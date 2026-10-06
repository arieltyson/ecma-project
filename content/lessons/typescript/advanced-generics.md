---
title: Constraints, Defaults, const Type Parameters and NoInfer
summary: Control how type arguments are inferred, keep literal types, and stop inference from the wrong place.
minutes: 25
objectives:
  - Use keyof constraints to relate one type parameter to another.
  - Keep literal types with const type parameters.
  - Block an inference site with NoInfer.
  - Know how TypeScript picks a type argument from several candidates.
quiz:
  - question: "What does `<K extends keyof T>` express in `function get<T, K extends keyof T>(obj: T, key: K): T[K]`?"
    options:
      - K must be one of T's property names, and the result is that property's type.
      - K must be a string.
      - K and T are the same type.
    answer: 0
    explanation: Constraining one type parameter by another lets the return type depend on exactly which key was passed.
  - question: What does a `const` type parameter change?
    options:
      - It makes the argument readonly at run time.
      - It infers the narrowest literal type for the argument, as if the caller wrote `as const`.
      - It prevents the function from being called twice.
    answer: 1
    explanation: "`function f<const T>(x: T)` called with `[\"a\", \"b\"]` infers `readonly [\"a\", \"b\"]` instead of `string[]`."
  - question: "In `function pick<T extends string>(options: T[], fallback: NoInfer<T>)`, what does NoInfer do?"
    options:
      - It makes `fallback` optional.
      - It stops `fallback` from contributing to the inference of T, so T comes from `options` alone.
      - It removes the type of `fallback`.
    answer: 1
    explanation: Without NoInfer, passing a fallback that is not one of the options would widen T to include it. With NoInfer, it is checked against T instead.
resources:
  - title: TypeScript 5.0, const type parameters
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters
  - title: TypeScript 5.4, the NoInfer utility type
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type
---

Once you write generics regularly, the question shifts from "can I type this?" to "will TypeScript infer what I mean?" This lesson covers the tools for steering inference.

## Relating type parameters

One type parameter can be constrained by another. The classic example reads a property safely:

```ts
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const channel = { login: "lumen", followers: 3, live: true };
const followers = get(channel, "followers"); // number
// @ts-expect-error: "follows" is not a key of channel
get(channel, "follows");
```

`keyof T` is the union of `T`'s keys and `T[K]` is the type at key `K`. Both are explained in [Type Operators](/lessons/typescript/type-operators/).

## How inference chooses

When a type parameter appears in several places, TypeScript collects a candidate from each and picks a common type. Usually that is what you want:

```ts
function pair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

const p = pair(1, 2); // [number, number]
// @ts-expect-error: string is not assignable to number
pair(1, "2");
```

Literal arguments are widened (`1` becomes `number`) unless something asks to keep them.

## const type parameters

Adding `const` to a type parameter infers the argument as if the caller had written `as const`:

```ts
function defineRoutes<const T extends readonly string[]>(paths: T): T {
  return paths;
}

const routes = defineRoutes(["/", "/directory", "/settings"]);
// readonly ["/", "/directory", "/settings"]
type Path = (typeof routes)[number]; // "/" | "/directory" | "/settings"
```

Without `const`, `routes` would be `string[]` and `Path` just `string`. Use it in functions whose whole purpose is to capture literal values: route tables, event names, configuration builders.

## NoInfer

Sometimes one parameter should define the type and another should only be checked against it:

```ts
function choose<T extends string>(options: readonly T[], fallback: NoInfer<T>): T {
  return options[0] ?? fallback;
}

choose(["720p", "1080p"], "720p");
// @ts-expect-error: "4k" is not one of the options
choose(["720p", "1080p"], "4k");
```

Without `NoInfer`, the `"4k"` argument would become another candidate and `T` would widen to `"720p" | "1080p" | "4k"`, accepting the mistake. `NoInfer<T>` is the identity type with one effect: that position is not used for inference.

## Defaults

Type parameters can have defaults, which must come after required parameters:

```ts
interface Event<Name extends string = string, Payload = undefined> {
  readonly name: Name;
  readonly payload: Payload;
}

type Ping = Event<"ping">; // payload: undefined
```

## Assignment

1. Read the release notes for [const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters) and [NoInfer](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type).
2. Write `pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][]`.
3. Write `createStore<const S extends Record<string, unknown>>(initial: S)` returning an object with `get<K extends keyof S>(key: K): S[K]` and `set<K extends keyof S>(key: K, value: S[K]): void`. Check that `set("theme", "blue")` fails when `theme` was initialised as `"dark"` and decide whether that is what you want.
