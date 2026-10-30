# Privacy and storage

WEdit has no AI features, user account, analytics, backend, or message transport.

## What stays in the browser

- Preview originals and replacements plus chat labels are stored in the `wedit-local-preview-v1` localStorage key on the WhatsApp Web origin.
- Theme settings are stored in the `wedit-theme-v1` localStorage key.
- Uploaded media blobs are stored in the `wedit-local-preview-media` IndexedDB database.
- Exported JSON backups are files created on the device. A backup can contain message text and media.

## Network behavior

The extension declares no extension permissions. It runs as a content script only on `https://web.whatsapp.com/*`. WEdit itself has no server connection. If a user supplies a direct media URL, the browser requests that URL to render the preview.

## Data lifecycle

Removing WEdit does not necessarily erase origin storage. Clear `web.whatsapp.com` site data to remove WEdit's localStorage and IndexedDB entries; this also removes other WhatsApp Web site data. Export anything you want to keep before clearing it.
