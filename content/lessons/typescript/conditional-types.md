---
title: Conditional Types and infer
summary: Choose a type based on another type, extract parts of types with infer, and understand distribution over unions.
minutes: 30
objectives:
  - Read and write conditional types.
  - Extract types with infer.
  - Explain distributive conditional types and how to turn distribution off.
  - Know which built-in utility types are conditional types.
quiz:
  - question: "What is `IsString<\"a\" | 1>` given `type IsString<T> = T extends string ? true : false`?"
    options:
      - "`false`"
      - "`true`"
      - "`boolean`"
    answer: 2
    explanation: A conditional type on a naked type parameter distributes over a union. It evaluates to `true | false` for the two members, which is `boolean`.
  - question: "What does `type ElementOf<T> = T extends readonly (infer E)[] ? E : never` give for `string[]`?"
    options:
      - "`string[]`"
      - "`string`"
      - "`never`"
    answer: 1
    explanation: "`infer E` declares a type variable that is filled in by matching. `string[]` matches with `E = string`."
  - question: How do you stop a conditional type distributing over a union?
    options:
      - Wrap both sides in a tuple, as in `[T] extends [string]`.
      - Add `readonly` before T.
      - Use `infer` instead of `extends`.
    answer: 0
    explanation: Distribution only happens when the checked type is a naked type parameter. Wrapping it in a one-element tuple makes the whole union be checked at once.
resources:
  - title: TypeScript Handbook, Conditional Types
    url: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
---

A conditional type picks one of two types based on whether a type is assignable to another: `T extends U ? X : Y`. It is how TypeScript expresses "if" at the type level, and most of the built-in utility types are built from it.

## The shape

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"lumen">; // true
type B = IsString<42>;      // false
```

Read `extends` here as "is assignable to". Conditional types become useful with generics, where `T` is not known until the type is used.

## infer

Inside the `extends` clause, `infer X` declares a type variable that TypeScript fills in by matching. It is pattern matching on types:

```ts
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type Resolved<T> = T extends PromiseLike<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: never[]) => unknown ? A : never;

type E = ElementOf<string[]>;                 // string
type R = Resolved<Promise<number>>;           // number
type F = FirstArg<(login: string, n: number) => void>; // string
```

The built-ins `ReturnType`, `Parameters` and `Awaited` are written this way.

## Distribution

When the checked type is a **naked type parameter** and you pass a union, the conditional type is applied to each member separately and the results are joined:

```ts
type NonNull<T> = T extends null | undefined ? never : T;

type N = NonNull<string | null | undefined>; // string
```

`never` disappears from unions, so returning `never` for some members filters them out. That is exactly how the built-in `NonNullable`, `Exclude` and `Extract` work:

```ts
type State = "live" | "offline" | "hosting";
type NotLive = Exclude<State, "live">; // "offline" | "hosting"
```

### Turning distribution off

Sometimes you want to test the union as a whole. Wrap both sides in a tuple:

```ts
type IsNever<T> = [T] extends [never] ? true : false;

type Yes = IsNever<never>; // true
type No = IsNever<string>; // false
```

Without the tuple, `IsNever<never>` would be `never`: distributing over an empty union produces an empty union.

## Recursive conditional types

Conditional types can refer to themselves, which lets them walk nested structures:

```ts
type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface Settings {
  audio: { volume: number };
}

declare const settings: DeepReadonly<Settings>;
// @ts-expect-error: volume is readonly at every depth
settings.audio.volume = 1;
```

The `[K in keyof T]` part is a mapped type, the subject of the next lesson.

> [!TIP]
> Type-level code is still code. If a conditional type is hard to read, name its parts with intermediate aliases, and test it the way the [Testing and Debugging Types](/lessons/typescript/type-testing/) lesson describes.

## Assignment

1. Read the Handbook's [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html).
2. Write `UnwrapArray<T>`, which gives the element type for arrays and `T` itself otherwise.
3. Write `EventPayload<E, Name>` that, given a union of `{ type: string; payload: unknown }` events, extracts the payload of the event whose type is `Name`. Use `Extract` or `infer`.
