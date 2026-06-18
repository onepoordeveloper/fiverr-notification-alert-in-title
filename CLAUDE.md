# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome extension that swaps the Fiverr browser-tab favicon to a red variant when there's an unread notification, so the user notices activity from the tab title/icon without focusing the tab. Published on the Chrome Web Store (`update_url` + signing `key` in the manifest are tied to that listing — do not change them).

## Architecture

The entire behavior lives in one content script, `app/scripts/contentscript.js` (vanilla JS, no dependencies):

- Detection is DOM-based. Unread is the presence of `.popover-notifications-drawer [data-track-tag='dot_indicator']` — the badge dot Fiverr renders on the header Messages and Notifications buttons, removed from the DOM once everything is read. One selector covers both buttons. The `.popover-notifications-drawer` parent scope matters: the same `dot_indicator` component appears elsewhere (e.g. blog listings), so scoping prevents false positives.
- When unread, it rewrites every `<link rel*='icon'>` `href` to the bundled `images/fiverr-red.png` (exposed via `web_accessible_resources`). When read, it restores each link's captured original href (falling back to `https://www.fiverr.com/favicon.ico`). It only writes when the href actually changes, so the favicon doesn't flicker.
- Updates are driven by a debounced `MutationObserver` (coalesced via `requestAnimationFrame`) for instant reaction, with a 5s `setInterval` kept as a safety-net poll.

Everything is wired up by `app/manifest.json` (**Manifest V3**): the content script is injected on `https://www.fiverr.com/*` at `document_end`. No background script, no popup, no options page, and `permissions` is empty by design — the extension only touches the page DOM. Keep that minimal-permission footprint. `key` and `update_url` are tied to the published listing / extension identity — do not change them.

This design is fragile by nature: it depends on Fiverr's private DOM, which Fiverr can change without notice. Most past commits are reactions to exactly that ("fixes because of UI change", "update icon selector"). When the extension "stops working," the first suspect is the `UNREAD_SELECTOR` in the content script — not a logic bug. Note that Fiverr's class names are hashed CSS-module strings (`_xwb3qf`, etc.) that change every build; only target durable hooks like the semantic `popover-notifications-drawer` class and `data-track-tag` attributes.

## Working on it

No build, bundler, package manager, lint, or test setup exists — the extension loads as-is. To test changes: load `app/` as an unpacked extension via `chrome://extensions` (Developer mode → Load unpacked), then open Fiverr and toggle a message/notification (or add/remove a `dot_indicator` div under `.popover-notifications-drawer` in DevTools). Reload the extension from that page after edits.

Quick static checks without Chrome: `node --check app/scripts/contentscript.js` and `node -e "JSON.parse(require('fs').readFileSync('app/manifest.json','utf8'))"`.

Bump `version` in `app/manifest.json` for any change that will be repackaged for the store; the commit history follows a "version update" convention per release. The store upload must be an MV3 package.
