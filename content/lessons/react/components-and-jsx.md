---
title: Components and JSX
summary: Build user interfaces from small, pure functions that turn props into JSX.
minutes: 25
objectives:
  - Write function components that accept typed props.
  - Explain what JSX compiles to and its rules.
  - Render lists with stable keys and content conditionally.
  - Keep components pure and compose them with children.
quiz:
  - question: What does a component function need to be, according to React's rules?
    options:
      - Pure; given the same props and state it returns the same JSX and changes nothing outside itself while rendering.
      - Asynchronous.
      - A class.
    answer: 0
    explanation: React may call your component at any time, more than once, or not at all. Side effects belong in event handlers and effects, never in the render body.
  - question: Why is an array index a poor key for a list that can be reordered?
    options:
      - Keys must be strings.
      - When items move, the same index refers to a different item, so React reuses the wrong component state and DOM.
      - Indexes are slower to compare.
    answer: 1
    explanation: Keys tell React which item is which between renders. Use a stable ID from the data.
  - question: What does `{count && <Badge />}` render when count is 0?
    options:
      - Nothing.
      - The text 0.
      - An empty Badge.
    answer: 1
    explanation: "`0 && x` evaluates to 0, and React renders numbers. Use `count > 0 && <Badge />` or a ternary."
resources:
  - title: React, Your First Component
    url: https://react.dev/learn/your-first-component
  - title: React, Rendering Lists
    url: https://react.dev/learn/rendering-lists
  - title: React, Keeping Components Pure
    url: https://react.dev/learn/keeping-components-pure
---

A React app is a tree of **components**: functions that take **props** and return a description of UI written in **JSX**. React calls them, compares what they return with what is on screen, and updates the DOM to match.

## A component

```tsx
interface ChannelCardProps {
  readonly login: string;
  readonly title: string;
  readonly viewers: number;
}

export function ChannelCard({ login, title, viewers }: ChannelCardProps) {
  return (
    <article className="channel-card">
      <h3>{title}</h3>
      <p>
        {login} · {viewers.toLocaleString()} viewers
      </p>
    </article>
  );
}
```

Component names start with a capital letter; lowercase tags are HTML elements. Props are a single object, typed with an interface and usually destructured.

> [!TIP]
> If you know SwiftUI, a component is a `View`, props are its stored properties, and the returned JSX is its `body`. The big difference: React components are plain functions called again on every render.

## JSX

JSX is syntax for function calls. The compiler turns `<h3 className="title">{title}</h3>` into roughly `jsx("h3", { className: "title", children: title })`. Its rules follow from that:

- Return **one root** element, or wrap siblings in a fragment `<>...</>`.
- Attributes are camelCase JavaScript properties: `className`, `htmlFor`, `onClick`, `tabIndex`.
- `{}` embeds any JavaScript **expression**. Statements like `if` and `for` go outside the JSX.
- Strings, numbers and elements render. `null`, `undefined`, `true` and `false` render nothing.

## Conditional content

```tsx
function LiveBadge({ live, viewers }: { readonly live: boolean; readonly viewers: number }) {
  if (!live) return null;
  return (
    <span className="badge">
      LIVE
      {viewers > 0 ? ` · ${viewers}` : null}
    </span>
  );
}
```

Avoid `{count && <X />}` with numbers: when `count` is `0`, React renders "0".

## Lists and keys

```tsx
interface Stream {
  readonly id: string;
  readonly title: string;
}

function StreamList({ streams }: { readonly streams: readonly Stream[] }) {
  return (
    <ul>
      {streams.map((stream) => (
        <li key={stream.id}>{stream.title}</li>
      ))}
    </ul>
  );
}
```

`key` tells React which item is which between renders, so it can move DOM nodes and keep each item's state when the list changes. Use a stable ID from your data. An index only works for lists that never reorder, insert or delete.

## Composition with children

Components accept other elements through the `children` prop. This is how you build layouts and wrappers without the wrapper knowing its contents:

```tsx
import type { ReactNode } from "react";

function Panel({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Sidebar() {
  return (
    <Panel title="Followed channels">
      <p>No one is live.</p>
    </Panel>
  );
}
```

## Purity

React's central rule: **rendering must be pure**. A component's body calculates JSX from props, state and context, and does nothing else. No fetching, no subscriptions, no writing to variables outside the component, no changing the DOM.

```tsx
let renders = 0;

function Impure() {
  renders++; // a side effect during render: wrong
  return <p>{renders}</p>;
}
```

React relies on purity to render components in any order, more than once, or to discard a render and try again. In development, `<StrictMode>` renders every component twice to surface impure code. Side effects go in event handlers or, when they synchronise with something outside React, in effects.

## Assignment

1. Read [Describing the UI](https://react.dev/learn/describing-the-ui) in the React docs, all chapters.
2. Create a Vite project with `npm create vite@latest lumen -- --template react-ts` and turn on the strict compiler options from [A Strict tsconfig](/lessons/typescript/strict-config/).
3. Build a `Directory` component that renders a list of `ChannelCard`s from a hard-coded array, shows "No one is live" when the array is empty, and shows a LIVE badge only for live channels.
