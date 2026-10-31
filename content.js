// ==UserScript==
// @name         WEdit — WhatsApp Local Preview Editor
// @namespace    local.wedit.preview
// @version      4.2.0
// @description  Local WhatsApp preview studio with profile sync, sound imports, animated themes, and backups.
// @match        https://web.whatsapp.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const STORE_KEY = 'wedit-local-preview-v1';
  const DB_NAME = 'wedit-local-preview-media';
  const DB_STORE = 'media';
  const STICKER_KEY_PREFIX = 'wedit-sticker:';
  const STYLE_ID = 'wedit-v3-styles';
  const THEME_STORE_KEY = 'wedit-theme-v1';
  const SOUND_STORE_KEY = 'wedit-sounds-v1';
  const SOUND_MEDIA_KEY = 'wedit-custom-ui-sound';
  const WELCOME_VERSION_KEY = 'wedit-welcome-version-v1';
  const PROFILE_STORE_KEY = 'wedit-profile-card-v1';
  const LAUNCHER_POSITION_KEY = 'wedit-launcher-position-v1';
  const ANNOUNCEMENTS_URL = 'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/announcements.json';
  const CHANGELOG_URL = 'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/changelog.json';
  const APP_VERSION = '4.2.0';
  const RELEASE_INFO_URL = 'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/version.json';
  const USERSCRIPT_URL = 'https://raw.githubusercontent.com/yoericwsg/wedit-whatsapp-preview/main/wedit.user.js';
  const PANEL_ID = 'wedit-panel';
  const LAUNCHER_ID = 'wedit-launcher';
  const SELECTOR_TEXT = '[data-testid="selectable-text"], .selectable-text';
  const SELECTOR_ROOT = '[data-testid="msg-container"], .message-in, .message-out';
  const QUOTED = '[data-testid="quoted-message"], .quoted-message, [data-testid="quoted-message-container"]';
  const CHANGELOG_ENTRIES = [
    {
      version: '4.2.0',
      date: '2026-10-31',
      title: 'Profile sync, animated themes, and custom sounds',
      notes: [
        'Home can read your visible WhatsApp name, About text, phone and profile photo.',
        'Added custom interface sounds, opening animations, a separate update welcome, and decorative borders.',
        'Theme JSON now carries animation, frame and chain-motion settings.'
      ]
    },
    {
      version: '4.1.0',
      date: '2026-10-31',
      title: 'Home dashboard, profile shortcuts, and movable launcher',
      notes: [
        'Added a home dashboard with a local profile card and useful shortcuts.',
        'Added more built-in palettes and custom theme import/export.',
        'Made the WEdit launcher draggable and remembered its position.'
      ]
    },
    {
      version: '4.0.0',
      date: '2026-10-30',
      title: 'Quick hide, clean updates, announcements site',
      notes: [
        'Added Quick hide (Alt+Shift+H) to restore original page text and hide WEdit controls instantly.',
        'Update checks now show an in-page notice and only open Tampermonkey when you choose Update.',
        'Added a Vercel announcements page and private server-side publisher.'
      ]
    },
    {
      version: '3.3.0',
      date: '2026-10-30',
      title: 'Keyed announcement publishing',
      notes: [
        'Added an initial server-side publisher design; Vercel replaces the unpublished Netlify setup in 4.0.'
      ]
    },
    {
      version: '3.2.1',
      date: '2026-10-30',
      title: 'Faster Tampermonkey update notices',
      notes: [
        'WEdit now checks the published userscript version when WhatsApp Web loads and offers a direct Tampermonkey update button.'
      ]
    },
    {
      version: '3.2.0',
      date: '2026-10-30',
      title: 'Better editing, announcements, and stickers',
      notes: [
        'Added a live text preview, character count, and reset-to-original draft control.',
        'Added a guided announcement composer that prepares the complete feed file for publishing.',
        'Added a reusable local sticker shelf with multi-file and folder import.'
      ]
    },
    {
      version: '3.1.0',
      date: '2026-10-30',
      title: 'Announcements and sound',
      notes: [
        'Added public announcements, optional local interface sounds, and an in-panel changelog.'
      ]
    },
    {
      version: '3.0.1',
      date: '2026-10-30',
      title: 'Tampermonkey updates',
      notes: [
        'Added a GitHub update feed for the Tampermonkey userscript.'
      ]
    }
  ];

  const THEME_PRESETS = [
    {
      id: 'midnight', name: 'Midnight',
      description: 'Clean dark default', glass: false,
      colors: {
        panel: '#10191f', surface: '#142128',
        surface2: '#17252d', text: '#e7f0f3',
        muted: '#91a7b0', accent: '#45d5a4',
        border: '#30444d', input: '#0d151a'
      }
    },
    {
      id: 'liquid-glass', name: 'Liquid Glass',
      description: 'Translucent, blurred surfaces', glass: true,
      colors: {
        panel: '#152332', surface: '#213346',
        surface2: '#26394a', text: '#f4f7ff',
        muted: '#b5c4d5', accent: '#8bf8db',
        border: '#71869a', input: '#0e1b28'
      }
    },
    {
      id: 'oled', name: 'OLED Black',
      description: 'Almost pure black', glass: false,
      colors: {
        panel: '#050505', surface: '#101010',
        surface2: '#151515', text: '#f4f4f4',
        muted: '#929292', accent: '#62e6ab',
        border: '#303030', input: '#000000'
      }
    },
    {
      id: 'ocean', name: 'Deep Ocean',
      description: 'Cool blue tones', glass: false,
      colors: {
        panel: '#10232d', surface: '#142a35',
        surface2: '#1b3542', text: '#eff9ff',
        muted: '#a8c3ce', accent: '#70d8ff',
        border: '#345663', input: '#091820'
      }
    },
    {
      id: 'lavender', name: 'Lavender',
      description: 'Soft purple accent', glass: false,
      colors: {
        panel: '#211a32', surface: '#261d37',
        surface2: '#302442', text: '#f7efff',
        muted: '#c5b7d4', accent: '#c5a1ff',
        border: '#514263', input: '#191324'
      }
    },
    {
      id: 'rose', name: 'Rose',
      description: 'Warm pink highlights', glass: false,
      colors: {
        panel: '#2b1a23', surface: '#311d28',
        surface2: '#3b2430', text: '#fff2f6',
        muted: '#d0aeb9', accent: '#ff91bc',
        border: '#583847', input: '#1e1017'
      }
    },
    {
      id: 'mint', name: 'Mint',
      description: 'Fresh green tones', glass: false,
      colors: {
        panel: '#132722', surface: '#1a302a',
        surface2: '#203c34', text: '#e8fff6',
        muted: '#a0c8b8', accent: '#78edc2',
        border: '#355b4e', input: '#0c1914'
      }
    },
    {
      id: 'light', name: 'Cloud Light',
      description: 'Bright and simple', glass: false,
      colors: {
        panel: '#f7f9fc', surface: '#ffffff',
        surface2: '#eef2f7', text: '#1b2735',
        muted: '#64748b', accent: '#087f5b',
        border: '#d3dce5', input: '#f5f7fa'
      }
    },
    {
      id: 'sunset', name: 'Neon Sunset',
      description: 'Warm coral with violet depth', glass: false,
      colors: {
        panel: '#241527', surface: '#301b2e',
        surface2: '#3d2140', text: '#fff1f8',
        muted: '#c5a7c6', accent: '#ff936f',
        border: '#68405e', input: '#1a1020'
      }
    },
    {
      id: 'cyber', name: 'Cyber Lime',
      description: 'Electric green on deep graphite', glass: false,
      colors: {
        panel: '#121817', surface: '#19211d',
        surface2: '#222d26', text: '#f0fff3',
        muted: '#a0b8a5', accent: '#c0ff5d',
        border: '#405747', input: '#0b100d'
      }
    },
    {
      id: 'ember', name: 'Ember',
      description: 'Copper light over charcoal', glass: false,
      colors: {
        panel: '#211812', surface: '#2c1f17',
        surface2: '#3b291e', text: '#fff4e8',
        muted: '#cbb6a0', accent: '#ffb35c',
        border: '#60442e', input: '#17100c'
      }
    },
    {
      id: 'arctic', name: 'Arctic Blue',
      description: 'Frosted blue with crisp contrast', glass: true,
      colors: {
        panel: '#10202b', surface: '#182c3b',
        surface2: '#20394b', text: '#effaff',
        muted: '#a7c2d0', accent: '#83e5ff',
        border: '#416478', input: '#0a1720'
      }
    },
    {
      id: 'orchid', name: 'Orchid',
      description: 'Soft magenta and midnight plum', glass: false,
      colors: {
        panel: '#1d1528', surface: '#271b35',
        surface2: '#342447', text: '#fcf3ff',
        muted: '#c2b0d1', accent: '#e2a3ff',
        border: '#55406a', input: '#140e1d'
      }
    },
    {
      id: 'paper', name: 'Warm Paper',
      description: 'Soft cream and ink', glass: false,
      colors: {
        panel: '#f5f0e7', surface: '#fffaf1',
        surface2: '#eee5d7', text: '#28251f',
        muted: '#70685a', accent: '#176b55',
        border: '#d9cfbf', input: '#fffdf8'
      }
    }
  ];

  let currentTheme = loadTheme();
  let pendingBackupFile = null;
  let pendingThemeFile = null;
  let edits = loadEdits();
  let activeKey = null;
  let activeRoot = null;
  let activeText = null;
  let activeOriginalText = '';
  let searchTerm = '';
  let panelOpen = false;
  let quickHide = false;
  let enhanceQueued = false;
  let pendingFile = null;
  let mediaDBPromise = null;
  let activeTab = 'home';
  let announcementsRequest = null;
  let changelogEntries = cloneObject(CHANGELOG_ENTRIES);
  let localProfileCard = loadProfileCard();
  let announcementFeedItems = null;
  let announcementFeedReady = false;
  let audioContext = null;

  const objectURLs = new Map();
  const mediaRendering = new Set();
  const originalPositions = new WeakMap();

  function loadEdits() {
    try {
      const data = JSON.parse(
        localStorage.getItem(STORE_KEY) || '{}'
      );

      return data &&
        typeof data === 'object' &&
        !Array.isArray(data)
        ? data
        : {};
    } catch (_) {
      return {};
    }
  }

  function saveEdits() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(edits));
    } catch (_) {
      showToast('Could not save preview details. Browser storage may be full.');
    }

    renderEditList();
    updateStats();
  }

  function safeText(el) {
    return (el?.innerText || el?.textContent || '')
      .replace(/[\u200e\u200f]/g, '')
      .trim();
  }

  function getTextNode(root) {
    if (!root) return null;

    return Array.from(
      root.querySelectorAll(SELECTOR_TEXT)
    ).find(el => !el.closest(QUOTED)) || null;
  }

  function getMessageRoot(el) {
    return el?.closest(SELECTOR_ROOT) ||
      el?.closest('[data-id]') ||
      el?.parentElement ||
      null;
  }

  function hashString(str) {
    let hash = 2166136261;

    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(16);
  }

  function getChatName() {
    const title =
      document.querySelector(
        '[data-testid="conversation-info-header-chat-title"]'
      ) ||
      document.querySelector('header span[title]');

    return safeText(title) || 'Current chat';
  }

  function getKey(root, textNode) {
    if (!root) return null;

    const stable = root.closest('[data-id]') ||
      root.querySelector('[data-id]');

    const id = stable?.getAttribute('data-id');

    if (id) return `id:${id}`;

    const plain = root.querySelector('[data-pre-plain-text]')
      ?.getAttribute('data-pre-plain-text');

    if (plain) {
      return `pre:${plain}|${hashString(getChatName())}`;
    }

    if (root.dataset.weditKey) return root.dataset.weditKey;

    const direction = root.classList.contains('message-out')
      ? 'out'
      : 'in';

    const key = `fallback:${hashString(
      `${getChatName()}|${direction}|${safeText(textNode)}`
    )}`;

    root.dataset.weditKey = key;
    return key;
  }

  function isIncoming(root) {
    if (root?.closest('.message-in')) return true;
    if (root?.closest('.message-out')) return false;
    return true;
  }

  function isUsableMessage(root, textNode) {
    if (!root || !textNode || !textNode.isConnected) return false;

    if (
      root.closest(`#${PANEL_ID}, #${LAUNCHER_ID}`) ||
      textNode.closest(QUOTED)
    ) return false;

    const text = safeText(textNode);
    return text.length > 0 && text.length < 20000;
  }

  // Uploaded media is stored in IndexedDB.
  function openMediaDB() {
    if (mediaDBPromise) return mediaDBPromise;

    mediaDBPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }

      const req = indexedDB.open(DB_NAME, 1);

      req.onupgradeneeded = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'key' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(
        req.error || new Error('Could not open media storage')
      );
    });

    return mediaDBPromise;
  }

  async function putMedia(key, file) {
    const db = await openMediaDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');

      tx.objectStore(DB_STORE).put({
        key,
        blob: file,
        type: file.type,
        name: file.name || 'uploaded media',
        savedAt: Date.now()
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(
        tx.error || new Error('Media save failed')
      );
    });
  }

  async function getMedia(key) {
    try {
      const db = await openMediaDB();

      return await new Promise((resolve, reject) => {
        const req = db.transaction(DB_STORE, 'readonly')
          .objectStore(DB_STORE)
          .get(key);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      return null;
    }
  }

  async function deleteMedia(key) {
    try {
      const db = await openMediaDB();

      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');

        tx.objectStore(DB_STORE).delete(key);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch (_) {
      // Restoring text should still work.
    }

    const url = objectURLs.get(key);

    if (url) URL.revokeObjectURL(url);

    objectURLs.delete(key);
  }

  function getMediaTypeFromURL(url) {
    try {
      const path = new URL(url).pathname.toLowerCase();

      if (/\.(mp4|webm|mov|m4v)$/.test(path)) return 'video';
      if (/\.gif$/.test(path)) return 'gif';
      if (/\.(png|jpe?g|webp|avif|bmp|svg)$/.test(path)) {
        return 'image';
      }

      return 'image';
    } catch (_) {
      return 'image';
    }
  }

  function validHttpURL(value) {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch (_) {
      return false;
    }
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const s = document.createElement('style');
    s.id = STYLE_ID;

    s.textContent = `
      #${LAUNCHER_ID},#${PANEL_ID},.wedit-inline,#wedit-toast,#wedit-update-notice {
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,
        BlinkMacSystemFont,"Segoe UI",sans-serif!important
      }

      html.wedit-quick-hide #${LAUNCHER_ID},
      html.wedit-quick-hide #${PANEL_ID},
      html.wedit-quick-hide .wedit-inline,
      html.wedit-quick-hide #wedit-toast,
      html.wedit-quick-hide #wedit-update-notice {display:none!important}

      #${LAUNCHER_ID} {
        position:fixed;z-index:999999;right:22px;bottom:22px;
        border:1px solid rgba(255,255,255,.16);border-radius:16px;
        padding:10px 14px;color:#f4f7fb;
        background:linear-gradient(135deg,#172d3b,#172b2b);
        box-shadow:0 12px 35px #0004;cursor:pointer;
        display:flex;align-items:center;gap:9px;font-size:13px;
        font-weight:750
      }

      #${LAUNCHER_ID}:hover {
        transform:translateY(-1px);box-shadow:0 15px 40px #0006
      }

      #${LAUNCHER_ID} .wedit-mark {
        width:25px;height:25px;border-radius:8px;
        display:grid;place-items:center;background:#42d6a4;
        color:#102820;font-size:15px
      }

      #${LAUNCHER_ID} .wedit-pill {
        margin-left:4px;color:#a8f0d3;font-size:10px;font-weight:800
      }

      #${LAUNCHER_ID} .wedit-drag-handle {
        display:grid;place-items:center;width:18px;height:25px;
        margin-left:-5px;color:#ffffff78;font-size:15px;line-height:1;
        cursor:grab;touch-action:none;user-select:none
      }
      #${LAUNCHER_ID} .wedit-drag-handle:active {cursor:grabbing}

      #${PANEL_ID} {
        position:fixed;z-index:999998;right:22px;bottom:78px;
        width:min(410px,calc(100vw - 28px));
        max-height:min(82vh,820px);display:none;flex-direction:column;
        overflow:hidden;border:1px solid #e2eff526;border-radius:20px;
        background:#10191f;color:#e7f0f3;box-shadow:0 24px 70px #0007;
        font-size:13px
      }

      #${PANEL_ID}.open {display:flex}
      #${PANEL_ID} * {box-sizing:border-box}
      #${PANEL_ID}.wedit-animate-liquid.open {animation:wedit-panel-liquid .34s cubic-bezier(.2,.85,.25,1) both;transform-origin:bottom right}
      #${PANEL_ID}.wedit-animate-ios.open {animation:wedit-panel-ios .62s cubic-bezier(.18,.9,.18,1) both;transform-origin:bottom right}
      #${PANEL_ID}.wedit-animate-liquid.open .wedit-pane:not([hidden])>*{animation:wedit-content-in .28s cubic-bezier(.2,.8,.2,1) both}
      #${PANEL_ID}.wedit-animate-liquid.open .wedit-pane:not([hidden])>*:nth-child(1){animation-delay:.04s}
      #${PANEL_ID}.wedit-animate-liquid.open .wedit-pane:not([hidden])>*:nth-child(2){animation-delay:.08s}
      #${PANEL_ID}.wedit-animate-liquid.open .wedit-pane:not([hidden])>*:nth-child(3){animation-delay:.12s}
      #${PANEL_ID}.wedit-animate-liquid.open .wedit-pane:not([hidden])>*:nth-child(4){animation-delay:.16s}
      @keyframes wedit-panel-liquid {from{opacity:0;transform:translateY(18px) scale(.94);filter:blur(8px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
      @keyframes wedit-panel-ios {0%{opacity:0;transform:translateY(28px) scale(.88);filter:blur(15px)}65%{opacity:1;transform:translateY(-3px) scale(1.01);filter:blur(0)}100%{transform:translateY(0) scale(1)}}
      @keyframes wedit-content-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
      #${PANEL_ID}.wedit-frame-flowers::after,#${PANEL_ID}.wedit-frame-pumpkin::after,#${PANEL_ID}.wedit-frame-chain::after{content:var(--wedit-frame-content);position:absolute;z-index:4;inset:4px;display:flex;justify-content:space-around;align-items:flex-start;padding:2px 7px;border:1px solid color-mix(in srgb,var(--wedit-accent) 70%,transparent);border-radius:15px;color:var(--wedit-accent);font-size:13px;letter-spacing:5px;line-height:1;pointer-events:none;text-shadow:0 1px 7px var(--wedit-panel);transition:transform .28s ease,filter .28s ease}
      #${PANEL_ID}.wedit-frame-flowers{--wedit-frame-content:'✿  ❀  ✿  ❀  ✿'}
      #${PANEL_ID}.wedit-frame-pumpkin{--wedit-frame-content:'🎃  ✦  🎃  ✦  🎃'}
      #${PANEL_ID}.wedit-frame-chain{--wedit-frame-content:'⛓  ⛓  ⛓  ⛓  ⛓'}
      #${PANEL_ID}.wedit-frame-chain.wedit-chain-hover:hover::after{transform:translateY(-2px) rotate(-.5deg);filter:drop-shadow(0 0 8px var(--wedit-accent))}
      #${PANEL_ID}.wedit-frame-chain.wedit-chain-hover .wedit-home-profile:hover{transform:translateY(-1px)}
      #${PANEL_ID} .wedit-home-profile{transition:transform .2s ease,border-color .2s ease}
      #${PANEL_ID}.wedit-no-motion.open{animation:none!important}
      @media(prefers-reduced-motion:reduce){#${PANEL_ID}.open{animation:none!important}#${PANEL_ID} *,#${PANEL_ID} *::before,#${PANEL_ID} *::after{scroll-behavior:auto!important;transition-duration:.01ms!important}}
      #wedit-welcome{position:fixed;z-index:1000002;inset:0;display:grid;place-items:center;padding:20px;background:#071018a8;backdrop-filter:blur(12px);animation:wedit-welcome-in .5s ease both}
      #wedit-welcome[hidden]{display:none}
      #wedit-welcome .wedit-welcome-card{width:min(440px,100%);padding:28px;border:1px solid color-mix(in srgb,var(--wedit-accent) 45%,var(--wedit-border));border-radius:26px;background:radial-gradient(ellipse at top right,color-mix(in srgb,var(--wedit-accent) 28%,transparent),transparent 65%),var(--wedit-panel);color:var(--wedit-text);box-shadow:0 30px 100px #0008;animation:wedit-welcome-card .7s cubic-bezier(.2,.9,.2,1) both}
      #wedit-welcome.wedit-welcome-classic{backdrop-filter:none;background:#071018c9}
      #wedit-welcome.wedit-welcome-classic .wedit-welcome-card{border-radius:16px;background:var(--wedit-panel)}
      #wedit-welcome .wedit-label{color:var(--wedit-accent);font-size:10px;font-weight:900;letter-spacing:1.2px}
      #wedit-welcome h2{margin:10px 0;color:var(--wedit-text);font-size:30px;letter-spacing:-1px}
      #wedit-welcome p{color:var(--wedit-muted);font-size:13px;line-height:1.6}
      @keyframes wedit-welcome-in{from{opacity:0}to{opacity:1}}
      @keyframes wedit-welcome-card{from{opacity:0;transform:translateY(20px) scale(.94);filter:blur(10px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}

      #${PANEL_ID} .wedit-header {
        padding:16px 17px 12px;
        background:radial-gradient(ellipse at top right,#38bd9129,transparent 60%),#142128;
        border-bottom:1px solid #ffffff14
      }

      #${PANEL_ID} .wedit-title-row {
        display:flex;align-items:center;justify-content:space-between;gap:10px
      }

      #${PANEL_ID} .wedit-title {
        font-weight:850;font-size:17px;letter-spacing:-.4px
      }

      #${PANEL_ID} .wedit-kicker {
        color:#91aaaf;font-size:10px;text-transform:uppercase;
        letter-spacing:1.3px;margin-bottom:4px;font-weight:800
      }

      #${PANEL_ID} .wedit-close {
        border:0;background:#ffffff12;color:#d7e2e6;
        border-radius:9px;width:30px;height:30px;cursor:pointer;font-size:18px
      }

      #${PANEL_ID} .wedit-note {
        margin-top:10px;padding:8px 10px;
        border:1px solid #5bd2a833;border-radius:10px;
        background:#33ac7e12;color:#a9e9d0;font-size:10.5px;line-height:1.45
      }

      #${PANEL_ID} .wedit-body {padding:12px 16px 15px;overflow:auto}

      #${PANEL_ID} .wedit-label {
        display:block;color:#9cb0b9;font-size:10px;font-weight:800;
        letter-spacing:.6px;text-transform:uppercase;margin:12px 0 6px
      }

      #${PANEL_ID} .wedit-context {
        padding:10px 11px;background:#17252d;
        border:1px solid #ffffff12;border-radius:11px;
        color:#dce8eb;line-height:1.45;word-break:break-word
      }

      #${PANEL_ID} .wedit-context small {
        display:block;color:#80dabb;font-size:10px;font-weight:800;
        letter-spacing:.65px;text-transform:uppercase;margin-bottom:5px
      }

      #${PANEL_ID} textarea,
      #${PANEL_ID} input[type=text],
      #${PANEL_ID} input[type=url],
      #${PANEL_ID} input[type=search] {
        width:100%;border:1px solid #30444d;border-radius:10px;
        background:#0d151a;color:#ecf5f7;padding:10px 11px;
        outline:none;font:inherit
      }

      #${PANEL_ID} textarea {
        min-height:76px;line-height:1.5;resize:vertical
      }

      #${PANEL_ID} .wedit-editor-toolbar {
        display:flex;justify-content:space-between;align-items:center;gap:8px;
        margin-top:5px;color:var(--wedit-muted);font-size:10px
      }

      #${PANEL_ID} .wedit-live-preview {
        margin-top:8px;padding:10px;border:1px solid var(--wedit-border);
        border-radius:10px;background:var(--wedit-surface);min-height:52px
      }

      #${PANEL_ID} .wedit-live-preview small {
        color:var(--wedit-muted);font-size:9px;font-weight:800;
        letter-spacing:.4px;text-transform:uppercase
      }

      #${PANEL_ID} .wedit-live-preview p {
        margin:6px 0 0;color:var(--wedit-text);font-size:12px;
        line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere
      }

      #${PANEL_ID} textarea:focus,
      #${PANEL_ID} input:focus {
        border-color:#43d7a4;box-shadow:0 0 0 3px #43d7a41a
      }

      #${PANEL_ID} .wedit-nav {
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
        gap:4px;padding:5px;margin:10px 14px 0;
        border:1px solid var(--wedit-border);border-radius:13px;
        background:var(--wedit-input)
      }

      #${PANEL_ID} .wedit-nav-tab {
        display:flex;align-items:center;justify-content:center;gap:5px;
        padding:9px 3px;border:0;border-radius:9px;
        background:transparent;color:var(--wedit-muted);
        font-size:10px;font-weight:800;cursor:pointer;
        transition:background .16s ease,transform .16s ease
      }

      #${PANEL_ID} .wedit-nav-tab span {font-size:14px;opacity:.9}
      #${PANEL_ID} .wedit-nav-tab:hover {transform:translateY(-1px)}
      #${PANEL_ID} .wedit-pane[hidden] {display:none!important}

      #${PANEL_ID} .wedit-home-banner {
        padding:16px;border:1px solid var(--wedit-border);border-radius:16px;
        background:radial-gradient(ellipse at top right,color-mix(in srgb,var(--wedit-accent) 18%,transparent),transparent 64%),var(--wedit-surface)
      }
      #${PANEL_ID} .wedit-home-banner h2 {
        margin:5px 0 3px;color:var(--wedit-text);font-size:20px;
        line-height:1.15;letter-spacing:-.6px
      }
      #${PANEL_ID} .wedit-home-banner p {margin:0;color:var(--wedit-muted);font-size:10px}
      #${PANEL_ID} .wedit-home-profile {
        display:flex;align-items:center;gap:10px;margin-top:10px;padding:12px;
        border:1px solid var(--wedit-border);border-radius:15px;background:var(--wedit-surface)
      }
      #${PANEL_ID} .wedit-profile-avatar {
        display:grid;place-items:center;flex:0 0 48px;width:48px;height:48px;
        overflow:hidden;border:2px solid color-mix(in srgb,var(--wedit-accent) 50%,var(--wedit-border));
        border-radius:50%;background:var(--wedit-surface2);color:var(--wedit-accent);
        font-size:18px;font-weight:900
      }
      #${PANEL_ID} .wedit-profile-avatar img {width:100%;height:100%;object-fit:cover}
      #${PANEL_ID} .wedit-profile-copy {display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}
      #${PANEL_ID} .wedit-profile-copy .wedit-label {margin:0;font-size:8px}
      #${PANEL_ID} .wedit-profile-copy strong {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--wedit-text)}
      #${PANEL_ID} .wedit-profile-copy>span:last-child {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--wedit-muted);font-size:9px}
      #${PANEL_ID} .wedit-profile-copy #wedit-profile-about{display:-webkit-box;white-space:normal;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;line-height:1.35}
      #${PANEL_ID} .wedit-profile-edit {margin-top:8px;border:1px solid var(--wedit-border);border-radius:12px;background:var(--wedit-surface);color:var(--wedit-text)}
      #${PANEL_ID} .wedit-profile-edit summary {padding:9px 11px;color:var(--wedit-accent);font-size:10px;font-weight:800;cursor:pointer}
      #${PANEL_ID} .wedit-profile-fields {display:grid;gap:8px;padding:0 11px 11px}
      #${PANEL_ID} .wedit-profile-fields label {display:grid;gap:5px;color:var(--wedit-muted);font-size:9px;font-weight:750}
      #${PANEL_ID} .wedit-profile-fields input[type=text],#${PANEL_ID} .wedit-profile-fields input[type=tel] {padding:8px;font-size:10px}
      #${PANEL_ID} #wedit-local-profile-photo {max-width:100%;font-size:9px;color:var(--wedit-muted)}
      #${PANEL_ID} .wedit-profile-photo {padding:8px;border:1px dashed var(--wedit-border);border-radius:9px;text-align:center;cursor:pointer}
      #${PANEL_ID} .wedit-home-stats {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:9px}
      #${PANEL_ID} .wedit-home-stats>div {display:flex;min-width:0;flex-direction:column;gap:3px;padding:9px;border:1px solid var(--wedit-border);border-radius:11px;background:var(--wedit-surface)}
      #${PANEL_ID} .wedit-home-stats span {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--wedit-accent);font-size:13px;font-weight:900}
      #${PANEL_ID} .wedit-home-stats small {color:var(--wedit-muted);font-size:8px}
      #${PANEL_ID} .wedit-home-shortcuts {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      #${PANEL_ID} .wedit-home-shortcuts button {display:grid;grid-template-columns:25px 1fr;gap:1px 7px;align-items:center;min-width:0;padding:9px;border:1px solid var(--wedit-border);border-radius:12px;background:var(--wedit-surface);color:var(--wedit-text);text-align:left;cursor:pointer;transition:transform .15s ease,border-color .15s ease}
      #${PANEL_ID} .wedit-home-shortcuts button:hover {transform:translateY(-1px);border-color:var(--wedit-accent)}
      #${PANEL_ID} .wedit-home-shortcuts button>span {grid-row:span 2;display:grid;place-items:center;width:25px;height:25px;border-radius:8px;background:var(--wedit-surface2);color:var(--wedit-accent);font-size:14px}
      #${PANEL_ID} .wedit-home-shortcuts b {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}
      #${PANEL_ID} .wedit-home-shortcuts small {color:var(--wedit-muted);font-size:8px;line-height:1.3}
      #${PANEL_ID} .wedit-home-release {display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px;border-top:1px solid var(--wedit-border);color:var(--wedit-text)}
      #${PANEL_ID} .wedit-home-release strong {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}

      #${PANEL_ID} .wedit-pane-heading {
        display:flex;justify-content:space-between;align-items:center;
        gap:8px;margin:2px 0 11px
      }

      #${PANEL_ID} .wedit-pane-heading .wedit-label {margin:0 0 2px}
      #${PANEL_ID} .wedit-heading-title {
        font-size:17px;font-weight:850;letter-spacing:-.3px;
        color:var(--wedit-text)
      }

      #${PANEL_ID} .wedit-live-dot {
        display:inline-flex;align-items:center;padding:5px 7px;
        border:1px solid var(--wedit-border);border-radius:7px;
        background:var(--wedit-surface2);color:var(--wedit-accent);
        font-size:9px;letter-spacing:.7px;font-weight:900;white-space:nowrap
      }

      #${PANEL_ID} .wedit-announcement-list,
      #${PANEL_ID} .wedit-changelog-list {
        display:flex;flex-direction:column;gap:8px;margin-top:10px
      }

      #${PANEL_ID} .wedit-announcement-card,
      #${PANEL_ID} .wedit-changelog-card {
        padding:11px;border:1px solid var(--wedit-border);border-radius:12px;
        background:var(--wedit-surface);color:var(--wedit-text)
      }

      #${PANEL_ID} .wedit-announcement-card h3,
      #${PANEL_ID} .wedit-changelog-card h3 {
        margin:0;font-size:13px;line-height:1.35
      }

      #${PANEL_ID} .wedit-announcement-meta,
      #${PANEL_ID} .wedit-changelog-meta {
        margin-top:4px;color:var(--wedit-muted);font-size:10px
      }

      #${PANEL_ID} .wedit-changelog-notes {
        display:flex;flex-direction:column;gap:5px;margin:8px 0 0;
        padding-left:17px;color:var(--wedit-text);font-size:11px;line-height:1.5
      }

      #${PANEL_ID} .wedit-announcement-body {
        margin:8px 0 0;color:var(--wedit-text);font-size:11px;
        line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere
      }

      #${PANEL_ID} .wedit-announcement-card a {
        display:inline-block;margin-top:8px;color:var(--wedit-accent);
        font-size:11px;font-weight:750
      }

      #${PANEL_ID} .wedit-sound-row {
        display:flex;align-items:center;gap:9px;margin-top:12px;padding:10px;
        border:1px solid var(--wedit-border);border-radius:11px;
        background:var(--wedit-surface);color:var(--wedit-text);font-size:11px
      }

      #${PANEL_ID} .wedit-sound-row input {accent-color:var(--wedit-accent)}

      #${PANEL_ID} .wedit-helper {
        margin-top:8px;color:var(--wedit-muted);font-size:10px;line-height:1.5
      }

      #${PANEL_ID} .wedit-section-copy {
        font-size:11px;line-height:1.5;color:var(--wedit-muted);margin:0 0 10px
      }

      #${PANEL_ID} .wedit-bottom-note {
        margin-top:14px;padding-top:10px;border-top:1px solid var(--wedit-border);
        font-size:9px;line-height:1.45;color:var(--wedit-muted);text-align:center
      }

      #${PANEL_ID} .wedit-or {
        text-align:center;color:var(--wedit-muted);font-size:10px;margin:9px 0
      }

      #${PANEL_ID} select {
        width:100%;padding:10px;border:1px solid var(--wedit-border);
        border-radius:10px;background:var(--wedit-input);
        color:var(--wedit-text);font:inherit;outline:none
      }

      #${PANEL_ID} .wedit-theme-grid {
        display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px
      }

      #${PANEL_ID} .wedit-theme-card {
        display:flex;flex-direction:column;align-items:flex-start;gap:6px;
        min-width:0;padding:10px;border:1px solid var(--wedit-border);
        border-radius:13px;background:var(--wedit-surface);
        color:var(--wedit-text);text-align:left;cursor:pointer;
        transition:transform .15s ease,border-color .15s ease
      }

      #${PANEL_ID} .wedit-theme-card:hover {transform:translateY(-1px)}

      #${PANEL_ID} .wedit-theme-swatches {
        display:flex;gap:5px;width:100%;margin-bottom:2px
      }

      #${PANEL_ID} .wedit-theme-swatches i {
        width:23px;height:23px;border-radius:8px;
        border:1px solid #ffffff22;box-shadow:inset 0 0 0 1px #00000008
      }

      #${PANEL_ID} .wedit-theme-name {font-size:11px;font-weight:850}

      #${PANEL_ID} .wedit-theme-desc {
        font-size:9px;line-height:1.35;color:var(--wedit-muted)
      }

      #${PANEL_ID} .wedit-colour-grid {
        display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px
      }

      #${PANEL_ID} .wedit-colour-grid label {
        display:flex;flex-direction:column;gap:6px;padding:8px;
        border:1px solid var(--wedit-border);border-radius:10px;
        background:var(--wedit-surface);color:var(--wedit-muted);
        font-size:10px;font-weight:750
      }

      #${PANEL_ID} input[type=color] {
        width:100%;height:30px;padding:2px;border:1px solid var(--wedit-border);
        border-radius:7px;background:var(--wedit-input);cursor:pointer
      }

      #${PANEL_ID} .wedit-glass-toggle {
        display:flex;align-items:center;gap:9px;padding:11px;margin-top:10px;
        border:1px solid var(--wedit-border);border-radius:12px;
        background:var(--wedit-surface);cursor:pointer
      }

      #${PANEL_ID} .wedit-glass-toggle input {
        accent-color:var(--wedit-accent);width:16px;height:16px
      }

      #${PANEL_ID} .wedit-glass-toggle span {
        display:flex;flex-direction:column;gap:3px;
        color:var(--wedit-text);font-size:11px
      }

      #${PANEL_ID} .wedit-glass-toggle small {
        color:var(--wedit-muted);font-size:9px;line-height:1.4
      }

      #${PANEL_ID} .wedit-mini-link {
        background:transparent;border:0;color:var(--wedit-accent);
        font-size:10px;font-weight:850;cursor:pointer
      }

      #${PANEL_ID} .wedit-wide {width:100%;margin-top:8px}

      #${PANEL_ID} .wedit-backup-card {
        display:flex;align-items:flex-start;gap:10px;padding:12px;
        border:1px solid var(--wedit-border);border-radius:13px;
        background:var(--wedit-surface)
      }

      #${PANEL_ID} .wedit-backup-icon {
        display:grid;place-items:center;flex:0 0 32px;height:32px;
        border-radius:10px;background:var(--wedit-surface2);
        color:var(--wedit-accent);font-size:18px;font-weight:900
      }

      #${PANEL_ID} .wedit-backup-card b,
      #${PANEL_ID} .wedit-restore-row b {
        font-size:11px;color:var(--wedit-text)
      }

      #${PANEL_ID} .wedit-backup-card p {
        margin:5px 0 0;color:var(--wedit-muted);font-size:10px;line-height:1.5
      }

      #${PANEL_ID} .wedit-restore-row {
        display:flex;align-items:center;justify-content:space-between;
        gap:10px;padding:11px;border:1px solid var(--wedit-border);
        border-radius:12px;background:var(--wedit-surface);margin-bottom:7px
      }

      #${PANEL_ID} .wedit-restore-row>div {display:flex;flex-direction:column;gap:4px}

      #${PANEL_ID} .wedit-restore-row small {
        max-width:210px;color:var(--wedit-muted);font-size:9px;line-height:1.4
      }

      #${PANEL_ID} .wedit-filebox {
        display:flex;align-items:center;justify-content:center;gap:8px;
        min-height:52px;border:1px dashed var(--wedit-border);
        border-radius:11px;background:var(--wedit-surface);padding:10px;
        text-align:center;color:var(--wedit-text);font-size:11px;
        font-weight:700;cursor:pointer;word-break:break-word
      }

      #${PANEL_ID} input[type=file] {display:none}

      #${PANEL_ID} .wedit-media-options {
        display:flex;align-items:center;justify-content:space-between;
        gap:10px;margin-top:8px;flex-wrap:wrap
      }

      #${PANEL_ID} .wedit-check {
        display:flex;align-items:center;gap:6px;color:var(--wedit-muted);
        font-size:11px
      }

      #${PANEL_ID} .wedit-check input {accent-color:var(--wedit-accent)}

      #${PANEL_ID} .wedit-actions {display:flex;gap:8px;margin-top:10px}
      #${PANEL_ID} button {font-family:inherit}

      #${PANEL_ID} .wedit-btn {
        border:1px solid transparent;border-radius:10px;
        padding:9px 11px;font-size:11px;font-weight:850;cursor:pointer
      }

      #${PANEL_ID} .wedit-primary {
        background:var(--wedit-accent);color:var(--wedit-panel);flex:1
      }

      #${PANEL_ID} .wedit-secondary {
        background:var(--wedit-surface2);border-color:var(--wedit-border);
        color:var(--wedit-text)
      }

      #${PANEL_ID} .wedit-danger {
        color:#ff9da4;background:color-mix(in srgb,#e85d66 12%,var(--wedit-panel));
        border-color:color-mix(in srgb,#e85d66 40%,var(--wedit-border))
      }

      #${PANEL_ID} .wedit-btn:disabled {opacity:.45;cursor:not-allowed}

      #${PANEL_ID} .wedit-section-row {
        display:flex;align-items:center;justify-content:space-between;
        gap:8px;margin-top:18px;margin-bottom:8px
      }

      #${PANEL_ID} .wedit-section-title {
        font-weight:850;color:var(--wedit-text);font-size:12px
      }

      #${PANEL_ID} .wedit-count {
        border-radius:7px;background:var(--wedit-surface2);
        color:var(--wedit-accent);font-size:10px;font-weight:800;padding:3px 7px
      }

      #${PANEL_ID} .wedit-list {display:flex;flex-direction:column;gap:8px}

      #${PANEL_ID} .wedit-empty {
        padding:12px;border:1px dashed var(--wedit-border);
        border-radius:12px;text-align:center;color:var(--wedit-muted);
        line-height:1.5;font-size:11px
      }

      #${PANEL_ID} .wedit-item {
        border:1px solid var(--wedit-border);background:var(--wedit-surface);
        border-radius:12px;padding:10px;cursor:pointer
      }

      #${PANEL_ID} .wedit-item:hover {border-color:var(--wedit-accent)}

      #${PANEL_ID} .wedit-item-top {
        display:flex;justify-content:space-between;align-items:center;
        gap:8px;margin-bottom:6px
      }

      #${PANEL_ID} .wedit-item-name {
        color:var(--wedit-muted);font-size:10px;white-space:nowrap;
        overflow:hidden;text-overflow:ellipsis
      }

      #${PANEL_ID} .wedit-undo {
        background:transparent;border:0;color:var(--wedit-accent);
        font-size:10px;font-weight:850;cursor:pointer;flex-shrink:0
      }

      #${PANEL_ID} .wedit-item-before,
      #${PANEL_ID} .wedit-item-after {
        overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;
        -webkit-line-clamp:2;word-break:break-word;line-height:1.4
      }

      #${PANEL_ID} .wedit-item-before {
        color:var(--wedit-muted);text-decoration:line-through;margin-bottom:4px
      }

      #${PANEL_ID} .wedit-item-after {color:var(--wedit-text)}

      #${PANEL_ID} .wedit-footer {
        display:flex;justify-content:space-between;align-items:center;
        gap:8px;margin-top:12px;padding-top:12px;
        border-top:1px solid var(--wedit-border);
        color:var(--wedit-muted);font-size:10px;flex-wrap:wrap
      }

      .wedit-inline {
        position:absolute!important;z-index:9999!important;
        top:4px!important;right:4px!important;opacity:0;
        pointer-events:none;border:1px solid var(--wedit-border)!important;
        border-radius:7px!important;padding:5px 7px!important;
        background:var(--wedit-surface)!important;color:var(--wedit-text)!important;
        font-size:10px!important;font-weight:800!important;
        box-shadow:0 3px 12px #0002!important;cursor:pointer!important
      }

      .wedit-message-hover:hover>.wedit-inline,
      .wedit-message-hover:focus-within>.wedit-inline {
        opacity:.9;pointer-events:auto
      }

      .wedit-inline.wedit-is-edited {opacity:0!important;pointer-events:none}

      .wedit-message-hover:hover>.wedit-inline.wedit-is-edited,
      .wedit-message-hover:focus-within>.wedit-inline.wedit-is-edited {
        opacity:.95!important;pointer-events:auto!important
      }

      .wedit-local-flag {display:none!important}

      #${PANEL_ID} .wedit-sticker-tray {
        display:grid;grid-template-columns:repeat(5,minmax(0,1fr));
        gap:6px;margin-top:5px
      }

      #${PANEL_ID} .wedit-sticker-pick {
        border:1px solid var(--wedit-border);border-radius:10px;
        background:var(--wedit-surface);color:var(--wedit-text);
        padding:7px 2px;cursor:pointer;display:flex;flex-direction:column;
        align-items:center;gap:4px;font-size:9px;font-weight:800
      }

      #${PANEL_ID} .wedit-sticker-pick:hover {
        border-color:var(--wedit-accent)
      }

      #${PANEL_ID} .wedit-sticker-icon {width:35px;height:35px;display:block}

      #${PANEL_ID} .wedit-my-sticker-grid {
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
        gap:7px;margin-top:7px
      }

      #${PANEL_ID} .wedit-my-sticker {
        position:relative;min-width:0;padding:6px;border:1px solid var(--wedit-border);
        border-radius:10px;background:var(--wedit-surface);color:var(--wedit-text);
        text-align:center
      }

      #${PANEL_ID} .wedit-my-sticker-select {
        width:100%;padding:0;border:0;background:transparent;color:inherit;
        cursor:pointer;text-align:center;font:inherit
      }

      #${PANEL_ID} .wedit-my-sticker-select img {
        display:block;width:100%;height:56px;object-fit:contain
      }

      #${PANEL_ID} .wedit-my-sticker-select span {
        display:block;overflow:hidden;margin-top:4px;font-size:9px;
        text-overflow:ellipsis;white-space:nowrap
      }

      #${PANEL_ID} .wedit-sticker-delete {
        position:absolute;top:2px;right:2px;width:19px;height:19px;
        border:0;border-radius:50%;background:#152128dd;color:#fff;
        cursor:pointer;font-size:13px;line-height:19px
      }

      .wedit-media-preview {
        display:block;clear:both;margin:5px 0 3px;
        max-width:min(280px,65vw);position:relative;overflow:hidden;
        border-radius:10px
      }

      .wedit-media-preview img {
        display:block;max-width:100%;max-height:330px;
        object-fit:contain;border-radius:10px
      }

      .wedit-media-preview video {
        display:block;max-width:100%;max-height:330px;
        border-radius:10px;background:#000
      }

      .wedit-media-preview.wedit-sticker {
        width:145px;max-width:145px;background:transparent!important;
        border-radius:0!important;overflow:visible
      }

      .wedit-media-preview.wedit-sticker img {
        width:100%;max-height:170px;object-fit:contain;
        border-radius:0;filter:drop-shadow(0 2px 2px #0002)
      }

      #wedit-toast {
        position:fixed;z-index:1000000;left:50%;bottom:26px;
        transform:translateX(-50%);max-width:calc(100vw - 30px);
        padding:10px 14px;border:1px solid var(--wedit-border);
        border-radius:12px;background:var(--wedit-surface);
        color:var(--wedit-text);font-size:12px;box-shadow:0 12px 30px #0005
      }

      #wedit-update-notice {
        position:fixed;z-index:1000001;right:22px;bottom:78px;
        display:flex;align-items:center;gap:10px;max-width:min(440px,calc(100vw - 28px));
        padding:12px;border:1px solid #45d5a4;border-radius:13px;
        background:#142128;color:#e7f0f3;font-size:12px;
        box-shadow:0 14px 36px #0007
      }

      #wedit-update-notice span {flex:1;line-height:1.45}
      #wedit-update-notice button {
        border:0;border-radius:8px;padding:8px 10px;background:#45d5a4;
        color:#102820;font:inherit;font-weight:800;cursor:pointer;white-space:nowrap
      }
      #wedit-update-notice .wedit-update-close {
        padding:5px 7px;background:transparent;color:#e7f0f3;font-size:16px
      }

      #${PANEL_ID}.wedit-glass .wedit-context,
      #${PANEL_ID}.wedit-glass .wedit-item,
      #${PANEL_ID}.wedit-glass .wedit-theme-card,
      #${PANEL_ID}.wedit-glass .wedit-backup-card,
      #${PANEL_ID}.wedit-glass .wedit-restore-row {
        background:color-mix(in srgb,var(--wedit-surface) 74%,transparent)!important;
        backdrop-filter:blur(10px)
      }

      #${PANEL_ID}.wedit-glass {
        background:color-mix(in srgb,var(--wedit-panel) 78%,transparent)!important;
        backdrop-filter:blur(26px) saturate(155%)!important;
        -webkit-backdrop-filter:blur(26px) saturate(155%)!important;
        box-shadow:0 24px 80px #0005,inset 0 1px #ffffff20!important
      }

      #${PANEL_ID} .wedit-header {
        background:linear-gradient(135deg,
        color-mix(in srgb,var(--wedit-accent) 12%,transparent),
        transparent 68%),var(--wedit-surface)!important;
        border-color:var(--wedit-border)!important
      }

      #${PANEL_ID} .wedit-body {background:transparent!important}
      #${PANEL_ID} .wedit-title {color:var(--wedit-text)!important}

      #${PANEL_ID} .wedit-kicker,
      #${PANEL_ID} .wedit-label,
      #${PANEL_ID} .wedit-section-copy,
      #${PANEL_ID} .wedit-helper,
      #${PANEL_ID} .wedit-footer,
      #${PANEL_ID} .wedit-bottom-note {
        color:var(--wedit-muted)!important
      }

      #${PANEL_ID} .wedit-note {
        background:color-mix(in srgb,var(--wedit-accent) 9%,transparent)!important;
        border-color:color-mix(in srgb,var(--wedit-accent) 28%,transparent)!important;
        color:var(--wedit-text)!important
      }

      #${PANEL_ID} .wedit-nav {background:var(--wedit-input)!important;border-color:var(--wedit-border)!important}
      #${PANEL_ID} .wedit-nav-tab {color:var(--wedit-muted)!important}

      #${PANEL_ID} .wedit-nav-tab.active {
        background:var(--wedit-surface2)!important;
        color:var(--wedit-accent)!important;
        box-shadow:inset 0 0 0 1px var(--wedit-border)!important
      }

      #${PANEL_ID} .wedit-primary {
        background:var(--wedit-accent)!important;color:var(--wedit-panel)!important
      }

      #${PANEL_ID} .wedit-secondary {
        background:var(--wedit-surface2)!important;
        border-color:var(--wedit-border)!important;color:var(--wedit-text)!important
      }

      #${PANEL_ID} .wedit-count {
        background:var(--wedit-surface2)!important;color:var(--wedit-accent)!important
      }

      #${PANEL_ID} .wedit-item-name,
      #${PANEL_ID} .wedit-item-before {color:var(--wedit-muted)!important}

      #${PANEL_ID} .wedit-item-after,
      #${PANEL_ID} .wedit-section-title,
      #${PANEL_ID} .wedit-heading-title {color:var(--wedit-text)!important}

      #${PANEL_ID} .wedit-live-dot {
        background:color-mix(in srgb,var(--wedit-accent) 15%,transparent)!important;
        color:var(--wedit-accent)!important;
        border-color:color-mix(in srgb,var(--wedit-accent) 25%,transparent)!important
      }

      #${PANEL_ID} .wedit-theme-card.active {
        border-color:var(--wedit-accent)!important;
        box-shadow:0 0 0 1px var(--wedit-accent)!important
      }

      #${PANEL_ID} .wedit-theme-desc {color:var(--wedit-muted)!important}
      #${PANEL_ID} .wedit-mini-link,#${PANEL_ID} .wedit-undo {color:var(--wedit-accent)!important}
      #${PANEL_ID} .wedit-bottom-note {border-top:1px solid var(--wedit-border)!important}

      #${LAUNCHER_ID} {
        background:linear-gradient(135deg,var(--wedit-surface),var(--wedit-panel))!important;
        color:var(--wedit-text)!important;border-color:var(--wedit-border)!important
      }

      #${LAUNCHER_ID}.wedit-glass {
        background:color-mix(in srgb,var(--wedit-panel) 75%,transparent)!important;
        backdrop-filter:blur(22px) saturate(150%)!important;
        -webkit-backdrop-filter:blur(22px) saturate(150%)!important;
        box-shadow:0 12px 35px #0004,inset 0 1px #ffffff20!important
      }

      #${LAUNCHER_ID} .wedit-mark {
        background:var(--wedit-accent)!important;color:var(--wedit-panel)!important
      }

      #${LAUNCHER_ID} .wedit-pill {color:var(--wedit-accent)!important}
    `;

    document.head.appendChild(s);
    installThemeStyles();
  }

  function makeLauncherDraggable(launcher) {
    const handle = launcher.querySelector('.wedit-drag-handle');
    if (!handle) return;
    let drag = null;
    let suppressClickUntil = 0;

    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      const rect = launcher.getBoundingClientRect();
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      const maxLeft = Math.max(8, innerWidth - launcher.offsetWidth - 8);
      const maxTop = Math.max(8, innerHeight - launcher.offsetHeight - 8);
      const left = Math.min(maxLeft, Math.max(8, drag.left + dx));
      const top = Math.min(maxTop, Math.max(8, drag.top + dy));
      launcher.style.left = `${left}px`;
      launcher.style.top = `${top}px`;
      launcher.style.right = 'auto';
      launcher.style.bottom = 'auto';
      if (panelOpen) positionPanelFromLauncher();
    });

    const finishDrag = event => {
      if (!drag || drag.id !== event.pointerId) return;
      if (drag.moved) {
        suppressClickUntil = Date.now() + 350;
        try {
          localStorage.setItem(LAUNCHER_POSITION_KEY, JSON.stringify({
            left: parseFloat(launcher.style.left),
            top: parseFloat(launcher.style.top)
          }));
        } catch (_) {}
      }
      drag = null;
    };
    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
    launcher.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    window.addEventListener('resize', () => {
      restoreLauncherPosition(launcher);
      if (panelOpen) positionPanelFromLauncher();
    });
  }

  function restoreLauncherPosition(launcher) {
    try {
      const saved = JSON.parse(localStorage.getItem(LAUNCHER_POSITION_KEY) || 'null');
      if (!Number.isFinite(saved?.left) || !Number.isFinite(saved?.top)) return;
      const left = Math.min(Math.max(8, innerWidth - launcher.offsetWidth - 8), Math.max(8, saved.left));
      const top = Math.min(Math.max(8, innerHeight - launcher.offsetHeight - 8), Math.max(8, saved.top));
      launcher.style.left = `${left}px`;
      launcher.style.top = `${top}px`;
      launcher.style.right = 'auto';
      launcher.style.bottom = 'auto';
    } catch (_) {}
  }

  function positionPanelFromLauncher() {
    const launcher = document.getElementById(LAUNCHER_ID);
    const panel = document.getElementById(PANEL_ID);
    if (!launcher || !panel || !panelOpen) return;
    requestAnimationFrame(() => {
      const button = launcher.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      const width = box.width || Math.min(410, innerWidth - 28);
      const height = box.height || Math.min(innerHeight * 0.82, 820);
      const left = Math.min(innerWidth - width - 8, Math.max(8, button.right - width));
      let top = button.top - height - 10;
      if (top < 8) top = Math.min(innerHeight - height - 8, button.bottom + 10);
      panel.style.left = `${Math.max(8, left)}px`;
      panel.style.top = `${Math.max(8, top)}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    });
  }

  function buildUI() {
    if (document.getElementById(PANEL_ID)) return;

    const launcher = document.createElement('button');
    launcher.id = LAUNCHER_ID;
    launcher.type = 'button';
    launcher.innerHTML =
      '<span class="wedit-drag-handle" title="Drag to move WEdit">⠿</span>' +
      '<span class="wedit-mark">W</span>' +
      '<span>WEdit <span class="wedit-pill" id="wedit-launcher-state">' +
      'LOCAL STUDIO</span></span>';

    launcher.addEventListener('click', event => {
      if (event.target.closest('.wedit-drag-handle')) return;
      togglePanel();
    });
    makeLauncherDraggable(launcher);
    document.body.appendChild(launcher);
    restoreLauncherPosition(launcher);

    const panel = document.createElement('aside');
    panel.id = PANEL_ID;

    panel.innerHTML = `
      <div class="wedit-header">
        <div class="wedit-title-row">
          <div>
            <div class="wedit-kicker">WhatsApp Web utility</div>
            <div class="wedit-title">WEdit
              <span style="color:var(--wedit-accent);font-size:10px;letter-spacing:.6px">
                STUDIO 4.1
              </span>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="wedit-mini-link" id="wedit-quick-hide" type="button"
              title="Hide previews and WEdit controls (Alt+Shift+H)">Quick hide</button>
            <button class="wedit-close" type="button"
              title="Close panel" aria-label="Close panel">×</button>
          </div>
        </div>
        <div class="wedit-note">
          <b>Private local previews.</b> Edits, themes and media are stored
          in this browser only. They do not change WhatsApp messages or what
          other people see.
        </div>
      </div>

      <nav class="wedit-nav" aria-label="WEdit sections">
        <button type="button" class="wedit-nav-tab active"
          data-tab="home"><span>⌂</span> Home</button>
        <button type="button" class="wedit-nav-tab"
          data-tab="editor"><span>✎</span> Editor</button>
        <button type="button" class="wedit-nav-tab"
          data-tab="media"><span>▧</span> Media</button>
        <button type="button" class="wedit-nav-tab"
          data-tab="themes"><span>◐</span> Themes</button>
        <button type="button" class="wedit-nav-tab"
          data-tab="backup"><span>↻</span> Backup</button>
        <button type="button" class="wedit-nav-tab"
          data-tab="changelog"><span>≡</span> Changelog</button>
        <button type="button" class="wedit-nav-tab"
          data-tab="announcements"><span>◉</span> News</button>
      </nav>

      <div class="wedit-body">
        <section id="wedit-pane-home" class="wedit-pane">
          <div class="wedit-home-banner">
            <div class="wedit-label">YOUR WEDIT SPACE</div>
            <h2>Everything, one tap away.</h2>
            <p>Personal shortcuts and your local preview setup.</p>
          </div>

          <div class="wedit-home-profile">
            <div class="wedit-profile-avatar" id="wedit-profile-avatar">W</div>
            <div class="wedit-profile-copy">
              <span class="wedit-label">YOUR WHATSAPP PROFILE</span>
              <strong id="wedit-profile-name">WhatsApp profile</strong>
              <span id="wedit-profile-about">Open your profile to sync your About text</span>
              <span id="wedit-profile-phone">Phone number isn’t shown in this view</span>
            </div>
            <button class="wedit-btn wedit-secondary" id="wedit-open-own-profile" type="button">Sync profile</button>
          </div>

          <details class="wedit-profile-edit">
            <summary>Personalize this card on this device</summary>
            <div class="wedit-profile-fields">
              <label>Name shown on this card<input id="wedit-local-profile-name"
                type="text" maxlength="60" placeholder="Your name"></label>
              <label>Phone label (optional)<input id="wedit-local-profile-phone"
                type="tel" maxlength="32" placeholder="Add a number for your own reference"></label>
              <label class="wedit-profile-photo" for="wedit-local-profile-photo">Choose a card photo</label>
              <input id="wedit-local-profile-photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
              <button class="wedit-btn wedit-secondary" id="wedit-clear-profile-photo" type="button">Use WhatsApp photo</button>
              <div class="wedit-helper">These details only customize this WEdit card. Use <b>Open profile</b> to change the real WhatsApp account profile.</div>
            </div>
          </details>

          <div class="wedit-home-stats">
            <div><span id="wedit-home-preview-count">0</span><small>saved previews</small></div>
            <div><span id="wedit-home-theme">Midnight</span><small>active theme</small></div>
            <div><span id="wedit-home-sticker-count">0</span><small>your stickers</small></div>
          </div>

          <div class="wedit-section-row"><div class="wedit-section-title">Quick shortcuts</div></div>
          <div class="wedit-home-shortcuts">
            <button type="button" data-home-tab="editor"><span>✎</span><b>Message editor</b><small>Open your local previews</small></button>
            <button type="button" data-home-tab="media"><span>▧</span><b>Stickers & media</b><small>Import your sticker files</small></button>
            <button type="button" data-home-tab="themes"><span>◐</span><b>Themes</b><small>Pick or import a palette</small></button>
            <button type="button" data-home-tab="backup"><span>↻</span><b>Backups</b><small>Save or restore your data</small></button>
            <button type="button" data-home-tab="changelog"><span>≡</span><b>Changelog</b><small>See what changed</small></button>
            <button type="button" data-home-tab="announcements"><span>◉</span><b>Announcements</b><small>Read WEdit news</small></button>
          </div>

          <div class="wedit-home-release">
            <span class="wedit-live-dot" id="wedit-home-release-version">LATEST RELEASE</span>
            <strong id="wedit-home-release-title">WEdit 4.1.0</strong>
            <button class="wedit-mini-link" type="button" data-home-tab="changelog">Read release notes →</button>
          </div>
        </section>

        <section id="wedit-pane-editor" class="wedit-pane">
          <div class="wedit-pane-heading">
            <div>
              <div class="wedit-label">Editor</div>
              <div class="wedit-heading-title">Message preview</div>
            </div>
            <span class="wedit-live-dot">LOCAL</span>
          </div>

          <div class="wedit-context" id="wedit-original">
            <small>No message selected</small>
            Hover over a text message and press Edit.
          </div>

          <label class="wedit-label" for="wedit-replacement">
            Replacement text
          </label>

          <textarea id="wedit-replacement"
            placeholder="Write your local preview…" disabled></textarea>

          <div class="wedit-editor-toolbar">
            <span id="wedit-char-count">0 characters</span>
            <button id="wedit-use-original" class="wedit-mini-link"
              type="button" disabled>Reset draft to original</button>
          </div>

          <div class="wedit-live-preview" aria-live="polite">
            <small>Preview · changes only after Apply</small>
            <p id="wedit-live-preview-text">Select a message to preview your edit.</p>
          </div>

          <div class="wedit-actions">
            <button class="wedit-btn wedit-primary" id="wedit-apply"
              type="button" disabled>Apply local preview</button>
            <button class="wedit-btn wedit-secondary" id="wedit-reset"
              type="button" disabled>Restore message</button>
          </div>

          <div class="wedit-helper">
            Ctrl/⌘ + Enter applies your edit. Alt + Shift + E toggles WEdit.
          </div>

          <div class="wedit-section-row">
            <div class="wedit-section-title">Saved previews</div>
            <span id="wedit-count" class="wedit-count">0</span>
          </div>

          <input id="wedit-search" type="search"
            placeholder="Search saved previews…" autocomplete="off">

          <div class="wedit-list" id="wedit-list" style="margin-top:8px"></div>

          <div class="wedit-footer">
            <span id="wedit-storage-label">Stored on this device</span>
            <button class="wedit-btn wedit-secondary"
              id="wedit-open-backup" type="button">Backup options →</button>
          </div>
        </section>

        <section id="wedit-pane-media" class="wedit-pane" hidden>
          <div class="wedit-pane-heading">
            <div>
              <div class="wedit-label">Media lab</div>
              <div class="wedit-heading-title">Make a media preview</div>
            </div>
            <span class="wedit-live-dot">LOCAL</span>
          </div>

          <div class="wedit-context">
            <small>How it works</small>
            Choose a message first, then apply a sticker, image, GIF or video
            preview. This stays in your browser and is never sent.
          </div>

          <span class="wedit-label">Starter stickers</span>
          <div class="wedit-sticker-tray" id="wedit-sticker-tray"></div>

          <div class="wedit-section-row">
            <div class="wedit-section-title">My WhatsApp stickers</div>
            <span id="wedit-sticker-count" class="wedit-count">0</span>
          </div>
          <div class="wedit-helper">
            First save or export sticker images from WhatsApp to your device. Then choose WebP, PNG, JPG, or GIF files here. WEdit cannot read WhatsApp's private app storage. Tap a saved sticker to attach it to the selected local preview.
          </div>
          <div class="wedit-actions">
            <button class="wedit-btn wedit-secondary" id="wedit-pick-stickers"
              type="button">Choose sticker files</button>
            <button class="wedit-btn wedit-secondary" id="wedit-pick-sticker-folder"
              type="button">Import a folder</button>
          </div>
          <input id="wedit-sticker-files" type="file"
            accept=".webp,.png,.jpg,.jpeg,.gif,.avif" multiple>
          <input id="wedit-sticker-folder" type="file"
            accept=".webp,.png,.jpg,.jpeg,.gif,.avif"
            multiple webkitdirectory directory>
          <div class="wedit-helper" id="wedit-sticker-import-status">
            Choose up to 100 images, 5 MB each, and 60 MB total per import. Your sticker shelf stays on this device.
          </div>
          <div class="wedit-my-sticker-grid" id="wedit-my-sticker-grid"></div>

          <span class="wedit-label">Upload media</span>
          <label class="wedit-filebox" for="wedit-file">
            <span>＋</span>
            <span id="wedit-file-name">Choose image, GIF, sticker image, or video</span>
          </label>

          <input id="wedit-file" type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime,video/x-m4v">

          <div class="wedit-or">or use a direct media URL</div>

          <input id="wedit-media-url" type="url"
            placeholder="https://…/image.gif or clip.mp4" autocomplete="off">

          <div class="wedit-media-options">
            <label class="wedit-check">
              <input id="wedit-sticker" type="checkbox"> Sticker-style display
            </label>
            <button class="wedit-btn wedit-secondary"
              id="wedit-remove-media" type="button">Remove media</button>
          </div>

          <div id="wedit-media-status" class="wedit-helper">
            Uploaded media is saved locally. GIF animations and video controls
            depend on browser support.
          </div>

          <div class="wedit-actions">
            <button class="wedit-btn wedit-primary" id="wedit-apply-media"
              type="button" disabled>Apply media preview</button>
            <button class="wedit-btn wedit-secondary" id="wedit-back-editor"
              type="button">Back to editor</button>
          </div>
        </section>

        <section id="wedit-pane-themes" class="wedit-pane" hidden>
          <div class="wedit-pane-heading">
            <div>
              <div class="wedit-label">Appearance</div>
              <div class="wedit-heading-title">Make it yours</div>
            </div>
            <span class="wedit-live-dot" id="wedit-current-theme-label">MIDNIGHT</span>
          </div>

          <p class="wedit-section-copy">
            Choose a preset or build your own palette. Changes apply instantly.
          </p>

          <div class="wedit-theme-grid" id="wedit-theme-grid"></div>

          <div class="wedit-section-row">
            <div class="wedit-section-title">Custom palette</div>
            <button id="wedit-reset-theme" type="button"
              class="wedit-mini-link">Reset</button>
          </div>

          <div class="wedit-colour-grid">
            <label>Panel <input type="color" id="wedit-color-panel" data-color="panel"></label>
            <label>Surface <input type="color" id="wedit-color-surface" data-color="surface"></label>
            <label>Text <input type="color" id="wedit-color-text" data-color="text"></label>
            <label>Accent <input type="color" id="wedit-color-accent" data-color="accent"></label>
            <label>Border <input type="color" id="wedit-color-border" data-color="border"></label>
            <label>Input <input type="color" id="wedit-color-input" data-color="input"></label>
          </div>

          <label class="wedit-glass-toggle">
            <input id="wedit-glass-toggle" type="checkbox">
            <span>
              <b>Liquid Glass layer</b>
              <small>Blur, translucent surfaces and soft highlights</small>
            </span>
          </label>

          <div class="wedit-actions">
            <button id="wedit-export-theme" class="wedit-btn wedit-primary"
              type="button">Export theme JSON</button>
            <button id="wedit-import-theme-trigger" class="wedit-btn wedit-secondary"
              type="button">Import theme</button>
          </div>

          <input id="wedit-theme-file" type="file" accept="application/json,.json">

          <div class="wedit-helper">
            Theme files are JSON, so you can keep and share your own palettes.
          </div>

          <div class="wedit-section-row"><div class="wedit-section-title">Motion & frame</div></div>
          <label class="wedit-label" for="wedit-motion-style">Panel opening animation</label>
          <select id="wedit-motion-style"><option value="liquid">Liquid pop</option><option value="ios">iOS welcome glide</option><option value="none">No animation</option></select>
          <label class="wedit-label" for="wedit-frame-style">Decorative border</label>
          <select id="wedit-frame-style"><option value="none">No frame</option><option value="flowers">Flowers</option><option value="pumpkin">Pumpkins</option><option value="chain">Sleek chains</option></select>
          <label class="wedit-glass-toggle"><input id="wedit-chain-hover" type="checkbox"><span><b>Move chains on hover</b><small>Subtle movement when the pointer reaches the panel.</small></span></label>
          <label class="wedit-label" for="wedit-welcome-style">New-version welcome card</label>
          <select id="wedit-welcome-style"><option value="glass">Liquid Glass</option><option value="classic">Classic</option></select>
          <div class="wedit-helper">The welcome card appears once after an update. This choice is separate from the panel opening animation.</div>

          <div class="wedit-section-row"><div class="wedit-section-title">Your interface sound</div></div>
          <input id="wedit-sound-file" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac">
          <div class="wedit-actions">
            <button class="wedit-btn wedit-secondary" id="wedit-import-sound" type="button">Import sound</button>
            <button class="wedit-btn wedit-secondary" id="wedit-preview-sound" type="button">Preview</button>
            <button class="wedit-btn wedit-secondary" id="wedit-remove-sound" type="button">Remove</button>
          </div>
          <div class="wedit-helper" id="wedit-sound-status">Optional: MP3, WAV, OGG, or M4A up to 3 MB and 15 seconds. Stored on this device.</div>
        </section>

        <section id="wedit-pane-backup" class="wedit-pane" hidden>
          <div class="wedit-pane-heading">
            <div>
              <div class="wedit-label">Safety & restore</div>
              <div class="wedit-heading-title">Your data, under control</div>
            </div>
            <span class="wedit-live-dot">BACKUP</span>
          </div>

          <div class="wedit-backup-card">
            <div class="wedit-backup-icon">↓</div>
            <div>
              <b>Full WEdit backup</b>
              <p>
                Includes saved preview text, media uploads and your current
                theme. Media is embedded in the JSON file, so large backups
                can be large too.
              </p>
            </div>
          </div>

          <button id="wedit-export-backup"
            class="wedit-btn wedit-primary wedit-wide"
            type="button">Download full backup</button>

          <div class="wedit-section-row">
            <div class="wedit-section-title">Import a backup</div>
          </div>

          <label class="wedit-filebox" for="wedit-backup-file">
            <span>↑</span>
            <span id="wedit-backup-name">Choose a WEdit JSON backup</span>
          </label>

          <input id="wedit-backup-file" type="file" accept="application/json,.json">

          <label class="wedit-label" for="wedit-import-mode">
            Import behaviour
          </label>

          <select id="wedit-import-mode">
            <option value="merge">Merge with current previews</option>
            <option value="replace">Replace current saved set</option>
          </select>

          <button id="wedit-import-backup"
            class="wedit-btn wedit-secondary wedit-wide"
            type="button">Import backup</button>

          <div class="wedit-section-row">
            <div class="wedit-section-title">Restore options</div>
          </div>

          <div class="wedit-restore-row">
            <div>
              <b>Restore every preview</b>
              <small>Remove all saved text/media edits and show originals where loaded.</small>
            </div>
            <button id="wedit-restore-all" type="button"
              class="wedit-btn wedit-danger">Restore all</button>
          </div>

          <div class="wedit-restore-row">
            <div>
              <b>Reset appearance</b>
              <small>Switch back to the default Midnight theme.</small>
            </div>
            <button id="wedit-reset-appearance" type="button"
              class="wedit-btn wedit-secondary">Reset</button>
          </div>

          <div id="wedit-backup-status" class="wedit-helper">
            Backups stay on your device unless you choose to move them elsewhere.
          </div>
        </section>

        <section id="wedit-pane-changelog" class="wedit-pane" hidden>
          <div class="wedit-pane-heading">
            <div>
              <div class="wedit-label">Release notes</div>
              <div class="wedit-heading-title">Changelog</div>
            </div>
            <span class="wedit-live-dot">4.1.0</span>
          </div>
          <div class="wedit-changelog-list" id="wedit-changelog-list"></div>
        </section>

        <section id="wedit-pane-announcements" class="wedit-pane" hidden>
          <div class="wedit-pane-heading">
            <div>
              <div class="wedit-label">From WEdit</div>
              <div class="wedit-heading-title">Announcements</div>
            </div>
            <button class="wedit-mini-link" id="wedit-refresh-announcements"
              type="button">Refresh</button>
          </div>
          <div class="wedit-helper" id="wedit-announcements-status" role="status">
            Announcements load from the public WEdit feed. They contain text and optional web links.
          </div>
          <div class="wedit-announcement-list" id="wedit-announcement-list"></div>
          <div class="wedit-helper">
            Posts are published on the WEdit newsroom. <a href="https://wedit-whatsapp-preview.vercel.app/" target="_blank" rel="noopener noreferrer">Open the newsroom →</a>
          </div>
          <label class="wedit-sound-row">
            <input id="wedit-sound-toggle" type="checkbox">
            <span>Play interface sound effects</span>
          </label>
          <div class="wedit-helper">
            Sounds are generated on this device. Feed checks run when opened and every 15 minutes while this tab stays active.
          </div>
        </section>

        <div class="wedit-bottom-note">
          WEdit only changes the view in this browser. It does not send or
          edit real WhatsApp messages.
        </div>
      </div>`;

    document.body.appendChild(panel);

    panel.querySelector('.wedit-close')
      .addEventListener('click', () => togglePanel(false));

    panel.querySelector('#wedit-quick-hide')
      .addEventListener('click', () => setQuickHide(true));

    panel.querySelectorAll('.wedit-nav-tab').forEach(btn =>
      btn.addEventListener('click', () => {
        playInterfaceSound('tap');
        setTab(btn.dataset.tab);
      })
    );

    panel.querySelectorAll('[data-home-tab]').forEach(btn =>
      btn.addEventListener('click', () => {
        playInterfaceSound('tap');
        setTab(btn.dataset.homeTab);
      })
    );

    panel.querySelector('#wedit-open-own-profile')
      .addEventListener('click', openWhatsAppProfile);

    panel.querySelector('#wedit-local-profile-name')
      .value = localProfileCard.name || '';
    panel.querySelector('#wedit-local-profile-phone')
      .value = localProfileCard.phone || '';
    panel.querySelector('#wedit-local-profile-name')
      .addEventListener('input', saveProfileCardFields);
    panel.querySelector('#wedit-local-profile-phone')
      .addEventListener('input', saveProfileCardFields);
    panel.querySelector('#wedit-local-profile-photo')
      .addEventListener('change', handleProfilePhoto);
    panel.querySelector('#wedit-clear-profile-photo')
      .addEventListener('click', () => {
        localProfileCard.photo = '';
        try { localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(localProfileCard)); }
        catch (_) {}
        renderHomeProfile();
        showToast('Using the WhatsApp toolbar photo when available.');
      });
    renderHomeProfile();
    renderHomeRelease();

    panel.querySelector('#wedit-refresh-announcements')
      .addEventListener('click', () => {
        playInterfaceSound('tap');
        refreshAnnouncements(true);
      });

    panel.querySelector('#wedit-pick-stickers')
      .addEventListener('click', () =>
        panel.querySelector('#wedit-sticker-files').click()
      );

    panel.querySelector('#wedit-pick-sticker-folder')
      .addEventListener('click', () =>
        panel.querySelector('#wedit-sticker-folder').click()
      );

    for (const input of [
      panel.querySelector('#wedit-sticker-files'),
      panel.querySelector('#wedit-sticker-folder')
    ]) {
      input.addEventListener('change', event => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        importUserStickers(files);
      });
    }

    panel.querySelector('#wedit-sound-toggle').checked = soundsEnabled();
    panel.querySelector('#wedit-sound-toggle')
      .addEventListener('change', event => {
        try {
          localStorage.setItem(
            SOUND_STORE_KEY,
            event.target.checked ? 'on' : 'off'
          );
        } catch (_) {
          showToast('Could not save sound preference.');
        }
        if (event.target.checked) playInterfaceSound('success');
      });

    panel.querySelector('#wedit-import-sound').addEventListener('click', () => panel.querySelector('#wedit-sound-file').click());
    panel.querySelector('#wedit-sound-file').addEventListener('change', importInterfaceSound);
    panel.querySelector('#wedit-preview-sound').addEventListener('click', () => previewInterfaceSound());
    panel.querySelector('#wedit-remove-sound').addEventListener('click', async () => {
      await deleteMedia(SOUND_MEDIA_KEY);
      renderSoundStatus();
      showToast('Custom sound removed.');
    });

    panel.querySelector('#wedit-apply')
      .addEventListener('click', applyActiveEdit);

    panel.querySelector('#wedit-apply-media')
      .addEventListener('click', async () => {
        await applyActiveEdit();
        setTab('editor');
      });

    panel.querySelector('#wedit-reset')
      .addEventListener('click', restoreActiveEdit);

    panel.querySelector('#wedit-restore-all')
      .addEventListener('click', clearAllEdits);

    panel.querySelector('#wedit-reset-appearance')
      .addEventListener('click', () => applyTheme(THEME_PRESETS[0]));

    panel.querySelector('#wedit-open-backup')
      .addEventListener('click', () => setTab('backup'));

    panel.querySelector('#wedit-back-editor')
      .addEventListener('click', () => setTab('editor'));

    panel.querySelector('#wedit-export-backup')
      .addEventListener('click', exportBackup);

    panel.querySelector('#wedit-import-backup')
      .addEventListener('click', importBackup);

    panel.querySelector('#wedit-backup-file')
      .addEventListener('change', e => {
        pendingBackupFile = e.target.files?.[0] || null;

        panel.querySelector('#wedit-backup-name').textContent =
          pendingBackupFile
            ? `${pendingBackupFile.name} · ${formatBytes(pendingBackupFile.size)}`
            : 'Choose a WEdit JSON backup';

        panel.querySelector('#wedit-backup-status').textContent =
          pendingBackupFile
            ? 'Backup selected. Choose merge or replace, then click Import backup.'
            : 'No backup selected.';
      });

    panel.querySelector('#wedit-export-theme')
      .addEventListener('click', exportTheme);

    panel.querySelector('#wedit-import-theme-trigger')
      .addEventListener('click', () =>
        panel.querySelector('#wedit-theme-file').click()
      );

    panel.querySelector('#wedit-theme-file')
      .addEventListener('change', e => {
        pendingThemeFile = e.target.files?.[0] || null;
        if (pendingThemeFile) importThemeFile(pendingThemeFile);
      });

    panel.querySelectorAll('[data-color]').forEach(input =>
      input.addEventListener('input', updateCustomThemeFromControls)
    );

    panel.querySelector('#wedit-glass-toggle')
      .addEventListener('change', updateCustomThemeFromControls);
    for (const id of ['wedit-motion-style','wedit-frame-style','wedit-chain-hover']) {
      panel.querySelector(`#${id}`).addEventListener('change', updateCustomThemeFromControls);
    }
    panel.querySelector('#wedit-welcome-style').addEventListener('change', updateCustomThemeFromControls);

    panel.querySelector('#wedit-reset-theme')
      .addEventListener('click', () => applyTheme(THEME_PRESETS[0]));

    panel.querySelector('#wedit-search')
      .addEventListener('input', e => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderEditList();
      });

    panel.querySelector('#wedit-replacement')
      .addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          applyActiveEdit();
        }
      });

    panel.querySelector('#wedit-replacement')
      .addEventListener('input', updateEditorPreview);

    panel.querySelector('#wedit-use-original')
      .addEventListener('click', () => {
        const input = panel.querySelector('#wedit-replacement');
        input.value = activeOriginalText;
        updateEditorPreview();
        input.focus();
      });

    panel.querySelector('#wedit-file')
      .addEventListener('change', handleFileChoice);

    buildStickerTray(panel);

    panel.querySelector('#wedit-media-url')
      .addEventListener('input', () => {
        pendingFile = null;
        updateMediaStatus();
      });

    panel.querySelector('#wedit-sticker')
      .addEventListener('change', updateMediaStatus);

    panel.querySelector('#wedit-remove-media')
      .addEventListener('click', () => {
        pendingFile = null;
        panel.querySelector('#wedit-file').value = '';
        panel.querySelector('#wedit-file-name').textContent =
          'Choose image, GIF, sticker image, or video';
        panel.querySelector('#wedit-media-url').value = '';
        panel.querySelector('#wedit-media-status').textContent =
          'Media will be removed from the preview when you apply it.';
      });

    renderThemePresets();
    renderChangelog();
    setTab('home');
    updateThemeFields();
    applyTheme(currentTheme, false);
    updateStats();
    renderEditList();
  }

  function setTab(tab) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    const allowed = [
      'home', 'editor', 'media', 'themes', 'backup', 'changelog', 'announcements'
    ];

    if (!allowed.includes(tab)) tab = 'home';
    activeTab = tab;

    panel.querySelectorAll('.wedit-nav-tab').forEach(btn =>
      btn.classList.toggle('active', btn.dataset.tab === tab)
    );

    allowed.forEach(name => {
      const pane = panel.querySelector(`#wedit-pane-${name}`);
      if (pane) pane.hidden = name !== tab;
    });

    if (tab === 'media') {
      panel.querySelector('#wedit-apply-media').disabled = !activeKey;
    }

    if (tab === 'home') {
      renderHomeProfile();
      updateStats();
    }

    if (tab === 'changelog') refreshChangelog();
    if (tab === 'announcements') refreshAnnouncements(false);
  }

  function updateEditorPreview() {
    const input = document.getElementById('wedit-replacement');
    const preview = document.getElementById('wedit-live-preview-text');
    const count = document.getElementById('wedit-char-count');
    const resetDraft = document.getElementById('wedit-use-original');
    if (!input || !preview || !count) return;

    const value = input.value;
    const length = Array.from(value).length;
    count.textContent = `${length} character${length === 1 ? '' : 's'}`;
    preview.textContent = value || '(Empty message text)';
    if (resetDraft) resetDraft.disabled = !activeKey;
  }

  function soundsEnabled() {
    try {
      return localStorage.getItem(SOUND_STORE_KEY) !== 'off';
    } catch (_) {
      return false;
    }
  }

  async function importInterfaceSound(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('audio/') || file.size > 3 * 1024 * 1024) {
      showToast('Choose an audio file under 3 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const duration = await new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => resolve(audio.duration);
        audio.onerror = () => reject(new Error('Audio could not be read.'));
        audio.src = url;
      });
      if (!Number.isFinite(duration) || duration > 15) throw new Error('Sound must be 15 seconds or shorter.');
      await putMedia(SOUND_MEDIA_KEY, file);
      renderSoundStatus();
      showToast('Custom interface sound saved on this device.');
      previewInterfaceSound();
    } catch (error) {
      showToast(error.message || 'Could not import that sound.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function renderSoundStatus() {
    const status = document.getElementById('wedit-sound-status');
    if (!status) return;
    const record = await getMedia(SOUND_MEDIA_KEY);
    status.textContent = record?.name
      ? `Imported: ${record.name} · stored only in this browser.`
      : 'Optional: MP3, WAV, OGG, or M4A up to 3 MB and 15 seconds. Stored on this device.';
  }

  async function previewInterfaceSound() {
    const record = await getMedia(SOUND_MEDIA_KEY);
    if (!record?.blob) {
      showToast('Import a sound first.');
      return;
    }
    const url = URL.createObjectURL(record.blob);
    const audio = new Audio(url);
    audio.volume = 0.75;
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    try { await audio.play(); }
    catch (_) { URL.revokeObjectURL(url); showToast('Press Preview again after interacting with the page.'); }
  }

  async function playInterfaceSound(kind) {
    if (!soundsEnabled()) return;
    const customSound = await getMedia(SOUND_MEDIA_KEY);
    if (customSound?.blob) {
      const url = URL.createObjectURL(customSound.blob);
      const audio = new Audio(url);
      audio.volume = 0.42;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      audio.play().catch(() => URL.revokeObjectURL(url));
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      audioContext ||= new AudioContextClass();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const tones = kind === 'success'
        ? [640, 880]
        : kind === 'restore'
          ? [520, 390]
          : [720];

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(tones[0], now);
      if (tones.length > 1) {
        oscillator.frequency.setValueAtTime(tones[1], now + 0.07);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch (_) {
      // Audio is decorative; a blocked device must not affect editing.
    }
  }

  function renderChangelog() {
    const list = document.getElementById('wedit-changelog-list');
    if (!list) return;

    list.replaceChildren();
    changelogEntries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'wedit-changelog-card';
      const heading = document.createElement('h3');
      heading.textContent = `${entry.version} · ${entry.title}`;
      const meta = document.createElement('div');
      meta.className = 'wedit-changelog-meta';
      meta.textContent = entry.date;
      const notes = document.createElement('ul');
      notes.className = 'wedit-changelog-notes';
      entry.notes.forEach(note => {
        const item = document.createElement('li');
        item.textContent = note;
        notes.appendChild(item);
      });
      card.append(heading, meta, notes);
      list.appendChild(card);
    });
  }

  function loadProfileCard() {
    try {
      const raw = JSON.parse(localStorage.getItem(PROFILE_STORE_KEY) || 'null');
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { name: '', phone: '', photo: '', synced: null };
      return {
        name: typeof raw.name === 'string' ? raw.name.slice(0, 60) : '',
        phone: typeof raw.phone === 'string' ? raw.phone.slice(0, 32) : '',
        photo: typeof raw.photo === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(raw.photo) && raw.photo.length <= 1100000 ? raw.photo : '',
        synced: raw.synced && typeof raw.synced === 'object' ? {
          name: String(raw.synced.name || '').slice(0, 80),
          about: String(raw.synced.about || '').slice(0, 140),
          phone: String(raw.synced.phone || '').slice(0, 40),
          photo: /^https:\/\//i.test(String(raw.synced.photo || '')) ? String(raw.synced.photo).slice(0, 2000) : ''
        } : null
      };
    } catch (_) {
      return { name: '', phone: '', photo: '', synced: null };
    }
  }

  function getWhatsAppProfileTrigger() {
    return document.querySelector(
      '[data-testid="menu-bar-profile"], [data-testid="menu-bar-profile-photo"], button[aria-label="Profile"], [role="button"][aria-label*="profile" i]'
    );
  }

  function renderHomeProfile() {
    const nameNode = document.getElementById('wedit-profile-name');
    const phoneNode = document.getElementById('wedit-profile-phone');
    const aboutNode = document.getElementById('wedit-profile-about');
    const avatar = document.getElementById('wedit-profile-avatar');
    if (!nameNode || !phoneNode || !avatar) return;

    const trigger = getWhatsAppProfileTrigger();
    const image = trigger?.querySelector('img');
    const accountName = image?.alt?.trim() || trigger?.getAttribute('aria-label')?.trim() || '';
    const accountNumber = (trigger?.getAttribute('aria-label') || '').match(/\+?[\d\s().-]{8,}/)?.[0]?.trim() || '';
    const synced = localProfileCard.synced || {};
    const name = localProfileCard.name || synced.name || accountName || 'Your WhatsApp profile';
    const phone = localProfileCard.phone || synced.phone || accountNumber || 'Phone number isn’t shown in this view';
    nameNode.textContent = name;
    phoneNode.textContent = phone;
    if (aboutNode) aboutNode.textContent = synced.about || 'Open your profile to sync your About text';
    avatar.replaceChildren();

    const photoSource = localProfileCard.photo || synced.photo || image?.currentSrc || image?.src || '';
    if (photoSource && /^(https:\/\/|blob:|data:image\/)/i.test(photoSource)) {
      const photo = document.createElement('img');
      photo.src = photoSource;
      photo.alt = '';
      avatar.append(photo);
    } else {
      avatar.textContent = Array.from(name.trim())[0]?.toUpperCase() || 'W';
    }
  }

  function saveProfileCardFields() {
    localProfileCard.name = document.getElementById('wedit-local-profile-name')?.value.trim().slice(0, 60) || '';
    localProfileCard.phone = document.getElementById('wedit-local-profile-phone')?.value.trim().slice(0, 32) || '';
    try { localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(localProfileCard)); }
    catch (_) { showToast('Could not save this profile card.'); }
    renderHomeProfile();
    renderSoundStatus();
  }

  async function handleProfilePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 750 * 1024) {
      showToast('Choose a PNG, JPG, WebP, or GIF under 750 KB.');
      return;
    }
    try {
      const photo = await blobToDataURL(file);
      localProfileCard.photo = typeof photo === 'string' ? photo : '';
      localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(localProfileCard));
      renderHomeProfile();
      showToast('Local profile card photo saved.');
    } catch (_) {
      showToast('Could not save that profile photo.');
    }
  }

  function openWhatsAppProfile() {
    const alreadyOpen = scrapeWhatsAppProfile();
    if (alreadyOpen) {
      saveWhatsAppProfile(alreadyOpen);
      showToast('WhatsApp profile synced to your WEdit card.');
      return;
    }
    const trigger = getWhatsAppProfileTrigger();
    if (!trigger) {
      const profile = scrapeWhatsAppProfile();
      if (profile) saveWhatsAppProfile(profile);
      else showToast('Open your WhatsApp profile from WhatsApp’s menu, then tap Sync profile.');
      return;
    }
    trigger.click();
    showToast('Opening your WhatsApp profile…');
    window.setTimeout(() => {
      const profile = scrapeWhatsAppProfile();
      if (profile) {
        saveWhatsAppProfile(profile);
        showToast('WhatsApp profile synced to your WEdit card.');
      } else showToast('Profile opened. Tap Sync profile again when its details are visible.');
    }, 650);
  }

  function scrapeWhatsAppProfile() {
    const visible = element => !!element && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
    const candidates = Array.from(document.querySelectorAll('[role="dialog"], [data-testid*="drawer"], [data-testid*="profile"], aside, section'))
      .filter(visible)
      .filter(node => /edit profile/i.test(node.innerText || ''))
      .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    const root = candidates[0];
    if (!root) return null;
    const controls = Array.from(root.querySelectorAll('input,textarea,[contenteditable="true"],[role="textbox"]'));
    const valueFor = pattern => {
      const control = controls.find(el => pattern.test(`${el.getAttribute('aria-label') || ''} ${el.getAttribute('placeholder') || ''} ${el.getAttribute('name') || ''} ${el.parentElement?.innerText || ''}`));
      return String(control?.value || control?.textContent || '').trim();
    };
    const text = (root.innerText || '').replace(/\r/g, '');
    const sectionValue = label => {
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const index = lines.findIndex(line => new RegExp(`^${label}$`, 'i').test(line));
      return index >= 0 ? (lines[index + 1] || '').slice(0, 140) : '';
    };
    const name = valueFor(/name/i) || sectionValue('Name');
    const about = valueFor(/about|status/i) || sectionValue('About');
    const phone = valueFor(/phone|number/i) || (text.match(/\+?[\d][\d\s().-]{7,}/)?.[0] || '').trim();
    const photo = Array.from(root.querySelectorAll('img')).filter(img => img.naturalWidth > 48 && img.naturalHeight > 48)
      .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight)[0];
    return { name, about, phone, photo: photo?.currentSrc || photo?.src || '' };
  }

  function saveWhatsAppProfile(profile) {
    localProfileCard.synced = {
      name: String(profile.name || '').slice(0, 80),
      about: String(profile.about || '').slice(0, 140),
      phone: String(profile.phone || '').slice(0, 40),
      photo: /^https:\/\//i.test(profile.photo || '') ? profile.photo.slice(0, 2000) : ''
    };
    try { localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(localProfileCard)); } catch (_) {}
    renderHomeProfile();
  }

  function renderHomeRelease() {
    const entry = changelogEntries[0];
    const title = document.getElementById('wedit-home-release-title');
    const version = document.getElementById('wedit-home-release-version');
    if (title) title.textContent = entry ? `${entry.version} · ${entry.title}` : 'No release notes yet';
    if (version) version.textContent = entry ? `LATEST · ${entry.version}` : 'LATEST RELEASE';
  }

  function cleanChangelogFeed(rawText) {
    if (typeof rawText !== 'string' || rawText.length > 200000) throw new Error('Changelog file is too large.');
    const raw = JSON.parse(rawText);
    if (raw?.schemaVersion !== 1 || !Array.isArray(raw.entries)) throw new Error('Changelog format is invalid.');
    return raw.entries.slice(0, 100).flatMap(entry => {
      if (!entry || typeof entry !== 'object' || !/^\d+\.\d+\.\d+$/.test(entry.version || '') ||
          typeof entry.title !== 'string' || typeof entry.date !== 'string' || !Array.isArray(entry.notes)) return [];
      const notes = entry.notes.filter(note => typeof note === 'string').map(note => note.trim().slice(0, 300)).filter(Boolean).slice(0, 20);
      return notes.length ? [{ version: entry.version.slice(0, 24), date: entry.date.slice(0, 10), title: entry.title.trim().slice(0, 140), notes }] : [];
    });
  }

  async function refreshChangelog() {
    try {
      const body = await requestAnnouncementText(CHANGELOG_URL, 'changelog');
      changelogEntries = cleanChangelogFeed(body);
      renderChangelog();
      renderHomeRelease();
    } catch (error) {
      console.warn('[WEdit] Changelog feed unavailable:', error);
      renderChangelog();
      renderHomeRelease();
    }
  }

  function requestAnnouncementText(url = ANNOUNCEMENTS_URL, kind = 'announcements') {
    const feedURL = `${url}?v=${Date.now()}`;

    if (typeof GM_xmlhttpRequest === 'function') {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: feedURL,
          headers: { Accept: 'application/json' },
          timeout: 12000,
          onload: response => {
            if (response.status >= 200 && response.status < 300) {
              resolve(response.responseText);
            } else {
              reject(new Error(`Feed returned HTTP ${response.status}.`));
            }
          },
          onerror: () => reject(new Error('Could not reach the announcement feed.')),
          ontimeout: () => reject(new Error('Announcement feed request timed out.'))
        });
      });
    }

    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: kind === 'changelog' ? 'WEDIT_FETCH_CHANGELOG' : 'WEDIT_FETCH_ANNOUNCEMENTS' },
          response => {
            if (chrome.runtime.lastError) {
              reject(new Error('Could not reach the WEdit update service.'));
            } else if (response?.ok && typeof response.body === 'string') {
              resolve(response.body);
            } else {
              reject(new Error(response?.error || 'Could not load announcements.'));
            }
          }
        );
      });
    }

    return fetch(feedURL, { cache: 'no-store', credentials: 'omit' })
      .then(response => {
        if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`);
        return response.text();
      });
  }

  function cleanAnnouncementFeed(rawText) {
    if (typeof rawText !== 'string' || rawText.length > 500000) {
      throw new Error('Announcement feed is too large.');
    }
    const raw = JSON.parse(rawText);
    if (!raw || raw.schemaVersion !== 1 || !Array.isArray(raw.announcements)) {
      throw new Error('Announcement feed format is invalid.');
    }

    return raw.announcements.slice(0, 30).flatMap(item => {
      if (!item || typeof item !== 'object') return [];
      if (typeof item.title !== 'string' || typeof item.body !== 'string') return [];
      const publishedAt = typeof item.publishedAt === 'string'
        ? item.publishedAt.slice(0, 40)
        : '';
      const parsedDate = Date.parse(publishedAt);
      if (!Number.isFinite(parsedDate)) return [];

      let link = '';
      if (typeof item.url === 'string' && item.url.length <= 2048) {
        try {
          const candidate = new URL(item.url);
          if (candidate.protocol === 'https:') link = candidate.href;
        } catch (_) {}
      }

      return [{
        title: item.title.trim().slice(0, 140),
        body: item.body.trim().slice(0, 4000),
        publishedAt,
        link
      }].filter(entry => entry.title && entry.body);
    }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }

  function renderAnnouncements(items) {
    const list = document.getElementById('wedit-announcement-list');
    if (!list) return;
    list.replaceChildren();

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'wedit-empty';
      empty.textContent = 'No announcements have been posted yet.';
      list.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'wedit-announcement-card';
      const heading = document.createElement('h3');
      heading.textContent = item.title;
      const meta = document.createElement('div');
      meta.className = 'wedit-announcement-meta';
      meta.textContent = new Date(item.publishedAt).toLocaleString();
      const body = document.createElement('p');
      body.className = 'wedit-announcement-body';
      body.textContent = item.body;
      card.append(heading, meta, body);

      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'More details →';
        card.appendChild(link);
      }
      list.appendChild(card);
    });
  }

  async function refreshAnnouncements(showFeedback) {
    const status = document.getElementById('wedit-announcements-status');
    if (announcementsRequest) return announcementsRequest;
    const buildButton = document.getElementById('wedit-build-announcement');
    if (!announcementFeedReady && buildButton) buildButton.disabled = true;
    if (status && showFeedback) status.textContent = 'Checking for announcements…';

    announcementsRequest = (async () => {
      try {
        const body = await requestAnnouncementText();
        const items = cleanAnnouncementFeed(body);
        announcementFeedItems = items;
        announcementFeedReady = true;
        if (buildButton) buildButton.disabled = false;
        renderAnnouncements(items);
        if (status) {
          status.textContent = items.length
            ? `Updated just now · ${items.length} announcement${items.length === 1 ? '' : 's'}`
            : 'Feed is up to date. No announcements yet.';
        }
        const draftStatus = document.getElementById('wedit-announcement-draft-status');
        if (draftStatus) {
          draftStatus.textContent = 'Feed ready. Write a title and message, then publish.';
        }
        if (showFeedback) playInterfaceSound('success');
      } catch (error) {
        console.warn('[WEdit] Announcement feed unavailable:', error);
        announcementFeedReady = false;
        if (buildButton) buildButton.disabled = true;
        if (status) status.textContent =
          'Could not load announcements. Check your connection and refresh.';
        const draftStatus = document.getElementById('wedit-announcement-draft-status');
        if (draftStatus) draftStatus.textContent =
          'Could not read the existing feed. Refresh before creating a post so older announcements stay intact.';
        if (showFeedback) showToast('Could not refresh announcements.');
      } finally {
        announcementsRequest = null;
      }
    })();

    return announcementsRequest;
  }

  function cloneObject(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function sanitizeTheme(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const colors = raw.colors && typeof raw.colors === 'object'
      ? raw.colors
      : raw;

    const base = THEME_PRESETS[0];

    const clean = {
      id: typeof raw.id === 'string' ? raw.id.slice(0, 40) : 'custom',
      name: typeof raw.name === 'string' ? raw.name.slice(0, 36) : 'Custom',
      description: typeof raw.description === 'string'
        ? raw.description.slice(0, 80)
        : 'My personal palette',
      glass: !!raw.glass,
      motion: ['liquid', 'ios', 'none'].includes(raw.motion) ? raw.motion : 'liquid',
      borderStyle: ['none', 'flowers', 'pumpkin', 'chain'].includes(raw.borderStyle) ? raw.borderStyle : 'none',
      chainHover: !!raw.chainHover,
      welcomeStyle: raw.welcomeStyle === 'classic' ? 'classic' : 'glass',
      colors: {}
    };

    for (const key of [
      'panel', 'surface', 'surface2', 'text',
      'muted', 'accent', 'border', 'input'
    ]) {
      const value = colors[key];

      clean.colors[key] =
        typeof value === 'string' &&
        /^#[0-9a-fA-F]{6}$/.test(value)
          ? value.toLowerCase()
          : base.colors[key];
    }

    return clean;
  }

  function loadTheme() {
    try {
      const stored = JSON.parse(
        localStorage.getItem(THEME_STORE_KEY) || 'null'
      );

      return sanitizeTheme(stored) ||
        cloneObject(THEME_PRESETS[0]);
    } catch (_) {
      return cloneObject(THEME_PRESETS[0]);
    }
  }

  function installThemeStyles() {
    if (document.getElementById('wedit-theme-overrides')) return;

    const style = document.createElement('style');
    style.id = 'wedit-theme-overrides';

    style.textContent = `
      #${PANEL_ID}{background:var(--wedit-panel)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;padding:5px;margin:10px 14px 0;border:1px solid var(--wedit-border);border-radius:13px;background:var(--wedit-input);}
      #${PANEL_ID} .wedit-nav-tab{display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 2px;border:0;border-radius:9px;background:transparent;color:var(--wedit-muted);font-size:10px;font-weight:800;cursor:pointer;transition:background .16s ease,transform .16s ease;}
      #${PANEL_ID} .wedit-nav-tab span{font-size:14px;opacity:.9;}
      #${PANEL_ID} .wedit-nav-tab:hover{transform:translateY(-1px);}
      #${PANEL_ID} .wedit-pane[hidden]{display:none!important;}
      #${PANEL_ID} .wedit-pane-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:2px 0 11px;}
      #${PANEL_ID} .wedit-pane-heading .wedit-label{margin:0 0 2px;}
      #${PANEL_ID} .wedit-heading-title{font-size:17px;font-weight:850;letter-spacing:-.3px;color:var(--wedit-text);}
      #${PANEL_ID} .wedit-live-dot{display:inline-flex;align-items:center;padding:5px 7px;border:1px solid var(--wedit-border);border-radius:7px;background:var(--wedit-surface2);color:var(--wedit-accent);font-size:9px;letter-spacing:.7px;font-weight:900;white-space:nowrap;}
      #${PANEL_ID} .wedit-helper{margin-top:8px;color:var(--wedit-muted);font-size:10px;line-height:1.5;}
      #${PANEL_ID} .wedit-section-copy{font-size:11px;line-height:1.5;color:var(--wedit-muted);margin:0 0 10px;}
      #${PANEL_ID} .wedit-bottom-note{margin-top:14px;padding-top:10px;border-top:1px solid var(--wedit-border);font-size:9px;line-height:1.45;color:var(--wedit-muted);text-align:center;}
      #${PANEL_ID} .wedit-or{text-align:center;color:var(--wedit-muted);font-size:10px;margin:9px 0;}
      #${PANEL_ID} select{width:100%;padding:10px;border:1px solid var(--wedit-border);border-radius:10px;background:var(--wedit-input);color:var(--wedit-text);font:inherit;outline:none;}
      #${PANEL_ID} .wedit-theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
      #${PANEL_ID} .wedit-theme-card{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;padding:10px;border:1px solid var(--wedit-border);border-radius:13px;background:var(--wedit-surface);color:var(--wedit-text);text-align:left;cursor:pointer;transition:transform .15s ease,border-color .15s ease;}
      #${PANEL_ID} .wedit-theme-card:hover{transform:translateY(-1px);}
      #${PANEL_ID} .wedit-theme-swatches{display:flex;gap:5px;width:100%;margin-bottom:2px;}
      #${PANEL_ID} .wedit-theme-swatches i{width:23px;height:23px;border-radius:8px;border:1px solid #ffffff22;box-shadow:inset 0 0 0 1px #00000008;}
      #${PANEL_ID} .wedit-theme-name{font-size:11px;font-weight:850;}
      #${PANEL_ID} .wedit-theme-desc{font-size:9px;line-height:1.35;color:var(--wedit-muted);}
      #${PANEL_ID} .wedit-colour-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
      #${PANEL_ID} .wedit-colour-grid label{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid var(--wedit-border);border-radius:10px;background:var(--wedit-surface);color:var(--wedit-muted);font-size:10px;font-weight:750;}
      #${PANEL_ID} input[type=color]{width:100%;height:30px;padding:2px;border:1px solid var(--wedit-border);border-radius:7px;background:var(--wedit-input);cursor:pointer;}
      #${PANEL_ID} .wedit-glass-toggle{display:flex;align-items:center;gap:9px;padding:11px;margin-top:10px;border:1px solid var(--wedit-border);border-radius:12px;background:var(--wedit-surface);cursor:pointer;}
      #${PANEL_ID} .wedit-glass-toggle input{accent-color:var(--wedit-accent);width:16px;height:16px;}
      #${PANEL_ID} .wedit-glass-toggle span{display:flex;flex-direction:column;gap:3px;color:var(--wedit-text);font-size:11px;}
      #${PANEL_ID} .wedit-glass-toggle small{color:var(--wedit-muted);font-size:9px;line-height:1.4;}
      #${PANEL_ID} .wedit-mini-link{background:transparent;border:0;color:var(--wedit-accent);font-size:10px;font-weight:850;cursor:pointer;}
      #${PANEL_ID} .wedit-wide{width:100%;margin-top:8px;}
      #${PANEL_ID} .wedit-backup-card{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--wedit-border);border-radius:13px;background:var(--wedit-surface);}
      #${PANEL_ID} .wedit-backup-icon{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:10px;background:var(--wedit-surface2);color:var(--wedit-accent);font-size:18px;font-weight:900;}
      #${PANEL_ID} .wedit-backup-card b,#${PANEL_ID} .wedit-restore-row b{font-size:11px;color:var(--wedit-text);}
      #${PANEL_ID} .wedit-backup-card p{margin:5px 0 0;color:var(--wedit-muted);font-size:10px;line-height:1.5;}
      #${PANEL_ID} .wedit-restore-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px;border:1px solid var(--wedit-border);border-radius:12px;background:var(--wedit-surface);margin-bottom:7px;}
      #${PANEL_ID} .wedit-restore-row>div{display:flex;flex-direction:column;gap:4px;}
      #${PANEL_ID} .wedit-restore-row small{max-width:210px;color:var(--wedit-muted);font-size:9px;line-height:1.4;}
      #${PANEL_ID}.wedit-glass .wedit-context,#${PANEL_ID}.wedit-glass .wedit-item,#${PANEL_ID}.wedit-glass .wedit-theme-card,#${PANEL_ID}.wedit-glass .wedit-backup-card,#${PANEL_ID}.wedit-glass .wedit-restore-row{background:color-mix(in srgb,var(--wedit-surface) 74%,transparent)!important;backdrop-filter:blur(10px);}
      #${PANEL_ID}.wedit-glass{background:color-mix(in srgb,var(--wedit-panel) 78%,transparent)!important;backdrop-filter:blur(26px) saturate(155%)!important;-webkit-backdrop-filter:blur(26px) saturate(155%)!important;box-shadow:0 24px 80px #0005,inset 0 1px #ffffff20!important;}
      #${PANEL_ID} .wedit-header{background:linear-gradient(135deg,color-mix(in srgb,var(--wedit-accent) 12%,transparent),transparent 68%),var(--wedit-surface)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-body{background:transparent!important;}
      #${PANEL_ID} .wedit-title{color:var(--wedit-text)!important;}
      #${PANEL_ID} .wedit-kicker,#${PANEL_ID} .wedit-label,#${PANEL_ID} .wedit-section-copy,#${PANEL_ID} .wedit-helper,#${PANEL_ID} .wedit-footer,#${PANEL_ID} .wedit-bottom-note{color:var(--wedit-muted)!important;}
      #${PANEL_ID} .wedit-note{background:color-mix(in srgb,var(--wedit-accent) 9%,transparent)!important;border-color:color-mix(in srgb,var(--wedit-accent) 28%,transparent)!important;color:var(--wedit-text)!important;}
      #${PANEL_ID} .wedit-context,#${PANEL_ID} .wedit-item,#${PANEL_ID} .wedit-backup-card,#${PANEL_ID} .wedit-restore-row{background:var(--wedit-surface)!important;border-color:var(--wedit-border)!important;color:var(--wedit-text)!important;}
      #${PANEL_ID} .wedit-context small{color:var(--wedit-accent)!important;}
      #${PANEL_ID} textarea,#${PANEL_ID} input[type=text],#${PANEL_ID} input[type=url],#${PANEL_ID} input[type=search],#${PANEL_ID} select{background:var(--wedit-input)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-nav{background:var(--wedit-input)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-nav-tab{color:var(--wedit-muted)!important;}
      #${PANEL_ID} .wedit-nav-tab.active{background:var(--wedit-surface2)!important;color:var(--wedit-accent)!important;box-shadow:inset 0 0 0 1px var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-primary{background:var(--wedit-accent)!important;color:var(--wedit-panel)!important;}
      #${PANEL_ID} .wedit-secondary{background:var(--wedit-surface2)!important;border-color:var(--wedit-border)!important;color:var(--wedit-text)!important;}
      #${PANEL_ID} .wedit-danger{background:color-mix(in srgb,#e85d66 12%,var(--wedit-panel))!important;border-color:color-mix(in srgb,#e85d66 40%,var(--wedit-border))!important;color:#ff9da4!important;}
      #${PANEL_ID} .wedit-count{background:var(--wedit-surface2)!important;color:var(--wedit-accent)!important;}
      #${PANEL_ID} .wedit-item-name,#${PANEL_ID} .wedit-item-before{color:var(--wedit-muted)!important;}
      #${PANEL_ID} .wedit-item-after,#${PANEL_ID} .wedit-section-title,#${PANEL_ID} .wedit-heading-title{color:var(--wedit-text)!important;}
      #${PANEL_ID} .wedit-sticker-pick{background:var(--wedit-surface)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-live-dot{background:color-mix(in srgb,var(--wedit-accent) 15%,transparent)!important;color:var(--wedit-accent)!important;border-color:color-mix(in srgb,var(--wedit-accent) 25%,transparent)!important;}
      #${PANEL_ID} .wedit-filebox{background:var(--wedit-surface)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-theme-card{background:var(--wedit-surface)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #${PANEL_ID} .wedit-theme-card.active{border-color:var(--wedit-accent)!important;box-shadow:0 0 0 1px var(--wedit-accent)!important;}
      #${PANEL_ID} .wedit-theme-desc{color:var(--wedit-muted)!important;}
      #${PANEL_ID} .wedit-mini-link,#${PANEL_ID} .wedit-undo{color:var(--wedit-accent)!important;}
      #${PANEL_ID} .wedit-bottom-note{border-top:1px solid var(--wedit-border)!important;}
      #${LAUNCHER_ID}{background:linear-gradient(135deg,var(--wedit-surface),var(--wedit-panel))!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #${LAUNCHER_ID}.wedit-glass{background:color-mix(in srgb,var(--wedit-panel) 75%,transparent)!important;backdrop-filter:blur(22px) saturate(150%)!important;-webkit-backdrop-filter:blur(22px) saturate(150%)!important;box-shadow:0 12px 35px #0004,inset 0 1px #ffffff20!important;}
      #${LAUNCHER_ID} .wedit-mark{background:var(--wedit-accent)!important;color:var(--wedit-panel)!important;}
      #${LAUNCHER_ID} .wedit-pill{color:var(--wedit-accent)!important;}
      .wedit-inline{background:var(--wedit-surface)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
      #wedit-toast{background:var(--wedit-surface)!important;color:var(--wedit-text)!important;border-color:var(--wedit-border)!important;}
    `;

    document.head.appendChild(style);
  }

  function applyTheme(raw, persist = true) {
    const theme = sanitizeTheme(raw) || cloneObject(THEME_PRESETS[0]);
    currentTheme = theme;

    const root = document.documentElement;
    const map = {
      panel: '--wedit-panel',
      surface: '--wedit-surface',
      surface2: '--wedit-surface2',
      text: '--wedit-text',
      muted: '--wedit-muted',
      accent: '--wedit-accent',
      border: '--wedit-border',
      input: '--wedit-input'
    };

    Object.entries(map).forEach(([key, variable]) => {
      root.style.setProperty(variable, theme.colors[key]);
    });

    const panel = document.getElementById(PANEL_ID);
    const launcher = document.getElementById(LAUNCHER_ID);

    [panel, launcher].filter(Boolean).forEach(el => {
      el.classList.toggle('wedit-glass', !!theme.glass);
    });
    if (panel) {
      panel.classList.remove('wedit-frame-flowers', 'wedit-frame-pumpkin', 'wedit-frame-chain', 'wedit-animate-liquid', 'wedit-animate-ios', 'wedit-no-motion', 'wedit-chain-hover');
      if (theme.borderStyle !== 'none') panel.classList.add(`wedit-frame-${theme.borderStyle}`);
      if (theme.chainHover && theme.borderStyle === 'chain') panel.classList.add('wedit-chain-hover');
      if (theme.motion === 'none') panel.classList.add('wedit-no-motion');
      else panel.classList.add(`wedit-animate-${theme.motion}`);
    }
    const motion = document.getElementById('wedit-motion-style');
    const frame = document.getElementById('wedit-frame-style');
    const chainHover = document.getElementById('wedit-chain-hover');
    const welcome = document.getElementById('wedit-welcome-style');
    if (motion) motion.value = theme.motion;
    if (frame) frame.value = theme.borderStyle;
    if (chainHover) chainHover.checked = theme.chainHover;
    if (welcome) welcome.value = theme.welcomeStyle;

    if (persist) {
      try {
        localStorage.setItem(THEME_STORE_KEY, JSON.stringify(theme));
      } catch (_) {
        showToast('Theme could not be saved.');
      }
    }

    updateThemeFields();
    updateThemeHeader();
    renderThemePresets();
  }

  function updateThemeHeader() {
    const label = document.getElementById('wedit-current-theme-label');
    if (label) label.textContent = (currentTheme.name || 'CUSTOM').toUpperCase();
  }

  function updateThemeFields() {
    if (!currentTheme) return;

    for (const key of [
      'panel', 'surface', 'text', 'accent', 'border', 'input'
    ]) {
      const input = document.getElementById(`wedit-color-${key}`);

      if (input && /^#[0-9a-f]{6}$/i.test(currentTheme.colors[key])) {
        input.value = currentTheme.colors[key];
      }
    }

    const glass = document.getElementById('wedit-glass-toggle');
    if (glass) glass.checked = !!currentTheme.glass;
    const motion = document.getElementById('wedit-motion-style');
    const frame = document.getElementById('wedit-frame-style');
    const chainHover = document.getElementById('wedit-chain-hover');
    const welcome = document.getElementById('wedit-welcome-style');
    if (motion) motion.value = currentTheme.motion;
    if (frame) frame.value = currentTheme.borderStyle;
    if (chainHover) chainHover.checked = currentTheme.chainHover;
    if (welcome) welcome.value = currentTheme.welcomeStyle;

    updateThemeHeader();
  }

  function updateCustomThemeFromControls() {
    const next = cloneObject(currentTheme || THEME_PRESETS[0]);

    next.id = 'custom';
    next.name = 'Custom';
    next.description = 'Your custom colour palette';
    next.colors = { ...next.colors };

    for (const key of [
      'panel', 'surface', 'text', 'accent', 'border', 'input'
    ]) {
      const input = document.getElementById(`wedit-color-${key}`);

      if (input && /^#[0-9a-f]{6}$/i.test(input.value)) {
        next.colors[key] = input.value;
      }
    }

    next.glass = !!document.getElementById('wedit-glass-toggle')?.checked;
    next.motion = document.getElementById('wedit-motion-style')?.value || 'liquid';
    next.borderStyle = document.getElementById('wedit-frame-style')?.value || 'none';
    next.chainHover = !!document.getElementById('wedit-chain-hover')?.checked;
    next.welcomeStyle = document.getElementById('wedit-welcome-style')?.value || 'glass';
    applyTheme(next);
  }

  function renderThemePresets() {
    const grid = document.getElementById('wedit-theme-grid');
    if (!grid) return;

    grid.replaceChildren();

    THEME_PRESETS.forEach(theme => {
      const card = document.createElement('button');
      card.type = 'button';

      card.className = 'wedit-theme-card' +
        (currentTheme?.id === theme.id ? ' active' : '');

      card.setAttribute('aria-label', `Apply ${theme.name} theme`);

      const swatches = document.createElement('span');
      swatches.className = 'wedit-theme-swatches';

      [
        theme.colors.panel,
        theme.colors.surface,
        theme.colors.accent,
        theme.colors.text
      ].forEach(color => {
        const dot = document.createElement('i');
        dot.style.background = color;
        swatches.appendChild(dot);
      });

      const name = document.createElement('b');
      name.className = 'wedit-theme-name';
      name.textContent = theme.name;

      const desc = document.createElement('small');
      desc.className = 'wedit-theme-desc';
      desc.textContent = theme.description;

      card.append(swatches, name, desc);
      card.addEventListener('click', () => applyTheme(theme));
      grid.appendChild(card);
    });

    const custom = document.createElement('button');
    custom.type = 'button';

    custom.className = 'wedit-theme-card' +
      (currentTheme?.id === 'custom' ? ' active' : '');

    const swatches = document.createElement('span');
    swatches.className = 'wedit-theme-swatches';

    [
      currentTheme.colors.panel,
      currentTheme.colors.surface,
      currentTheme.colors.accent,
      currentTheme.colors.text
    ].forEach(color => {
      const dot = document.createElement('i');
      dot.style.background = color;
      swatches.appendChild(dot);
    });

    const name = document.createElement('b');
    name.className = 'wedit-theme-name';
    name.textContent = 'Your custom theme';

    const desc = document.createElement('small');
    desc.className = 'wedit-theme-desc';
    desc.textContent = 'Edit colours below';

    custom.append(swatches, name, desc);

    custom.addEventListener('click', () => {
      const theme = cloneObject(currentTheme);
      theme.id = 'custom';
      theme.name = 'Custom';
      applyTheme(theme);
    });

    grid.appendChild(custom);
  }

  function downloadJSON(filename, data) {
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportTheme() {
    downloadJSON(
      `wedit-theme-${(currentTheme.name || 'custom')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`,
      {
        format: 'WEdit theme',
        version: 1,
        exportedAt: new Date().toISOString(),
        theme: currentTheme
      }
    );

    showToast('Theme exported as a portable JSON file.');
  }

  async function importThemeFile(file) {
    try {
      if (file.size > 1024 * 1024) {
        throw new Error('Theme files must be smaller than 1 MB.');
      }

      const payload = JSON.parse(await file.text());
      const theme = sanitizeTheme(payload?.theme || payload);

      if (!theme) {
        throw new Error('That file does not contain a valid WEdit theme.');
      }

      theme.id = 'custom';

      if (!theme.name || THEME_PRESETS.some(p => p.name === theme.name)) {
        theme.name = 'Imported theme';
      }

      applyTheme(theme);
      showToast(`Imported theme: ${theme.name}`);
    } catch (err) {
      showToast(err?.message || 'Could not import this theme.');
    } finally {
      const input = document.getElementById('wedit-theme-file');
      if (input) input.value = '';
      pendingThemeFile = null;
    }
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(
        reader.error || new Error('Could not read media for backup')
      );

      reader.readAsDataURL(blob);
    });
  }

  function dataURLToBlob(dataURL) {
    if (
      typeof dataURL !== 'string' ||
      !dataURL.startsWith('data:') ||
      dataURL.length > 180 * 1024 * 1024
    ) {
      throw new Error('Backup contains invalid or excessively large media.');
    }

    const comma = dataURL.indexOf(',');

    if (comma < 0) throw new Error('Invalid media data in backup.');

    const meta = dataURL.slice(5, comma);
    const data = dataURL.slice(comma + 1);
    const mime = meta.split(';')[0] || 'application/octet-stream';

    if (meta.includes(';base64')) {
      const binary = atob(data);
      const parts = [];

      for (let offset = 0; offset < binary.length; offset += 1024 * 1024) {
        const slice = binary.slice(offset, offset + 1024 * 1024);
        const bytes = new Uint8Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          bytes[i] = slice.charCodeAt(i);
        }

        parts.push(bytes);
      }

      return new Blob(parts, { type: mime });
    }

    return new Blob([decodeURIComponent(data)], { type: mime });
  }

  async function exportBackup() {
    const button = document.getElementById('wedit-export-backup');

    if (button) {
      button.disabled = true;
      button.textContent = 'Building backup…';
    }

    try {
      const mediaAssets = {};
      const outputEdits = cloneObject(edits);

      for (const [key, item] of Object.entries(outputEdits)) {
        if (item.media?.kind !== 'blob') continue;

        const stored = await getMedia(key);

        if (stored?.blob) {
          mediaAssets[key] = {
            name: stored.name || item.media.name || 'uploaded-media',
            type: stored.type ||
              item.media.type ||
              stored.blob.type ||
              'application/octet-stream',
            dataURL: await blobToDataURL(stored.blob)
          };
        }
      }

      downloadJSON(
        `wedit-full-backup-${new Date().toISOString().slice(0, 10)}.json`,
        {
          format: 'WEdit full backup',
          version: 3,
          exportedAt: new Date().toISOString(),
          theme: currentTheme,
          profileCard: localProfileCard,
          edits: outputEdits,
          mediaAssets
        }
      );

      const status = document.getElementById('wedit-backup-status');

      if (status) {
        status.textContent =
          `Backup exported: ${Object.keys(outputEdits).length} preview(s), ` +
          `${Object.keys(mediaAssets).length} uploaded media file(s), current theme.`;
      }

      showToast('Full backup downloaded, including locally uploaded media.');
    } catch (err) {
      console.error('[WEdit] Backup export failed:', err);
      showToast(err?.message || 'Backup failed. Try fewer or smaller media files.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Download full backup';
      }
    }
  }

  async function importBackup() {
    if (!pendingBackupFile) {
      showToast('Choose a WEdit JSON backup first.');
      return;
    }

    const button = document.getElementById('wedit-import-backup');
    const status = document.getElementById('wedit-backup-status');

    if (button) {
      button.disabled = true;
      button.textContent = 'Importing…';
    }

    try {
      if (pendingBackupFile.size > 220 * 1024 * 1024) {
        throw new Error(
          'That backup is over 220 MB. Try reducing large media files.'
        );
      }

      const payload = JSON.parse(await pendingBackupFile.text());

      if (
        !payload ||
        typeof payload !== 'object' ||
        !payload.edits ||
        typeof payload.edits !== 'object' ||
        Array.isArray(payload.edits)
      ) {
        throw new Error('This does not look like a WEdit backup JSON file.');
      }

      if (!['WEdit full backup', 'WEdit text backup'].includes(payload.format)) {
        throw new Error(
          'Unrecognised backup format. Choose a WEdit backup JSON file.'
        );
      }

      const imported = {};

      for (const [key, raw] of Object.entries(payload.edits)) {
        if (!key || !raw || typeof raw !== 'object') continue;

        const item = {
          originalText: typeof raw.originalText === 'string'
            ? raw.originalText
            : '',
          replacement: typeof raw.replacement === 'string'
            ? raw.replacement
            : '',
          chatName: typeof raw.chatName === 'string'
            ? raw.chatName
            : 'Imported chat',
          direction: typeof raw.direction === 'string'
            ? raw.direction
            : 'Message',
          updatedAt: Number(raw.updatedAt) || Date.now(),
          media: raw.media && typeof raw.media === 'object'
            ? raw.media
            : null
        };

        if (item.media?.kind === 'blob' && !payload.mediaAssets?.[key]) {
          item.media = null;
        }

        imported[key] = item;
      }

      if (!Object.keys(imported).length && !payload.theme && !payload.profileCard) {
        throw new Error('No saved previews, theme, or profile card were found in this backup.');
      }

      const mode = document.getElementById('wedit-import-mode').value;

      if (mode === 'replace') {
        const ok = window.confirm(
          'Replace the current WEdit saved previews and theme with this backup? ' +
          'This cannot be undone unless you have exported a backup.'
        );

        if (!ok) return;

        for (const [key, item] of Object.entries(edits)) {
          const root = findRootByKey(key);
          const text = root ? getTextNode(root) : null;

          if (text) text.textContent = item.originalText || '';
          if (root) removeEditedDecoration(root);

          await deleteMedia(key);
        }

        edits = {};
      }

      let restoredMedia = 0;

      for (const [key, item] of Object.entries(imported)) {
        const asset = payload.mediaAssets?.[key];

        if (asset?.dataURL) {
          const blob = dataURLToBlob(asset.dataURL);

          const file = new File(
            [blob],
            asset.name || item.media?.name || 'wedit-imported-media',
            { type: asset.type || blob.type }
          );

          await putMedia(key, file);

          item.media = {
            ...(item.media || {}),
            kind: 'blob',
            name: asset.name || file.name,
            type: asset.type || file.type,
            sticker: !!item.media?.sticker
          };

          restoredMedia++;
        }

        edits[key] = item;
      }

      if (payload.theme) {
        const theme = sanitizeTheme(payload.theme);
        if (theme) applyTheme(theme);
      }

      if (payload.profileCard && typeof payload.profileCard === 'object') {
        localProfileCard = {
          name: typeof payload.profileCard.name === 'string' ? payload.profileCard.name.slice(0, 60) : '',
          phone: typeof payload.profileCard.phone === 'string' ? payload.profileCard.phone.slice(0, 32) : '',
          photo: typeof payload.profileCard.photo === 'string' &&
            /^data:image\/(png|jpeg|webp|gif);base64,/i.test(payload.profileCard.photo) &&
            payload.profileCard.photo.length <= 1100000
            ? payload.profileCard.photo
            : '',
          synced: payload.profileCard.synced && typeof payload.profileCard.synced === 'object' ? {
            name: String(payload.profileCard.synced.name || '').slice(0, 80),
            about: String(payload.profileCard.synced.about || '').slice(0, 140),
            phone: String(payload.profileCard.synced.phone || '').slice(0, 40),
            photo: /^https:\/\//i.test(String(payload.profileCard.synced.photo || '')) ? String(payload.profileCard.synced.photo).slice(0, 2000) : ''
          } : null
        };
        try { localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(localProfileCard)); }
        catch (_) { showToast('Profile card could not fit in browser storage.'); }
        document.getElementById('wedit-local-profile-name').value = localProfileCard.name;
        document.getElementById('wedit-local-profile-phone').value = localProfileCard.phone;
        renderHomeProfile();
      }

      saveEdits();
      queueEnhance();

      if (status) {
        status.textContent =
          `Imported ${Object.keys(imported).length} preview(s) and restored ` +
          `${restoredMedia} uploaded media file(s).`;
      }

      showToast(`Backup imported: ${Object.keys(imported).length} preview(s).`);
    } catch (err) {
      console.error('[WEdit] Backup import failed:', err);
      showToast(err?.message || 'Could not import that backup.');

      if (status) {
        status.textContent = err?.message ||
          'Import failed. Check that this is a valid WEdit backup.';
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Import backup';
      }

      const input = document.getElementById('wedit-backup-file');
      if (input) input.value = '';

      pendingBackupFile = null;
    }
  }

  function togglePanel(force) {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    panelOpen = typeof force === 'boolean' ? force : !panelOpen;
    if (panelOpen) {
      panel.classList.remove('wedit-reopen');
      void panel.offsetWidth;
      panel.classList.add('wedit-reopen');
      window.setTimeout(() => panel.classList.remove('wedit-reopen'), 700);
    }
    panel.classList.toggle('open', panelOpen);
    if (panelOpen) positionPanelFromLauncher();
  }

  function restoreRootForQuickHide(root) {
    if (!root?.isConnected) return;
    const textNode = getTextNode(root);
    if (textNode) {
      const key = getKey(root, textNode);
      const entry = key ? edits[key] : null;
      if (entry && safeText(textNode) === (entry.replacement || '')) {
        textNode.textContent = entry.originalText || '';
      }
    }
    root.querySelectorAll(':scope > .wedit-inline, :scope > .wedit-local-flag, :scope > .wedit-media-preview')
      .forEach(element => element.remove());
    root.classList.remove('wedit-message-hover');
    if (originalPositions.has(root)) {
      root.style.position = originalPositions.get(root);
      originalPositions.delete(root);
    }
  }

  function setQuickHide(hidden) {
    quickHide = Boolean(hidden);
    document.documentElement.classList.toggle('wedit-quick-hide', quickHide);
    if (quickHide) {
      togglePanel(false);
      document.querySelectorAll(SELECTOR_ROOT).forEach(restoreRootForQuickHide);
      return;
    }
    queueEnhance();
    showToast('WEdit view restored.');
  }

  function showToast(message) {
    const old = document.getElementById('wedit-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'wedit-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => toast.remove(), 2800);
  }

  function isNewerVersion(candidate, installed) {
    if (!/^\d+\.\d+\.\d+$/.test(candidate) ||
        !/^\d+\.\d+\.\d+$/.test(installed)) return false;
    const next = candidate.split('.').map(Number);
    const current = installed.split('.').map(Number);
    for (let index = 0; index < 3; index++) {
      if (next[index] > current[index]) return true;
      if (next[index] < current[index]) return false;
    }
    return false;
  }

  function showUpdateNotice(version) {
    document.getElementById('wedit-update-notice')?.remove();

    const notice = document.createElement('div');
    notice.id = 'wedit-update-notice';
    notice.setAttribute('role', 'status');

    const message = document.createElement('span');
    message.textContent = `WEdit ${version} is available.`;

    const update = document.createElement('button');
    update.type = 'button';
    update.textContent = 'Update in Tampermonkey';
    update.addEventListener('click', () => {
      try {
        GM_openInTab(USERSCRIPT_URL, { active: true, insert: true });
      } catch (_) {
        window.open(USERSCRIPT_URL, '_blank', 'noopener');
      }
    });

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'wedit-update-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Dismiss update notice');
    close.addEventListener('click', () => notice.remove());

    notice.append(message, update, close);
    document.body.appendChild(notice);
  }

  function showVersionWelcome() {
    try {
      if (localStorage.getItem(WELCOME_VERSION_KEY) === APP_VERSION) return;
      localStorage.setItem(WELCOME_VERSION_KEY, APP_VERSION);
    } catch (_) { return; }
    const welcome = document.createElement('div');
    welcome.id = 'wedit-welcome';
    welcome.classList.toggle('wedit-welcome-classic', currentTheme?.welcomeStyle === 'classic');
    welcome.setAttribute('role', 'dialog');
    welcome.setAttribute('aria-modal', 'true');
    welcome.setAttribute('aria-labelledby', 'wedit-welcome-title');
    const card = document.createElement('section');
    card.className = 'wedit-welcome-card';
    card.innerHTML = `<div class="wedit-label">WEDIT UPDATE · ${APP_VERSION}</div><h2 id="wedit-welcome-title">A fresher space.</h2><p>Your profile card can sync the visible WhatsApp name, About, phone, and photo. Themes now have opening motion, decorative frames, and a separate update welcome style.</p><button class="wedit-btn wedit-primary" type="button">Take a look</button><button class="wedit-mini-link" type="button">Not now</button>`;
    const close = () => welcome.remove();
    card.querySelector('.wedit-btn').addEventListener('click', () => { close(); togglePanel(true); });
    card.querySelector('.wedit-mini-link').addEventListener('click', close);
    welcome.addEventListener('click', event => { if (event.target === welcome) close(); });
    welcome.append(card);
    document.body.append(welcome);
  }

  function checkForUserscriptUpdate(manualCheck = false) {
    if (
      typeof GM_info === 'undefined' ||
      typeof GM_xmlhttpRequest !== 'function' ||
      !GM_info.script?.version
    ) {
      if (manualCheck) showToast('Update checks are available from Tampermonkey.');
      return;
    }

    GM_xmlhttpRequest({
      method: 'GET',
      url: `${RELEASE_INFO_URL}?check=${Date.now()}`,
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      timeout: 10000,
      onload: response => {
        if (response.status < 200 || response.status >= 300) {
          if (manualCheck) showToast(`Update check failed (HTTP ${response.status}).`);
          return;
        }
        try {
          const release = JSON.parse(response.responseText);
          if (isNewerVersion(release.version, GM_info.script.version)) {
            showUpdateNotice(release.version);
          } else {
            document.getElementById('wedit-update-notice')?.remove();
            if (manualCheck) showToast('WEdit is up to date.');
          }
        } catch (_) {
          // An invalid release marker should not affect WhatsApp or WEdit.
          if (manualCheck) showToast('The published update marker is invalid.');
        }
      },
      onerror: () => { if (manualCheck) showToast('Could not check for WEdit updates.'); },
      ontimeout: () => { if (manualCheck) showToast('The WEdit update check timed out.'); }
    });
  }

  function updateMediaStatus() {
    const status = document.getElementById('wedit-media-status');
    const urlInput = document.getElementById('wedit-media-url');

    if (!status || !urlInput) return;

    if (pendingFile) {
      status.textContent =
        `Selected ${pendingFile.name} (${formatBytes(pendingFile.size)}). ` +
        'Apply to save this media locally.';
    } else if (urlInput.value.trim()) {
      status.textContent = validHttpURL(urlInput.value.trim())
        ? 'Direct URL looks valid. A direct image/GIF/video URL works best; gallery pages may not embed.'
        : 'Paste a valid http:// or https:// media URL.';
    } else {
      status.textContent =
        'Choose an image, animated GIF, sticker PNG/WebP, or video. ' +
        'Supported playback depends on your browser.';
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFileChoice(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!(file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      showToast('Choose an image, GIF, sticker image, or video file.');
      event.target.value = '';
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      showToast('Please choose media smaller than 80 MB.');
      event.target.value = '';
      return;
    }

    pendingFile = file;
    document.getElementById('wedit-media-url').value = '';
    document.getElementById('wedit-file-name').textContent =
      `${file.name} · ${formatBytes(file.size)}`;

    updateMediaStatus();
  }

  function stickerMimeFor(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const supported = {
      webp: 'image/webp',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      avif: 'image/avif'
    };
    return supported[extension] || '';
  }

  async function getUserStickers() {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.bound(
        STICKER_KEY_PREFIX,
        `${STICKER_KEY_PREFIX}\uffff`
      );
      const request = db.transaction(DB_STORE, 'readonly')
        .objectStore(DB_STORE)
        .getAll(range);
      request.onsuccess = () => resolve(
        request.result
          .filter(item => item.blob instanceof Blob)
          .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
      );
      request.onerror = () => reject(request.error || new Error('Could not read sticker shelf.'));
    });
  }

  async function renderUserStickerShelf() {
    const grid = document.getElementById('wedit-my-sticker-grid');
    const count = document.getElementById('wedit-sticker-count');
    if (!grid) return;

    grid.replaceChildren();
    try {
      const stickers = await getUserStickers();
      if (count) count.textContent = String(stickers.length);

      if (!stickers.length) {
        const empty = document.createElement('div');
        empty.className = 'wedit-empty';
        empty.textContent = 'Your imported stickers will show up here.';
        grid.appendChild(empty);
        return;
      }

      stickers.forEach(sticker => {
        const card = document.createElement('div');
        card.className = 'wedit-my-sticker';
        card.title = `Use ${sticker.name} as a local preview sticker`;
        const select = document.createElement('button');
        select.type = 'button';
        select.className = 'wedit-my-sticker-select';
        select.setAttribute('aria-label', `Use sticker ${sticker.name}`);

        const image = document.createElement('img');
        image.alt = '';
        image.loading = 'lazy';
        const previousURL = objectURLs.get(sticker.key);
        if (previousURL) URL.revokeObjectURL(previousURL);
        const url = URL.createObjectURL(sticker.blob);
        objectURLs.set(sticker.key, url);
        image.src = url;

        const name = document.createElement('span');
        name.textContent = sticker.name.replace(/\.[^.]+$/, '');

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'wedit-sticker-delete';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${sticker.name}`);
        remove.addEventListener('click', async event => {
          event.stopPropagation();
          await deleteMedia(sticker.key);
          renderUserStickerShelf();
        });

        select.append(image, name);
        card.append(select, remove);
        select.addEventListener('click', () => {
          if (!activeKey) {
            showToast('Select a message first, then choose its sticker.');
            return;
          }
          pendingFile = new File(
            [sticker.blob],
            sticker.name,
            { type: sticker.type || sticker.blob.type || stickerMimeFor(sticker) }
          );
          document.getElementById('wedit-file').value = '';
          document.getElementById('wedit-media-url').value = '';
          document.getElementById('wedit-file-name').textContent =
            `Selected sticker: ${sticker.name}`;
          document.getElementById('wedit-sticker').checked = true;
          updateMediaStatus();
          showToast('Sticker selected. Choose Apply media preview to place it locally.');
        });
        grid.appendChild(card);
      });
    } catch (error) {
      if (count) count.textContent = '—';
      const empty = document.createElement('div');
      empty.className = 'wedit-empty';
      empty.textContent = 'Sticker storage is unavailable in this browser.';
      grid.appendChild(empty);
      console.warn('[WEdit] Could not render imported stickers:', error);
    }
  }

  async function importUserStickers(files) {
    const status = document.getElementById('wedit-sticker-import-status');
    const imageFiles = files.filter(file => stickerMimeFor(file));
    if (!imageFiles.length) {
      if (status) status.textContent = 'No supported sticker images selected. Choose WebP, PNG, JPG, GIF, or AVIF files.';
      return;
    }

    let imported = 0;
    let skipped = files.length - imageFiles.length +
      Math.max(0, imageFiles.length - 100);
    let totalBytes = 0;
    const selected = imageFiles.slice(0, 100);
    if (status) status.textContent = `Importing ${selected.length} sticker images…`;

    try {
      for (const file of selected) {
        if (file.size <= 0 || file.size > 5 * 1024 * 1024 ||
            totalBytes + file.size > 60 * 1024 * 1024) {
          skipped++;
          continue;
        }

        const type = file.type.startsWith('image/')
          ? file.type
          : stickerMimeFor(file);
        const normalized = new File([file], file.name, { type });
        const key = `${STICKER_KEY_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        await putMedia(key, normalized);
        imported++;
        totalBytes += file.size;
        if (status && imported % 5 === 0) {
          status.textContent = `Importing stickers… ${imported} of ${selected.length}`;
        }
      }

      await renderUserStickerShelf();
      if (status) {
        status.textContent = imported
          ? `Imported ${imported} sticker${imported === 1 ? '' : 's'} to this device${skipped ? ` · skipped ${skipped}` : ''}.`
          : `No stickers imported${skipped ? ` · skipped ${skipped}` : ''}. Each image must be 5 MB or smaller.`;
      }
      if (imported) {
        playInterfaceSound('success');
        showToast(`Added ${imported} sticker${imported === 1 ? '' : 's'} to your shelf.`);
      }
    } catch (error) {
      if (status) status.textContent =
        'Import stopped because browser storage is full or unavailable. Your saved stickers remain in the shelf.';
      showToast('Could not finish importing stickers. Check browser storage.');
      console.warn('[WEdit] Sticker import failed:', error);
      await renderUserStickerShelf();
    }
  }

  function buildStickerTray(panel) {
    const tray = panel.querySelector('#wedit-sticker-tray');

    const stickers = [
      {
        name: 'Heart',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path d="M80 139C67 126 19 91 19 53 19 19 60 12 80 42 100 12 141 19 141 53c0 38-48 73-61 86Z" fill="#ff5e86" stroke="#a91f50" stroke-width="5"/><path d="M42 46c5-13 18-18 29-12" fill="none" stroke="#ffc4d5" stroke-width="8" stroke-linecap="round"/></svg>'
      },
      {
        name: 'Star',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path d="m80 12 19 44 48 4-36 31 11 47-42-25-42 25 11-47-36-31 48-4Z" fill="#ffd34e" stroke="#b77b18" stroke-width="5" stroke-linejoin="round"/><path d="M61 75h1m36 0h1" stroke="#4a3820" stroke-width="9" stroke-linecap="round"/><path d="M65 91q15 16 30 0" fill="none" stroke="#4a3820" stroke-width="5" stroke-linecap="round"/></svg>'
      },
      {
        name: 'Cat',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path d="M28 55 24 18l37 21q19-8 38 0l37-21-4 38q10 16 8 39-5 46-61 48-56-2-61-48-2-23 10-40Z" fill="#ffb96b" stroke="#9d5d2c" stroke-width="5" stroke-linejoin="round"/><path d="M48 79q9-10 18 0m28 0q9-10 18 0" fill="none" stroke="#563b2d" stroke-width="5" stroke-linecap="round"/><path d="m72 94 8 6 8-6Z" fill="#d95774"/><path d="M80 100v7m0 0q-11 9-20 0m20 0q11 9 20 0" fill="none" stroke="#563b2d" stroke-width="3" stroke-linecap="round"/><path d="M38 99 15 95m25 13-23 8m105-17 23-4m-25 17 23 8" stroke="#9d5d2c" stroke-width="3" stroke-linecap="round"/></svg>'
      },
      {
        name: 'Fire',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path d="M84 12c7 35-27 42-17 71 5-12 15-18 22-35 31 28 43 52 33 79-8 22-30 30-47 28-35-3-53-29-45-57 4-16 18-28 21-45 16 13 20 26 18 38 16-20 19-39 15-79Z" fill="#ff733f" stroke="#a93227" stroke-width="5"/><path d="M82 83c15 15 24 29 17 45-5 11-18 16-28 8-17-12-5-30 11-53Z" fill="#ffd95d"/></svg>'
      },
      {
        name: 'Crown',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path d="m22 49 33 27 25-48 25 48 33-27-13 75H35Z" fill="#ffd34e" stroke="#ac7616" stroke-width="6" stroke-linejoin="round"/><path d="M35 124h90v13H35Z" fill="#ffb62d" stroke="#ac7616" stroke-width="5"/><circle cx="22" cy="45" r="9" fill="#ff6385"/><circle cx="80" cy="23" r="9" fill="#65d5fb"/><circle cx="138" cy="45" r="9" fill="#ff6385"/></svg>'
      }
    ];

    stickers.forEach(sticker => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wedit-sticker-pick';
      btn.title = `Add ${sticker.name} sticker to the local preview`;

      const img = document.createElement('img');
      img.className = 'wedit-sticker-icon';
      img.alt = '';
      img.src =
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sticker.svg)}`;

      const label = document.createElement('span');
      label.textContent = sticker.name;

      btn.append(img, label);

      btn.addEventListener('click', () => {
        try {
          pendingFile = new File(
            [sticker.svg],
            `wedit-${sticker.name.toLowerCase()}-sticker.svg`,
            { type: 'image/svg+xml' }
          );

          panel.querySelector('#wedit-file').value = '';
          panel.querySelector('#wedit-media-url').value = '';
          panel.querySelector('#wedit-file-name').textContent =
            `${sticker.name} sticker selected`;

          panel.querySelector('#wedit-sticker').checked = true;

          updateMediaStatus();
          showToast(
            `${sticker.name} sticker selected. Apply local preview to place it.`
          );
        } catch (_) {
          showToast(
            'This browser does not support the built-in sticker picker. ' +
            'Upload a sticker image instead.'
          );
        }
      });

      tray.appendChild(btn);
    });

    renderUserStickerShelf();
  }

  function selectMessage(root, textNode) {
    const key = getKey(root, textNode);
    if (!key) return;

    activeKey = key;
    activeRoot = root;
    activeText = textNode;

    const entry = edits[key];
    const original = entry?.originalText ?? safeText(textNode);
    const shown = entry?.replacement ?? safeText(textNode);
    activeOriginalText = original;

    const context = document.getElementById('wedit-original');
    context.replaceChildren();

    const label = document.createElement('small');
    label.textContent =
      `${isIncoming(root) ? 'Received message' : 'Message sent from this account'} · ${getChatName()}`;

    const content = document.createElement('div');
    content.textContent = original || '(Empty message text)';
    context.append(label, content);

    const textarea = document.getElementById('wedit-replacement');
    textarea.disabled = false;
    textarea.value = shown;
    updateEditorPreview();

    const urlInput = document.getElementById('wedit-media-url');
    urlInput.value = entry?.media?.kind === 'url'
      ? entry.media.url
      : '';

    pendingFile = null;
    document.getElementById('wedit-file').value = '';

    document.getElementById('wedit-file-name').textContent =
      entry?.media?.name
        ? `Saved: ${entry.media.name}`
        : 'Choose image, GIF, sticker image, or video';

    document.getElementById('wedit-sticker').checked =
      !!entry?.media?.sticker;

    document.getElementById('wedit-reset').disabled = !entry;
    document.getElementById('wedit-apply').disabled = false;

    updateMediaStatus();
    setTab('editor');
    togglePanel(true);
  }

  async function applyActiveEdit() {
    if (
      !activeKey ||
      !activeRoot?.isConnected ||
      !activeText?.isConnected
    ) {
      showToast('Select a loaded text message first.');
      return;
    }

    const replacement =
      document.getElementById('wedit-replacement').value;

    const url =
      document.getElementById('wedit-media-url').value.trim();

    const sticker =
      document.getElementById('wedit-sticker').checked;

    const existing = edits[activeKey];

    const originalText =
      existing?.originalText ?? safeText(activeText);

    if (!replacement.trim() && !pendingFile && !url) {
      showToast('Enter replacement text or add a media file/URL.');
      return;
    }

    if (url && !validHttpURL(url)) {
      showToast('Media URL must start with http:// or https://.');
      setTab('media');
      return;
    }

    let media = null;

    if (pendingFile) {
      try {
        await putMedia(activeKey, pendingFile);

        media = {
          kind: 'blob',
          name: pendingFile.name,
          type: pendingFile.type || 'application/octet-stream',
          sticker
        };
      } catch (err) {
        console.error('[WEdit] Failed storing media', err);

        showToast(
          'Could not save media in IndexedDB. Try a smaller file ' +
          'or check storage settings.'
        );

        return;
      }
    } else if (url) {
      media = {
        kind: 'url',
        url,
        type: getMediaTypeFromURL(url),
        sticker
      };
    } else if (existing?.media) {
      const urlNow =
        document.getElementById('wedit-media-url').value.trim();

      const fileLabel =
        document.getElementById('wedit-file-name').textContent;

      const removeRequested =
        fileLabel.startsWith('Choose image') && !urlNow && !pendingFile;

      media = removeRequested ? null : {
        ...existing.media,
        sticker
      };
    }

    const entry = {
      originalText,
      replacement,
      chatName: getChatName(),
      direction: isIncoming(activeRoot) ? 'Received' : 'Sent',
      updatedAt: Date.now(),
      media
    };

    if (
      existing?.media?.kind === 'blob' &&
      media?.kind !== 'blob'
    ) {
      await deleteMedia(activeKey);
    }

    edits[activeKey] = entry;
    activeText.textContent = replacement;

    activeRoot.querySelectorAll(':scope > .wedit-media-preview')
      .forEach(el => el.remove());

    renderMessageMedia(activeRoot, activeKey, entry)
      .catch(err => console.warn('[WEdit] Media preview issue:', err));

    decorateEditedRoot(activeRoot, activeKey);
    saveEdits();

    document.getElementById('wedit-reset').disabled = false;

    document.getElementById('wedit-file-name').textContent =
      media?.name
        ? `Saved: ${media.name}`
        : 'Choose image, GIF, sticker image, or video';

    pendingFile = null;
    document.getElementById('wedit-file').value = '';

    showToast(
      'Local preview applied. Nothing was sent or edited on WhatsApp.'
    );
    playInterfaceSound('success');

    updateSelectedContext();
  }

  async function renderMessageMedia(root, key, entry) {
    if (!root || mediaRendering.has(key)) return;

    mediaRendering.add(key);

    try {
      const media = entry?.media;

      const previous = Array.from(
        root.querySelectorAll(':scope > .wedit-media-preview')
      );

      if (
        media &&
        previous.some(el =>
          el.dataset.weditMediaKey === key && el.childElementCount > 0
        )
      ) return;

      previous.forEach(el => el.remove());

      if (!media) return;

      const holder = document.createElement('div');

      holder.className =
        `wedit-media-preview${media.sticker ? ' wedit-sticker' : ''}`;

      holder.dataset.weditMediaKey = key;
      holder.title = 'WEdit local media preview';

      let src = '';

      if (media.kind === 'url') {
        if (!validHttpURL(media.url)) return;
        src = media.url;
      } else if (media.kind === 'blob') {
        const stored = await getMedia(key);

        if (!stored?.blob) {
          showMediaMissing(root, key);
          return;
        }

        const previousURL = objectURLs.get(key);

        if (previousURL) URL.revokeObjectURL(previousURL);

        src = URL.createObjectURL(stored.blob);
        objectURLs.set(key, src);
      } else {
        return;
      }

      const kind = media.kind === 'blob'
        ? (media.type || '')
        : getMediaTypeFromURL(media.url);

      let el;

      if (kind.startsWith('video/') || kind === 'video') {
        el = document.createElement('video');
        el.controls = true;
        el.loop = true;
        el.playsInline = true;
        el.preload = 'metadata';
      } else {
        el = document.createElement('img');
        el.alt = media.sticker
          ? 'Local sticker preview'
          : 'Local image preview';

        el.loading = 'lazy';
        el.draggable = false;
      }

      el.src = src;

      el.addEventListener('error', () => {
        const msg = document.createElement('div');

        msg.style.cssText =
          'padding:8px;color:#ffd0cb;font-size:11px;' +
          'background:#281d20;border-radius:8px;';

        msg.textContent =
          'This media could not load. Try a direct media URL or upload the file.';

        holder.replaceChildren(msg);
      }, { once: true });

      holder.appendChild(el);
      root.appendChild(holder);
    } catch (err) {
      console.warn('[WEdit] Could not render local media preview:', err);
    } finally {
      mediaRendering.delete(key);
    }
  }

  function showMediaMissing(root, key) {
    root.querySelectorAll(':scope > .wedit-media-preview')
      .forEach(el => el.remove());

    console.info('[WEdit] Local media file missing for preview', key);
  }

  function updateSelectedContext() {
    const entry = edits[activeKey];
    if (!entry) return;

    const context = document.getElementById('wedit-original');
    if (!context) return;

    context.replaceChildren();

    const label = document.createElement('small');
    label.textContent =
      `${entry.direction} message · ${entry.chatName} · original`;

    const content = document.createElement('div');
    content.textContent =
      entry.originalText || '(Empty text; media-only preview)';

    context.append(label, content);
  }

  function findRootByKey(key) {
    for (const root of document.querySelectorAll(
      `${SELECTOR_ROOT}, [data-id]`
    )) {
      const text = getTextNode(root);

      if (text && getKey(root, text) === key) return root;
    }

    return null;
  }

  function decorateEditedRoot(root, key) {
    if (!root) return;

    root.querySelectorAll(':scope > .wedit-local-flag')
      .forEach(flag => flag.remove());

    root.classList.add('wedit-message-hover');

    if (!root.style.position || root.style.position === 'static') {
      root.style.position = 'relative';
    }

    let btn = root.querySelector(':scope > .wedit-inline');

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wedit-inline';
      btn.title = 'Edit this local preview';
      btn.setAttribute('aria-label', 'Edit local preview');
      root.appendChild(btn);
    }

    btn.classList.add('wedit-is-edited');
    btn.textContent = '✎ Edit';
    btn.dataset.weditKey = key;
  }

  function removeEditedDecoration(root) {
    if (!root) return;

    root.querySelectorAll(':scope > .wedit-local-flag')
      .forEach(el => el.remove());

    const btn = root.querySelector(':scope > .wedit-inline');

    if (btn) {
      btn.classList.remove('wedit-is-edited');
      btn.textContent = '✎ Edit';
    }

    root.querySelectorAll(':scope > .wedit-media-preview')
      .forEach(el => el.remove());
  }

  async function restoreByKey(key) {
    const item = edits[key];
    if (!item) return;

    const root = findRootByKey(key);
    const textNode = root ? getTextNode(root) : null;

    if (textNode) textNode.textContent = item.originalText;
    if (root) removeEditedDecoration(root);

    await deleteMedia(key);
    delete edits[key];
    saveEdits();

    if (activeKey === key) {
      activeRoot = root;
      activeText = textNode;

      const textarea = document.getElementById('wedit-replacement');
      const reset = document.getElementById('wedit-reset');

      activeOriginalText = item.originalText || '';
      if (textarea) textarea.value = activeOriginalText;
      if (reset) reset.disabled = true;
      updateEditorPreview();

      const fileLabel = document.getElementById('wedit-file-name');

      if (fileLabel) {
        fileLabel.textContent =
          'Choose image, GIF, sticker image, or video';
      }

      const urlInput = document.getElementById('wedit-media-url');
      if (urlInput) urlInput.value = '';
    }

    showToast(
      textNode
        ? 'Original restored in your local view.'
        : 'Preview removed from saved list. Open the chat to refresh its visible message.'
    );
  }

  async function restoreActiveEdit() {
    if (!activeKey || !edits[activeKey]) {
      showToast('This message has no saved local edit.');
      return;
    }

    await restoreByKey(activeKey);

    const reset = document.getElementById('wedit-reset');
    if (reset) reset.disabled = true;
    playInterfaceSound('restore');
  }

  function renderEditList() {
    const list = document.getElementById('wedit-list');
    const count = document.getElementById('wedit-count');

    if (!list) return;

    const entries = Object.entries(edits)
      .filter(([, item]) =>
        !searchTerm ||
        `${item.chatName || ''} ${item.originalText || ''} ` +
        `${item.replacement || ''} ${item.media?.name || ''}`
          .toLowerCase()
          .includes(searchTerm)
      )
      .sort((a, b) =>
        (b[1].updatedAt || 0) - (a[1].updatedAt || 0)
      );

    if (count) {
      count.textContent = String(Object.keys(edits).length);
    }

    const pill = document.getElementById('wedit-launcher-state');

    if (pill) {
      pill.textContent =
        `${Object.keys(edits).length} LOCAL PREVIEW` +
        `${Object.keys(edits).length === 1 ? '' : 'S'}`;
    }

    list.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'wedit-empty';

      empty.textContent = Object.keys(edits).length
        ? 'No previews match that search.'
        : 'No saved previews yet. Hover a text message and select Edit to begin.';

      list.appendChild(empty);
      return;
    }

    entries.slice(0, 40).forEach(([key, item]) => {
      const card = document.createElement('div');
      card.className = 'wedit-item';

      const top = document.createElement('div');
      top.className = 'wedit-item-top';

      const name = document.createElement('div');
      name.className = 'wedit-item-name';

      name.textContent =
        `${item.chatName || 'Chat'} · ${item.direction || 'Message'}` +
        `${item.media ? ' · media' : ''}`;

      const undo = document.createElement('button');
      undo.className = 'wedit-undo';
      undo.type = 'button';
      undo.textContent = 'RESTORE';

      undo.addEventListener('click', ev => {
        ev.stopPropagation();
        restoreByKey(key);
      });

      top.append(name, undo);

      const before = document.createElement('div');
      before.className = 'wedit-item-before';
      before.textContent = item.originalText || '(No original text)';

      const after = document.createElement('div');
      after.className = 'wedit-item-after';

      after.textContent = item.replacement ||
        (item.media
          ? `[${item.media.name || item.media.type || 'media preview'}]`
          : '(empty)');

      card.append(top, before, after);

      card.addEventListener('click', () => {
        const root = findRootByKey(key);
        const textNode = root ? getTextNode(root) : null;

        if (root && textNode) {
          selectMessage(root, textNode);
        } else {
          togglePanel(true);
          showToast(
            'Open that chat and scroll to the message to edit or restore it on screen.'
          );
        }
      });

      list.appendChild(card);
    });

    if (entries.length > 40) {
      const more = document.createElement('div');
      more.className = 'wedit-empty';
      more.textContent =
        `Showing 40 of ${entries.length}. Use search to find another.`;

      list.appendChild(more);
    }
  }

  function updateStats() {
    const count = document.getElementById('wedit-count');
    const homeCount = document.getElementById('wedit-home-preview-count');
    const homeTheme = document.getElementById('wedit-home-theme');
    const homeStickers = document.getElementById('wedit-home-sticker-count');

    const previewCount = Object.keys(edits).length;
    if (count) count.textContent = String(previewCount);
    if (homeCount) homeCount.textContent = String(previewCount);
    if (homeTheme) homeTheme.textContent = currentTheme?.name || 'Midnight';
    if (homeStickers) homeStickers.textContent = document.getElementById('wedit-sticker-count')?.textContent || '0';
  }

  async function clearAllEdits() {
    const keys = Object.keys(edits);

    if (!keys.length) {
      showToast('There are no saved previews to clear.');
      return;
    }

    if (!window.confirm(
      `Clear ${keys.length} saved local preview(s) from this browser? ` +
      'This does not change WhatsApp messages.'
    )) return;

    for (const key of keys) {
      const root = findRootByKey(key);
      const textNode = root ? getTextNode(root) : null;

      if (textNode) textNode.textContent = edits[key].originalText || '';
      if (root) removeEditedDecoration(root);

      await deleteMedia(key);
    }

    edits = {};
    activeKey = null;
    activeRoot = null;
    activeText = null;
    activeOriginalText = '';

    saveEdits();

    const context = document.getElementById('wedit-original');
    const textarea = document.getElementById('wedit-replacement');

    if (context) {
      context.textContent =
        'No message selected. Hover over a text message and press Edit.';
    }

    if (textarea) {
      textarea.value = '';
      textarea.disabled = true;
    }
    updateEditorPreview();

    document.getElementById('wedit-apply').disabled = true;
    document.getElementById('wedit-reset').disabled = true;

    showToast('All local previews cleared.');
    playInterfaceSound('restore');
  }

  function handleClick(event) {
    if (quickHide) return;
    const button = event.target.closest('.wedit-inline');
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const root = button.closest(SELECTOR_ROOT) || button.parentElement;
    const textNode = getTextNode(root);

    if (!isUsableMessage(root, textNode)) {
      showToast('Could not find text in that message.');
      return;
    }

    selectMessage(root, textNode);
  }

  function enhanceRoot(root) {
    if (!root?.isConnected) return;
    if (quickHide) {
      restoreRootForQuickHide(root);
      return;
    }

    const textNode = getTextNode(root);
    if (!isUsableMessage(root, textNode)) return;

    const key = getKey(root, textNode);
    if (!key) return;

    root.querySelectorAll(':scope > .wedit-local-flag')
      .forEach(flag => flag.remove());

    root.classList.add('wedit-message-hover');

    if (!root.style.position || root.style.position === 'static') {
      if (!originalPositions.has(root)) originalPositions.set(root, root.style.position);
      root.style.position = 'relative';
    }

    let btn = root.querySelector(':scope > .wedit-inline');

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wedit-inline';
      btn.textContent = '✎ Edit';
      btn.title = 'Edit this message in a local preview';
      btn.setAttribute('aria-label', 'Edit message locally');
      btn.dataset.weditKey = key;

      root.appendChild(btn);
    } else {
      btn.dataset.weditKey = key;
    }

    const entry = edits[key];

    if (entry) {
      if (safeText(textNode) !== (entry.replacement || '')) {
        textNode.textContent = entry.replacement || '';
      }

      btn.classList.add('wedit-is-edited');
      btn.textContent = '✎ Edit';

      if (
        entry.media &&
        !root.querySelector(
          `:scope > .wedit-media-preview[data-wedit-media-key="${CSS.escape(key)}"]`
        )
      ) {
        renderMessageMedia(root, key, entry)
          .catch(err => console.warn('[WEdit] media render failed', err));
      } else if (!entry.media) {
        root.querySelectorAll(':scope > .wedit-media-preview')
          .forEach(el => el.remove());
      }
    } else {
      btn.classList.remove('wedit-is-edited');
      btn.textContent = '✎ Edit';

      root.querySelectorAll(':scope > .wedit-local-flag')
        .forEach(el => el.remove());

      root.querySelectorAll(':scope > .wedit-media-preview')
        .forEach(el => el.remove());
    }
  }

  function queueEnhance() {
    if (enhanceQueued) return;

    enhanceQueued = true;

    requestAnimationFrame(() => {
      enhanceQueued = false;

      const roots = new Set();

      document.querySelectorAll(SELECTOR_TEXT).forEach(text => {
        const root = getMessageRoot(text);
        if (root) roots.add(root);
      });

      roots.forEach(enhanceRoot);
    });
  }

  function start() {
    addStyles();
    buildUI();
    showVersionWelcome();
    refreshChangelog();
    checkForUserscriptUpdate();
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Check for WEdit updates', () => checkForUserscriptUpdate(true));
    }

    document.addEventListener('click', handleClick, true);

    document.addEventListener('keydown', event => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        setQuickHide(!quickHide);
        return;
      }
      if (
        event.altKey &&
        event.shiftKey &&
        event.key.toLowerCase() === 'e'
      ) {
        event.preventDefault();
        togglePanel();
      }
    });

    queueEnhance();

    window.setInterval(() => {
      if (
        (activeTab === 'announcements' || activeTab === 'home') &&
        document.visibilityState === 'visible'
      ) refreshAnnouncements(false);
      if (
        (activeTab === 'changelog' || activeTab === 'home') &&
        document.visibilityState === 'visible'
      ) refreshChangelog();
    }, 15 * 60 * 1000);

    const observer = new MutationObserver(records => {
      const relevant = records.some(r => {
        const target = r.target;

        if (
          target?.nodeType === Node.ELEMENT_NODE &&
          target.closest?.(`#${PANEL_ID},#${LAUNCHER_ID},#wedit-toast`)
        ) return false;

        if (
          target?.parentElement?.closest?.(
            `#${PANEL_ID},#${LAUNCHER_ID},#wedit-toast`
          )
        ) return false;

        return true;
      });

      if (relevant) queueEnhance();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
