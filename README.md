# WEdit — WhatsApp Local Preview Editor

> A no-AI, local-only preview studio for WhatsApp Web. Edit how messages look in your own browser, try media previews, customize the panel, and keep portable backups.

![WEdit editor screenshot running the real content script with fictional sample messages](docs/images/editor-demo.png)

WEdit changes the visible page in your browser. It does not send messages, change WhatsApp's servers, or change what another person sees. There is no AI, account, analytics, WEdit server, or message-sync service. The News tab reads public announcement text from this repository.

## What it does

- Select a loaded text message and create a local replacement preview.
- See a live draft preview and character count; reset the draft to the original text with one click.
- Keep a searchable list of saved previews; restore one message or all previews.
- Attach a local image, GIF, sticker-style image, or video preview, or use a direct HTTP(S) media URL.
- Import saved WhatsApp sticker images in bulk or from a folder, then reuse them from a personal sticker shelf.
- Choose eight themes, adjust a custom palette, enable Liquid Glass, and import/export theme JSON.
- Export or import a full JSON backup, including saved previews, the selected theme, and uploaded media.
- Read the in-panel changelog and public announcements; optional interface sounds are controlled by a toggle.
- Toggle the panel with **Alt+Shift+E**. The editor also advertises **Ctrl/⌘+Enter** to apply the current edit.

![WEdit theme UI preview](docs/images/themes-preview.svg)

## Install as a Chrome or Edge extension

### Windows quick launcher

1. Download or clone this repository.
2. Double-click [`install.cmd`](install.cmd). It opens the browser's extension page and this folder.
3. Turn on **Developer mode**.
4. Select **Load unpacked**, then choose the folder containing `manifest.json`.
5. Open or reload [WhatsApp Web](https://web.whatsapp.com/).

The launcher does not bypass Chrome or Edge's extension controls. You complete the **Load unpacked** step in the browser.

### Manual install

- Chrome: open `chrome://extensions/`
- Edge: open `edge://extensions/`

Enable **Developer mode** → **Load unpacked** → select this repository folder.

![WEdit media preview UI](docs/images/media-preview.svg)

## Install with Tampermonkey

1. Install Tampermonkey from the browser's official extension store.
2. Open [`wedit.user.js`](wedit.user.js) in this repository.
3. In GitHub, open the **Raw** view; Tampermonkey should offer to install the userscript. If it displays source text, copy it into Tampermonkey's **Create a new script** editor, replace the starter text, and save.
4. Reload WhatsApp Web.

The userscript checks this repository's published version when WhatsApp Web loads. When newer code is available, it opens Tampermonkey's update screen once for that version and leaves an **Open update** button in WEdit. Tampermonkey also checks on its configured schedule; a code release must increase the userscript `@version` and `version.json` together.

Tampermonkey asks for permission to contact `raw.githubusercontent.com` so the News tab can read the public announcement feed. No WhatsApp content or local previews are sent with that request.

The same script file is included as `content.js` for the extension build. Tampermonkey and the unpacked extension are two ways to load WEdit; do not enable both at once.

## Package for the Chrome Web Store

Prerequisites: a registered Chrome Web Store developer account and a completed store listing. The store package is separate from this repository bundle.

Run [`package-webstore.cmd`](scripts/package-webstore.cmd). It creates `dist/wedit-web-store.zip` containing the manifest, content script, announcement worker, and icons, with `manifest.json` at the ZIP root. Upload that ZIP from the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/), complete the listing and privacy fields, and submit it for review. Store submissions need listing images and a screenshot. The PNG above shows the WEdit interface running on a local demo page with fictional sample messages; it is not from a signed-in WhatsApp account. The SVGs below are illustrative panels.

## Data and privacy

- WEdit stores message preview records and theme settings in the WhatsApp Web origin's local browser storage.
- Uploaded media is stored in IndexedDB under the WhatsApp Web origin.
- A full backup may contain message text and uploaded media. Keep it where you want that data to remain.
- If you enter a media URL, the browser loads that URL to show the preview.
- The News tab requests the public `announcements.json` file from GitHub when opened and every 15 minutes while the tab remains active. This request contains no chat text or preview data.
- Clearing the browser's WhatsApp Web site data may remove local WEdit records and media.
- WEdit does not transmit your edits or backups to a WEdit server.

See [Privacy and storage](docs/privacy-and-storage.md) for details.

## Advanced notes

- Shortcut: **Alt+Shift+E** opens/closes the panel.
- The editor operates on messages currently rendered by WhatsApp Web. Scroll a message into view before selecting it.
- Message selectors and keys depend on WhatsApp Web's page structure; WhatsApp updates can change that structure.
- Local extension development: edit `content.js`, reload WEdit at `chrome://extensions/` or `edge://extensions/`, then reload WhatsApp Web.
- Tampermonkey development: edit `wedit.user.js` and refresh the WhatsApp Web tab.
- Export a backup before moving browser profiles or clearing site data. A restore can merge with the current set or replace it.

See [Installation](docs/installation.md), [Feature guide](docs/features.md), and [Advanced use](docs/advanced-use.md).

The public [changelog](CHANGELOG.md) records releases. To publish an announcement, open **News**, fill in the post title and text, choose **Build announcement file**, then **Copy feed file**. Choose **Open GitHub editor**, replace the whole file contents with the copied text, and commit to `main`. The composer preserves existing posts. GitHub access with repository write permission is required.

## Project files

- `manifest.json` — Manifest V3 metadata and WhatsApp Web match.
- `content.js` — extension content script.
- `background.js` — fetches the fixed public announcement feed for the extension.
- `wedit.user.js` — Tampermonkey-ready userscript.
- `announcements.json` and `CHANGELOG.md` — public update notes and feed.
- `install.cmd` — opens the browser extensions page and repository folder.
- `scripts/package-webstore.cmd` — builds a minimal Web Store ZIP.
- `docs/` — install, feature, privacy, and advanced guides, a local UI demo page, a real interface screenshot, and illustrative panel artwork.

## Contributing

Issues and pull requests are welcome. Keep changes local-first: do not add message sending, tracking, remote storage, or AI processing without clearly changing the product description and privacy documentation.
