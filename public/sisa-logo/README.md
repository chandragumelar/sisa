# sisa logo — option B

Drop these into your /public folder (or wherever Vite serves static).

Files:

- icon.svg, icon-maskable.svg — vector masters
- icon-512.png, icon-192.png — standard PWA icons ("any" purpose)
- icon-512-maskable.png, icon-192-maskable.png — for Android (with 12% safe-zone padding so OS masking doesn't crop)
- apple-touch-icon.png — 180×180 for iOS "Add to Home Screen"
- favicon-32.png, favicon-16.png — browser tab favicons

To wire up:

1. Copy all PNG + SVG files into public/.
2. Merge `manifest-icons-snippet.json`'s `icons` array into your existing `manifest.json`.
3. Add the lines in `head-snippet.html` to your root `index.html`'s `<head>`.
