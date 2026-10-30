'use strict';

const ANNOUNCEMENTS_URL =
  'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/announcements.json';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
