---
title: Typing Functions
summary: Function types, optional and rest parameters, overloads, this, and how callbacks are checked.
minutes: 25
objectives:
  - Write function type expressions and call signatures.
  - Use optional, default and rest parameters.
  - Write overloads, and know when a union parameter is better.
  - Understand void return types and parameter bivariance in callbacks.
quiz:
  - question: What does a `void` return type on a callback type mean?
    options:
      - The callback must return undefined.
      - The return value is ignored, so a callback that returns something is still accepted.
      - The callback cannot have a return statement.
    answer: 1
    explanation: "`forEach(items, (x) => list.push(x))` must compile even though `push` returns a number. `void` in a function type means the caller does not use the result."
  - question: When should you prefer a union parameter over overloads?
    options:
      - When the return type does not depend on which argument type was passed.
      - Never; overloads are always clearer.
      - When the function has more than two parameters.
    answer: 0
    explanation: Overloads are for relating a specific input type to a specific output type. If every input gives the same output type, a single signature with a union is simpler.
  - question: "What is the type of `rest` in `function log(level: string, ...rest: number[])`?"
    options:
      - "`number`"
      - "`number[]`"
      - "`[number]`"
    answer: 1
    explanation: "Rest parameters collect remaining arguments into an array. They can also be typed as tuples, such as `...args: [string, number]`, to fix their length."
resources:
  - title: TypeScript Handbook, More on Functions
    url: https://www.typescriptlang.org/docs/handbook/2/functions.html
---

Functions are where most type annotations live. This lesson covers how to describe them, and a few rules about how function types are compared that surprise most people once.

## Function types

```ts
type Formatter = (value: number, locale?: string) => string;

interface Validator {
  (input: string): boolean; // call signature
  readonly message: string; // plus a property
}

const compact: Formatter = (value, locale = "en") =>
  new Intl.NumberFormat(locale, { notation: "compact" }).format(value);
```

Parameter names in a function type are documentation only; any names work when you implement it.

## Optional, default and rest parameters

```ts
function title(text: string, maxLength?: number): string {
  if (maxLength === undefined) return text;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function greet(name: string, greeting = "Hi"): string {
  return `${greeting}, ${name}`; // greeting: string
}

function sum(...values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
```

An optional parameter has type `T | undefined` inside the function. A default value removes the `undefined`.

Rest parameters can be tuples, which lets you type exact argument lists:

```ts
function emit(...args: [event: "follow", login: string] | [event: "raid", from: string, viewers: number]) {
  const [event] = args;
  return event;
}

emit("follow", "lumen");
emit("raid", "nova", 120);
// @ts-expect-error: a raid needs a viewer count
emit("raid", "nova");
```

## Overloads

Overloads declare several signatures for one implementation. Use them when the **return type depends on the argument type**:

```ts
function parse(input: string): number;
function parse(input: readonly string[]): number[];
function parse(input: string | readonly string[]): number | number[] {
  return typeof input === "string" ? Number(input) : input.map(Number);
}

const one = parse("4");          // number
const many = parse(["1", "2"]);  // number[]
```

Callers see only the overload signatures, not the implementation signature. If every input produces the same output type, skip overloads and use a union parameter instead; it is simpler and composes better with other generic code.

## void

A function type that returns `void` means "the caller ignores the result". A function that returns something is still assignable to it:

```ts
const followers: string[] = [];
const logins = ["a", "b"];

logins.forEach((login) => followers.push(login)); // push returns number; fine
```

This is deliberate. It lets you pass any function as a callback whose return value nobody reads.

## this

A function that uses `this` can declare its type as a fake first parameter, which is erased:

```ts
interface Button {
  label: string;
}

function announce(this: Button) {
  return `Pressed ${this.label}`;
}

const button = { label: "Follow", announce };
button.announce();
```

Most modern code avoids `this` outside classes. Arrow functions capture `this` from where they are defined, which is usually what you want in callbacks.

## Callback parameters

Method-style declarations (`handle(event: Event): void`) are checked **bivariantly** for compatibility with older code, while function properties (`handle: (event: Event) => void`) are checked strictly under `strictFunctionTypes`. Prefer the property form in your own types so the stricter rule applies.

## Assignment

1. Read the Handbook's [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html).
2. Write `formatDuration(seconds: number, style?: "short" | "long"): string` returning `"1:05:03"` or `"1 hour 5 minutes"`.
3. Write `get` with two overloads: given a single ID it returns `Channel | undefined`, given an array of IDs it returns `Channel[]`. Then try writing it as a single signature with a union, and note what callers lose.
