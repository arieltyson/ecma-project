---
title: Reducers and Context
summary: Move complex state logic into a reducer, share state deeply with context, and combine the two without unnecessary re-renders.
minutes: 30
objectives:
  - Write a typed reducer with a discriminated union of actions.
  - Provide and read context with createContext, a provider and use.
  - Combine a reducer and context to manage state for a subtree.
  - Know when context is the wrong tool.
quiz:
  - question: What must a reducer be?
    options:
      - An async function.
      - A pure function from (state, action) to the next state, without mutation or side effects.
      - A class with methods.
    answer: 1
    explanation: React may call reducers more than once in development. Purity also makes them trivial to test.
  - question: What happens when a context provider's value changes?
    options:
      - Nothing until the page reloads.
      - Every component that reads that context re-renders.
      - Only the provider re-renders.
    answer: 1
    explanation: Context consumers re-render when the value changes by reference. Passing a new object literal every render re-renders all of them every time.
  - question: Why split state and dispatch into two contexts?
    options:
      - It is required by React.
      - Components that only dispatch do not re-render when the state changes, because dispatch is stable.
      - Dispatch cannot be put in context.
    answer: 1
    explanation: dispatch from useReducer never changes identity, so a dispatch-only context never triggers re-renders.
resources:
  - title: React, Extracting State Logic into a Reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
  - title: React, Passing Data Deeply with Context
    url: https://react.dev/learn/passing-data-deeply-with-context
  - title: React, Scaling Up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
---

As state logic grows, two problems appear: update logic is scattered across many event handlers, and data has to be passed through many layers of components. Reducers solve the first; context solves the second.

## Reducers

A reducer collects every way state can change into one pure function. Event handlers describe **what happened** by dispatching an action:

```tsx
import { useReducer } from "react";

interface Message {
  readonly id: string;
  readonly author: string;
  readonly text: string;
}

interface ChatState {
  readonly messages: readonly Message[];
  readonly paused: boolean;
  readonly buffered: readonly Message[];
}

type ChatAction =
  | { readonly type: "received"; readonly message: Message }
  | { readonly type: "paused" }
  | { readonly type: "resumed" }
  | { readonly type: "deleted"; readonly id: string };

const MAX = 200;

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "received":
      return state.paused
        ? { ...state, buffered: [...state.buffered, action.message] }
        : { ...state, messages: [...state.messages, action.message].slice(-MAX) };
    case "paused":
      return { ...state, paused: true };
    case "resumed":
      return {
        paused: false,
        buffered: [],
        messages: [...state.messages, ...state.buffered].slice(-MAX),
      };
    case "deleted":
      return { ...state, messages: state.messages.filter((m) => m.id !== action.id) };
  }
}

export function useChat() {
  return useReducer(chatReducer, { messages: [], paused: false, buffered: [] });
}
```

The action type is a [discriminated union](/lessons/typescript/discriminated-unions/), so the switch narrows each case and TypeScript checks that every action is handled. Reducers are plain functions: test them without rendering anything.

Use a reducer when several pieces of state change together, when the next state depends on the previous one in non-trivial ways, or when you want the update logic in one testable place. For a single boolean, `useState` is fine.

## Context

Context passes a value to every component below a provider, without props:

```tsx
import { createContext, use, type ReactNode } from "react";

interface Viewer {
  readonly login: string;
  readonly isModerator: boolean;
}

const ViewerContext = createContext<Viewer | null>(null);

export function ViewerProvider({ viewer, children }: { readonly viewer: Viewer | null; readonly children: ReactNode }) {
  return <ViewerContext value={viewer}>{children}</ViewerContext>;
}

export function useViewer(): Viewer | null {
  return use(ViewerContext);
}

export function ModTools() {
  const viewer = useViewer();
  if (!viewer?.isModerator) return null;
  return <button>Timeout user</button>;
}
```

In React 19, render the context itself (`<ViewerContext value>`) as the provider, and read it with `use(Context)` or `useContext(Context)`. `use` may be called conditionally.

A custom hook (`useViewer`) hides the context object and is the place to throw a helpful error if a required provider is missing.

## Reducer plus context

Together they give a subtree its own store. Put state and dispatch in **separate** contexts, so components that only dispatch never re-render on state changes:

```tsx
import { createContext, use, useReducer, type Dispatch, type ReactNode } from "react";

type Action = { readonly type: "toggled" };
interface State {
  readonly open: boolean;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "toggled":
      return { open: !state.open };
  }
}

const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function SidebarProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { open: true });
  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  );
}

export function useSidebar(): State {
  const state = use(StateContext);
  if (!state) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return state;
}

export function useSidebarDispatch(): Dispatch<Action> {
  const dispatch = use(DispatchContext);
  if (!dispatch) throw new Error("useSidebarDispatch must be used inside <SidebarProvider>");
  return dispatch;
}
```

## When not to use context

- **Passing props two levels down** is fine. Try composition with `children` before reaching for context.
- **High-frequency values** (chat messages arriving every few milliseconds, scroll position) re-render every consumer. Use an external store with selectors instead; see [External Stores](/lessons/react/external-stores/).
- **Server data** belongs in a data library's cache, which already shares it across the app.

Good context values change rarely: the signed-in viewer, theme, locale, feature flags, a router.

## Assignment

1. Read the React docs chapters on [reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer), [context](https://react.dev/learn/passing-data-deeply-with-context) and [combining them](https://react.dev/learn/scaling-up-with-reducer-and-context).
2. Write `chatReducer` above with Vitest tests for every action, including the 200-message cap and pausing.
3. Provide the signed-in viewer through context and use it in three components at different depths.
