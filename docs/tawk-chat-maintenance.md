# Tawk Chat Maintenance

This site uses a Tawk widget loaded from `js/config.js`.

Before changing security headers, script loading, or widget behavior, review this file.

## Current widget identifiers

- `propertyId`: `5e9d854435bcbb0c9ab2de75`
- `widgetId`: `1ji2d8ea8`
- Embed script: `https://embed.tawk.to/5e9d854435bcbb0c9ab2de75/1ji2d8ea8`
- Hosted chat fallback: `https://tawk.to/chat/5e9d854435bcbb0c9ab2de75/1ji2d8ea8`

If Tawk regenerates or changes the widget ID in the dashboard, update both URLs above in `js/config.js`.

## Files involved

- `js/config.js`: loads the widget, retries visibility recovery, and renders the fallback button.
- Top-level HTML files (`index.html`, `about.html`, etc.): each page contains a CSP meta tag that must allow Tawk domains.

## Required CSP allowlist

If CSP is tightened again, keep these entries.

### `script-src`

- `https://embed.tawk.to`
- `https://*.tawk.to`

### `connect-src`

- `https://embed.tawk.to`
- `https://va.tawk.to`
- `https://*.tawk.to`
- `wss://*.tawk.to`

### `frame-src`

- `https://*.tawk.to`

If any of these are removed, the common failure mode is:

- chat notifications still appear in the page title
- but the launcher or chat window is missing or non-functional

## Current runtime behavior

The integration intentionally does more than the default Tawk snippet.

### Embedded widget flow

- `window.Tawk_API.showWidget()` is called when available.
- The code retries widget visibility after load because Tawk DOM nodes can appear after `onLoad`.
- The widget position is gently adjusted so it feels less intrusive.

### Fallback flow

If the launcher does not render visibly, a `Chat with us` button is shown.

Click order is:

1. `window.Tawk_API.popup()`
2. `window.Tawk_API.maximize()`
3. `window.Tawk_API.toggle()`
4. same-tab navigation to the hosted chat URL

The last step is intentional. `window.open(...)` was avoided because some browsers/privacy tools allow a popup shell but block the actual chat behavior.

## Do not change casually

Avoid removing these behaviors unless you test the full site afterward:

- delayed `ensureChatWidgetVisible()` retries
- fallback button logic
- same-tab hosted chat fallback
- explicit placement styling applied to rendered Tawk nodes

These were added because the widget continued receiving events while remaining invisible after security/UI changes.

## Safe update checklist

After any update affecting CSP, service worker, header policy, third-party scripts, or chat styling, verify all of the following:

1. The Tawk launcher is visible on desktop.
2. The Tawk launcher is visible on mobile.
3. Clicking the launcher opens chat.
4. If the launcher is hidden, the `Chat with us` fallback button appears.
5. Clicking the fallback button opens chat successfully.
6. Browser console shows no CSP errors for `tawk.to`.
7. The page title notification still works when a test message arrives.

Run this automated check before deploys that touch security or layout:

```bash
node scripts/check-tawk-csp.mjs
```

## Common break points

### Security hardening

- removing Tawk domains from CSP
- adding stricter frame or websocket restrictions

### UI cleanup

- global iframe/style rules affecting fixed-position elements
- z-index changes that bury the widget under site overlays
- forcing `overflow: hidden` on root containers in ways that affect chat overlays

### Widget replacement

- changing property ID or widget ID only in one URL
- replacing Tawk embed snippet without preserving fallback behavior

## Where to edit

If you need to change behavior, edit the Tawk block in `js/config.js` instead of scattering chat logic across page files.

Keep the integration centralized.