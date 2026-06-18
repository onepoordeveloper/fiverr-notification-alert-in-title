'use strict'

// Opens an educational page on first install (welcome) and on significant
// updates — a minor or major version change. Patch releases (e.g. 1.5.0 ->
// 1.5.1) are skipped so small fixes don't pop a tab every time.
//
// Event-driven: this service worker only wakes for onInstalled, then idles.
// Opening an extension page via chrome.tabs.create needs no extra permission.

var WHATS_NEW_PAGE = 'whatsnew.html'

// True when the major or minor component differs (or there's no prior version).
function isSignificantUpdate(previousVersion, currentVersion) {
  if (!previousVersion) {
    return true
  }
  var previous = previousVersion.split('.')
  var current = currentVersion.split('.')
  return previous[0] !== current[0] || previous[1] !== current[1]
}

function openWhatsNew() {
  chrome.tabs.create({ url: chrome.runtime.getURL(WHATS_NEW_PAGE) })
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    openWhatsNew()
    return
  }

  if (details.reason === 'update') {
    var current = chrome.runtime.getManifest().version
    if (isSignificantUpdate(details.previousVersion, current)) {
      openWhatsNew()
    }
  }
})
