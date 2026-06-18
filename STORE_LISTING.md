# Chrome Web Store listing

Source of truth for the store listing copy. Update alongside feature releases.

## Short description (manifest `description`, max 132 chars)

Turns the Fiverr tab icon red and plays an optional chime when a new message or notification arrives.

## Detailed description (store listing)

```
Never miss a Fiverr message again.

This extension turns the Fiverr tab icon red the moment a new message or
notification arrives. Keep working in your other tabs and you'll still catch it
out of the corner of your eye — no need to check Fiverr over and over.

What's new:
- Sound alert (optional). Get a short chime when a new message or notification
  comes in. Turn it on or off and set the volume from the toolbar — just click
  the extension icon.
- Works with the latest Fiverr. Notification detection was rebuilt for Fiverr's
  redesigned header, so the red icon is reliable again.
- Lighter and up to date. Rebuilt on Manifest V3 with no third-party libraries.

How to use it:
1. Install it and open Fiverr (stay logged in).
2. Click the extension icon in your toolbar to toggle the sound and set volume.
3. Keep Fiverr open in a tab and get back to work — the icon turns red, and
   chimes if you've enabled sound, whenever something new lands.

Note: browsers only allow sound after you've interacted with the page, so the
first chime after a page reload plays on your next click on Fiverr.

Privacy: the extension only reads the Fiverr page to spot new notifications. It
doesn't collect or transmit your messages or any personal data. Your sound
on/off and volume settings are saved through Chrome's own storage.

Questions or issues? Email onepoordeveloper@gmail.com.

YouTube: https://www.youtube.com/watch?v=ZWcGFBoebO4
GitHub: https://github.com/onepoordeveloper/fiverr-notification-alert-in-title
```

## Dashboard notes

- **Permission justification** — `storage`: saves the user's sound on/off and
  volume preference.
- **Data collection**: none. The extension reads the Fiverr page only to detect
  new notifications; it does not collect or transmit messages or personal data.
- **Single purpose**: alert the user to new Fiverr messages/notifications via the
  tab icon and an optional sound.
