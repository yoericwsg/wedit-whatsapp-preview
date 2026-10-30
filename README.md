# WEdit — WhatsApp Local Preview Editor

A Manifest V3 Chrome/Edge extension port of the supplied WEdit userscript. It runs only on `https://web.whatsapp.com/` and requests no extension permissions.

## Install on Windows

Double-click `install.cmd`. It opens your browser's extensions page and this project folder. In the browser, enable **Developer mode**, choose **Load unpacked**, and select this folder.

Or install manually:

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the folder containing `manifest.json`.
4. Reload WhatsApp Web.

Use the floating **WEdit** button to open the editor. `Alt+Shift+E` toggles the panel. Text edits, themes, and uploaded preview media are stored locally in the browser profile for WhatsApp Web; they do not send or modify WhatsApp messages.

## Repository commands

From this folder, run:

```cmd
git init
git add .
git commit -m "Initial WEdit extension"
```

To create a GitHub repository later, create an empty repository on GitHub, then add its URL as `origin` and push your `main` branch.
