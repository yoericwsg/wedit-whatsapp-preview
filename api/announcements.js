import { timingSafeEqual } from 'node:crypto';

const OWNER = 'yoericwsg';
const REPO = 'wedit-whatsapp-preview';
const BRANCH = 'main';
const FEED_PATH = 'announcements.json';
const CHANGELOG_PATH = 'changelog.json';
const MARKDOWN_PATH = 'CHANGELOG.md';
const REPO_CONTENTS = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const RAW_ROOT = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const MAX_BODY = 15_000;
const NO_STORE = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };

function json(status, value, headers = NO_STORE) {
  return Response.json(value, { status, headers });
}

function matchesSecret(received, expected) {
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length &&
    timingSafeEqual(receivedBytes, expectedBytes);
}

function cleanAnnouncement(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const title = typeof input.title === 'string' ? input.title.replace(/[\r\n]+/g, ' ').trim() : '';
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  if (!title || title.length > 140 || !body || body.length > 4000) return null;

  const announcement = { title, body, publishedAt: new Date().toISOString() };
  if (input.url !== undefined && input.url !== '') {
    if (typeof input.url !== 'string' || input.url.length > 2048) return null;
    try {
      const link = new URL(input.url);
      if (link.protocol !== 'https:') return null;
      announcement.url = link.href;
    } catch {
      return null;
    }
  }
  return announcement;
}

function cleanChangelog(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const version = typeof input.version === 'string' ? input.version.trim() : '';
  const title = typeof input.title === 'string' ? input.title.replace(/[\r\n]+/g, ' ').trim() : '';
  const date = typeof input.date === 'string' ? input.date.trim() : '';
  const notes = Array.isArray(input.notes)
    ? input.notes.map(note => typeof note === 'string' ? note.replace(/[\r\n]+/g, ' ').trim() : '')
      .filter(Boolean)
    : [];
  if (!/^\d+\.\d+\.\d+$/.test(version) || !title || title.length > 140 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date ||
      !notes.length || notes.length > 20 || notes.some(note => note.length > 300)) return null;
  return { version, date, title, notes };
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'WEdit-admin'
  };
}

async function getGitHubFile(path, headers) {
  const response = await fetch(`${REPO_CONTENTS}/${path}?ref=${BRANCH}`, { headers });
  if (response.status === 404) return { text: '', sha: null };
  if (!response.ok) throw new Error('Could not read the current GitHub file.');
  const file = await response.json();
  return {
    text: Buffer.from(String(file.content || '').replace(/\s/g, ''), 'base64').toString('utf8'),
    sha: file.sha
  };
}

