---
title: External Stores and useSyncExternalStore
summary: Subscribe to state that lives outside React, such as browser APIs, WebSocket feeds and global stores, without tearing.
minutes: 30
objectives:
  - Subscribe to browser state with useSyncExternalStore.
  - Write a minimal external store with subscribe and getSnapshot.
  - Return stable snapshots and select slices to avoid needless renders.
  - Provide a server snapshot for prerendering and hydration.
quiz:
  - question: What must getSnapshot return when nothing has changed?
    options:
      - A new object each time.
      - The same value (by Object.is) as last time.
      - undefined.
    answer: 1
    explanation: React calls getSnapshot on every render and compares results. A new object every time causes an infinite render loop.
  - question: What problem does useSyncExternalStore solve that useEffect plus useState does not?
    options:
      - Tearing, where different components show different versions of the same store during a concurrent render.
      - Fetching data from a server.
      - Code splitting.
    answer: 0
    explanation: React reads external stores synchronously and consistently for the whole render, even with transitions.
  - question: What is getServerSnapshot for?
    options:
      - Fetching data on the server.
      - Providing the value used when prerendering and during hydration, so the client's first render matches the HTML.
      - Saving the store to disk.
    answer: 1
    explanation: Browser-only values like localStorage do not exist on the server. The server snapshot gives both sides the same starting value; the client then updates.
resources:
  - title: React, useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
---

Some state does not belong to any component: whether the browser is online, the current media query, a chat feed arriving over a WebSocket, a global store. `useSyncExternalStore` is React's hook for reading such state safely.

## The API

```ts nocheck
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
```

- `subscribe(onChange)` starts listening, calls `onChange` whenever the store changes, and returns an unsubscribe function.
- `getSnapshot()` returns the current value. It must return the **same** value when nothing changed.
- `getServerSnapshot()` returns the value to use when prerendering and hydrating.

## Browser state

```tsx
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
```

Define `subscribe` outside the component so it is stable; a new function each render makes React resubscribe every time.

## A store of your own

A store is any object with those two functions. This one holds chat messages pushed from a socket:

```ts
type Listener = () => void;

export interface Message {
  readonly id: string;
  readonly text: string;
}

export function createMessageStore(limit = 200) {
  let messages: readonly Message[] = [];
  const listeners = new Set<Listener>();

  return {
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): readonly Message[] {
      return messages;
    },
    push(message: Message): void {
      messages = [...messages, message].slice(-limit); // new array: a new snapshot
      for (const listener of listeners) listener();
    },
  };
}
```

```tsx nocheck
const store = createMessageStore();
socket.addEventListener("message", (e) => store.push(JSON.parse(e.data)));

function ChatLog() {
  const messages = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return <ul>{messages.map((m) => <li key={m.id}>{m.text}</li>)}</ul>;
}
```

The snapshot is replaced, never mutated, so comparing references tells React whether anything changed.

## Selecting a slice

A component that needs one number from a big store should not re-render on every change. Select a primitive (or a stable reference):

```tsx nocheck
const count = useSyncExternalStore(store.subscribe, () => store.getSnapshot().length);
```

Selecting a newly created object (`() => ({ count: ... })`) would return a new reference every time, which loops. Libraries such as Zustand wrap exactly this hook with selector support and equality functions.

## Why not useEffect plus useState?

That pattern works most of the time, but during a concurrent render (a transition), React may pause halfway through the tree. If the store changes in the meantime, components rendered before and after the change show different values: **tearing**. `useSyncExternalStore` guarantees one consistent value for the whole render.

## Server snapshots

When a page is prerendered, browser-only values do not exist. Return a sensible default from `getServerSnapshot`. React uses it on the server and for the client's hydration render, then switches to `getSnapshot` and re-renders if they differ. This site's lesson progress works that way: the HTML shows nothing completed, and your progress appears after hydration. See `src/state/progress.ts`.

## Assignment

1. Read the [useSyncExternalStore reference](https://react.dev/reference/react/useSyncExternalStore).
2. Write `useMediaQuery(query: string): boolean` with `matchMedia`, and use it to switch between a sidebar and a drawer layout.
3. Build `createMessageStore` above, feed it from a `setInterval` that pushes a fake message every 50ms, and render it in two components: the log and a message counter that only re-renders when the count changes. Verify with the React Profiler.
