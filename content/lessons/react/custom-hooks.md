---
title: Custom Hooks
summary: Extract reusable stateful logic into hooks, follow the Rules of Hooks, and design hook APIs that compose.
minutes: 25
objectives:
  - Extract logic shared by components into a custom hook.
  - State the Rules of Hooks and why they exist.
  - Design hook inputs and outputs, including typed tuples and objects.
  - Know when a function should not be a hook.
quiz:
  - question: Two components call the same custom hook. Do they share state?
    options:
      - Yes, hooks are global.
      - No. Each call has its own state; hooks share logic, not state.
      - Only if they are siblings.
    answer: 1
    explanation: A custom hook is a function that calls other hooks. Each component that calls it gets its own independent state.
  - question: Why can hooks not be called inside conditions or loops?
    options:
      - It is slower.
      - React identifies each hook by its call order, which must be the same on every render.
      - Conditions are not allowed in components.
    answer: 1
    explanation: React stores hook state in a list per component and matches calls by position. The `use` API is the one exception that may be called conditionally.
  - question: A function `formatViewers(n)` uses no hooks. Should it be named `useFormatViewers`?
    options:
      - Yes, all component helpers should start with use.
      - No. The use prefix signals that a function calls hooks and must follow their rules.
      - Only if it returns a string.
    answer: 1
    explanation: Naming a plain function as a hook restricts where it can be called for no reason.
resources:
  - title: React, Reusing Logic with Custom Hooks
    url: https://react.dev/learn/reusing-logic-with-custom-hooks
  - title: React, Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
---

A custom hook is a function whose name starts with `use` and that calls other hooks. It lets components share **stateful logic** (subscriptions, timers, form handling) the way ordinary functions share calculations.

## Extracting a hook

Two components both need to know whether the browser is online:

```tsx
import { useEffect, useState } from "react";

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function ChatStatus() {
  const online = useOnline();
  return <p role="status">{online ? "Connected" : "Offline: messages will send when you reconnect"}</p>;
}
```

Each component that calls `useOnline` gets its own state. Hooks share logic, not state. (For browser state like this, `useSyncExternalStore` is even better; see the next lesson.)

## The Rules of Hooks

1. **Only call hooks at the top level** of a component or custom hook: not in conditions, loops, nested functions or after an early `return`.
2. **Only call hooks from React functions**: components and custom hooks.

React matches each hook call to its stored state by **call order**, so the order must be identical on every render. The lint rule `react-hooks/rules-of-hooks` enforces this. The `use` API is the exception: it can be called conditionally.

## Designing hooks

- **Name it after what it provides**, not how: `useOnline`, `useChannel(login)`, `useDebouncedValue(value, ms)`.
- **Return a tuple** for one value plus one setter, mirroring `useState`: `const [volume, setVolume] = usePersistentState("volume", 0.5)`. Use `as const` so TypeScript infers a tuple, not an array.
- **Return an object** for more than two things: `const { data, error, status } = useStream(id)`.
- **Accept plain values**, and let the hook react to their changes through effect dependencies.

```tsx
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable; keep the in-memory value.
    }
  }, [key, value]);
  return [value, setValue] as const;
}
```

`usePersistentState` uses an `as T` assertion on stored JSON for brevity. In production code, accept a parse function or schema, as in [Validating Data at the Boundary](/lessons/typescript/runtime-validation/).

## When not to write a hook

- If the function calls no hooks, it is a plain function. Do not prefix it with `use`.
- Avoid "lifecycle" hooks like `useMount(fn)`. They hide dependencies from the linter and encourage effects that should not exist.
- Do not wrap every `useState` in a hook. Extract when logic is reused or when it makes a component easier to read.

## Assignment

1. Read [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) and do its challenges.
2. Write `useDebouncedValue` and use it for a channel search box that only filters after the user stops typing for 250ms.
3. Write `useInterval(callback, delayMs | null)` where passing `null` pauses it, using `useEffectEvent` so a changing callback does not reset the timer.
