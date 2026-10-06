---
title: State as a Snapshot
summary: How useState works, why state behaves like a snapshot, how updates are batched, and how to update objects and arrays.
minutes: 30
objectives:
  - Add state with useState, including lazy initialisation.
  - Explain why a state variable does not change until the next render.
  - Use updater functions when the next state depends on the previous one.
  - Update objects and arrays immutably.
quiz:
  - question: "`setCount(count + 1)` is called three times in one click handler, with count at 0. What is count after the re-render?"
    options:
      - "3"
      - "1"
      - "0"
    answer: 1
    explanation: Each call reads the same snapshot, count = 0, so each sets 1. Use `setCount((c) => c + 1)` three times to get 3.
  - question: Why must you not mutate a state object directly, as in `channel.followers++; setChannel(channel)`?
    options:
      - It throws an error.
      - React compares by reference; the same object means no change is detected, and earlier renders' snapshots are corrupted.
      - Objects cannot be stored in state.
    answer: 1
    explanation: "Create a new object, `setChannel({ ...channel, followers: channel.followers + 1 })`, so React sees a new reference."
  - question: "What does `useState(() => loadDraft())` do differently from `useState(loadDraft())`?"
    options:
      - Nothing.
      - It calls loadDraft only on the first render instead of on every render.
      - It makes the state read-only.
    answer: 1
    explanation: The argument is only used on the first render, but `useState(loadDraft())` still calls the function every time. Passing the function lets React call it once.
resources:
  - title: React, State, a Component's Memory
    url: https://react.dev/learn/state-a-components-memory
  - title: React, State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
  - title: React, Queueing a Series of State Updates
    url: https://react.dev/learn/queueing-a-series-of-state-updates
  - title: React, Updating Objects in State
    url: https://react.dev/learn/updating-objects-in-state
---

State is a component's memory: values that persist between renders and that, when changed, trigger a new render. Most React bugs that beginners hit come from expecting state to behave like an ordinary variable.

## useState

```tsx
import { useState } from "react";

export function FollowButton({ initiallyFollowing }: { readonly initiallyFollowing: boolean }) {
  const [following, setFollowing] = useState(initiallyFollowing);
  return (
    <button aria-pressed={following} onClick={() => setFollowing(!following)}>
      {following ? "Following" : "Follow"}
    </button>
  );
}
```

`useState(initial)` returns the current value and a setter. The initial value is only used on the first render. TypeScript infers the state type from it; pass a type argument when the initial value does not show the full type, such as `useState<Channel | null>(null)`.

If computing the initial value is expensive, pass a function, which React only calls once:

```tsx
import { useState } from "react";

function readDraft(): string {
  return localStorage.getItem("draft") ?? "";
}

export function Composer() {
  const [draft, setDraft] = useState(readDraft); // not readDraft()
  return <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />;
}
```

> [!TIP]
> In SwiftUI terms, `useState` is `@State`. Like `@State`, it belongs to the view instance (here, the component's position in the tree), not to the function.

## A snapshot

Calling a setter does not change the variable you already have. It asks React for a new render, and **that** render gets the new value:

```tsx
import { useState } from "react";

export function Snapshot() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // still 0: this render's snapshot
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

Every render has its own props, state and event handlers, fixed at the moment it ran. A handler created in one render always sees that render's values, even if it runs later (in a timeout, for example).

## Batching and updater functions

React batches all state updates in one event, then renders once. Since each setter call reads the same snapshot, three `setCount(count + 1)` calls produce 1, not 3. When the next state depends on the previous one, pass an **updater function**:

```tsx nocheck
setCount((c) => c + 1);
setCount((c) => c + 1);
setCount((c) => c + 1); // 3
```

React queues updaters and runs them in order during the next render, each receiving the result of the previous one.

## Objects and arrays

React decides whether state changed by comparing references (`Object.is`). Mutating an object in place keeps the same reference, so React may skip the render, and the old snapshot changes underneath previous renders. Always create new values:

```tsx
import { useState } from "react";

interface Channel {
  readonly login: string;
  readonly followers: number;
  readonly tags: readonly string[];
}

export function useChannel(initial: Channel) {
  const [channel, setChannel] = useState(initial);

  const follow = () =>
    setChannel((c) => ({ ...c, followers: c.followers + 1 }));

  const addTag = (tag: string) =>
    setChannel((c) => ({ ...c, tags: [...c.tags, tag] }));

  const removeTag = (tag: string) =>
    setChannel((c) => ({ ...c, tags: c.tags.filter((t) => t !== tag) }));

  return { channel, follow, addTag, removeTag };
}
```

| Instead of | Use |
| --- | --- |
| `arr.push(x)` | `[...arr, x]` |
| `arr.splice(i, 1)` | `arr.filter((_, j) => j !== i)` or `arr.toSpliced(i, 1)` |
| `arr[i] = x` | `arr.with(i, x)` or `arr.map(...)` |
| `arr.sort()` | `arr.toSorted()` |
| `obj.key = x` | `{ ...obj, key: x }` |

Marking state types `readonly` makes the compiler catch accidental mutation.

## Assignment

1. Read the React docs chapters [State: A Component's Memory](https://react.dev/learn/state-a-components-memory), [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) and [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates), and do their challenges.
2. Build a viewer poll with three options where each vote button increments its count, and a "vote three times" button that correctly adds three.
3. Add a list of chat messages in state with add, delete and edit operations, each implemented without mutation. Mark the types `readonly` and confirm that `push` is now a compile error.
