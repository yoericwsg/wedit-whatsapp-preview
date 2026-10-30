# Changelog

## 4.0.0 — 2026-10-30

- Added Quick hide: **Alt+Shift+H** restores original message text and removes WEdit buttons and previews until toggled back on.
- Reworked Tampermonkey update discovery to show an in-page notice, with an explicit update action and manual menu check.
- Added a Vercel announcements website with a server-side publisher; announcement keys and GitHub tokens stay outside the public page bundle.
- Simplified the WEdit News panel to read-only announcements and moved publishing to the website.

## 3.3.0 — 2026-10-30

- Added an initial announcement publishing scaffold; the deployed publishing site arrives in 4.0.0.
- Added server-side key validation design without placing a key or GitHub token in the extension.

## 3.2.1 — 2026-10-30

- Added a Tampermonkey page-load check that opens the update screen once per new version and leaves an update button in WEdit.

## 3.2.0 — 2026-10-30

- Added a live text preview, character count, and reset-to-original draft control.
- Added a guided announcement composer that generates and copies a complete feed file for GitHub publishing.
- Added a reusable local sticker shelf with multi-file and folder import for WebP, PNG, JPG, GIF, and AVIF images (100 files, 5 MB each, 60 MB per batch).

## 3.1.0 — 2026-10-30

- Added an announcements tab that reads the repository feed when opened and checks every 15 minutes while it remains active.
- Added optional on-device interface sounds and a preference toggle.
- Added an in-panel changelog.

## 3.0.1 — 2026-10-30

- Added GitHub update metadata for Tampermonkey.
