# Feature guide

## Message preview editor

Hover a loaded text message and select **Edit**. Change the replacement text; the preview card and character count update as you type. **Reset draft to original** fills the editor with the original words without applying them. Choose **Apply local preview** when the live preview looks right. WEdit records the original and replacement locally and updates only the visible page. Use **Restore message** to return that record to its original text.

The saved preview list can be searched. Selecting a saved item opens its editor when that message is loaded. If it is not on screen, open the relevant chat and scroll until WhatsApp renders it.

## Media previews

Select a message, open **Media**, and choose an uploaded image, GIF, sticker image, or supported video. You can also enter a direct HTTP(S) media URL. **Sticker-style display** changes the local preview presentation. Uploaded media is stored in IndexedDB; full backups include media attached to saved previews.

### Import your sticker images

1. Save or export sticker images to your device from WhatsApp.
2. Open **Media → My WhatsApp stickers**.
3. Choose **Choose sticker files** for multiple images, or **Import a folder** for a sticker folder.
4. Select WebP, PNG, JPG, GIF, or AVIF image files. WEdit imports up to 100 at a time, up to 5 MB each, with a 60 MB total per batch.
5. Select a message, tap a sticker from your shelf, then choose **Apply media preview**.

Animated WebP and GIF files animate in browsers that support them. WEdit imports image files you can access on your device; it does not read WhatsApp's private app storage or import sticker-pack archives directly. The sticker shelf is local to that browser profile and is not part of message backups.

## Themes

Choose one of eight presets, edit the custom color controls, or enable the Liquid Glass layer. Theme changes apply to the WEdit panel and are stored locally. Export/import theme JSON to reuse a palette.

## Backup and restore

A full backup can include preview text, uploaded media, and the current theme. Import can merge the saved previews or replace the current saved set. Restore-all removes WEdit's saved preview records and restores originals where those messages are loaded.

## Sound effects

Open **News** and use **Play interface sound effects** to turn the small, locally generated sounds on or off. Sounds run only after a WEdit interaction and use the browser's Web Audio API; WEdit downloads no sound files.

## Changelog and announcements

Open **Changelog** for version notes. **News** reads the public `announcements.json` feed from this repository when opened and refreshes every 15 minutes while News remains selected in a visible tab. The feed renders plain text and HTTPS links only.

To post a message, open **News**, fill the title and body, then select **Build announcement file**. Choose **Copy feed file**, open the GitHub editor, replace the whole file text with the copied JSON, and commit to `main`. The composer keeps the existing posts in the feed. Sign in with an account that has repository write access. Users see the post on their next refresh. Feed edits are public, so keep private details out of announcements.

## Local-only boundary

WEdit does not send or edit WhatsApp messages. The preview exists only in the browser view where WEdit is installed and its local storage is available.
