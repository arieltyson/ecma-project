---
title: "Project: A Router From Scratch"
summary: Build a client-side router on the History API in plain TypeScript, handling links, back and forward, scroll and focus.
kind: project
minutes: 300
objectives:
  - A router that intercepts in-app links and leaves native behaviour alone.
  - Back and forward support with per-entry scroll restoration.
  - Accessible navigation with focus management and announcements.
  - Cancellation of stale data loads when the user navigates quickly.
resources:
  - title: MDN, History API
    url: https://developer.mozilla.org/en-US/docs/Web/API/History_API
  - title: MDN, AbortController
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  - title: Vite, getting started
    url: https://vite.dev/guide/
---

Before using a router library, build one. You will meet every problem those libraries solve, and you will be able to reason about their behaviour (and their bugs) from first principles.

## Brief

Build a small Lumen site with Vite and plain TypeScript (no framework) with four views:

- `/` home
- `/directory` a list of live channels
- `/channels/:login` a channel page
- anything else, a not found view

Channel data comes from a local `channels.json` loaded with `fetch`, with an artificial random delay of 200 to 1500ms so you can test slow and overlapping loads.

## Requirements

1. **Matching**: a pure function from pathname to a route result, tested with Vitest. You may reuse your solution to [Project: Type-Safe Route Builder](/lessons/typescript/project-route-builder/).
2. **Link interception**: one delegated `click` listener on `document` intercepts same-origin `<a>` clicks and calls `navigate`. It does not intercept modified clicks, middle clicks, `target="_blank"`, `download` links or other origins.
3. **navigate(url)** pushes a history entry and renders the matching view. Navigating to the current URL does nothing.
4. **Back and forward** render the right view via `popstate`.
5. **Scroll**: new navigations start at the top, or at the `#hash` target. Back and forward restore each entry's scroll position. Use `history.scrollRestoration = "manual"` and store positions in history state.
6. **Focus and announcement**: after each navigation, focus moves to the new view's `<h1>` and the document title updates.
7. **Data loading**: the channel view fetches its data with an `AbortSignal`. Navigating away before it loads aborts the request, and a stale response must never render over a newer view.
8. **Deep links**: configure the Vite dev server and your production build so that loading `/channels/lumen` directly works. Explain why it would 404 on a plain static server.

## Break it on purpose

1. Remove the abort and the staleness check. Click quickly between two channels with different delays until the slower, older channel's data appears on the newer channel's page. Write down the exact sequence of events, then fix it.
2. Intercept every click without checking modifier keys. Try to open a channel in a new tab with <kbd>⌘</kbd>-click. Fix it.
3. Remove the focus management and navigate with VoiceOver (<kbd>⌘F5</kbd> on macOS) or another screen reader running. Note what is and is not announced.

## Stretch

- Add a loading indicator that only appears if a navigation takes more than 300ms.
- Prefetch a channel's data when its link is hovered or focused.
- Rewrite the interception with the Navigation API where supported, keeping your History API version as a fallback.

## Explain it

- Which browser behaviours did you have to reimplement, and which did you get for free?
- Why does `pushState` not fire `popstate`, and how did that shape your code?
- How did you prevent stale responses? Compare an `AbortController` with a "latest request ID" check. When do you need both?
- What does a document request for a deep link look like in the Network panel, compared to an in-app navigation?
