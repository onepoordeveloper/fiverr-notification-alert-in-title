'use strict';

// Swaps the Fiverr tab favicon to a red variant while there is an unread
// message or notification, and restores the original favicon when there is
// none. Unread is detected via UNREAD_SELECTOR below; everything else here is
// plumbing to apply that signal to the page's <link rel="icon"> tags.
(function () {
  var RED_FAVICON = chrome.runtime.getURL('images/fiverr-red.png');

  // Unread signal: Fiverr shows a `dot_indicator` dot on the header Messages and
  // Notifications buttons, removing it from the DOM once everything is read. We
  // scope to `.popover-notifications-drawer` (the wrapper around both buttons) so
  // the same dot used elsewhere — e.g. blog listings — can't false-trigger.
  // THIS SELECTOR is the one fragile coupling to Fiverr's markup: if the favicon
  // stops reacting, Fiverr changed its header and this is what needs updating.
  var UNREAD_SELECTOR =
    ".popover-notifications-drawer [data-track-tag='dot_indicator']";
  var ICON_SELECTOR = "link[rel*='icon']";

  // Fallback used only if we never captured the page's real favicon href
  // (e.g. an icon link appeared already pointing at our red image).
  var FALLBACK_FAVICON = 'https://www.fiverr.com/favicon.ico';

  // Safety-net poll. The MutationObserver below reacts instantly; this just
  // guarantees eventual consistency if a mutation is ever missed. Matches the
  // original 5s cadence so worst-case behaviour is unchanged.
  var POLL_INTERVAL_MS = 5000;

  function hasUnread() {
    return document.querySelector(UNREAD_SELECTOR) !== null;
  }

  function iconLinks() {
    return document.querySelectorAll(ICON_SELECTOR);
  }

  // Reflect the current unread state onto every icon link. Only writes when the
  // target href actually differs, so we don't rewrite (and re-fetch) the
  // favicon on every tick — avoiding the constant flicker the old code caused.
  function sync() {
    var unread = hasUnread();

    iconLinks().forEach(function (link) {
      if (unread) {
        if (link.getAttribute('href') === RED_FAVICON) {
          return;
        }
        if (!link.dataset.fiverrOriginalHref) {
          link.dataset.fiverrOriginalHref =
            link.getAttribute('href') || FALLBACK_FAVICON;
        }
        link.setAttribute('href', RED_FAVICON);
      } else if (link.getAttribute('href') === RED_FAVICON) {
        link.setAttribute(
          'href',
          link.dataset.fiverrOriginalHref || FALLBACK_FAVICON
        );
      }
    });
  }

  // Coalesce bursts of DOM mutations into a single sync on the next frame so a
  // busy SPA doesn't trigger hundreds of redundant runs.
  var scheduled = false;
  function scheduleSync() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      sync();
    });
  }

  var observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'href'],
  });

  setInterval(sync, POLL_INTERVAL_MS);
  sync();
})();
