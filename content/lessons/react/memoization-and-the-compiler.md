---
title: Memoization and the React Compiler
summary: Skip unnecessary work with memo, useMemo and useCallback, and let the React Compiler do it for you.
minutes: 30
objectives:
  - Explain what memo, useMemo and useCallback each skip.
  - Identify when referential equality makes memoisation fail.
  - Describe what the React Compiler does and what it requires of your code.
  - Profile before optimising.
quiz:
  - question: A memo-wrapped child receives `onSelect={() => select(id)}` from its parent. Does memo prevent the child re-rendering when the parent re-renders?
    options:
      - Yes.
      - No. The arrow function is a new reference each render, so props differ every time.
      - Only in production.
    answer: 1
    explanation: memo compares props with Object.is. Without useCallback (or the compiler), inline functions and objects defeat it.
  - question: What does the React Compiler do?
    options:
      - Converts TypeScript to JavaScript.
      - Automatically memoises components and values at build time, based on what they depend on.
      - Runs components on the server.
    answer: 1
    explanation: The compiler analyses your components and inserts fine-grained memoisation, so most manual memo, useMemo and useCallback become unnecessary.
  - question: What does the compiler require of your code?
    options:
      - Class components.
      - That it follows the Rules of React, such as pure rendering and not mutating props or state.
      - That every component is wrapped in memo.
    answer: 1
    explanation: The compiler's optimisations are only safe for code that follows the rules. It skips components it cannot prove safe.
resources:
  - title: React, memo
    url: https://react.dev/reference/react/memo
  - title: React, useMemo
    url: https://react.dev/reference/react/useMemo
  - title: React Compiler
    url: https://react.dev/learn/react-compiler
---

Re-rendering is usually cheap. When it is not, React offers three tools to skip work, and the React Compiler can apply them automatically.

## Profile first

Before memoising anything, record the interaction in the React DevTools **Profiler** and find the component that is actually slow. Most performance problems come from rendering too much (a huge list), doing expensive work during render, or effects causing extra renders, not from re-rendering small components.

## memo

`memo` skips re-rendering a component when its props are unchanged (compared with `Object.is`):

```tsx
import { memo } from "react";

interface Row {
  readonly id: string;
  readonly title: string;
}

export const StreamRow = memo(function StreamRow({
  stream,
  onSelect,
}: {
  readonly stream: Row;
  readonly onSelect: (id: string) => void;
}) {
  return <li onClick={() => onSelect(stream.id)}>{stream.title}</li>;
});
```

## useMemo and useCallback

`memo` only helps if the props really are the same. Objects, arrays and functions created during render are new every time. `useMemo` caches a calculated value and `useCallback` caches a function, until their dependencies change:

```tsx
import { useCallback, useMemo, useState } from "react";

declare function rank(streams: readonly { id: string; title: string; viewers: number }[]): typeof streams;
declare const StreamRow: (props: { stream: { id: string; title: string }; onSelect: (id: string) => void }) => React.ReactNode;

export function Directory({ streams }: { readonly streams: readonly { id: string; title: string; viewers: number }[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const ranked = useMemo(() => rank(streams), [streams]);
  const onSelect = useCallback((id: string) => setSelected(id), []);

  return (
    <>
      <p>{selected}</p>
      <ul>
        {ranked.map((s) => (
          <StreamRow key={s.id} stream={s} onSelect={onSelect} />
        ))}
      </ul>
    </>
  );
}
```

Doing this by hand is error-prone: one inline object anywhere in the chain silently defeats all of it.

## The React Compiler

The **React Compiler** is a build-time plugin that analyses each component and hook and inserts memoisation automatically, at a finer grain than you would by hand. With it enabled, you write plain components:

```tsx nocheck
export function Directory({ streams }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const ranked = rank(streams); // cached while streams is unchanged
  return (
    <ul>
      {ranked.map((s) => (
        <StreamRow key={s.id} stream={s} onSelect={setSelected} />
      ))}
    </ul>
  );
}
```

It is enabled with a Babel plugin (`babel-plugin-react-compiler`) in Vite, Next.js and other build tools. This site is built with it.

The compiler only optimises code that follows the **Rules of React**: pure rendering, no mutation of props, state or values used in rendering, and hooks called unconditionally. Code it cannot prove safe is left as is. The `react-hooks` ESLint plugin reports violations, which makes it worth fixing them even before adopting the compiler.

With the compiler, reach for `useMemo` and `useCallback` only as escape hatches, for example when an effect must depend on a value whose identity you control precisely.

## Making the problem smaller

Often the best optimisation is structural:

- **Move state down** into the component that uses it, so typing in a search box does not re-render the whole page.
- **Pass children** instead of rendering them inside the stateful component. Elements passed as `children` are created by the parent and do not re-render when the wrapper's state changes.
- **Virtualise** long lists, rendering only the rows on screen (with a library such as TanStack Virtual).
- **Defer** non-urgent updates with transitions, covered next.

## Assignment

1. Read the [React Compiler introduction](https://react.dev/learn/react-compiler).
2. Build a directory of 2,000 streams with a search box. Profile typing, then fix it first by moving state down, then with `useMemo` and `memo`, and compare the profiles.
3. Enable the React Compiler in the same project, remove your manual memoisation and profile again.
