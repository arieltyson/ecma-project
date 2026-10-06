---
title: History and Client-Side Routing
summary: How the History API changes the URL without a navigation, how back and forward reach your code, and what a router must handle.
minutes: 30
objectives:
  - Use pushState, replaceState and the popstate event.
  - Explain which actions fire popstate and which do not.
  - Restore scroll position and manage focus after client-side navigation.
  - Know how the back/forward cache and the Navigation API change the picture.
quiz:
  - question: Does `history.pushState` fire a `popstate` event?
    options:
      - Yes, always.
      - No. popstate fires when the user (or code) traverses history, such as pressing back.
      - Only if the URL changes.
    answer: 1
    explanation: Your own pushState call already knows the URL changed, so no event fires. Back, forward and history.go() fire popstate.
  - question: When should you use replaceState instead of pushState?
    options:
      - When the change should not create a new back-button stop, such as updating a search filter as the user types.
      - When navigating to a different page.
      - Never; replaceState is deprecated.
    answer: 0
    explanation: Each pushState adds an entry. Replacing keeps the URL accurate without filling the history with intermediate states.
  - question: After a client-side navigation, where should keyboard focus go for screen reader users?
    options:
      - Stay on the clicked link.
      - To the new page's main heading or main region, so the change is announced.
      - To the browser's address bar.
    answer: 1
    explanation: A real navigation resets focus and announces the new page. A client-side router must do this itself.
  - question: A page is restored from the back/forward cache. Which event tells you?
    options:
      - "`load`"
      - "`pageshow` with `event.persisted === true`"
      - "`popstate`"
    answer: 1
    explanation: bfcache restores the whole page from memory, JavaScript state included, without running load again. Use pageshow to refresh stale data.
resources:
  - title: MDN, History API
    url: https://developer.mozilla.org/en-US/docs/Web/API/History_API
  - title: MDN, Navigation API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
  - title: web.dev, back/forward cache
    url: https://web.dev/articles/bfcache
---

Each tab keeps a **session history**: a list of entries, each with a URL and an optional state object. Back and forward move through it. The History API lets JavaScript add and replace entries without loading a new document, which is the foundation of every client-side router.

## Reading and changing history

```ts
history.pushState({ scrollY: 0 }, "", "/channels/lumen"); // add an entry
history.replaceState({ scrollY: 420 }, "", location.href); // change the current one
history.back();                                            // traverse, like the back button
```

- `pushState(state, unused, url)` adds an entry after the current one and changes the URL. The second argument is ignored by browsers; pass `""`.
- `replaceState` changes the current entry in place.
- The URL must be same-origin. Nothing is requested from the server.
- `state` is stored with the entry using structured clone, so it can hold plain objects but not functions or DOM nodes. Keep it small.

Neither call renders anything. Your code must update the page to match the new URL.

## popstate

When the user goes back or forward between entries created in the same document, the browser fires `popstate` with the entry's state:

```ts
function render(pathname: string) {
  document.title = pathname;
}

window.addEventListener("popstate", (event: PopStateEvent) => {
  render(location.pathname);
  const state: unknown = event.state;
  console.log("restored state", state);
});
```

`pushState` and `replaceState` do **not** fire `popstate`. Clicking a link to a `#fragment` does fire it (and `hashchange`), because that creates an entry without leaving the document.

## Intercepting links

A router listens for clicks on same-origin links, prevents the browser's navigation, and pushes a history entry instead. It must leave alone any click the user intends to behave natively:

```ts
function shouldIntercept(event: MouseEvent, link: HTMLAnchorElement): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
    !link.target &&
    !link.hasAttribute("download") &&
    link.origin === location.origin
  );
}
```

Breaking any of these (for example intercepting <kbd>⌘</kbd>-click, which should open a new tab) is one of the most common router bugs.

## Scroll and focus

A real navigation starts the new page at the top and moves focus to the document. Going back restores the previous scroll position. A client-side router has to do this itself:

- Set `history.scrollRestoration = "manual"` if you manage scroll yourself.
- Before pushing, save `scrollY` into the current entry with `replaceState`.
- On `popstate`, render, then scroll to the saved position.
- On a new navigation, scroll to the top (or to the `#hash` target).
- After rendering, move focus to the new page's `<h1>` (with `tabindex="-1"`) so screen readers announce it.

This site's router does all of these in under 200 lines: read `src/router/router.tsx` in the repository.

## The back/forward cache

Browsers can keep a whole page in memory when you navigate away, and restore it instantly on back, JavaScript heap included. This **bfcache** skips `load` entirely, so data can be stale:

```ts
window.addEventListener("pageshow", (event: PageTransitionEvent) => {
  if (event.persisted) {
    // Restored from bfcache: refresh live data such as viewer counts.
  }
});
```

Pages with `unload` listeners are often excluded from the bfcache. Use `pagehide` or `visibilitychange` instead.

## The Navigation API

The newer **Navigation API** (`window.navigation`) replaces most of this boilerplate: a single `navigate` event fires for link clicks, form submissions and back/forward, and `event.intercept({ handler })` turns it into a same-document navigation with built-in scroll and focus handling. Check current browser support before relying on it, and keep a History API fallback.

## Assignment

1. Read MDN's [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) guide.
2. In the console on any page, run `history.pushState({}, "", "/test")`, observe the URL, press back, and note what did and did not happen.
3. Read this site's `src/router/router.tsx` and list each browser behaviour it reproduces by hand.
