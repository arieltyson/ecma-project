---
title: Testing and Debugging Types
summary: Write tests for types, read compiler errors efficiently, and find out what TypeScript inferred.
minutes: 20
objectives:
  - Assert types with @ts-expect-error and expectTypeOf.
  - Inspect inferred types in the editor and with helper types.
  - Read long assignability errors from the bottom up.
  - Know the usual causes of slow type-checking.
quiz:
  - question: Why prefer `@ts-expect-error` to `@ts-ignore` in tests of types?
    options:
      - It is shorter.
      - It fails if the line below stops producing an error, so the test catches a regression that makes bad code compile.
      - It works in JavaScript files.
    answer: 1
    explanation: "`@ts-ignore` silently passes either way. `@ts-expect-error` is an assertion that an error exists."
  - question: In a long "not assignable" error, where is the useful part usually?
    options:
      - The first line.
      - The last, most indented lines, which name the specific property that does not match.
      - The error code.
    answer: 1
    explanation: TypeScript explains the mismatch from the outside in. The innermost lines point at the actual property or element that differs.
  - question: What does `expectTypeOf(value).toEqualTypeOf<T>()` check?
    options:
      - That value equals T at run time.
      - That the static type of value is exactly T, at compile time.
      - That value is an instance of T.
    answer: 1
    explanation: The assertion is evaluated by the type checker. At run time it does nothing; the test fails during type-checking if the types differ.
resources:
  - title: Vitest, testing types
    url: https://vitest.dev/guide/testing-types
  - title: TypeScript Handbook, triple-slash and ts-expect-error comments
    url: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#-ts-expect-error-comments
---

Complex types are code, and code needs tests. This lesson covers how to test types, how to see what the compiler inferred, and how to read its error messages.

## Asserting errors

`// @ts-expect-error` suppresses the error on the next line, and is itself an error if there is nothing to suppress. That makes it a test:

```ts
type Login = string & { readonly __brand: "Login" };

function channelUrl(login: Login): string {
  return `/channels/${login}`;
}

// @ts-expect-error: plain strings must not be accepted
channelUrl("lumen");
```

If someone loosens `channelUrl` to accept `string`, this line starts failing. Every example in this curriculum uses the same technique, checked in CI.

## Asserting exact types

Vitest's `expectTypeOf` asserts a static type. Put type tests in files ending `.test-d.ts`, or call them in ordinary tests:

```ts
import { expectTypeOf, test } from "vitest";

function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

test("first keeps the element type", () => {
  expectTypeOf(first(["a"])).toEqualTypeOf<string | undefined>();
  expectTypeOf(first<number>).parameter(0).toEqualTypeOf<readonly number[]>();
});
```

`toEqualTypeOf` requires an exact match; `toExtendTypeOf` checks assignability.

## Seeing what was inferred

- **Hover** any identifier in the editor.
- For computed types, hover shows the alias name, not the expansion. A helper forces expansion:

```ts
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type A = { id: string };
type B = { login: string };
type Shown = Expand<A & B>; // hover: { id: string; login: string }
```

- In VS Code, **inlay hints** (`typescript.inlayHints.*` settings) show inferred parameter and return types inline.

## Reading errors

Assignability errors are written outside in. Start at the bottom:

```text
Argument of type '{ login: string; followers: string; }' is not assignable to parameter of type 'Channel'.
  Types of property 'followers' are incompatible.
    Type 'string' is not assignable to type 'number'.
```

The last line is the cause. The lines above it say how the checker got there.

## Slow types

Type-checking time grows with:

- large unions crossed in template literal types or mapped types,
- deeply recursive conditional types,
- intersections of many object types (prefer `interface extends`, which is cached),
- missing return types on exported functions in big files, which forces inference across modules.

TypeScript 7 is fast enough that most projects never notice, but the same patterns make editor feedback sluggish on large codebases.

## Assignment

1. Read Vitest's [Testing Types](https://vitest.dev/guide/testing-types) guide.
2. Write type tests for the `Split` and `Join` types from the template literal lesson, including one `@ts-expect-error` case.
3. Take an error message from your own code that is more than three lines long and annotate what each line means.
