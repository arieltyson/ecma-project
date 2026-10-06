---
title: Forms and Actions
summary: Handle input with controlled and uncontrolled fields, and submit with React 19 actions, useActionState, useFormStatus and useOptimistic.
minutes: 35
objectives:
  - Choose between controlled and uncontrolled inputs.
  - Submit a form with an action function and FormData.
  - Track pending state and results with useActionState and useFormStatus.
  - Show an optimistic result with useOptimistic and roll back on failure.
quiz:
  - question: What makes an input "controlled"?
    options:
      - It has a name attribute.
      - Its value comes from React state via the value prop, and every change goes through onChange.
      - It is inside a form.
    answer: 1
    explanation: A controlled input always shows what state says. Uncontrolled inputs keep their own value in the DOM, read later through FormData or a ref.
  - question: What does useActionState return?
    options:
      - "`[state, setState]`"
      - "`[state, formAction, isPending]`"
      - "`{ data, error, loading }`"
    answer: 1
    explanation: Pass `formAction` to `<form action>`. Each submission calls your action with the previous state and the form's FormData, and its return value becomes the new state.
  - question: Where can useFormStatus be called?
    options:
      - In the component that renders the form.
      - In a component rendered inside the form, such as a submit button.
      - Anywhere.
    answer: 1
    explanation: It reads the status of the nearest parent form, so it must be used in a child component.
  - question: What happens to an optimistic value from useOptimistic when the action finishes?
    options:
      - It is kept forever.
      - It is discarded and the real state is shown, which either confirms it or rolls it back.
      - It is saved to the server.
    answer: 1
    explanation: The optimistic value only lives while the action is pending. If the action fails and the real state did not change, the UI reverts automatically.
resources:
  - title: React, the form component
    url: https://react.dev/reference/react-dom/components/form
  - title: React, useActionState
    url: https://react.dev/reference/react/useActionState
  - title: React, useOptimistic
    url: https://react.dev/reference/react/useOptimistic
  - title: React, useFormStatus
    url: https://react.dev/reference/react-dom/hooks/useFormStatus
---

Forms are where user input meets your state and your server. React 19 added **actions**: functions passed to a form that run on submit, with built-in pending state, error handling and optimistic updates.

## Controlled inputs

A controlled input shows what state says, and every keystroke goes through `onChange`:

```tsx
import { useState } from "react";

export function TitleField() {
  const [title, setTitle] = useState("");
  const remaining = 140 - title.length;
  return (
    <label>
      Stream title
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
      <span aria-live="polite">{remaining} characters left</span>
    </label>
  );
}
```

Use controlled inputs when you need the value while typing: live validation, character counts, formatting, or enabling a button.

## Uncontrolled inputs and FormData

If you only need values on submit, let the DOM keep them and read them with `FormData`. Less state, fewer renders:

```tsx
export function SearchForm({ onSearch }: { readonly onSearch: (query: string) => void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get("q");
        if (typeof query === "string") onSearch(query.trim());
      }}
    >
      <input name="q" type="search" defaultValue="" aria-label="Search channels" />
      <button>Search</button>
    </form>
  );
}
```

`defaultValue` sets the initial value of an uncontrolled input; `value` makes it controlled. Do not switch between the two.

## Actions

In React 19 you can pass a **function** to `<form action>`. React calls it with the form's `FormData` on submit, inside a transition, and resets uncontrolled fields when it succeeds:

```tsx
async function saveTitle(formData: FormData): Promise<void> {
  const title = formData.get("title");
  if (typeof title !== "string") return;
  await fetch("/api/stream", { method: "PATCH", body: JSON.stringify({ title }) });
}

export function StreamSettings() {
  return (
    <form action={saveTitle}>
      <input name="title" aria-label="Stream title" />
      <button>Save</button>
    </form>
  );
}
```

## useActionState

`useActionState` wraps an action so it can return a result, and tells you when it is pending:

```tsx
import { useActionState } from "react";

type SaveState =
  | { readonly status: "idle" }
  | { readonly status: "saved"; readonly title: string }
  | { readonly status: "error"; readonly message: string };

async function save(_previous: SaveState, formData: FormData): Promise<SaveState> {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length === 0) return { status: "error", message: "Enter a title." };
  const response = await fetch("/api/stream", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return response.ok
    ? { status: "saved", title }
    : { status: "error", message: "Could not save. Try again." };
}

export function TitleForm() {
  const [state, formAction, isPending] = useActionState(save, { status: "idle" });
  return (
    <form action={formAction}>
      <input name="title" aria-label="Stream title" aria-describedby="title-status" />
      <button disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
      <p id="title-status" role="status">
        {state.status === "error" ? state.message : state.status === "saved" ? "Saved." : null}
      </p>
    </form>
  );
}
```

The action receives the previous state first, then the `FormData`. Returning a discriminated union keeps the result type honest.

## useFormStatus

A component **inside** a form can read that form's pending state with `useFormStatus` from `react-dom`, without prop drilling:

```tsx
import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { readonly children: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Working…" : children}</button>;
}
```

## useOptimistic

For actions that almost always succeed, like following a channel or sending a chat message, show the result immediately and let React reconcile when the server answers:

```tsx
import { useOptimistic, useState } from "react";

declare function sendMessage(text: string): Promise<{ id: string; text: string }>;

interface Message {
  readonly id: string;
  readonly text: string;
  readonly pending?: boolean;
}

export function Chat() {
  const [messages, setMessages] = useState<readonly Message[]>([]);
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (current, text: string) => [...current, { id: `temp-${current.length}`, text, pending: true }],
  );

  async function send(formData: FormData) {
    const text = String(formData.get("text") ?? "");
    addOptimistic(text);
    const saved = await sendMessage(text);
    setMessages((current) => [...current, saved]);
  }

  return (
    <>
      <ul>
        {optimistic.map((m) => (
          <li key={m.id} aria-busy={m.pending}>
            {m.text}
          </li>
        ))}
      </ul>
      <form action={send}>
        <input name="text" aria-label="Message" />
      </form>
    </>
  );
}
```

While `send` is pending, the list shows the optimistic message. When it finishes, the optimistic state is discarded and the real `messages` show. If `sendMessage` throws, the real state never changed, so the message disappears; catch the error and tell the user.

## Accessibility

- Every input needs a label: a wrapping `<label>`, `htmlFor`, or `aria-label`.
- Put validation messages in an element referenced by `aria-describedby`, and announce status with `role="status"`.
- Use native `required`, `type="email"` and `minLength` as a first line of validation.

## Assignment

1. Read the React reference for [`<form>`](https://react.dev/reference/react-dom/components/form), [`useActionState`](https://react.dev/reference/react/useActionState) and [`useOptimistic`](https://react.dev/reference/react/useOptimistic).
2. Build a "go live" settings form with a title, a category select and a mature content checkbox, submitted with `useActionState` to a fake API that fails one time in three.
3. Build a follow button with `useOptimistic` that flips instantly and reverts, with an error message, when the fake API fails.
