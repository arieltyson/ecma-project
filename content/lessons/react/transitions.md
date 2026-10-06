---
title: Transitions and Deferred Values
summary: Keep the interface responsive by marking some updates as non-urgent with useTransition and useDeferredValue.
minutes: 25
objectives:
  - Explain urgent versus non-urgent updates.
  - Use useTransition and startTransition for state updates and actions.
  - Use useDeferredValue to keep input responsive while expensive results catch up.
  - Show pending UI without hiding existing content.
quiz:
  - question: What does wrapping a state update in startTransition do?
    options:
      - Makes it run faster.
      - Marks it as non-urgent, so React can interrupt its render to handle urgent updates like typing.
      - Delays it by 300ms.
    answer: 1
    explanation: Transition renders can be interrupted and restarted. Urgent updates, such as the input's own value, render first.
  - question: Which update should NOT be in a transition?
    options:
      - Switching to a tab whose content is expensive to render.
      - Setting a controlled input's value as the user types.
      - Navigating to another page.
    answer: 1
    explanation: Text inputs must update synchronously, or typing feels broken. Put the expensive consequence of typing in a transition or a deferred value instead.
  - question: During a transition that suspends, what does React show?
    options:
      - The nearest Suspense fallback, replacing existing content.
      - The previous content, until the new content is ready.
      - A blank screen.
    answer: 1
    explanation: Transitions avoid hiding content that is already visible. Use isPending to show a subtle indicator instead.
resources:
  - title: React, useTransition
    url: https://react.dev/reference/react/useTransition
  - title: React, useDeferredValue
    url: https://react.dev/reference/react/useDeferredValue
---

Some updates must happen immediately: a character appearing as you type, a button looking pressed. Others can wait a few frames: the filtered results of that typing, the next page's content. React lets you mark the second kind as **transitions**, so they never block the first.

## useTransition

```tsx
import { useState, useTransition } from "react";

declare function Videos(): React.ReactNode;
declare function Clips(): React.ReactNode;
declare function About(): React.ReactNode;

type Tab = "videos" | "clips" | "about";

export function ChannelTabs() {
  const [tab, setTab] = useState<Tab>("videos");
  const [isPending, startTransition] = useTransition();

  function select(next: Tab) {
    startTransition(() => setTab(next));
  }

  return (
    <>
      <nav aria-busy={isPending}>
        {(["videos", "clips", "about"] as const).map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => select(t)}>
            {t}
          </button>
        ))}
      </nav>
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {tab === "videos" ? <Videos /> : tab === "clips" ? <Clips /> : <About />}
      </div>
    </>
  );
}
```

If the clips tab is slow to render, clicking it no longer freezes the page: React starts rendering it in the background, and if you click another tab first, it abandons the clips render. `isPending` lets you show that something is happening without removing the current tab.

## Transitions and Suspense

If a transition's render suspends (for example while a lesson chunk or data loads), React **keeps showing the old content** instead of the nearest Suspense fallback. That is why router navigations are usually transitions: the old page stays until the new one is ready. This site's router wraps every navigation in `startTransition` for that reason.

## Async transitions and actions

`startTransition` accepts an async function. The transition stays pending until it finishes, which is how React 19 actions track pending state:

```tsx
import { useTransition } from "react";

declare function follow(channelId: string): Promise<void>;

export function FollowButton({ channelId }: { readonly channelId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await follow(channelId);
      })}
    >
      {isPending ? "Following…" : "Follow"}
    </button>
  );
}
```

## useDeferredValue

When you do not control the state update (for example, the value comes from props), defer the **value** instead:

```tsx
import { useDeferredValue, useState } from "react";

declare function SearchResults(props: { query: string }): React.ReactNode;

export function ChannelSearch() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const stale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search channels" />
      <div style={{ opacity: stale ? 0.6 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </>
  );
}
```

The input renders with the new `query` immediately. `SearchResults` re-renders with the deferred value in the background, and if it is memoised (by `memo` or the compiler), it skips renders while the user is still typing.

Unlike debouncing, there is no fixed delay: on a fast device results update almost instantly, and on a slow one React simply skips intermediate values.

## Assignment

1. Read the references for [useTransition](https://react.dev/reference/react/useTransition) and [useDeferredValue](https://react.dev/reference/react/useDeferredValue).
2. Build a search over 10,000 fake channels whose result rows are artificially slow to render. Compare typing with no optimisation, with a 250ms debounce, and with `useDeferredValue`.
3. Build a tabbed channel page where one tab is slow, and use `useTransition` so tab buttons stay responsive.