async function putGitHubFile(path, content, sha, message, headers) {
  const response = await fetch(`${REPO_CONTENTS}/${path}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      ...(sha ? { sha } : {}),
      branch: BRANCH
    })
  });
  if (response.status === 409 || response.status === 422) {
    throw Object.assign(new Error('A WEdit update changed at the same time. Refresh and try again.'), { status: 409 });
  }
  if (!response.ok) throw new Error('GitHub did not accept the update. Check the repository token permissions.');
}

async function readPublicFile(path, fallback) {
  const response = await fetch(`${RAW_ROOT}/${path}?v=${Date.now()}`, { cache: 'no-store' });
  if (response.status === 404 && fallback !== undefined) return fallback;
  if (!response.ok) throw new Error(`Could not read ${path}.`);
  return response.json();
}

export async function GET() {
  try {
    const [feed, changelog] = await Promise.all([
      readPublicFile(FEED_PATH),
      readPublicFile(CHANGELOG_PATH, { schemaVersion: 1, entries: [] })
    ]);
    if (feed?.schemaVersion !== 1 || !Array.isArray(feed.announcements)) {
      return json(502, { error: 'Announcement feed format is invalid.' });
    }
    if (changelog?.schemaVersion !== 1 || !Array.isArray(changelog.entries)) {
      return json(502, { error: 'Changelog format is invalid.' });
    }
    return json(200, {
      schemaVersion: 1,
      announcements: feed.announcements.slice(0, 30),
      changelog: changelog.entries.slice(0, 100)
    }, { 'Cache-Control': 'public, max-age=60, s-maxage=60', 'Content-Type': 'application/json; charset=utf-8' });
  } catch {
    return json(502, { error: 'Could not load WEdit news.' });
  }
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json(403, { error: 'Request origin was not accepted.' });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  if (!expectedPassword) return json(503, { error: 'Admin sign-in is not configured on this deployment.' });

  const authorization = request.headers.get('authorization') || '';
  const suppliedPassword = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!suppliedPassword || suppliedPassword.length > 256 || !matchesSecret(suppliedPassword, expectedPassword)) {
    return json(401, { error: 'That password did not match.' });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY) return json(413, { error: 'Request is too large.' });
  let input;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { error: 'Request is too large.' });
    input = JSON.parse(text);
  } catch {
    return json(400, { error: 'Request body must be valid JSON.' });
  }

  if (input?.action === 'verify') return json(200, { ok: true });

  const githubToken = process.env.GITHUB_TOKEN || '';
  if (!githubToken) return json(503, { error: 'Publishing is not connected yet. Add GITHUB_TOKEN in Vercel Project Settings.' });
  const headers = githubHeaders(githubToken);

  try {
    if (input?.type === 'announcement') {
      const announcement = cleanAnnouncement(input.announcement);
      if (!announcement) return json(400, { error: 'Check the title, message, and HTTPS link.' });
      const current = await getGitHubFile(FEED_PATH, headers);
      const feed = current.text ? JSON.parse(current.text) : { schemaVersion: 1, announcements: [] };
      if (feed?.schemaVersion !== 1 || !Array.isArray(feed.announcements)) {
        return json(502, { error: 'The current announcement feed format is invalid.' });
      }
      const next = { schemaVersion: 1, announcements: [announcement, ...feed.announcements].slice(0, 30) };
      await putGitHubFile(FEED_PATH, `${JSON.stringify(next, null, 2)}\n`, current.sha,
        `Publish announcement: ${announcement.title}`, headers);
      return json(200, { ok: true, message: 'Announcement published.' });
    }

    if (input?.type === 'changelog') {
      const entry = cleanChangelog(input.entry);
      if (!entry) return json(400, { error: 'Check the version, date, title, and release notes.' });
      const current = await getGitHubFile(CHANGELOG_PATH, headers);
      const changelog = current.text
        ? JSON.parse(current.text)
        : { schemaVersion: 1, entries: [] };
      if (changelog?.schemaVersion !== 1 || !Array.isArray(changelog.entries)) {
        return json(502, { error: 'The current changelog format is invalid.' });
      }
      if (changelog.entries.some(item => item?.version === entry.version)) {
        return json(409, { error: `Version ${entry.version} is already listed.` });
      }
      const next = { schemaVersion: 1, entries: [entry, ...changelog.entries].slice(0, 100) };
      await putGitHubFile(CHANGELOG_PATH, `${JSON.stringify(next, null, 2)}\n`, current.sha,
        `Publish changelog: ${entry.version}`, headers);

      try {
        const markdown = await getGitHubFile(MARKDOWN_PATH, headers);
        const section = `## ${entry.version} — ${entry.date}\n\n### ${entry.title}\n\n${entry.notes.map(note => `- ${note}`).join('\n')}\n\n`;
        const original = markdown.text.replace(/^# Changelog\s*/i, '');
        await putGitHubFile(MARKDOWN_PATH, `# Changelog\n\n${section}${original}`,
          markdown.sha, `Publish changelog markdown: ${entry.version}`, headers);
      } catch {
        return json(207, { ok: true, message: 'Changelog is live in WEdit and on the site. The Markdown file did not sync.' });
      }
      return json(200, { ok: true, message: 'Changelog published to the site, WEdit, and GitHub.' });
    }
    return json(400, { error: 'Choose an announcement or changelog post.' });
  } catch (error) {
    return json(error?.status || 502, { error: error?.message || 'Publishing failed. Refresh and try again.' });
  }
}
