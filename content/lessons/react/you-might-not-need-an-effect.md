---
title: You Might Not Need an Effect
summary: Recognise the effects that should be derived values, event handlers, keys or external stores instead.
minutes: 25
objectives:
  - Replace effects that derive data with calculations during render.
  - Move logic caused by user actions into event handlers.
  - Reset state with keys instead of effects.
  - Recognise effect chains and remove them.
quiz:
  - question: A component sets `fullName` state in an effect whenever `firstName` or `lastName` change. What should it do instead?
    options:
      - Use useLayoutEffect.
      - Calculate `fullName` during render.
      - Store fullName in a ref.
    answer: 1
    explanation: Derived values need no state and no effect. The effect version renders once with a stale value, then again.
  - question: A purchase should send an analytics event when the user clicks Buy. Where does that code go?
    options:
      - In an effect that watches the cart.
      - In the click handler.
      - In the render body.
    answer: 1
    explanation: It happens because of a specific user action, not because the component is displayed, so it belongs in the event handler.
  - question: How do you reset all of a profile page's state when the user ID changes?
    options:
      - An effect that calls every setter when userId changes.
      - Render the page with `key={userId}`.
      - Reload the page.
    answer: 1
    explanation: A new key makes React create a fresh instance with fresh state, with no extra render and no forgotten setters.
resources:
  - title: React, You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
---

Effects are an escape hatch for synchronising with systems outside React. When there is no external system, an effect is usually the wrong tool: it costs an extra render, shows stale values for a moment, and makes the data flow hard to follow.

## Derived data: calculate it

```tsx nocheck
// Unnecessary
const [visible, setVisible] = useState<Stream[]>([]);
useEffect(() => {
  setVisible(streams.filter((s) => s.live));
}, [streams]);

// Better
const visible = streams.filter((s) => s.live);
```

If the calculation is genuinely expensive, wrap it in `useMemo`, or let the React Compiler memoise it. Still no effect.

## User actions: use the event handler

Ask *why* the code runs. If it runs because the user did something, it belongs in that event's handler:

```tsx
declare function follow(channelId: string): Promise<void>;
declare function track(event: string, data: Record<string, string>): void;

export function FollowButton({ channelId }: { readonly channelId: string }) {
  async function handleClick() {
    await follow(channelId);
    track("follow", { channelId }); // caused by the click, so it lives here
  }
  return <button onClick={handleClick}>Follow</button>;
}
```

An effect that watches `following` and sends analytics when it becomes `true` would also fire when the page loads already following, or when state is restored.

## Resetting state: use a key

```tsx nocheck
// Unnecessary
useEffect(() => {
  setDraft("");
  setReplyingTo(null);
}, [channelId]);

// Better: a fresh component instance per channel
<ChatComposer key={channelId} channelId={channelId} />
```

## Adjusting some state when a prop changes

Occasionally you need to adjust *part* of the state when a prop changes. Compare with the previous value during render instead of using an effect:

```tsx
import { useState } from "react";

export function StreamList({ items }: { readonly items: readonly string[] }) {
  const [selection, setSelection] = useState<string | null>(null);
  const [previousItems, setPreviousItems] = useState(items);

  if (items !== previousItems) {
    setPreviousItems(items);
    if (selection !== null && !items.includes(selection)) setSelection(null);
  }

  return <p>{selection ?? "Nothing selected"}</p>;
}
```

React re-renders immediately, before painting, so no stale frame is shown. Even better is to avoid the need: storing `selectedId` and deriving `items.includes(selectedId) ? selectedId : null` needs no adjustment at all.

## Chains of effects

Effects that set state that triggers other effects are hard to follow and render many times:

```tsx nocheck
useEffect(() => { if (card?.gold) setGoldCount((c) => c + 1); }, [card]);
useEffect(() => { if (goldCount > 3) setRound((r) => r + 1); }, [goldCount]);
useEffect(() => { if (round > 5) setGameOver(true); }, [round]);
```

Compute what you can during render, and do the rest in the event handler that started it all, which can set all the state at once.

## Subscribing to external stores

Reading from a browser API or third-party store with `useEffect` plus `useState` works, but `useSyncExternalStore` is designed for it and avoids tearing. See [External Stores](/lessons/react/external-stores/).

## When an effect is right

- Connecting to a WebSocket, an `EventSource`, or a chat SDK.
- Subscribing to browser events not tied to a single element (`resize`, `online`, `visibilitychange`).
- Controlling a non-React widget (a video player, a map).
- Fetching data, if you are not using a data library.

## Assignment

1. Read [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) and do all of its challenges.
2. Search a React project for `useEffect` and classify each one: external system, derived data, event logic, reset, or chain. Rewrite every one that is not an external system.
