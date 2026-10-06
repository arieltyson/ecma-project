---
title: Structuring State
summary: Choose the minimal state, derive everything else, lift state to the right component, and avoid duplicated or contradictory state.
minutes: 25
objectives:
  - Derive values during render instead of storing them.
  - Avoid redundant, duplicated and contradictory state.
  - Lift state up to the closest common parent.
  - Decide what belongs in component state, the URL or server state.
quiz:
  - question: A component stores `items` and `itemCount` in two state variables. What is wrong?
    options:
      - Nothing.
      - itemCount can be derived from items.length, and storing it lets the two drift apart.
      - State cannot hold numbers.
    answer: 1
    explanation: Store the minimum and calculate the rest during render. Derived values are always consistent with their source.
  - question: Two sibling components need the same selected channel. Where should the state live?
    options:
      - In both siblings, kept in sync with effects.
      - In their closest common parent, passed down as props.
      - In a global variable.
    answer: 1
    explanation: Lifting state up gives one source of truth. Syncing copies with effects causes extra renders and bugs.
  - question: Why store `selectedId` instead of a copy of the selected object?
    options:
      - IDs are smaller.
      - A copied object goes stale when the list's item is updated; an ID always looks up the current version.
      - Objects cannot be compared.
    answer: 1
    explanation: Duplicated data means two sources of truth. Store the ID and derive the object with find.
resources:
  - title: React, Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
  - title: React, Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
---

Most state bugs are structure bugs: two variables that should always agree, but sometimes do not. The fix is usually to store less.

## Derive, do not store

If a value can be calculated from props or other state, calculate it during render:

```tsx
import { useState } from "react";

interface Stream {
  readonly id: string;
  readonly title: string;
  readonly viewers: number;
}

export function Directory({ streams }: { readonly streams: readonly Stream[] }) {
  const [query, setQuery] = useState("");

  // Derived: no state, no effect.
  const visible = streams.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
  const totalViewers = visible.reduce((sum, s) => sum + s.viewers, 0);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter" />
      <p>{totalViewers} watching</p>
      <ul>
        {visible.map((s) => (
          <li key={s.id}>{s.title}</li>
        ))}
      </ul>
    </>
  );
}
```

Storing `visible` in state and updating it in an effect would cost an extra render and could show stale results for a frame.

## Principles

The React docs list five; in practice they reduce to:

1. **Group related state** that always changes together into one object.
2. **Avoid contradictions.** Two booleans like `isSending` and `isSent` allow an impossible state; use one `status` union (see [discriminated unions](/lessons/typescript/discriminated-unions/)).
3. **Avoid redundancy.** Do not store what you can derive.
4. **Avoid duplication.** Store an ID, not a copy of an object that also lives in a list.
5. **Avoid deep nesting.** Flatten (normalise) data keyed by ID if you update nested items often.

```tsx nocheck
// Contradictory
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

// One source of truth
type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; error: Error };
const [status, setStatus] = useState<Status>({ kind: "idle" });
```

## Lifting state up

When two components need the same state, move it to their closest common parent and pass it down, with callbacks to change it:

```tsx
import { useState } from "react";

function ChannelList({
  selectedId,
  onSelect,
}: {
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <button aria-pressed={selectedId === "lumen"} onClick={() => onSelect("lumen")}>
      lumen
    </button>
  );
}

function ChannelDetails({ channelId }: { readonly channelId: string | null }) {
  return <p>{channelId ?? "Select a channel"}</p>;
}

export function Browse() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <>
      <ChannelList selectedId={selectedId} onSelect={setSelectedId} />
      <ChannelDetails channelId={selectedId} />
    </>
  );
}
```

The child that used to own the state becomes **controlled**: its parent decides what it shows.

## Where state should live

Not all state is component state:

| Kind | Examples | Lives in |
| --- | --- | --- |
| UI state | open menus, input drafts, hover | the component that uses it, or the closest common parent |
| URL state | current page, filters, sort, selected tab | the URL (search params), so links and reloads keep it |
| Server state | channels, streams, chat history | a data library's cache (Apollo Client, TanStack Query) |
| Global client state | theme, signed-in viewer | context or an external store |

Putting server data in `useState` and keeping it fresh by hand is the most common source of complexity in React apps. [Server State vs Client State](/lessons/spa/server-state/) covers the alternative.

## Assignment

1. Read [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) and do its challenges.
2. Refactor a component of yours that keeps a filtered list in state so the list is derived instead.
3. Build a two-pane channel browser (list and details) and move the selected channel's state into the URL search params with `URLSearchParams` and `history.replaceState`. Reload and confirm the selection survives.
