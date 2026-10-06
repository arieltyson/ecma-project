---
title: Literal Types, as const and satisfies
summary: Keep exact values in your types, freeze object shapes with as const, and check a value against a type without losing its precision.
minutes: 20
objectives:
  - Use string, number and boolean literal types in unions.
  - Freeze arrays and objects into readonly literal types with as const.
  - Derive a union type from a constant array.
  - Use satisfies to validate a value while keeping its inferred type.
quiz:
  - question: What is the type of `ROLES` after `const ROLES = ["viewer", "mod"] as const`?
    options:
      - "`string[]`"
      - "`readonly [\"viewer\", \"mod\"]`"
      - "`(\"viewer\" | \"mod\")[]`"
    answer: 1
    explanation: "`as const` makes the array a readonly tuple of its literal values. `(typeof ROLES)[number]` then gives the union `\"viewer\" | \"mod\"`."
  - question: How does `satisfies` differ from a type annotation?
    options:
      - It checks the value against the type but keeps the more specific inferred type.
      - It converts the value to the type at run time.
      - It disables excess property checks.
    answer: 0
    explanation: An annotation replaces the inferred type with the declared one. `satisfies` only checks, so later code still sees the exact keys and literal values.
  - question: Why do literal unions usually replace enums in modern TypeScript?
    options:
      - Enums are slower to type-check.
      - Literal unions are erased completely and work with plain strings from JSON or the DOM.
      - Enums cannot be used in switch statements.
    answer: 1
    explanation: A union of string literals has no runtime footprint, so it works with type stripping, and a plain string from an API can be checked against it directly.
resources:
  - title: TypeScript Handbook, Literal Types
    url: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types
  - title: TypeScript 4.9, the satisfies operator
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator
---

A literal type is a type with exactly one value: `"live"`, `42`, `true`. On their own they are not much use. In unions, they let you describe "one of these specific values" precisely, which is the foundation of most well-typed code.

## Literal unions

```ts
type StreamState = "live" | "offline" | "hosting";

function label(state: StreamState): string {
  return state === "live" ? "Live now" : "Offline";
}

label("live");
// @ts-expect-error: "Live" is not assignable to StreamState
label("Live");
```

This replaces `enum` in modern code. The type disappears at run time, and a plain string from JSON can be compared against it directly.

## as const

Object and array literals widen, because their contents could change:

```ts
const settings = { theme: "dark", volume: 5 };
// { theme: string; volume: number }
```

`as const` tells TypeScript the value will never change, so it keeps every literal and marks everything `readonly`:

```ts
const settings = { theme: "dark", volume: 5 } as const;
// { readonly theme: "dark"; readonly volume: 5 }
```

### A union from a list

The most useful pattern: define the values once, at run time, and derive the type from them. The list can be iterated or validated against; the type stays in sync automatically.

```ts
export const QUALITIES = ["160p", "360p", "720p", "1080p"] as const;
export type Quality = (typeof QUALITIES)[number];
// "160p" | "360p" | "720p" | "1080p"

export function isQuality(value: string): value is Quality {
  return (QUALITIES as readonly string[]).includes(value);
}
```

`(typeof QUALITIES)[number]` reads as "the type of any element of `QUALITIES`". [Type Operators](/lessons/typescript/type-operators/) explains the syntax.

## satisfies

Sometimes you want to check a value against a type *and* keep its precise inferred type. An annotation cannot do both:

```ts
type Theme = "light" | "dark";
type Palette = Record<Theme, string>;

const annotated: Palette = { light: "#fff", dark: "#000" };
annotated.light; // string

const checked = {
  light: "#fff",
  dark: "#000",
} as const satisfies Palette;
checked.light; // "#fff"
```

`satisfies` reports a missing key, an extra key or a wrong value type, exactly like an annotation. But the variable keeps its own type. Combined with `as const` it is the idiomatic way to write configuration objects, route tables and lookup maps.

```ts
type Route = { readonly path: string; readonly title: string };

const ROUTES = {
  home: { path: "/", title: "Home" },
  directory: { path: "/directory", title: "Browse" },
} as const satisfies Record<string, Route>;

type RouteName = keyof typeof ROUTES; // "home" | "directory"
```

With an annotation of `Record<string, Route>`, `RouteName` would have been `string`, and `ROUTES.typo` would compile.

## Assignment

1. Read the release notes section on [the satisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator).
2. Define `const CHAT_MODES = ["everyone", "followers", "subscribers", "emote-only"] as const` and derive a `ChatMode` type from it.
3. Write a `CHAT_MODE_LABELS` object that maps every mode to a display label using `satisfies Record<ChatMode, string>`. Remove one key and read the error. Add an extra key and read that error too.
