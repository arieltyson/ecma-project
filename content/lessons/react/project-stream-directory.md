---
title: "Project: Stream Directory"
summary: Build a browsable, filterable directory of live streams whose state lives in the URL.
kind: project
minutes: 420
objectives:
  - A directory page with search, category filters, sorting and infinite loading.
  - URL search params as the single source of truth for filters, so links and reloads keep them.
  - Responsive loading, empty and error states with Suspense and error boundaries.
  - A responsive, accessible grid built with modern CSS.
resources:
  - title: MDN, URLSearchParams
    url: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  - title: MDN, IntersectionObserver
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
---

The directory is where viewers find something to watch. It combines most of what this course covered: derived state, the URL as state, data loading with race conditions, Suspense, transitions and layout.

## Brief

Build `/directory` for Lumen. A fake API returns pages of live streams (title, channel, category, viewer count, tags, thumbnail URL and a started-at time) with a cursor, after a random delay, failing occasionally.

## Requirements

1. **Grid**: a responsive grid of stream cards built with CSS Grid (`auto-fill` and `minmax`), with thumbnails that reserve space (`aspect-ratio`) so nothing shifts as images load.
2. **Filters**: a search box, a category select and a sort order (viewers or recently started). All three live in the URL search params. Reloading or sharing the URL restores them. Typing in search uses `replaceState`; changing category or sort uses `pushState`, so back undoes it.
3. **Responsiveness**: typing in search never blocks. Use `useDeferredValue` or a transition for the results, and show the previous results dimmed while new ones load.
4. **Loading**: first load shows skeleton cards the same size as real cards. Changing filters keeps the current results until new ones arrive.
5. **Infinite loading**: more results load when a sentinel element near the end of the grid becomes visible (`IntersectionObserver`). A "Load more" button is also present for keyboard and screen reader users.
6. **Races**: switching filters while a page is loading never shows results for the old filters.
7. **States**: an empty state with a "clear filters" action, and an error state with retry, scoped to the results area with an error boundary or explicit error state.
8. **Types**: the API response is validated with a schema, and filters are parsed from the URL into a typed object with defaults for missing or invalid values.
9. **Accessibility**: the result count is announced politely after filtering, and each card is a single link with a meaningful accessible name.

## Break it on purpose

1. Keep filters in `useState` instead of the URL. Apply a filter, open a channel, press back, and describe what is lost.
2. Remove the race handling and reproduce stale results by switching categories quickly.
3. Remove the thumbnails' reserved space and measure CLS with the Performance panel.

## Stretch

- Prefetch the next page when the user is two rows from the end.
- Keep scroll position when returning from a channel page to the directory.
- Replace your hand-written fetching with TanStack Query or Apollo Client, and compare the code.

## Explain it

- Why is the URL the right home for filter state? What does not belong there?
- How did you decide between `pushState` and `replaceState` for each control?
- How do `useDeferredValue` and debouncing differ, and which did you choose?
- What would it take to render this page on the server for a faster first load?
