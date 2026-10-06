---
title: Suspense, use and Error Boundaries
summary: Declare loading and error states in the tree with Suspense and error boundaries, read promises with use, and split code with lazy.
minutes: 30
objectives:
  - Show loading states declaratively with Suspense boundaries.
  - Read a cached promise with use.
  - Split code by route with lazy.
  - Catch rendering errors with an error boundary and know what it cannot catch.
quiz:
  - question: Why must the promise passed to `use` not be created during render?
    options:
      - Promises cannot be passed as arguments.
      - Each render would create a new promise, so the component would suspend forever.
      - use only accepts async functions.
    answer: 1
    explanation: Suspending throws away the render. When it retries, a promise created in render would be new and pending again. Cache it outside the component, or get it from a data library or framework.
  - question: Which error does an error boundary catch?
    options:
      - An error thrown while rendering a child component.
      - An error thrown in an onClick handler.
      - A rejected promise in a setTimeout callback.
    answer: 0
    explanation: Error boundaries catch errors during rendering, in lifecycle methods and in effects of their children. Event handler and async errors need try/catch, though errors thrown inside transitions and actions are rethrown to the nearest boundary.
  - question: Where should Suspense boundaries go?
    options:
      - Around every component.
      - Where a loading state makes sense to the user, such as around a page or a panel that loads independently.
      - Only at the root.
    answer: 1
    explanation: Boundaries are a design decision. Too few and one slow request hides the whole page; too many and the page pops in piece by piece.
resources:
  - title: React, Suspense
    url: https://react.dev/reference/react/Suspense
  - title: React, use
    url: https://react.dev/reference/react/use
  - title: React, error boundaries
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
---

Loading and error states are usually handled with flags in every component: `if (loading) return <Spinner />`. Suspense and error boundaries move that handling up into the tree, so components can be written as if their data were already there.

## Suspense

A `<Suspense>` boundary shows its `fallback` while anything inside it is waiting:

```tsx
import { Suspense } from "react";

declare function ChannelHeader(props: { login: string }): React.ReactNode;
declare function ChatPanel(props: { login: string }): React.ReactNode;

export function ChannelPage({ login }: { readonly login: string }) {
  return (
    <>
      <Suspense fallback={<div className="skeleton-header" />}>
        <ChannelHeader login={login} />
      </Suspense>
      <Suspense fallback={<p>Loading chat…</p>}>
        <ChatPanel login={login} />
      </Suspense>
    </>
  );
}
```

Things that suspend: components loaded with `lazy`, promises read with `use`, and data libraries with Suspense support (Apollo Client's `useSuspenseQuery`, TanStack Query's `useSuspenseQuery`). Plain `fetch` in an effect does **not** suspend.

Each boundary is a loading state the user will see. Place them where independent parts of the page can appear separately.

## use

`use(promise)` reads a promise's value, suspending until it resolves:

```tsx
import { Suspense, use } from "react";

interface Channel {
  readonly login: string;
  readonly title: string;
}

const cache = new Map<string, Promise<Channel>>();

function fetchChannel(login: string): Promise<Channel> {
  let promise = cache.get(login);
  if (!promise) {
    promise = fetch(`/api/channels/${login}`).then((r) => r.json() as Promise<Channel>);
    cache.set(login, promise);
  }
  return promise;
}

function Title({ login }: { readonly login: string }) {
  const channel = use(fetchChannel(login));
  return <h1>{channel.title}</h1>;
}

export function Header({ login }: { readonly login: string }) {
  return (
    <Suspense fallback={<h1>Loading…</h1>}>
      <Title login={login} />
    </Suspense>
  );
}
```

The promise must be **stable across renders**, which is why it is cached. In real apps, a framework loader, a data library or a parent component provides it. This site uses exactly this pattern to load lesson bodies; see `src/content/lessons.ts`.

## lazy

`lazy` loads a component's code the first time it renders, which splits your bundle by route or by rarely used feature:

```tsx nocheck
import { lazy, Suspense } from "react";

const ModeratorTools = lazy(() => import("./moderator-tools.tsx"));

export function ChatHeader({ isModerator }: { readonly isModerator: boolean }) {
  return isModerator ? (
    <Suspense fallback={null}>
      <ModeratorTools />
    </Suspense>
  ) : null;
}
```

The imported module must have a default export that is a component.

## Error boundaries

An error boundary catches errors thrown while rendering its children and shows a fallback instead of unmounting the whole app. It must be a class component, because there is no hook equivalent of `getDerivedStateFromError`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  readonly fallback: (error: Error, reset: () => void) => ReactNode;
  readonly children: ReactNode;
}

interface State {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  override render(): ReactNode {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}
```

Most apps use the `react-error-boundary` package rather than writing this by hand. Pair each Suspense boundary that loads data with an error boundary, so a failed request shows a retry option in that region.

Error boundaries do **not** catch errors in event handlers, in `setTimeout` callbacks, or in promises you do not hand to React. Catch those yourself. Errors thrown inside transitions and actions are rethrown to the nearest boundary.

## Activity

React 19.2's `<Activity mode="hidden">` hides part of the tree while keeping its state, and unmounts its effects until it becomes visible again. It suits tabs and back navigation where you want to return to exactly where the user was.

## Assignment

1. Read the references for [Suspense](https://react.dev/reference/react/Suspense) and [use](https://react.dev/reference/react/use).
2. Split a multi-page app by route with `lazy`, and confirm in the Network panel that each page's chunk loads on first visit.
3. Add an error boundary with a "Try again" button around a component that throws one time in two when rendering, and make the button reset the boundary.
