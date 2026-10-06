---
title: Branded Types and Illegal States
summary: Stop structurally identical values from mixing, and push validation to the edges so the core of your code only sees valid data.
minutes: 20
objectives:
  - Create branded types for identifiers and validated values.
  - Write smart constructors that are the only way to create a brand.
  - Apply "parse, don't validate" to function signatures.
  - Know the cost and limits of brands.
quiz:
  - question: "Why does `function follow(userId: string, channelId: string)` invite bugs?"
    options:
      - Strings are slow to compare.
      - The arguments can be swapped and the compiler cannot tell.
      - Strings cannot be used as Map keys.
    answer: 1
    explanation: Both parameters have the same structural type. Branding each ID type makes a swap a compile error.
  - question: "What exists at run time for `type ChannelId = string & { readonly __brand: \"ChannelId\" }`?"
    options:
      - An object with a __brand property.
      - Just the string; the brand exists only in the type system.
      - A class instance.
    answer: 1
    explanation: The brand is a phantom property used only for type checking. The value is a plain string, so there is no runtime cost.
  - question: What does "parse, don't validate" recommend?
    options:
      - Check input once at the boundary and return a more precise type, instead of re-checking a loose type everywhere.
      - Never use regular expressions.
      - Validate on the server only.
    answer: 0
    explanation: A function that returns `Email` rather than `boolean` records the fact that validation happened in the type, so every later function can require `Email` and skip the check.
resources:
  - title: Parse, don't validate (Alexis King)
    url: https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
  - title: TypeScript FAQ, nominal typing
    url: https://github.com/microsoft/TypeScript/wiki/FAQ#can-i-make-a-type-alias-nominal
---

Structural typing means any two `string`s are interchangeable. Usually that is fine. For identifiers and validated values, it is a source of bugs. **Branding** adds a type-only marker so that values with the same runtime shape become different types.

## The problem

```ts
function follow(userId: string, channelId: string): void {
  console.log(`${userId} follows ${channelId}`);
}

const user = "u_123";
const channel = "c_456";
follow(channel, user); // compiles; wrong at run time
```

## A brand

```ts
declare const brand: unique symbol;
type Brand<T, Name extends string> = T & { readonly [brand]: Name };

type UserId = Brand<string, "UserId">;
type ChannelId = Brand<string, "ChannelId">;

function follow(userId: UserId, channelId: ChannelId): void {
  console.log(`${userId} follows ${channelId}`);
}

declare const user: UserId;
declare const channel: ChannelId;

follow(user, channel);
// @ts-expect-error: a ChannelId is not a UserId
follow(channel, user);
// @ts-expect-error: a plain string is not a UserId
follow("u_123", channel);
```

The intersection with a property nobody can create makes the types incompatible. At run time the values are plain strings; the brand costs nothing.

## Smart constructors

A brand is only useful if creating one requires going through a check. Write one function per brand that validates and returns the branded type, and make it the only place that uses `as`:

```ts
declare const brand: unique symbol;
type Brand<T, Name extends string> = T & { readonly [brand]: Name };

export type Login = Brand<string, "Login">;

const LOGIN = /^[a-z0-9_]{4,25}$/;

export function parseLogin(input: string): Login | undefined {
  const login = input.trim().toLowerCase();
  return LOGIN.test(login) ? (login as Login) : undefined;
}

function channelUrl(login: Login): string {
  return `https://lumen.tv/${login}`;
}

const login = parseLogin("  Lumen_TV ");
if (login) channelUrl(login);
```

`channelUrl` cannot be called with an unchecked string. The type itself records that validation happened.

## Parse, don't validate

A validator returns `boolean` and throws away what it learned. A parser returns a more precise type. Compare:

```ts nocheck
function isValidLogin(input: string): boolean; // caller still has a string
function parseLogin(input: string): Login | undefined; // caller has a Login
```

Parse once, at the boundary where data enters (a form, a URL, an API response), and let the rest of the program require the precise type. This is the same idea as discriminated unions: make invalid states unrepresentable, so code deep inside the app never has to check again.

## Limits

- Brands are erased, so they do not survive serialisation. Re-parse after reading from JSON or storage.
- Libraries and generated code (such as GraphQL codegen) will hand you plain strings. Brand them at the boundary.
- Do not brand everything. Use brands where mixing values up is plausible and costly: IDs of different entities, units (milliseconds versus seconds), sanitised versus raw HTML.

## Assignment

1. Read [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/).
2. Create `Milliseconds` and `Seconds` brands with constructors and a conversion function. Show that passing seconds to `setTimeout`-style code fails to compile.
3. Write `parseHexColor(input: string): HexColor | undefined` and use `HexColor` in a function that sets a theme colour.
