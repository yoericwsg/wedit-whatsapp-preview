import { timingSafeEqual } from 'node:crypto';

const OWNER = 'yoericwsg';
const REPO = 'wedit-whatsapp-preview';
const BRANCH = 'main';
const FILE = 'announcements.json';
const MAX_BODY = 10000;
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8'
};

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

function equalSecret(received, expected) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function validateAnnouncement(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const body = typeof value.body === 'string' ? value.body.trim() : '';
  if (!title || title.length > 140 || !body || body.length > 4000) return null;
  const announcement = { title, body, publishedAt: new Date().toISOString() };
  if (value.url !== undefined && value.url !== '') {
    if (typeof value.url !== 'string' || value.url.length > 2048) return null;
    try {
      const url = new URL(value.url);
      if (url.protocol !== 'https:') return null;
      announcement.url = url.href;
    } catch {
      return null;
    }
  }
  return announcement;
}

export default async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return reply(405, { error: 'Use POST to publish.' });

  const expectedKey = Netlify.env.get('ANNOUNCEMENT_KEY');
  const githubToken = Netlify.env.get('GITHUB_TOKEN');
  if (!expectedKey || !githubToken) {
    return reply(503, { error: 'Publishing is not configured yet.' });
  }

  const authorization = request.headers.get('authorization') || '';
  const suppliedKey = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';
  if (!suppliedKey || suppliedKey.length > 256 || !equalSecret(suppliedKey, expectedKey)) {
    return reply(401, { error: 'Publishing key was not accepted.' });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY) return reply(413, { error: 'Announcement is too large.' });

  let requestData;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return reply(413, { error: 'Announcement is too large.' });
    requestData = JSON.parse(text);
  } catch {
    return reply(400, { error: 'Request body must be valid JSON.' });
  }
  const announcement = validateAnnouncement(requestData?.announcement);
  if (!announcement) return reply(400, { error: 'Check the title, message, and HTTPS link.' });

  const apiURL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${githubToken}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'WEdit-announcement-publisher'
  };

  try {
    const currentResponse = await fetch(`${apiURL}?ref=${BRANCH}`, { headers: githubHeaders });
    if (!currentResponse.ok) return reply(502, { error: 'Could not load the current announcement feed.' });
    const currentFile = await currentResponse.json();
    const decoded = Buffer.from(currentFile.content.replace(/\s/g, ''), 'base64').toString('utf8');
    const feed = JSON.parse(decoded);
    if (feed?.schemaVersion !== 1 || !Array.isArray(feed.announcements)) {
      return reply(502, { error: 'The current announcement feed has an invalid format.' });
    }
    const nextFeed = {
      schemaVersion: 1,
      announcements: [announcement, ...feed.announcements].slice(0, 30)
    };
    const contents = Buffer.from(`${JSON.stringify(nextFeed, null, 2)}\n`).toString('base64');
    const updateResponse = await fetch(apiURL, {
      method: 'PUT',
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Publish announcement: ${announcement.title}`,
        content: contents,
        sha: currentFile.sha,
        branch: BRANCH
      })
    });
    if (!updateResponse.ok) return reply(502, { error: 'GitHub did not accept the feed update.' });
    return reply(200, { ok: true, message: 'Announcement published.' });
  } catch {
    return reply(502, { error: 'Publishing failed. Try again after refreshing News.' });
  }
};

export const config = {
  path: '/.netlify/functions/publish-announcement',
  method: ['POST', 'OPTIONS'],
  rateLimit: { action: 'rate_limit', aggregateBy: 'ip', windowSize: 60, windowLimit: 5 }
};
