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

WEdit opens on the Home dashboard. It includes quick links to the editor, sticker/media shelf, themes, backups, changelog, and announcements. The draggable launcher and your dashboard card settings are saved locally.

Select **Sync profile** to open WhatsApp's profile view and copy its currently visible name, About text, phone, and photo into the local Home card. Sync reads the page currently shown in your browser; it does not change WhatsApp account details. Local name, phone, and photo overrides are also available under **Personalize this card**.

Choose one of fourteen presets, edit the colors, and enable Liquid Glass. The theme controls also include panel opening motion, a separate one-time update welcome card style, decorative flower/pumpkin/chain borders, and optional chain hover motion. Theme JSON includes these settings and can be imported or exported.

## Backup and restore

A full backup can include preview text, uploaded media, the current theme, and the local profile card. Import can merge saved previews or replace the current saved set. Restore-all removes WEdit's saved preview records and restores originals where those messages are loaded.

## Sound effects

Open **News** and use **Play interface sound effects** to enable or mute UI sounds. In **Themes**, import a short audio file up to 3 MB and 15 seconds, preview it, or remove it. Imported sounds are stored in this browser's IndexedDB and play on WEdit interactions when the toggle is on.

The animated update welcome card appears once when each new version opens. Its style is independent of the panel's open animation and can be changed in **Themes**.

## Quick hide

Select **Quick hide** in the panel or press **Alt+Shift+H**. WEdit restores the original text for active previews, removes its message buttons and media overlays, and hides the panel and launcher. Press **Alt+Shift+H** again to restore the local previews. This is a temporary display toggle; saved preview records remain in local storage.

## Changelog and announcements

Open **Changelog** for release notes or **News** for announcements. Both update from public repository feeds. The newsroom site also has a password-gated admin desk for publishing an announcement or changelog entry. Announcement posts and release notes are public.

To publish, open the Vercel newsroom, choose **Admin sign-in**, and enter the admin password. The server keeps the GitHub write token secret and preserves the newest 30 announcement posts. Keep private details out of public posts.

## Local-only boundary

WEdit does not send or edit WhatsApp messages. The preview exists only in the browser view where WEdit is installed and its local storage is available.
