---
title: Synchronizing With Effects
summary: Use effects to connect a component to systems outside React, with correct dependencies, cleanup and race-condition handling.
minutes: 35
objectives:
  - Write effects that synchronise with external systems and clean up after themselves.
  - Specify dependencies correctly and know why the linter insists.
  - Avoid race conditions when fetching in an effect.
  - Read the latest props in an effect without re-running it, using useEffectEvent.
quiz:
  - question: When does an effect's cleanup function run?
    options:
      - Only when the component unmounts.
      - Before the effect runs again with new dependencies, and when the component unmounts.
      - After every render.
    answer: 1
    explanation: React cleans up the previous synchronisation before starting the next one, and once more on unmount.
  - question: An effect fetches channel data for `channelId`. The user switches channels quickly. What bug appears without cleanup?
    options:
      - None.
      - A slow response for the old channel can arrive last and overwrite the data for the new channel.
      - The fetch is cancelled automatically.
    answer: 1
    explanation: Responses can arrive in any order. Ignore or abort stale requests in the cleanup function.
  - question: Why does React run effects twice on mount in Strict Mode during development?
    options:
      - To make development slower.
      - To check that the effect's cleanup correctly undoes its setup.
      - Because of a bug.
    answer: 1
    explanation: A correct effect behaves the same after setup, cleanup, setup. If it does not, the cleanup is missing or wrong.
  - question: What is useEffectEvent for?
    options:
      - Fetching data.
      - Reading the latest props or state inside an effect without making them dependencies.
      - Replacing event handlers on buttons.
    answer: 1
    explanation: An effect event is not reactive. Call it from an effect when some logic should use current values but should not cause the effect to re-synchronise.
resources:
  - title: React, Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
  - title: React, Lifecycle of Reactive Effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
  - title: React, Separating Events from Effects
    url: https://react.dev/learn/separating-events-from-effects
  - title: React, useEffectEvent
    url: https://react.dev/reference/react/useEffectEvent
---

An effect lets a component **synchronise with something outside React**: a WebSocket, a browser API, a third-party widget, a timer. It is not a general-purpose "do this after render" hook. Most code that beginners put in effects belongs elsewhere; the next lesson covers those cases.

## The shape

```tsx
import { useEffect, useState } from "react";

export function ViewerCount({ channelId }: { readonly channelId: string }) {
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`wss://lumen.tv/viewers/${channelId}`);
    socket.addEventListener("message", (event: MessageEvent<string>) => {
      setViewers(Number(event.data));
    });
    return () => socket.close();
  }, [channelId]);

  return <span>{viewers ?? "…"} watching</span>;
}
```

1. **Setup** runs after React commits the render to the screen.
2. **Cleanup**, the function you return, undoes the setup.
3. **Dependencies** list every reactive value the effect reads (props, state, and anything derived from them). React re-runs the effect, cleaning up first, whenever one of them changes.

Think of it as: "while this component shows `channelId`, stay connected to that channel's socket." When `channelId` changes, React disconnects from the old one and connects to the new one.

## Dependencies

| Array | Runs |
| --- | --- |
| `[a, b]` | after mount, and after any render where `a` or `b` changed |
| `[]` | after mount only (plus Strict Mode's extra check) |
| omitted | after every render |

Dependencies are not a way to choose when your code runs; they must describe what the code reads. The `react-hooks/exhaustive-deps` lint rule checks this, and you should treat its warnings as errors. If an effect re-runs too often, change the code so it reads fewer reactive values, rather than lying in the array.

Objects and functions created during render are new on every render, so as dependencies they re-run the effect every time. Create them inside the effect instead, or depend on their primitive parts.

## Fetching and race conditions

Fetching in an effect works, but responses can arrive out of order. Abort the old request in cleanup:

```tsx
import { useEffect, useState } from "react";

interface Channel {
  readonly login: string;
  readonly title: string;
}

export function ChannelHeader({ login }: { readonly login: string }) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setChannel(null);
    fetch(`/api/channels/${encodeURIComponent(login)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<Channel>)
      .then(setChannel)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
      });
    return () => controller.abort();
  }, [login]);

  return <h1>{channel?.title ?? "Loading…"}</h1>;
}
```

This is the pattern to understand. In real apps, prefer a data library (Apollo Client, TanStack Query) or a framework loader, which add caching, deduplication, retries and Suspense support on top. See [Server State vs Client State](/lessons/spa/server-state/).

## Strict Mode's double run

In development, React mounts each component, immediately runs effect cleanup, then runs setup again. A correct effect looks the same afterwards. If you see two connections, two subscriptions, or a fetch whose result is shown twice, the cleanup is missing.

## useEffectEvent

Sometimes an effect needs the **latest** value of something without re-synchronising when it changes. For example, a chat connection should reconnect when the channel changes, but not when the theme does, even though the "connected" notification uses the theme:

```tsx
import { useEffect, useEffectEvent } from "react";

declare function connect(channelId: string): { on(event: "connected", fn: () => void): void; close(): void };
declare function showToast(message: string, theme: "light" | "dark"): void;

export function ChatConnection({
  channelId,
  theme,
}: {
  readonly channelId: string;
  readonly theme: "light" | "dark";
}) {
  const onConnected = useEffectEvent(() => {
    showToast(`Connected to ${channelId}`, theme);
  });

  useEffect(() => {
    const connection = connect(channelId);
    connection.on("connected", () => onConnected());
    return () => connection.close();
  }, [channelId]);

  return null;
}
```

`onConnected` always sees the current `theme`, and it is not a dependency. Only call effect events from inside effects.

## useLayoutEffect

`useLayoutEffect` runs after the DOM updates but **before** the browser paints. Use it only to measure layout and adjust before the user sees a flicker, such as positioning a tooltip. It blocks painting, so prefer `useEffect` otherwise.

## Assignment

1. Read [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) and [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects), and do their challenges.
2. Build a `useDocumentTitle(title)` effect, and a component that shows the live time and cleans up its interval.
3. Build `ChannelHeader` above against a fake API with random delays, remove the abort, and reproduce the race condition by switching channels quickly. Then restore it.
