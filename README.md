# Fiverr Notification Icon in Title

A browser extension that turns the Fiverr tab icon red — and optionally plays a
chime — the moment a new message or notification arrives. Keep working in other
tabs without checking Fiverr over and over.

Available for Chrome and Firefox. [Demo on YouTube](https://www.youtube.com/watch?v=ZWcGFBoebO4).

## Features

- **Red tab icon** whenever you have an unread Fiverr message or notification.
- **Optional sound** — a short chime when something new arrives, with an on/off
  toggle and volume slider in the toolbar popup.
- **Lightweight** — Manifest V3, vanilla JavaScript, no third-party libraries.
- **Private** — reads the Fiverr page only to detect notifications; doesn't
  collect or transmit your messages or personal data. Sound settings are saved
  through the browser's own storage.

## How it works

The content script watches Fiverr's header for the unread dot (`dot_indicator`)
on the Messages and Notifications buttons, scoped to the header drawer so other
parts of the page can't trigger it. When a dot appears it rewrites the page's
`<link rel="icon">` to a red favicon and restores the original when it clears. A
`MutationObserver` reacts instantly, with a 5-second poll as a safety net.

The chime is synthesized with the Web Audio API (no audio file to ship) and
defers to your first interaction with the page, which is required by browser
autoplay rules — so the first chime after a reload plays on your next click.

## Development

`app/` is the source and loads unpacked as-is:

- **Chrome** — `chrome://extensions` → enable Developer mode → Load unpacked →
  select `app/`.
- **Firefox** — `about:debugging` → This Firefox → Load Temporary Add-on →
  select `app/manifest.json`.

Then open Fiverr (logged in) and click the toolbar icon to configure sound. The
same `app/` loads in either browser; each just warns about the other browser's
manifest keys.

Quick static checks without a browser:

```sh
node --check app/scripts/contentscript.js
node -e "JSON.parse(require('fs').readFileSync('app/manifest.json','utf8'))"
```

## Building store packages

```sh
node build.mjs
```

`app/manifest.json` is a superset carrying both stores' keys. The build strips
what each store rejects and writes warning-free packages to `dist/`
(gitignored):

- `dist/fiverr-notification-alert-in-title-<version>-chrome.zip`
- `dist/fiverr-notification-alert-in-title-<version>-firefox.zip`

Chrome drops `browser_specific_settings` and `background.scripts`; Firefox drops
`key`, `update_url`, and `background.service_worker`. To add a store-specific
key, put it in the superset and add a `delete` line to the matching transform in
`build.mjs`.

## Project layout

```
app/
  manifest.json        MV3 superset (Chrome + Firefox keys)
  popup.html / .css    sound settings UI
  whatsnew.html / .css shown on install and significant updates
  images/              icons + the red favicon
  scripts/
    contentscript.js   favicon swap + chime trigger
    chime.js           Web Audio chime (shared with the popup)
    popup.js           settings, persisted via chrome.storage.sync
    background.js       service worker — opens the what's-new page
    whatsnew.js
build.mjs              dual-store packaging
```

## Contact

Questions or issues: onepoordeveloper@gmail.com
