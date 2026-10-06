---
title: What's New in ES2022 to ES2025
summary: The recent additions to JavaScript that change everyday code, from at() and structuredClone to Set methods, iterator helpers and Promise.try.
minutes: 25
objectives:
  - Use non-mutating array methods and at().
  - Group data with Object.groupBy and Map.groupBy.
  - Use the new Set methods for unions, intersections and differences.
  - Know how features reach the language through TC39 stages.
quiz:
  - question: What does `channels.toSorted(byViewers)` do differently from `channels.sort(byViewers)`?
    options:
      - It sorts in reverse.
      - It returns a new sorted array and leaves the original unchanged.
      - It sorts strings only.
    answer: 1
    explanation: toSorted, toReversed, toSpliced and with are the non-mutating versions, which suit React state and readonly arrays.
  - question: What does `Object.groupBy(streams, (s) => s.category)` return?
    options:
      - An array of arrays.
      - An object whose keys are categories and values are arrays of streams.
      - A Map.
    answer: 1
    explanation: Object.groupBy returns a null-prototype object. Map.groupBy returns a Map, which allows non-string keys.
  - question: How does a proposal become part of ECMAScript?
    options:
      - A browser ships it.
      - It moves through TC39 stages 0 to 4; stage 4 means it is finished and included in the next yearly edition.
      - Anyone can publish it on npm.
    answer: 1
    explanation: Stage 4 requires two shipping implementations and tests. Each June's edition, such as ES2025, includes everything that reached stage 4 that year.
resources:
  - title: TC39 finished proposals
    url: https://github.com/tc39/proposals/blob/main/finished-proposals.md
  - title: MDN, JavaScript reference
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
---

JavaScript gains features every year. ECMAScript editions are named by year: each June, everything that reached **stage 4** in the TC39 process becomes part of that year's edition. This lesson collects the recent additions that change everyday front-end code.

## Arrays

```ts
const viewers = [40, 1204, 12, 380];

viewers.at(-1);                       // 380: negative indexes count from the end
viewers.findLast((v) => v > 100);     // 380
viewers.toSorted((a, b) => b - a);    // [1204, 380, 40, 12], viewers unchanged
viewers.toReversed();                 // new reversed copy
viewers.with(0, 41);                  // copy with index 0 replaced
viewers.toSpliced(1, 1);              // copy with one element removed
```

The `to*` and `with` methods never mutate, which makes them the right choice for React state and `readonly` arrays.

## Objects and grouping

```ts
interface Stream {
  readonly title: string;
  readonly category: string;
  readonly viewers: number;
}

declare const streams: readonly Stream[];

const byCategory = Object.groupBy(streams, (s) => s.category);
// { chess: Stream[] | undefined, speedrun: ... }

const bySize = Map.groupBy(streams, (s) => (s.viewers > 1000 ? "big" : "small"));

Object.hasOwn(byCategory, "chess"); // own property check, safer than hasOwnProperty
const copy = structuredClone({ nested: { date: new Date() } }); // deep copy, keeps Dates, Maps, Sets
```

## Sets

```ts
const following = new Set(["lumen", "nova", "orbit"]);
const live = new Set(["nova", "orbit", "zephyr"]);

following.intersection(live);        // Set { "nova", "orbit" }: followed and live
following.difference(live);          // Set { "lumen" }: followed, offline
following.union(live);               // all four
following.symmetricDifference(live); // in exactly one
following.isSubsetOf(live);          // false
following.isDisjointFrom(new Set(["x"])); // true
```

## Iterators

Iterator helpers (`map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray` and more) work lazily on any iterator; see [Iterators and Generators](/lessons/javascript/iterators-and-generators/).

## Promises

```ts
const { promise, resolve, reject } = Promise.withResolvers<number>(); // ES2024
const result = await Promise.try(() => JSON.parse("1") as number);     // ES2025
void promise; void resolve; void reject; void result;
```

## Strings and regular expressions

```ts
"  lumen ".trim();
"a-b-c".replaceAll("-", "/");
RegExp.escape("1.5x (beta)");        // escapes characters special in regex
const date = /(?<year>\d{4})-(?<month>\d{2})/v.exec("2026-10");
date?.groups?.["year"];              // "2026"
```

The `v` flag enables set notation and better Unicode handling in character classes.

## Classes and modules

- **Private fields and methods** (`#count`), **static blocks** and class fields (ES2022).
- **Top-level await** (ES2022) and **JSON modules with import attributes** (ES2025).
- **Error cause** (ES2022): `new Error(message, { cause })`.

## On the way

Several proposals are at stage 3 or have recently reached stage 4 and are shipping in browsers. Check current support before using them in production:

- **Explicit resource management**: `using` declarations that dispose of resources at the end of a scope.
- **Temporal**: a modern date and time API replacing `Date`.
- **`Array.fromAsync`**, **`Error.isError`**, **`Math.sumPrecise`**, and base64 and hex methods on `Uint8Array`.

TypeScript supports features before they are finished, so `lib` and `target` settings decide what you can use. MDN's compatibility tables and Baseline labels show what browsers support.

## Assignment

1. Skim the TC39 [finished proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md) for 2022 to 2025.
2. Rewrite a piece of your code that mutates arrays to use the non-mutating methods.
3. Given followed channels and live channels, use Set methods to compute "followed and live", "followed and offline" and "live, not followed but in a followed category".
