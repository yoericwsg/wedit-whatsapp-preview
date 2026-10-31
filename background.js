'use strict';

const ANNOUNCEMENTS_URL =
  'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/announcements.json';
const CHANGELOG_URL =
  'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/changelog.json';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const url = message?.type === 'WEDIT_FETCH_ANNOUNCEMENTS'
    ? ANNOUNCEMENTS_URL
    : message?.type === 'WEDIT_FETCH_CHANGELOG'
      ? CHANGELOG_URL
      : '';
  if (!url) return undefined;

  fetch(`${url}?v=${Date.now()}`, { cache: 'no-store', credentials: 'omit' })
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
