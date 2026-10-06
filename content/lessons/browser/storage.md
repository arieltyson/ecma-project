---
title: Web Storage and IndexedDB
summary: Where a web client can keep data, how long each place lasts, and how to use it safely.
minutes: 25
objectives:
  - Compare cookies, localStorage, sessionStorage, IndexedDB and the Cache API.
  - Use localStorage defensively, including when it throws.
  - Synchronise state across tabs with the storage event.
  - Know what never belongs in client storage.
quiz:
  - question: How long does sessionStorage last?
    options:
      - Until the browser closes.
      - For the lifetime of the tab, including reloads, separately for each tab.
      - Forever.
    answer: 1
    explanation: sessionStorage is scoped to one tab and origin. It survives reloads but a new tab gets its own empty storage.
  - question: When does the `storage` event fire?
    options:
      - In the same tab that called setItem.
      - In other tabs and windows of the same origin when localStorage changes.
      - When storage is full.
    answer: 1
    explanation: The event exists to let other documents react, for example to sign out every tab or keep a theme in sync.
  - question: Why is localStorage a poor place for a session token?
    options:
      - It is too small.
      - Any script running on the page, including injected script, can read it.
      - It is cleared on reload.
    answer: 1
    explanation: An XSS bug exposes everything in localStorage. An HttpOnly cookie keeps the token out of reach of scripts.
resources:
  - title: MDN, Web Storage API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
  - title: MDN, IndexedDB
    url: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
  - title: web.dev, storage for the web
    url: https://web.dev/articles/storage-for-the-web
---

Browsers offer several places to keep data on the user's device. They differ in size, lifetime, speed and who can read them.

## The options

| Store | Size | Lifetime | API | Sent to server | Good for |
| --- | --- | --- | --- | --- | --- |
| Cookies | ~4 KB each | set by `Max-Age` | header or `document.cookie` | yes, every matching request | sessions |
| `localStorage` | ~5 MB per origin | until cleared | synchronous strings | no | preferences, small drafts |
| `sessionStorage` | ~5 MB per origin | the tab's lifetime | synchronous strings | no | per-tab UI state |
| IndexedDB | large (a share of disk) | until cleared or evicted | asynchronous, structured data | no | offline data, caches of API results |
| Cache API | large | until cleared or evicted | asynchronous request/response pairs | no | offline assets with a service worker |

All are scoped to an **origin** (scheme, host and port). Inside a third-party iframe, storage is additionally partitioned by the top-level site in modern browsers.

## localStorage, defensively

`localStorage` is simple but has sharp edges:

- It stores **strings only**. Serialise with JSON and validate on the way back in, because the data may be from an older version of your app or edited by hand.
- It is **synchronous**, so large reads and writes block the main thread.
- It can **throw**: when storage is full, when the user has blocked site data, and in some private browsing modes.

```ts
function load<T>(key: string, parse: (value: unknown) => T | undefined, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (parse(JSON.parse(raw)) ?? fallback);
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is a convenience; carry on without it.
  }
}

const volume = load("volume", (v) => (typeof v === "number" ? v : undefined), 0.5);
save("volume", volume);
```

This site stores your progress exactly this way: see `src/state/storage.ts` in the repository.

## Syncing tabs

Changing `localStorage` fires a `storage` event in **other** same-origin tabs:

```ts
window.addEventListener("storage", (event) => {
  if (event.key === "theme" && event.newValue) {
    document.documentElement.dataset["theme"] = event.newValue;
  }
});
```

For richer messages between tabs, `BroadcastChannel` sends structured data without touching storage.

## IndexedDB

IndexedDB is an asynchronous database of object stores with indexes and transactions. It stores structured clones (objects, arrays, dates, blobs), not just strings. Its raw API is event-based and verbose; most apps use a small promise wrapper such as `idb`. Use it for things like an offline cache of recent chat messages or VOD progress.

## What not to store

- **Secrets and session tokens**: any script on the page can read Web Storage. Prefer `HttpOnly` cookies.
- **Personal data you do not need**: storage persists on shared computers.
- **Anything you cannot lose**: browsers evict storage under pressure unless the site calls `navigator.storage.persist()` and the browser grants it, and users clear site data.

## Assignment

1. Read web.dev's [Storage for the web](https://web.dev/articles/storage-for-the-web).
2. Open this site in two tabs, mark a lesson complete in one, and watch the other update. Find the code that listens for the `storage` event in `src/state/progress.ts`.
3. Write a `usePersistentState` design (in prose, or code if you have done the React course) that loads from `localStorage`, validates with a schema, and stays in sync across tabs.
