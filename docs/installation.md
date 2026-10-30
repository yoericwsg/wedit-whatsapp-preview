# Installation

## Chrome / Edge unpacked extension

1. Download the repository ZIP from GitHub and extract it, or clone the repository with Git.
2. Run `install.cmd`, or open the extensions page directly:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted WEdit repository directory (the one containing `manifest.json`).
5. Visit `https://web.whatsapp.com/` and reload the tab if it was already open.

The `install.cmd` launcher opens the extension page and project directory. Browser confirmation of **Load unpacked** is still required; Chrome and Edge do not allow this script to silently enable an unpacked extension.

## Tampermonkey

1. Install Tampermonkey from the official extension listing for your browser.
2. Open `wedit.user.js` in the repo and choose **Raw** on GitHub.
3. If Tampermonkey does not open its install screen, copy the raw file into **Create a new script** and save.
4. Reload WhatsApp Web.

Tampermonkey will request access to `raw.githubusercontent.com` for the public announcement feed. WEdit only reads its fixed JSON feed there; it does not upload chat text or local previews.

The script includes GitHub-hosted `@updateURL` and `@downloadURL` entries. Tampermonkey checks for new versions according to its own update settings; leaving automatic userscript updates enabled installs later releases from this repository. Updates appear after a new version is pushed to the repository's `main` branch. Existing userscripts keep their settings and saved local previews during an update. If you installed by copying and pasting the script, install it once from GitHub's **Raw** view so Tampermonkey has the update source.

The userscript header limits execution to `https://web.whatsapp.com/*`. Avoid running both the userscript and unpacked extension simultaneously because each would add its own panel and observers.

## Remove WEdit

- Extension: remove WEdit from the browser's extensions page.
- Tampermonkey: disable or delete the WEdit userscript from its dashboard.
- To erase saved WEdit data, clear site data for `web.whatsapp.com` in the browser. That also clears other WhatsApp Web site data.
