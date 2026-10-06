---
title: Refs and the DOM
summary: Keep values across renders without re-rendering, reach DOM nodes for focus, measurement and scrolling, and pass refs as props in React 19.
minutes: 25
objectives:
  - Use useRef for mutable values that do not affect rendering.
  - Access DOM nodes with refs to manage focus and scrolling.
  - Pass refs to your own components as an ordinary prop.
  - Use callback refs with cleanup functions.
quiz:
  - question: How does changing `ref.current` differ from calling a state setter?
    options:
      - It is slower.
      - It does not trigger a re-render.
      - It cannot hold objects.
    answer: 1
    explanation: Refs are an escape hatch for values React does not need to render, such as timer IDs or DOM nodes.
  - question: When is `inputRef.current` set to the DOM node?
    options:
      - During render.
      - During the commit, before layout effects and effects run.
      - Never; you must call a function.
    answer: 1
    explanation: The node does not exist until React creates it in the commit phase. Read refs in event handlers and effects, not while rendering.
  - question: How do you pass a ref to your own function component in React 19?
    options:
      - Wrap it in forwardRef.
      - Accept `ref` as a regular prop.
      - Refs cannot be passed to components.
    answer: 1
    explanation: Since React 19, `ref` is an ordinary prop for function components. forwardRef still works but is no longer needed.
resources:
  - title: React, Referencing Values with Refs
    url: https://react.dev/learn/referencing-values-with-refs
  - title: React, Manipulating the DOM with Refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
  - title: React 19, ref as a prop
    url: https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
---

A ref is a box that survives re-renders: `{ current: value }`. Changing it does not cause a render. Refs have two jobs: remembering values React does not need to display, and holding DOM nodes.

## Remembering values

```tsx
import { useRef, useState } from "react";

export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function start() {
    if (intervalRef.current !== null) return;
    const startedAt = Date.now() - elapsed;
    intervalRef.current = window.setInterval(() => setElapsed(Date.now() - startedAt), 100);
  }

  function stop() {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return (
    <>
      <output>{(elapsed / 1000).toFixed(1)}s</output>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

The interval ID is needed by handlers but never displayed, so it is a ref. The elapsed time is displayed, so it is state.

Do not read or write `ref.current` during rendering (except for lazy initialisation). Rendering must be pure, and React cannot track refs.

## DOM nodes

Pass a ref to a JSX element and React sets `ref.current` to the DOM node after commit:

```tsx
import { useRef } from "react";

export function ChatInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} aria-label="Send a message" />
      <button onClick={() => inputRef.current?.focus()}>Reply</button>
    </>
  );
}
```

Typical uses: focusing, scrolling (`scrollIntoView`), measuring (`getBoundingClientRect`), and integrating non-React libraries. Prefer declarative props where they exist, such as `autoFocus`, and use a ref when there is only an imperative API, such as `dialog.showModal()`.

## Refs as props

In React 19, a function component receives `ref` like any other prop:

```tsx
import { useRef, type ComponentProps, type Ref } from "react";

type TextFieldProps = ComponentProps<"input"> & {
  readonly label: string;
  readonly ref?: Ref<HTMLInputElement>;
};

function TextField({ label, ref, ...props }: TextFieldProps) {
  return (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  );
}

export function Search() {
  const ref = useRef<HTMLInputElement>(null);
  return <TextField label="Search" ref={ref} onFocus={() => ref.current?.select()} />;
}
```

`forwardRef` is no longer needed for new code.

## Callback refs

Instead of an object, `ref` can be a function. React calls it with the node after mounting. In React 19 it may return a **cleanup function**, called when the node is removed:

```tsx
export function AutoScroll({ messages }: { readonly messages: readonly string[] }) {
  return (
    <ul>
      {messages.map((message, i) => (
        <li
          key={i}
          ref={
            i === messages.length - 1
              ? (node) => {
                  node?.scrollIntoView({ block: "end" });
                }
              : undefined
          }
        >
          {message}
        </li>
      ))}
    </ul>
  );
}
```

Callback refs are useful for lists of nodes, for observers (`ResizeObserver`, `IntersectionObserver`) attached per element, and when you need to know the moment a node appears.

## useImperativeHandle

To expose a limited API instead of the whole DOM node, use `useImperativeHandle`:

```tsx
import { useImperativeHandle, useRef, type Ref } from "react";

export interface PlayerHandle {
  play(): void;
  pause(): void;
}

export function Player({ src, ref }: { readonly src: string; readonly ref?: Ref<PlayerHandle> }) {
  const video = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => ({
    play: () => void video.current?.play(),
    pause: () => video.current?.pause(),
  }));
  return <video ref={video} src={src} />;
}
```

Use this sparingly. Most components should be controlled by props, not commands.

## Assignment

1. Read [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) and [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs), and do their challenges.
2. Build a chat panel that scrolls to the newest message when one arrives, but only if the user was already at the bottom.
3. Build a `TextField` component that accepts `ref` as a prop, and a form that focuses the first invalid field on submit.
