---
title: Mapped Types and Key Remapping
summary: Build a new object type by transforming every property of another, with modifiers, key remapping and filtering.
minutes: 25
objectives:
  - Write mapped types over keyof T and over unions.
  - Add and remove readonly and optional modifiers.
  - Rename and filter keys with as clauses.
  - Recognise Partial, Required, Readonly, Record and Pick as mapped types.
quiz:
  - question: "What does `{ -readonly [K in keyof T]-?: T[K] }` produce?"
    options:
      - A copy of T with every property readonly and optional.
      - A copy of T with readonly and optional removed from every property.
      - A union of T's property types.
    answer: 1
    explanation: The minus sign removes a modifier. This is the built-in `Required` combined with removing `readonly`.
  - question: How do you drop keys from a mapped type?
    options:
      - Remap them to `never` in an `as` clause.
      - Map their value to `undefined`.
      - Use `delete` in the type.
    answer: 0
    explanation: A key remapped to `never` is omitted. Combined with a conditional type, this filters properties by name or value type.
  - question: Which built-in utility type is NOT a mapped type?
    options:
      - "`Partial<T>`"
      - "`Pick<T, K>`"
      - "`Exclude<T, U>`"
    answer: 2
    explanation: "`Exclude` is a distributive conditional type over a union. The other two map over keys."
resources:
  - title: TypeScript Handbook, Mapped Types
    url: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
---

A mapped type builds an object type by iterating over a set of keys. It is the type-level equivalent of `Object.fromEntries(Object.entries(obj).map(...))`.

## The shape

```ts
type Flags<T> = {
  [K in keyof T]: boolean;
};

interface Features {
  chat: string;
  clips: number;
}

type FeatureFlags = Flags<Features>; // { chat: boolean; clips: boolean }
```

`[K in keyof T]` iterates over every key; the right side is the new property type, which can use `K` and `T[K]`.

## Modifiers

Add `readonly` or `?` with a `+` (implied) or remove them with `-`:

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

Mapped types over `keyof T` are **homomorphic**: they keep each property's original modifiers unless you change them, and they map over arrays and tuples element by element.

## Mapping over a union

The keys do not have to come from `keyof`. Any union of string, number or symbol literals works:

```ts
type Theme = "light" | "dark";
type Palette = { [K in Theme]: string }; // same as Record<Theme, string>
```

## Key remapping with as

An `as` clause renames each key. Template literal types (next lesson) make this expressive:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Player {
  volume: number;
  muted: boolean;
}

type PlayerGetters = Getters<Player>;
// { getVolume: () => number; getMuted: () => boolean }
```

`string & K` keeps only string keys, because `Capitalize` needs a string.

### Filtering

Remap a key to `never` to drop it:

```ts
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface Stream {
  id: string;
  title: string;
  viewers: number;
  live: boolean;
}

type TextFields = PickByValue<Stream, string>; // { id: string; title: string }
```

## Built-ins

Many utility types are short mapped types:

```ts nocheck
type Partial<T> = { [P in keyof T]?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };
```

Reading these definitions is the fastest way to understand them. Cmd-click any of them in your editor to jump to `lib.es5.d.ts`.

## Assignment

1. Read the Handbook's [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html).
2. Write `Nullable<T>`, which allows `null` for every property.
3. Write `EventHandlers<T>` that turns `{ follow: { login: string }; raid: { viewers: number } }` into `{ onFollow: (payload: { login: string }) => void; onRaid: (payload: { viewers: number }) => void }`.
