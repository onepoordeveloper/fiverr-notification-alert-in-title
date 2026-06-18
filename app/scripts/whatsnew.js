'use strict'

// Keeps the version label honest (pulled from the manifest) and wires the
// "Got it" button to close the tab.
;(function () {
  var versionEl = document.getElementById('version')
  if (versionEl) {
    versionEl.textContent = 'v' + chrome.runtime.getManifest().version
  }

  var closeEl = document.getElementById('close')
  if (closeEl) {
    closeEl.addEventListener('click', function () {
      window.close()
    })
  }
})()
