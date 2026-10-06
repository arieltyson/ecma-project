---
title: Built-in Utility Types
summary: The utility types that ship with TypeScript, what each one is built from, and when to reach for them.
minutes: 20
objectives:
  - Use Partial, Required, Readonly, Pick, Omit and Record.
  - Use Exclude, Extract and NonNullable on unions.
  - Use ReturnType, Parameters and Awaited on functions.
  - Know the pitfalls of Omit and of deriving types from implementation details.
quiz:
  - question: "Which type describes an update payload where every field of `Channel` is optional?"
    options:
      - "`Required<Channel>`"
      - "`Partial<Channel>`"
      - "`Readonly<Channel>`"
    answer: 1
    explanation: "`Partial<T>` makes every property optional. Combine it with `Pick` to allow updates to only some fields: `Partial<Pick<Channel, \"title\" | \"game\">>`."
  - question: "What does `Omit<Channel, \"logn\">` do when `Channel` has no `logn` key?"
    options:
      - It reports an error.
      - It silently returns Channel unchanged.
      - It removes every key.
    answer: 1
    explanation: "`Omit`'s key parameter is constrained to `PropertyKey`, not `keyof T`, so typos pass. A stricter helper with `K extends keyof T` catches them."
  - question: What is `Awaited<Promise<Promise<string>>>`?
    options:
      - "`Promise<string>`"
      - "`string`"
      - "`unknown`"
    answer: 1
    explanation: "`Awaited` unwraps promises recursively, matching what `await` does at run time."
resources:
  - title: TypeScript Handbook, Utility Types
    url: https://www.typescriptlang.org/docs/handbook/utility-types.html
---

TypeScript ships a set of generic types for common transformations. You have already seen how most of them are built; this lesson is a reference for using them well.

## Object utilities

```ts
interface Channel {
  readonly id: string;
  login: string;
  title: string;
  game: string | null;
  followers: number;
}

type ChannelUpdate = Partial<Pick<Channel, "title" | "game">>;
type ChannelPreview = Pick<Channel, "id" | "login">;
type NewChannel = Omit<Channel, "id" | "followers">;
type FrozenChannel = Readonly<Channel>;
type ChannelsById = Record<Channel["id"], Channel>;
```

| Type | Result |
| --- | --- |
| `Partial<T>` | every property optional |
| `Required<T>` | every property required |
| `Readonly<T>` | every property readonly (shallow) |
| `Pick<T, K>` | only keys `K` |
| `Omit<T, K>` | every key except `K` |
| `Record<K, V>` | an object with keys `K` and values `V` |

> [!WARNING]
> `Omit<T, K>` does not check that `K` is a key of `T`, so `Omit<Channel, "logn">` compiles and removes nothing. A stricter version is one line:
>
> ```ts
> type StrictOmit<T, K extends keyof T> = Omit<T, K>;
> ```

## Union utilities

```ts
type Status = "live" | "offline" | "hosting" | null;

type Present = NonNullable<Status>;            // "live" | "offline" | "hosting"
type Away = Exclude<Status, "live" | null>;    // "offline" | "hosting"
type Live = Extract<Status, "live">;           // "live"
```

`Extract` is especially useful on discriminated unions:

```ts
type Message =
  | { type: "text"; body: string }
  | { type: "emote"; emoteId: string };

type TextMessage = Extract<Message, { type: "text" }>; // { type: "text"; body: string }
```

## Function utilities

```ts
async function fetchChannel(login: string, signal?: AbortSignal) {
  const response = await fetch(`/api/channels/${login}`, signal ? { signal } : {});
  return (await response.json()) as { login: string; followers: number };
}

type Args = Parameters<typeof fetchChannel>;          // [login: string, signal?: AbortSignal]
type Returned = ReturnType<typeof fetchChannel>;      // Promise<{ login: string; followers: number }>
type ChannelData = Awaited<ReturnType<typeof fetchChannel>>; // { login: string; followers: number }
```

These are useful when you do not own a function's types, such as a third-party library that does not export them. In your own code, prefer naming the type and using it in the function signature; deriving types from implementation means a refactor of the function body can silently change public types.

## Others worth knowing

- `NoInfer<T>`: blocks inference (see [advanced generics](/lessons/typescript/advanced-generics/)).
- `InstanceType<C>` and `ConstructorParameters<C>`: for class constructors.
- `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`: for string literals.

## Assignment

1. Read the Handbook's [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) reference.
2. For a `Stream` interface with eight fields, write the types for a creation payload (no server-generated fields), an update payload (some fields optional) and a list item (a few fields only).
3. Write `StrictOmit` and show a typo it catches that `Omit` does not.
