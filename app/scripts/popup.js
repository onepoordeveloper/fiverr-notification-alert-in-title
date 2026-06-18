'use strict';

// Settings UI for the toolbar popup: toggle the chime and set its volume,
// persisted to chrome.storage.sync (the content script reads the same keys and
// reacts live via storage.onChanged).
(function () {
  var DEFAULTS = { soundEnabled: true, volume: 0.5 };

  var enabledEl = document.getElementById('soundEnabled');
  var volumeEl = document.getElementById('volume');
  var testEl = document.getElementById('test');

  function syncDisabledState() {
    volumeEl.disabled = !enabledEl.checked;
    testEl.disabled = !enabledEl.checked;
  }

  chrome.storage.sync.get(DEFAULTS, function (stored) {
    var s = stored || DEFAULTS;
    enabledEl.checked = s.soundEnabled !== false;
    var volume = typeof s.volume === 'number' ? s.volume : DEFAULTS.volume;
    volumeEl.value = String(Math.round(volume * 100));
    syncDisabledState();
  });

  enabledEl.addEventListener('change', function () {
    chrome.storage.sync.set({ soundEnabled: enabledEl.checked });
    syncDisabledState();
  });

  volumeEl.addEventListener('input', function () {
    chrome.storage.sync.set({ volume: Number(volumeEl.value) / 100 });
  });

  testEl.addEventListener('click', function () {
    if (globalThis.FiverrChime) {
      globalThis.FiverrChime.play(Number(volumeEl.value) / 100);
    }
  });
})();
