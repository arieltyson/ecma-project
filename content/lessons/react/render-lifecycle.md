---
title: "Rendering: Trigger, Render, Commit"
summary: What happens when state changes, how React decides what to update, and when components mount, update and unmount.
minutes: 30
objectives:
  - Describe the trigger, render and commit phases.
  - Explain when a component re-renders and why re-rendering is not the same as updating the DOM.
  - Predict how position and keys decide whether state is kept or reset.
  - Map the class component lifecycle to function components and effects.
quiz:
  - question: A parent's state changes. Which components re-render by default?
    options:
      - Only the parent.
      - The parent and every component it renders, recursively.
      - Only components whose props changed.
    answer: 1
    explanation: Rendering a component renders its children too. React then only touches the DOM where the output differs. Memoisation (or the React Compiler) skips unchanged subtrees.
  - question: What does it mean that React "commits"?
    options:
      - It saves state to local storage.
      - It applies the minimal set of changes to the DOM, then runs layout effects and schedules effects.
      - It sends a request to the server.
    answer: 1
    explanation: The render phase calculates what the UI should be. The commit phase changes the DOM to match.
  - question: Switching a component's key from "a" to "b" while it stays in the same place does what?
    options:
      - Nothing visible.
      - Unmounts the old instance and mounts a new one with fresh state.
      - Re-renders it with the same state.
    answer: 1
    explanation: React keeps state for the same component type at the same position with the same key. A new key means a new instance. It is the standard way to reset a component.
resources:
  - title: React, Render and Commit
    url: https://react.dev/learn/render-and-commit
  - title: React, Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
  - title: React, Lifecycle of Reactive Effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
---

Every update in React goes through the same three steps. Knowing them answers most "why did this re-render?" and "why did my state reset?" questions.

## Trigger

A render is triggered by:

1. The **initial render**, when `createRoot(container).render(<App />)` (or `hydrateRoot`) runs.
2. A **state update** with a `set` function from `useState` or a `dispatch` from `useReducer`, anywhere in the tree.
3. A change to a **context** value or an **external store** a component subscribes to.

Props changing is not a trigger on its own: props change because a parent re-rendered.

## Render

React calls your components to find out what the UI should look like. For an update, it calls the component whose state changed **and every component inside it**, recursively. This is cheap compared to touching the DOM: rendering produces plain objects that React compares with the previous result.

A re-render does not mean the DOM changes. If a component returns the same output, React leaves its DOM alone.

## Commit

React then applies the differences to the DOM: inserting, updating and removing nodes. After that:

1. Refs are attached.
2. `useLayoutEffect` callbacks run, synchronously, before the browser paints.
3. The browser paints.
4. `useEffect` callbacks run, after paint.

```text
setState → render (call components) → commit (update DOM) → layout effects → paint → effects
```

## Mount, update, unmount

Function components do not have lifecycle methods. A component instance:

- **mounts** the first time it appears at a position in the tree,
- **updates** each time it re-renders at that position,
- **unmounts** when it is no longer rendered there.

Effects describe how to synchronise with something outside React for as long as the component is mounted:

```tsx
import { useEffect } from "react";

function ViewerCount({ channelId }: { readonly channelId: string }) {
  useEffect(() => {
    const socket = new WebSocket(`wss://lumen.tv/viewers/${channelId}`);
    return () => socket.close(); // runs before the next effect and on unmount
  }, [channelId]);
  return null;
}
```

| Class lifecycle | Function component |
| --- | --- |
| `componentDidMount` | effect with `[]` dependencies |
| `componentDidUpdate` | effect with dependencies |
| `componentWillUnmount` | effect cleanup function |
| `shouldComponentUpdate` | `memo` (or the React Compiler) |

Think in terms of synchronising, not lifecycle events: "while mounted with this `channelId`, stay connected to its socket."

## Identity: position and keys

React keeps a component's state as long as the **same component type** renders at the **same position** in the tree (with the same key). Change any of these and the state is destroyed:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

function Chat({ channelId }: { readonly channelId: string }) {
  // A new channel gets a fresh draft: the key resets the input's state.
  return <DraftInput key={channelId} />;
}

function DraftInput() {
  const [draft, setDraft] = useState("");
  return <input value={draft} onChange={(e) => setDraft(e.target.value)} />;
}

export { Counter, Chat };
```

Two consequences:

- **Never define a component inside another component.** The inner one is a new function on every render, so React sees a new type and resets its state each time.
- **Use `key` to reset state on purpose**, for example a form per selected item.

## Strict Mode in development

`<StrictMode>` renders components twice and runs effects as mount, cleanup, mount once on first mount. Production does neither. If double rendering changes behaviour, the component is impure; if double effects cause a bug, the effect's cleanup is missing or wrong.

## Assignment

1. Read [Render and Commit](https://react.dev/learn/render-and-commit) and [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).
2. Add a `console.log("render", name)` to three nested components, change state at each level, and record which ones log. Then open the React DevTools Profiler and confirm.
3. Build a channel switcher where the chat draft input resets when the channel changes, using `key`. Then break it by moving `DraftInput`'s definition inside `Chat` and explain what you see.
