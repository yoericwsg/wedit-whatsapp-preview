# Feature guide

## Message preview editor

Hover a loaded text message and select **Edit**. Change the replacement text, then choose **Apply preview**. WEdit records the original and replacement locally and updates only the visible page. Use **Restore message** to return that record to its original text.

The saved preview list can be searched. Selecting a saved item opens its editor when that message is loaded. If it is not on screen, open the relevant chat and scroll until WhatsApp renders it.

## Media previews

Select a message, open **Media**, and choose an uploaded image, GIF, sticker image, or supported video. You can also enter a direct HTTP(S) media URL. **Sticker-style display** changes the local preview presentation. Uploaded files are stored in IndexedDB; full backups include them.

## Themes

Choose one of eight presets, edit the custom color controls, or enable the Liquid Glass layer. Theme changes apply to the WEdit panel and are stored locally. Export/import theme JSON to reuse a palette.

## Backup and restore

A full backup can include preview text, uploaded media, and the current theme. Import can merge the saved previews or replace the current saved set. Restore-all removes WEdit's saved preview records and restores originals where those messages are loaded.

## Sound effects

Open **News** and use **Play interface sound effects** to turn the small, locally generated sounds on or off. Sounds run only after a WEdit interaction and use the browser's Web Audio API; WEdit downloads no sound files.

## Changelog and announcements

Open **Changelog** for version notes. **News** reads the public `announcements.json` feed from this repository when opened and refreshes every 15 minutes while News remains selected in a visible tab. The feed renders plain text and HTTPS links only.

To post a message, choose **Post an announcement** and edit `announcements.json` on GitHub. Sign in with an account that has write access to the repository. Add an object to its `announcements` array with a `title`, an ISO `publishedAt` date, a `body`, and an optional HTTPS `url`; then commit the change to `main`. WEdit users see it on their next refresh. Feed edits are public, so keep private details out of announcements.

## Local-only boundary

WEdit does not send or edit WhatsApp messages. The preview exists only in the browser view where WEdit is installed and its local storage is available.
