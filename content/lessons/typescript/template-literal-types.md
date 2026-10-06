---
title: Template Literal Types
summary: Build and parse string types with the same syntax as template literals.
minutes: 25
objectives:
  - Build string literal unions with template literal types.
  - Use the intrinsic string manipulation types.
  - Parse strings at the type level with infer.
  - Know the limits of type-level string work.
quiz:
  - question: "A template literal type combines `\"sm\" | \"lg\"` with `\"red\" | \"blue\"`, separated by a hyphen. What does it produce?"
    options:
      - "`string`"
      - "A union of four strings: sm-red, sm-blue, lg-red and lg-blue."
      - "`\"sm-red\"` only."
    answer: 1
    explanation: Template literal types distribute over unions in every position and form the cross product.
  - question: What does `Uppercase<"live">` give?
    options:
      - "`\"LIVE\"`"
      - "`string`"
      - "`\"Live\"`"
    answer: 0
    explanation: "`Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` are built into the compiler and transform literal types."
  - question: "`Param<S>` matches S against a template that starts with a colon followed by `${infer P}`, and returns P. What is `Param<\":login\">`?"
    options:
      - "`\":login\"`"
      - "`\"login\"`"
      - "`never`"
    answer: 1
    explanation: The pattern matches the leading colon and infers the rest of the string into P.
resources:
  - title: TypeScript Handbook, Template Literal Types
    url: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
---

Template literal types use template string syntax in a type position. They build string unions out of other string types, and with `infer` they can pull strings apart.

## Building strings

```ts
type Size = "sm" | "md" | "lg";
type Tone = "neutral" | "accent";

type ButtonClass = `button-${Size}-${Tone}`;
// "button-sm-neutral" | "button-sm-accent" | "button-md-neutral" | ...

type EventName<T extends string> = `on${Capitalize<T>}`;
type Handlers = EventName<"follow" | "raid">; // "onFollow" | "onRaid"
```

Unions in any position produce every combination. Keep the inputs small; the result grows multiplicatively.

## Intrinsic string types

Four built-ins transform literal types: `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize`. They are implemented inside the compiler, not in a `.d.ts` file.

## Patterns with non-literal parts

A template can contain `string`, `number` or `bigint`, which makes it a pattern rather than a fixed set:

```ts
type CssLength = `${number}px` | `${number}rem`;
type ChannelUrl = `https://lumen.tv/${string}`;

const gap: CssLength = "1.5rem";
// @ts-expect-error: "1.5em" does not match the pattern
const bad: CssLength = "1.5em";
```

## Parsing with infer

`infer` inside a template literal matches part of a string:

```ts
type Trim<S extends string> = S extends ` ${infer Rest}`
  ? Trim<Rest>
  : S extends `${infer Rest} `
    ? Trim<Rest>
    : S;

type Split<S extends string, D extends string> = S extends `${infer Head}${D}${infer Tail}`
  ? [Head, ...Split<Tail, D>]
  : [S];

type T = Trim<"  live  ">;           // "live"
type Parts = Split<"a/b/c", "/">;    // ["a", "b", "c"]
```

When `infer` is followed by more template text, it matches as little as possible up to that text. The Type-Safe Route Builder project at the end of this course uses this technique to extract `:param` names from a path pattern, so `"/channels/:login/clips/:clipId"` produces a params type with `login` and `clipId`.

## Limits

Type-level string parsing is powerful but slow to compile and hard to read. Recursion has a depth limit (around 1000 levels for tail-recursive conditional types, less otherwise). Use it at the edges of an API, where it improves every call site, and keep it out of everyday domain types.

## Assignment

1. Read the Handbook's [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html).
2. Write `Join<T extends readonly string[], D extends string>`, the inverse of `Split`.
3. Write `CamelCase<S>` that turns `"stream-key-reset"` into `"streamKeyReset"`.
