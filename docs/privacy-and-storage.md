# Privacy and storage

The WEdit editor has no AI, account, analytics, or message transport. The separate announcements website uses a server function only to publish public announcement text to the GitHub feed.

## What stays in the browser

- Preview originals and replacements plus chat labels are stored in the `wedit-local-preview-v1` localStorage key on the WhatsApp Web origin.
- Theme settings are stored in the `wedit-theme-v1` localStorage key.
- The sound toggle is stored in the `wedit-sounds-v1` localStorage key.
- Uploaded media blobs are stored in the `wedit-local-preview-media` IndexedDB database.
- Imported sticker images share that local IndexedDB database under WEdit sticker keys. They remain in that browser profile and are not included in message backups.
- Exported JSON backups are files created on the device. A backup can contain message text and media.

## Network behavior

The extension runs its editor content script only on `https://web.whatsapp.com/*`. It also has a narrowly scoped host permission for `raw.githubusercontent.com/yoericwsg/*` to read the fixed public announcement feed. The extension background worker requests only the WEdit `announcements.json` URL and returns the text to the News tab. It does not send chat text or local preview data. Tampermonkey uses the same GitHub host grant for the announcement feed, the small `version.json` check on page load, and its standard userscript update checks. When a newer version is found, WEdit displays an in-page notice; the update tab opens only after the user selects the update button. These requests contain no chat text or local preview data. If a user supplies a direct media URL, the browser requests that URL to render the preview.

The announcements site sends only the entered title, message, optional link, and publisher key to its same-origin Vercel function. The function uses a GitHub token stored in Vercel environment variables to update the public feed. The key and token are not included in the extension or public site source.

## Data lifecycle

Removing WEdit does not necessarily erase origin storage. Clear `web.whatsapp.com` site data to remove WEdit's localStorage and IndexedDB entries; this also removes other WhatsApp Web site data. Export anything you want to keep before clearing it.
