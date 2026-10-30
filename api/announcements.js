import { timingSafeEqual } from 'node:crypto';

const OWNER = 'yoericwsg';
const REPO = 'wedit-whatsapp-preview';
const BRANCH = 'main';
const FEED_PATH = 'announcements.json';
const FEED_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FEED_PATH}`;
const MAX_BODY = 10_000;
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
  const title = typeof input.title === 'string' ? input.title.trim() : '';
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

export async function GET() {
  try {
    const response = await fetch(`${FEED_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return json(502, { error: 'Could not load announcements.' });
    const feed = await response.json();
    if (feed?.schemaVersion !== 1 || !Array.isArray(feed.announcements)) {
      return json(502, { error: 'Announcement feed format is invalid.' });
    }
    return json(200, feed, { 'Cache-Control': 'public, max-age=60, s-maxage=60', 'Content-Type': 'application/json; charset=utf-8' });
  } catch {
    return json(502, { error: 'Could not reach the announcement feed.' });
  }
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json(403, { error: 'Request origin was not accepted.' });
  }

  const expectedKey = process.env.ANNOUNCEMENT_KEY || '';
  const githubToken = process.env.GITHUB_TOKEN || '';
  if (!expectedKey || !githubToken) {
    return json(503, { error: 'Announcement publishing is not configured yet.' });
  }

  const authorization = request.headers.get('authorization') || '';
  const suppliedKey = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!suppliedKey || suppliedKey.length > 256 || !matchesSecret(suppliedKey, expectedKey)) {
    return json(401, { error: 'Publishing key was not accepted.' });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY) return json(413, { error: 'Post is too large.' });
  let input;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { error: 'Post is too large.' });
    input = JSON.parse(text);
  } catch {
    return json(400, { error: 'Request body must be valid JSON.' });
  }

  const announcement = cleanAnnouncement(input?.announcement);
  if (!announcement) return json(400, { error: 'Check the title, message, and HTTPS link.' });

  const apiURL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FEED_PATH}`;
  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${githubToken}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'WEdit-announcements'
  };

  try {
    const currentResponse = await fetch(`${apiURL}?ref=${BRANCH}`, { headers: githubHeaders });
    if (!currentResponse.ok) return json(502, { error: 'Could not load the existing feed.' });
    const currentFile = await currentResponse.json();
    const currentFeed = JSON.parse(Buffer.from(currentFile.content.replace(/\s/g, ''), 'base64').toString('utf8'));
    if (currentFeed?.schemaVersion !== 1 || !Array.isArray(currentFeed.announcements)) {
      return json(502, { error: 'The existing feed format is invalid.' });
    }

    const nextFeed = {
      schemaVersion: 1,
      announcements: [announcement, ...currentFeed.announcements].slice(0, 30)
    };
    const updateResponse = await fetch(apiURL, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Publish announcement: ${announcement.title}`,
        content: Buffer.from(`${JSON.stringify(nextFeed, null, 2)}\n`).toString('base64'),
        sha: currentFile.sha,
        branch: BRANCH
      })
    });
    if (updateResponse.status === 409) return json(409, { error: 'A post just went live. Refresh and try again.' });
    if (!updateResponse.ok) return json(502, { error: 'GitHub did not accept the announcement.' });
    return json(200, { ok: true, message: 'Announcement published.' });
  } catch {
    return json(502, { error: 'Publishing failed. Refresh the feed and try again.' });
  }
}
