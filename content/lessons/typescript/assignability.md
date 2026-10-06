---
title: any, unknown, never and Assignability
summary: The top and bottom types, what "assignable" means, variance, and why any is a hole in the type system.
minutes: 25
objectives:
  - Explain the difference between any and unknown.
  - Use never for impossible values and exhaustive checks.
  - Reason about assignability as a subset relation.
  - Describe covariance and contravariance with examples.
quiz:
  - question: What can you do with a value of type `unknown` without narrowing it?
    options:
      - Call methods on it.
      - Pass it to a parameter of type `unknown` or compare it.
      - Read any property.
    answer: 1
    explanation: "`unknown` accepts every value but allows almost no operations until you narrow it. That makes it the safe choice for data whose type you do not know yet."
  - question: Which statement about `any` is true?
    options:
      - It is the same as `unknown`.
      - It turns off checking for every value it touches, and it spreads to the results of operations on it.
      - It is an error under `strict`.
    answer: 1
    explanation: "`any` is assignable to and from everything. A property read from an `any` is also `any`, so one `any` can silently disable checks far from where it started."
  - question: "If `Dog` is assignable to `Animal`, which is true under `strictFunctionTypes`?"
    options:
      - "`(a: Dog) => void` is assignable to `(a: Animal) => void`."
      - "`(a: Animal) => void` is assignable to `(a: Dog) => void`."
      - Neither is assignable to the other.
    answer: 1
    explanation: Parameters are contravariant. A function that can handle any Animal can safely be used where a function handling Dogs is expected, but not the other way round.
resources:
  - title: TypeScript Handbook, Type Compatibility
    url: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
  - title: TypeScript 4.7, variance annotations
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#optional-variance-annotations-for-type-parameters
---

"Type A is assignable to type B" is the question the checker answers millions of times per build. Thinking of types as **sets of values** makes the rules predictable: A is assignable to B when every value of A is also a value of B.

## Types as sets

- `"live"` is a set with one value. It is a subset of `string`.
- `"live" | "offline"` is the union of two sets.
- `{ login: string }` is the set of all objects that have a string `login`, including those with extra properties.
- `unknown` is the set of all values: the **top type**.
- `never` is the empty set: the **bottom type**.

Since the empty set is a subset of every set, `never` is assignable to everything. Since every set is a subset of `unknown`, everything is assignable to `unknown`.

## unknown

Use `unknown` for values you have not checked yet: parsed JSON, `catch` variables, message events, storage.

```ts
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong";
}

try {
  JSON.parse("{");
} catch (error) {
  console.error(errorMessage(error)); // error: unknown under strict
}
```

## any

`any` is not a set. It switches checking off: it is assignable to everything and everything is assignable to it, and anything you read from it is `any` too.

```ts
const data: any = JSON.parse('{"followers":"many"}');
const total: number = data.followers + 1; // compiles; total is "many1" at run time
```

Treat every `any` as a bug to fix. Lint rules can ban it; `unknown` plus narrowing is almost always the replacement. Watch for `any` arriving from untyped libraries, `JSON.parse`, and `response.json()`, all of which return `any`.

## never

`never` has three everyday uses:

1. **Exhaustiveness**: the leftover type after handling every union member (see [discriminated unions](/lessons/typescript/discriminated-unions/)).
2. **Functions that never return**: they always throw or loop forever.
3. **Filtering** in conditional and mapped types, where `never` disappears from unions.

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

## Variance

How does assignability of `A` and `B` carry over to types built from them?

- **Covariant** (same direction): if `"live"` is assignable to `string`, then `readonly "live"[]` is assignable to `readonly string[]`. Readonly containers and return types are covariant.
- **Contravariant** (opposite direction): function **parameters**. A handler for any `string` can stand in where a handler for `"live"` is expected, not the reverse.

```ts
type Handler<T> = (value: T) => void;

const handleAny: Handler<string> = (value) => console.log(value);
const handleLive: Handler<"live"> = handleAny; // fine: contravariant

declare const onlyLive: Handler<"live">;
// @ts-expect-error: this handler cannot accept every string
const broken: Handler<string> = onlyLive;
```

Mutable arrays are a known soundness gap: TypeScript treats `string[]` as covariant, so a `"live"[]` can be passed where `string[]` is expected and then have `"anything"` pushed into it. Accepting `readonly` arrays in parameters avoids the problem.

## Assignment

1. Read the Handbook's [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).
2. Find every `any` in a project you have written (try searching for `: any` and `as any`) and replace each with `unknown` plus narrowing, or a precise type.
3. Write a short example that shows the mutable array soundness gap, then fix it by changing the parameter to `readonly`.
