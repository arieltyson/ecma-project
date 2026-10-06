---
title: Unions and Narrowing
summary: Describe values that can be one of several types, and let control flow prove which one you have.
minutes: 25
objectives:
  - Write union types and know which operations they allow.
  - Narrow with typeof, truthiness, equality, in and instanceof.
  - Write type predicates and assertion functions.
  - Know when TypeScript infers a type predicate for you.
quiz:
  - question: "Given `value: string | number`, which call compiles without narrowing?"
    options:
      - "`value.toUpperCase()`"
      - "`value.toFixed()`"
      - "`value.toString()`"
    answer: 2
    explanation: On a union you may only use members that every type in it has. Both strings and numbers have `toString`.
  - question: "Why is `if (count)` a risky way to check that `count: number | undefined` is present?"
    options:
      - It does not narrow at all.
      - It also rejects `0`, which is a valid count.
      - It throws when count is undefined.
    answer: 1
    explanation: Truthiness narrowing treats `0`, `""` and `NaN` as missing. Compare with `!== undefined` or use `??` when zero or empty strings are meaningful.
  - question: What does the return type `value is Channel` mean?
    options:
      - The function returns a Channel.
      - When the function returns true, the argument is a Channel in the calling code.
      - The function throws if the value is not a Channel.
    answer: 1
    explanation: A type predicate connects a boolean result to a narrowing. An assertion function, `asserts value is Channel`, is the throwing variant.
  - question: In `if ("bitrate" in media)`, what does the check narrow?
    options:
      - It narrows `media` to the union members that declare a `bitrate` property.
      - Nothing, because `in` is not a type guard.
      - It narrows `media` to `object`.
    answer: 0
    explanation: The `in` operator narrows unions by property presence. It is most useful when the members do not share a tag field.
resources:
  - title: TypeScript Handbook, Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - title: TypeScript 5.5, inferred type predicates
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates
---

A union type says a value is one of several types: `string | number`, `Channel | undefined`. On its own a union only lets you do what every member allows. **Narrowing** is how you get the rest: TypeScript follows your `if` statements, `return`s and `switch`es and refines the type in each branch.

## Narrowing operators

```ts
function describe(value: string | number | readonly string[] | null) {
  if (value === null) return "nothing";        // equality
  if (typeof value === "string") return value; // typeof
  if (typeof value === "number") return value.toFixed(1);
  return value.join(", ");                     // what is left: readonly string[]
}
```

After each `return`, the remaining code only sees the types that were not handled. That is **control flow analysis**, and it is what makes unions pleasant to use.

| Check | Narrows by |
| --- | --- |
| `typeof x === "string"` | primitive type (`"string"`, `"number"`, `"bigint"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`) |
| `x === null`, `x !== undefined` | exact value |
| `if (x)` | truthiness; careful with `0` and `""` |
| `"key" in x` | property presence |
| `x instanceof Date` | prototype chain (classes only) |
| `Array.isArray(x)` | array versus not |

> [!WARNING]
> `typeof null` is `"object"`. Check for `null` before relying on `typeof x === "object"`.

## in

When union members are object types without a shared tag, `in` tells them apart:

```ts
interface Video {
  url: string;
  bitrate: number;
}
interface Clip {
  url: string;
  durationSeconds: number;
}

function details(media: Video | Clip): string {
  if ("bitrate" in media) return `${media.bitrate} kbps`;
  return `${media.durationSeconds}s`;
}
```

## Type predicates

Wrap a check in a function and return `value is T` to make it reusable:

```ts
interface Channel {
  login: string;
  followers: number;
}

function isChannel(value: unknown): value is Channel {
  return (
    typeof value === "object" &&
    value !== null &&
    "login" in value &&
    typeof value.login === "string" &&
    "followers" in value &&
    typeof value.followers === "number"
  );
}

const data: unknown = JSON.parse('{"login":"lumen","followers":3}');
if (isChannel(data)) {
  console.log(data.login); // data: Channel
}
```

The predicate is a promise you make; TypeScript trusts it. A wrong predicate is a bug the compiler cannot catch, so keep them small and tested.

### Inferred predicates

Since TypeScript 5.5, simple arrow functions get a predicate inferred for them. That makes `filter` narrow:

```ts
const maybe: (string | undefined)[] = ["a", undefined, "b"];
const present = maybe.filter((x) => x !== undefined); // string[]
```

## Assertion functions

An assertion function throws instead of returning `false`. After a call, the argument is narrowed for the rest of the scope:

```ts
function assertDefined<T>(value: T, name: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${name} is missing`);
  }
}

const root: HTMLElement | null = document.getElementById("root");
assertDefined(root, "#root");
root.append("ready"); // root: HTMLElement
```

## Assignment

1. Read the Handbook's [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) chapter.
2. Write `parseViewerCount(input: string | number | null): number` that returns `0` for `null`, parses strings with `Number.parseInt` and returns `0` for strings that are not numbers.
3. Write a type predicate `isStringArray(value: unknown): value is string[]` and use it to narrow the result of `JSON.parse`.
