---
title: Everyday Types and Inference
summary: The primitive, array, object and function types you use daily, and when to let TypeScript infer them.
minutes: 20
objectives:
  - Annotate primitives, arrays, tuples, objects and functions.
  - Know where inference works and where an annotation earns its place.
  - Use optional properties, readonly and union types with null.
  - Explain widening for let versus const.
quiz:
  - question: What type does TypeScript infer for `let status = "live"`?
    options:
      - "`\"live\"`"
      - "`string`"
      - "`unknown`"
    answer: 1
    explanation: A `let` can be reassigned, so its literal type widens to `string`. A `const` keeps the literal type `"live"`.
  - question: Where is an explicit annotation most valuable?
    options:
      - On every local variable.
      - On function parameters and exported function return types.
      - Never; inference always does better.
    answer: 1
    explanation: Parameters cannot be inferred from a declaration, and a declared return type stops an accidental change inside the function from silently changing its public contract.
  - question: What is the difference between `readonly string[]` and `string[]`?
    options:
      - There is none at run time or compile time.
      - The readonly type has no mutating methods such as push and sort, so the compiler stops you changing the array.
      - A readonly array is frozen at run time.
    answer: 1
    explanation: "`readonly` is a compile-time promise. It removes mutating methods from the type; it does not call `Object.freeze`."
resources:
  - title: TypeScript Handbook, Everyday Types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
  - title: TypeScript Handbook, Object Types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html
---

Most of the types you write are simple. This lesson covers them, and the more important skill: knowing when *not* to write a type because TypeScript can work it out.

## Primitives

```ts
const login: string = "lumen";
const viewers: number = 1204;
const isLive: boolean = true;
const id: bigint = 9007199254740993n;
const key: symbol = Symbol("key");
```

Use the lowercase names. `String`, `Number` and `Boolean` are the wrapper object types and almost never what you want.

## Inference

TypeScript infers a type from every initialiser, so the annotations above are redundant. Prefer:

```ts
const login = "lumen";   // "lumen"
let viewers = 1204;      // number
const tags = ["chess"];  // string[]
```

Annotate where inference cannot help or where a type is a contract:

- **Function parameters**, always.
- **Return types of exported functions**, so a change inside the function cannot silently change what callers get.
- **Empty collections**, which would otherwise infer `never[]` or `any[]`.

```ts
export function formatViewers(count: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(count);
}

const queue: string[] = [];
```

## Widening

`const` bindings keep literal types; `let` bindings widen them, because the variable could change later:

```ts
const a = "live"; // type "live"
let b = "live";   // type string
```

The next lesson shows how to keep literal types when you want them.

## Arrays and tuples

```ts
const scores: number[] = [3, 1, 2];
const names: readonly string[] = ["a", "b"];

// A tuple: fixed length, a type per position.
const entry: [login: string, viewers: number] = ["lumen", 1204];
const [who, count] = entry;
```

`readonly` removes `push`, `sort` and the other mutating methods from the type. Accept `readonly T[]` in function parameters whenever you do not mutate, so callers can pass either kind.

## Objects

Describe an object with a type alias or an interface (the difference is covered in [Interfaces, Type Aliases and Structural Typing](/lessons/typescript/object-types/)):

```ts
interface Stream {
  readonly id: string;
  title: string;
  viewers: number;
  game?: string; // optional: may be missing
}

const stream: Stream = { id: "1", title: "Speedrun", viewers: 40 };
```

## null and undefined

With `strictNullChecks`, a value that might be missing must say so:

```ts
function findStream(id: string): Stream | undefined {
  return streams.find((s) => s.id === id);
}

declare const streams: Stream[];
interface Stream {
  readonly id: string;
  title: string;
}

const found = findStream("1");
console.log(found?.title ?? "Offline");
```

Optional chaining (`?.`) and nullish coalescing (`??`) are the everyday tools for these types. Avoid the non-null assertion `found!.title`; it tells the compiler to stop checking without making the value any less missing.

## Functions

```ts
type Formatter = (value: number) => string;

const compact: Formatter = (value) => value.toString(); // value: number

function join(parts: readonly string[], separator = ", "): string {
  return parts.join(separator);
}
```

When a function is assigned to a typed variable or passed as a callback, its parameters are **contextually typed**: inferred from where it is used. That is why `streams.map((s) => s.title)` needs no annotation.

## Assignment

1. Read the Handbook's [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).
2. Write a `Channel` interface for a streaming site with a login, display name, optional bio, follower count and a readonly list of tags.
3. Write `topChannels(channels: readonly Channel[], limit: number): Channel[]` that returns the most followed channels without mutating the input. Hover over every variable in your editor and check its inferred type.
