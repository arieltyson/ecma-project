---
title: Generics
summary: Write functions, types and classes that work over many types while keeping the relationship between input and output.
minutes: 30
objectives:
  - Write generic functions and let TypeScript infer type arguments.
  - Constrain type parameters with extends.
  - Write generic interfaces, type aliases and classes.
  - Recognise when a type parameter is unnecessary.
quiz:
  - question: "Why is `function first<T>(items: readonly T[]): T | undefined` better than `function first(items: readonly unknown[]): unknown`?"
    options:
      - It runs faster.
      - The caller gets back the element type they passed in, instead of unknown.
      - It accepts more kinds of arguments.
    answer: 1
    explanation: A type parameter links the input type to the output type. With `unknown`, that relationship is lost and every caller has to narrow the result again.
  - question: "What does `<T extends { id: string }>` allow inside the function?"
    options:
      - Reading `value.id` on a value of type T.
      - Assigning any object to T.
      - Calling T as a constructor.
    answer: 0
    explanation: A constraint is a lower bound on what T can be. Inside the function you may use any member the constraint guarantees.
  - question: "`function log<T>(value: T): void { console.log(value) }`. What is wrong with it?"
    options:
      - Nothing.
      - "T appears only once, so it adds nothing; `value: unknown` says the same thing more simply."
      - Generic functions cannot return void.
    answer: 1
    explanation: A type parameter is only useful when it relates two or more positions (parameters, return type). Used once, it is noise.
resources:
  - title: TypeScript Handbook, Generics
    url: https://www.typescriptlang.org/docs/handbook/2/generics.html
  - title: TypeScript Handbook, guidelines for writing good generic functions
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html#guidelines-for-writing-good-generic-functions
---

A generic is a type with a parameter. Where a function parameter stands for a value supplied by the caller, a **type parameter** stands for a type supplied by the caller, usually inferred from the arguments. Generics let you write one function that works for many types without losing track of which type it is working with.

## A generic function

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

const login = first(["lumen", "nova"]); // string | undefined
const viewers = first([40, 12]);        // number | undefined
```

You rarely write `first<string>(...)`. TypeScript infers `T` from the argument. Explicit type arguments are for cases where there is nothing to infer from, such as an empty array or a function whose type parameter only appears in its return type.

## Relating inputs and outputs

The power of a generic is the relationship it records. Here the result keeps the exact key type:

```ts
function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const group = groups.get(k);
    if (group) group.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

interface Stream {
  title: string;
  game: "chess" | "speedrun";
}

declare const streams: Stream[];
const byGame = groupBy(streams, (s) => s.game); // Map<"chess" | "speedrun", Stream[]>
```

`PropertyKey` is the built-in `string | number | symbol`.

## Constraints

Inside a generic function, you can only use what the constraint guarantees. `extends` sets that guarantee:

```ts
function byId<T extends { readonly id: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

const channels = byId([{ id: "1", login: "lumen" }]); // Map<string, { id: string; login: string }>
```

The result keeps the full item type (including `login`), which a non-generic `{ id: string }` parameter would have thrown away.

## Generic types

Interfaces, type aliases and classes take type parameters too:

```ts
interface Page<T> {
  readonly items: readonly T[];
  readonly cursor: string | null;
}

type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

class Cache<K, V> {
  readonly #entries = new Map<K, V>();

  get(key: K): V | undefined {
    return this.#entries.get(key);
  }

  set(key: K, value: V): void {
    this.#entries.set(key, value);
  }
}

const cache = new Cache<string, Page<string>>();
```

`E = Error` is a **default**: `Result<number>` means `Result<number, Error>`.

## When not to use a generic

A type parameter that appears only once relates nothing:

```ts
// Unnecessary: T is used once.
function logOnce<T>(value: T): void {
  console.log(value);
}

// Clearer.
function log(value: unknown): void {
  console.log(value);
}
```

The Handbook's rule of thumb: **if a type parameter only appears in one location, strongly reconsider if you actually need it.** Similarly, prefer `T[]` constrained items over a parameter for the whole array, and push type parameters down to the most specific place you can.

## Assignment

1. Read the Handbook's [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) chapter and its [guidelines for good generic functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#guidelines-for-writing-good-generic-functions).
2. Write `last<T>(items: readonly T[]): T | undefined` and `partition<T>(items: readonly T[], test: (item: T) => boolean): [T[], T[]]`.
3. Write a generic `Result<T, E>` type and a function `tryParse<T>(json: string, check: (value: unknown) => value is T): Result<T, Error>`.
