'use strict';

const ANNOUNCEMENTS_URL =
  'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/announcements.json';
const PUBLISHER_URL = '';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'WEDIT_PUBLISH_ANNOUNCEMENT') {
    if (!PUBLISHER_URL || message.endpoint !== PUBLISHER_URL ||
        typeof message.key !== 'string' || message.key.length > 256) {
      sendResponse({ ok: false, error: 'Publisher settings are invalid.' });
      return undefined;
    }
    fetch(message.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${message.key}`
      },
      body: JSON.stringify({ announcement: message.announcement }),
      credentials: 'omit',
      cache: 'no-store'
    }).then(async response => {
      const result = await response.json().catch(() => ({}));
      sendResponse(response.ok
        ? { ok: true, message: result.message }
        : { ok: false, error: result.error || `Publish failed (HTTP ${response.status}).` });
    }).catch(() => sendResponse({ ok: false, error: 'Could not reach the announcement publisher.' }));
    return true;
  }

  if (message?.type !== 'WEDIT_FETCH_ANNOUNCEMENTS') return undefined;

  const url = `${ANNOUNCEMENTS_URL}?v=${Date.now()}`;
  fetch(url, { cache: 'no-store', credentials: 'omit' })
    .then(async response => {
      const body = await response.text();
      if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`);
      sendResponse({ ok: true, body });
    })
    .catch(error => sendResponse({
      ok: false,
      error: error?.message || 'Could not load announcements.'
    }));

  return true;
});
