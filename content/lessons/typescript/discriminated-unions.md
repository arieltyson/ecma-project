---
title: Discriminated Unions and Exhaustiveness
summary: Model states that cannot coexist as one union with a tag field, and make the compiler find every place a new state must be handled.
minutes: 25
objectives:
  - Model mutually exclusive states as a discriminated union.
  - Narrow a discriminated union with switch and equality.
  - Enforce exhaustive handling with never and satisfies.
  - Replace boolean flag soup with a single state field.
quiz:
  - question: What makes a union "discriminated"?
    options:
      - Every member has a common property with a different literal type.
      - Every member is an interface.
      - The union has exactly two members.
    answer: 0
    explanation: The shared literal property (often `status`, `type` or `kind`) lets TypeScript narrow to exactly one member when you compare it.
  - question: In an exhaustive `switch`, why assign the value to a `never` variable in the default case?
    options:
      - To silence unused variable warnings.
      - So that adding a new member to the union produces a compile error at that line.
      - To make the switch faster.
    answer: 1
    explanation: If every case is handled, the value's type in `default` is `never`. A new, unhandled member makes it that member's type, which is not assignable to `never`.
  - question: "A request state is `{ loading: boolean; error?: Error; data?: Stream[] }`. What is the main problem?"
    options:
      - It allows impossible combinations, such as loading with an error and data at the same time.
      - It uses too much memory.
      - Optional properties are not allowed in state.
    answer: 0
    explanation: Independent flags allow states that should never exist. A discriminated union with one member per real state makes them unrepresentable.
resources:
  - title: TypeScript Handbook, Discriminated unions
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  - title: TypeScript Handbook, Exhaustiveness checking
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
---

Most UI code is about states: a request is loading, has failed or has data; a stream is live, offline or hosting another channel. Discriminated unions are how TypeScript models states that cannot happen at the same time. They are the single most useful pattern in this course.

## The problem with flags

```ts
interface RequestState {
  loading: boolean;
  error?: Error;
  data?: string[];
}
```

This type allows eight combinations, and most of them are nonsense: loading *and* failed, failed *and* has data. Every component that reads it has to guess which flag wins.

## One field, one state

```ts
type Request<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: Error }
  | { readonly status: "success"; readonly data: T };
```

Now only four states exist, and each carries exactly the data that belongs to it. `status` is the **discriminant**: a property every member has, with a different literal type in each.

## Narrowing on the tag

Comparing the discriminant narrows to one member:

```ts
type Request<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: Error }
  | { readonly status: "success"; readonly data: T };

function render(request: Request<string[]>): string {
  switch (request.status) {
    case "idle":
      return "Search for a channel";
    case "loading":
      return "Loading…";
    case "error":
      return request.error.message; // error exists here
    case "success":
      return request.data.join(", "); // data exists here
  }
}
```

There is no `default` and no trailing `return`, yet `noImplicitReturns` is satisfied: TypeScript knows the four cases cover every member.

## Exhaustiveness

When someone adds a fifth state, you want every `switch` that ignores it to fail to compile. Assign the value to `never` in the default branch:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    default:
      return assertNever(shape);
  }
}
```

If you add `{ kind: "triangle"; ... }` to `Shape`, `shape` in the default branch has the triangle type, which is not assignable to `never`, and the call is a compile error pointing at exactly the switch you need to update. The throw also protects you at run time against data that does not match its type.

### Exhaustive lookups

For mapping each state to a value, an object with `satisfies Record<...>` is shorter than a switch and just as exhaustive:

```ts
type StreamState = "live" | "offline" | "hosting";

const BADGE = {
  live: "LIVE",
  offline: "Offline",
  hosting: "Hosting",
} as const satisfies Record<StreamState, string>;
```

## Designing with unions

A good rule: **if two fields only make sense together, they belong in the same union member.** This is often summarised as *make illegal states unrepresentable*. It removes whole categories of `undefined` checks, because the data is only reachable in the branch where it exists.

You will use this pattern for request state in React, for reducer actions, for GraphQL results and for route definitions.

## Assignment

1. Read the Handbook sections on [discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) and [exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).
2. Model a chat message as a union of `"text"`, `"emote"`, `"system"` and `"deleted"` messages, each with only the fields it needs.
3. Write `renderMessage(message: ChatMessage): string` with an exhaustive switch. Add a fifth kind, `"announcement"`, and fix the compile error it causes.
