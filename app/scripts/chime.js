'use strict'

// Synthesizes a short two-note notification chime with the Web Audio API, so
// there's no audio file to bundle or license and volume maps straight to gain.
// Shared by the content script (plays on a new notification) and the popup
// (Test button). Exposed as `globalThis.FiverrChime`.
//
// Browser autoplay policy blocks Web Audio until the page has had a user
// gesture, so a chime requested before any interaction (e.g. right after a
// page reload) is queued and played on the first click/keypress instead of
// failing with a console warning.
;(function () {
  // Drop a queued chime if the user doesn't interact within this window — a
  // very delayed beep for a stale page would be more confusing than helpful.
  var PENDING_TTL_MS = 60000

  var context = null
  var pending = null // { volume, at } queued until a user gesture

  function getContext() {
    if (!context) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) {
        return null
      }
      // Reused across chimes — browsers cap the number of live AudioContexts.
      context = new AudioCtx()
    }
    return context
  }

  function hasUserActivated() {
    var activation = navigator.userActivation
    return activation ? activation.hasBeenActive : true
  }

  function clampVolume(volume) {
    var level = typeof volume === 'number' ? volume : 0.5
    return Math.max(0, Math.min(1, level))
  }

  function playTone(ctx, frequency, startAt, duration, peakGain) {
    var oscillator = ctx.createOscillator()
    var gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // Quick attack, exponential decay. Ramps can't target 0, so use an epsilon.
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + duration + 0.02)
  }

  function emit(ctx, level) {
    var peak = 0.2 * level // stay gentle even at max volume
    var now = ctx.currentTime
    playTone(ctx, 880, now, 0.18, peak) // A5
    playTone(ctx, 1318.5, now + 0.16, 0.28, peak) // E6
  }

  // volume: 0..1
  function play(volume) {
    var level = clampVolume(volume)
    if (level === 0) {
      return
    }

    // No gesture yet: queue rather than poke the AudioContext, which would
    // surface the "AudioContext was not allowed to start" warning.
    if (!hasUserActivated()) {
      pending = { volume: level, at: Date.now() }
      return
    }

    var ctx = getContext()
    if (!ctx) {
      return
    }

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(function () {
          emit(ctx, level)
        })
        .catch(function () {})
    } else {
      emit(ctx, level)
    }
  }

  // First user gesture: unlock the context and flush any queued chime.
  function prime() {
    var queued = pending
    pending = null
    if (queued && Date.now() - queued.at < PENDING_TTL_MS) {
      play(queued.volume)
    } else {
      var ctx = getContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {})
      }
    }
  }

  ;['pointerdown', 'keydown', 'touchstart'].forEach(function (type) {
    window.addEventListener(type, prime, { once: true, capture: true })
  })

  globalThis.FiverrChime = { play: play }
})()
