---
title: keyof, typeof and Indexed Access
summary: Derive types from values and from other types, so a single source of truth drives everything.
minutes: 20
objectives:
  - Get the keys of a type with keyof.
  - Get the type of a value with typeof in a type position.
  - Look up property and element types with indexed access.
  - Combine the three to derive types from constants.
quiz:
  - question: "What is `keyof { login: string; followers: number }`?"
    options:
      - "`string`"
      - "`\"login\" | \"followers\"`"
      - "`[\"login\", \"followers\"]`"
    answer: 1
    explanation: keyof produces a union of the literal key types.
  - question: "`const config = { retries: 3 }`. What is `typeof config` in a type position?"
    options:
      - "`\"object\"`"
      - "`{ retries: number }`"
      - "`{ retries: 3 }`"
    answer: 1
    explanation: In a type position, typeof gives the inferred TypeScript type of the value. The string `"object"` is what the runtime `typeof` operator returns.
  - question: "`type Item = Stream[\"tags\"][number]` where `tags: readonly string[]`. What is Item?"
    options:
      - "`string`"
      - "`readonly string[]`"
      - "`number`"
    answer: 0
    explanation: "`Stream[\"tags\"]` is the array type; indexing an array type with `number` gives its element type."
resources:
  - title: TypeScript Handbook, Keyof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
  - title: TypeScript Handbook, Typeof Type Operator
    url: https://www.typescriptlang.org/docs/handbook/2/typeof-types.html
  - title: TypeScript Handbook, Indexed Access Types
    url: https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
---

The more types you derive from other types, the fewer places there are to forget an update. Three operators do most of that work.

## keyof

`keyof T` is the union of `T`'s property names:

```ts
interface Channel {
  login: string;
  followers: number;
  live: boolean;
}

type ChannelKey = keyof Channel; // "login" | "followers" | "live"

function sortBy(channels: readonly Channel[], key: ChannelKey): Channel[] {
  return channels.toSorted((a, b) => String(a[key]).localeCompare(String(b[key])));
}
```

For a type with a string index signature, `keyof` gives `string | number`, because JavaScript converts numeric keys to strings.

## typeof in a type position

In an expression, `typeof x` is the runtime operator that returns a string. In a **type position**, it gives the TypeScript type of a value:

```ts
const DEFAULTS = {
  volume: 0.5,
  quality: "auto",
  chat: true,
};

type Settings = typeof DEFAULTS;
// { volume: number; quality: string; chat: boolean }

function load(saved: Partial<Settings>): Settings {
  return { ...DEFAULTS, ...saved };
}
```

This is how you let a runtime value be the source of truth. Pair it with `as const` to keep literal types.

## Indexed access

`T[K]` looks up the type of a property, exactly like reading a property at run time:

```ts
interface Stream {
  id: string;
  broadcaster: { login: string; displayName: string };
  tags: readonly string[];
}

type Broadcaster = Stream["broadcaster"];          // { login: string; displayName: string }
type Login = Stream["broadcaster"]["login"];       // string
type Tag = Stream["tags"][number];                 // string
type IdOrTags = Stream["id" | "tags"];             // string | readonly string[]
```

Indexing an array or tuple type with `number` gives the element type. That is the `(typeof LIST)[number]` pattern from the literal types lesson.

## Putting them together

A constant table drives both run-time behaviour and types:

```ts
const BADGES = {
  broadcaster: { label: "Broadcaster", rank: 3 },
  moderator: { label: "Moderator", rank: 2 },
  vip: { label: "VIP", rank: 1 },
} as const;

type BadgeId = keyof typeof BADGES;                          // "broadcaster" | "moderator" | "vip"
type BadgeLabel = (typeof BADGES)[BadgeId]["label"];         // "Broadcaster" | "Moderator" | "VIP"

function rank(badge: BadgeId): number {
  return BADGES[badge].rank;
}
```

Add a badge to the object and both types update. There is nothing to keep in sync by hand.

## Assignment

1. Read the Handbook pages on [keyof](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html), [typeof](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) and [indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html).
2. Given a typed GraphQL-style response type with nested objects and arrays, extract the type of a single item three levels deep using only indexed access.
3. Write a `const THEME = { ... } as const` object and derive a `ThemeColor` union of its colour names. Use it in a function signature.
