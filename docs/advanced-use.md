# Advanced use

## Local source workflow

Edit `content.js`, visit `chrome://extensions/` or `edge://extensions/`, and press the extension card's reload button. Then reload WhatsApp Web. For Tampermonkey, edit `wedit.user.js` and refresh the WhatsApp Web tab.

When publishing a userscript code change, increase `@version` in `wedit.user.js` and the value in `version.json` together. The installed script reads the small version file on WhatsApp Web page load; when the published version is newer, it opens the Tampermonkey update screen once for that version and displays an **Open update** button. Tampermonkey's own scheduled update check remains enabled as a second route.

## Message discovery

WEdit watches WhatsApp Web's rendered DOM and locates selectable message text. Only loaded messages can be selected or restored on screen. If WhatsApp changes its DOM attributes or message layout, the selector constants near the top of `content.js` may need updating.

Message keys prefer WhatsApp's `data-id`. When that attribute is unavailable, WEdit falls back to pre-plain-text metadata or a hash of chat name, direction, and visible text. Editing a message may change the fallback text and therefore affect how it is found later; use the in-app saved preview list and export backups regularly.

## Backup migration

1. Export a full WEdit backup from the original browser profile.
2. Install WEdit in the destination profile and open WhatsApp Web.
3. Import the JSON backup and choose merge or replace.
4. Open the relevant chats and scroll to edited messages so the previews can be applied to loaded DOM nodes.

## Build a store ZIP

Run `scripts/package-webstore.cmd` from the repo or double-click it. The output is `dist/wedit-web-store.zip`. Increase `manifest.json`'s version before uploading a later release. The store package should contain only runtime files, not the repo history or docs.

## Publish an announcement

**News** reads the public `announcements.json` feed from GitHub. It refreshes when opened and every 15 minutes while selected in a visible tab. To publish, use the Vercel announcements site. That page checks a private key server-side and uses a Vercel environment token to commit new public posts to GitHub. Never paste either secret into the extension source or public feed.

Example feed structure:

```json
{
  "schemaVersion": 1,
  "announcements": [
    {
      "title": "Announcement title",
      "publishedAt": "2026-10-30T12:00:00Z",
      "body": "Write the announcement text here.",
      "url": "https://example.com/details"
    }
  ]
}
```

Keep `schemaVersion` set to `1`. Add new posts at the start of the array; WEdit displays the newest dated posts first and reads up to 30 entries.

## Troubleshooting

- Panel missing: reload WhatsApp Web and confirm WEdit is enabled on the extensions page or in Tampermonkey.
- Edit button missing: scroll the target message into view; check if the message has selectable text.
- Media unavailable: use an image/video URL that points directly to media or upload the file instead.
- Storage full: remove unneeded media previews or clear saved previews after exporting a backup.
