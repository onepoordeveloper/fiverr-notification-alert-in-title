# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome extension that swaps the Fiverr browser-tab favicon to a red variant when there's an unread notification, so the user notices activity from the tab title/icon without focusing the tab. Published on the Chrome Web Store (`update_url` + signing `key` in the manifest are tied to that listing — do not change them).

## Architecture

The entire behavior lives in one content script, `app/scripts/contentscript.js` (vanilla JS, no dependencies):

- Detection is DOM-based. Unread is the presence of `.popover-notifications-drawer [data-track-tag='dot_indicator']` — the badge dot Fiverr renders on the header Messages and Notifications buttons, removed from the DOM once everything is read. One selector covers both buttons. The `.popover-notifications-drawer` parent scope matters: the same `dot_indicator` component appears elsewhere (e.g. blog listings), so scoping prevents false positives.
- When unread, it rewrites every `<link rel*='icon'>` `href` to the bundled `images/fiverr-red.png` (exposed via `web_accessible_resources`). When read, it restores each link's captured original href (falling back to `https://www.fiverr.com/favicon.ico`). It only writes when the href actually changes, so the favicon doesn't flicker.
- Updates are driven by a debounced `MutationObserver` (coalesced via `requestAnimationFrame`) for instant reaction, with a 5s `setInterval` kept as a safety-net poll.

Everything is wired up by `app/manifest.json` (**Manifest V3**): the content script (`chime.js` then `contentscript.js`) is injected on `https://www.fiverr.com/*` at `document_end`. There's a toolbar popup (`popup.html`) for the sound on/off + volume settings, stored via `chrome.storage.sync`, and a minimal background service worker (`background.js`) whose only job is opening `whatsnew.html` on install and significant (minor/major) updates. The lone permission is `storage`; the extension otherwise only touches the page DOM, so keep that footprint. `key` and `update_url` are tied to the published Chrome listing / extension identity — do not change them.

This design is fragile by nature: it depends on Fiverr's private DOM, which Fiverr can change without notice. Most past commits are reactions to exactly that ("fixes because of UI change", "update icon selector"). When the extension "stops working," the first suspect is the `UNREAD_SELECTOR` in the content script — not a logic bug. Note that Fiverr's class names are hashed CSS-module strings (`_xwb3qf`, etc.) that change every build; only target durable hooks like the semantic `popover-notifications-drawer` class and `data-track-tag` attributes.

## Working on it

There's no bundler, lint, or test setup — `app/` is the source and loads unpacked as-is. To test changes: load `app/` via `chrome://extensions` (Developer mode → Load unpacked) — or `about:debugging` in Firefox — then open Fiverr and toggle a message/notification (or add/remove a `dot_indicator` div under `.popover-notifications-drawer` in DevTools). Reload the extension from that page after edits.

Quick static checks without a browser: `node --check app/scripts/contentscript.js` and `node -e "JSON.parse(require('fs').readFileSync('app/manifest.json','utf8'))"`.

### Dual-store packaging

The extension ships to both the Chrome Web Store and Firefox AMO from one source. `app/manifest.json` is a **superset** carrying both stores' keys, so unpacked `app/` loads in either browser during dev (each just warns about the other's keys). `node build.mjs` produces warning-free per-store packages under `dist/` (gitignored): it strips the keys each store rejects — Chrome drops `browser_specific_settings` and `background.scripts`; Firefox drops `key`, `update_url`, and `background.service_worker`. Add new store-specific keys to the superset and to the relevant transform in `build.mjs`.

Bump `version` in `app/manifest.json` per release (also update the static label in `whatsnew.html`, which `whatsnew.js` overrides at runtime), then re-run `node build.mjs`. AMO rejects re-uploads of an already-seen version, so a rejected build needs a fresh version number.
