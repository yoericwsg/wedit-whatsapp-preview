# Advanced use

## Local source workflow

Edit `content.js`, visit `chrome://extensions/` or `edge://extensions/`, and press the extension card's reload button. Then reload WhatsApp Web. For Tampermonkey, edit `wedit.user.js` and refresh the WhatsApp Web tab.

When publishing a userscript code change, increase `@version` in `wedit.user.js`, `manifest.json`, and `version.json` together. The installed script reads the version file when WhatsApp Web loads; if a newer release exists, it shows a notice with an **Update in Tampermonkey** button. Tampermonkey's scheduled update checks remain enabled.

## Dashboard and profile card

WEdit opens on **Home**. The shortcut tiles jump directly to each section. The floating launcher is moved by dragging its dotted grip; WEdit remembers its position on this device and places the panel beside it.

Select **Sync profile** to open WhatsApp's profile view. When the profile fields are visible, WEdit copies the current name, About text, phone, and avatar into its local card. If WhatsApp has not opened the profile view yet, select **Sync profile** again once it is visible. Local fields under **Personalize this card** override synced values.

In **Themes**, panel motion, decorative frame, chain hover motion, and the separate update welcome-card style are saved with the palette and included in exported theme JSON. Import a short sound file there to replace the generated interface tone; the News sound toggle mutes both.

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

## Publish an announcement or changelog entry

**News** and **Changelog** read public feeds from GitHub. Open the Vercel newsroom and select **Admin sign-in**. After the password is checked, the admin desk can publish an announcement or release notes. The server writes the public JSON feeds and `CHANGELOG.md`; the admin password and fine-grained GitHub token stay in Vercel environment variables.

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

Keep `schemaVersion` set to `1`. Add new announcements at the start of the array; WEdit displays the newest dated posts first and reads up to 30 entries. Changelog records use `changelog.json` and each entry has `version`, `date`, `title`, and a `notes` array.

## Troubleshooting

- Panel missing: reload WhatsApp Web and confirm WEdit is enabled on the extensions page or in Tampermonkey.
- Edit button missing: scroll the target message into view; check if the message has selectable text.
- Media unavailable: use an image/video URL that points directly to media or upload the file instead.
- Storage full: remove unneeded media previews or clear saved previews after exporting a backup.
