---
title: Interfaces, Type Aliases and Structural Typing
summary: How TypeScript compares object types by shape, when to use interface or type, and how excess property checks, index signatures and readonly work.
minutes: 25
objectives:
  - Explain structural typing and how it differs from nominal typing.
  - Choose between interface and type alias.
  - Predict when excess property checks apply.
  - Use index signatures, Record and readonly correctly.
quiz:
  - question: "`interface Point { x: number; y: number }`. Can a value of type `{ x: number; y: number; z: number }` be passed where a Point is expected?"
    options:
      - No, the extra property makes it a different type.
      - Yes, because it has every property Point requires.
      - Only if it is cast with `as Point`.
    answer: 1
    explanation: TypeScript is structural. A type is compatible if it has at least the required members. Extra properties are only rejected for object literals written directly at the assignment.
  - question: Which can an interface do that a type alias cannot?
    options:
      - Describe a union.
      - Be reopened and extended by declaration merging.
      - Use mapped or conditional types.
    answer: 1
    explanation: Two `interface Window` declarations merge into one, which is how libraries are augmented. Type aliases cannot merge, but can name unions, tuples and computed types.
  - question: When does an excess property check run?
    options:
      - On every assignment.
      - When a fresh object literal is assigned to a typed target.
      - Only in strict mode.
    answer: 1
    explanation: Excess property checks catch typos in object literals. A variable holding the same object is not checked for extras, because structural typing allows them.
resources:
  - title: TypeScript Handbook, Object Types
    url: https://www.typescriptlang.org/docs/handbook/2/objects.html
  - title: TypeScript Handbook, Type Compatibility
    url: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
---

TypeScript compares types by their **structure**, not their name. If a value has the members a type needs, it is that type. This is called structural typing, and it matches how JavaScript code actually uses objects.

## Structural typing

```ts
interface Named {
  name: string;
}

class Streamer {
  readonly name: string;
  readonly followers: number;

  constructor(name: string, followers: number) {
    this.name = name;
    this.followers = followers;
  }
}

function greet(who: Named) {
  return `Hi ${who.name}`;
}

greet(new Streamer("lumen", 3)); // fine: it has a name
greet({ name: "anon" });         // fine
```

`Streamer` never mentions `Named`, but it fits, so it is accepted.

In languages like Swift and Java, types are *nominal*: a class must declare that it implements an interface. TypeScript's approach means two independently written types with the same shape are interchangeable. [Branded Types](/lessons/typescript/branded-types/) shows how to opt out when two shapes should not mix, such as user IDs and channel IDs.

## interface or type

Both describe object shapes:

```ts
interface ChannelA {
  login: string;
  followers: number;
}

type ChannelB = {
  login: string;
  followers: number;
};
```

The differences:

| | `interface` | `type` |
| --- | --- | --- |
| Object shapes | Yes | Yes |
| Unions, tuples, primitives, mapped and conditional types | No | Yes |
| Extending | `extends` | `&` intersection |
| Declaration merging | Yes | No |

A reasonable rule: use `interface` for object shapes, especially public ones that others may extend, and `type` for everything else. Being consistent within a codebase matters more than which one you pick.

```ts
interface Base {
  readonly id: string;
}

interface Stream extends Base {
  title: string;
}

type Clip = Base & { durationSeconds: number };
```

## Excess property checks

Structural typing allows extra properties, which makes typos in object literals easy to miss. So TypeScript adds one extra rule: a **fresh object literal** assigned directly to a typed target may not have properties the type does not declare.

```ts
interface Options {
  title: string;
  mature?: boolean;
}

// @ts-expect-error: 'matrue' does not exist in type 'Options'
const a: Options = { title: "Speedrun", matrue: true };

const raw = { title: "Speedrun", matrue: true };
const b: Options = raw; // allowed: raw is not a fresh literal
```

## Index signatures and Record

When keys are not known ahead of time, use an index signature or `Record`:

```ts
interface ViewerCounts {
  [login: string]: number;
}

const counts: Record<string, number> = { lumen: 40 };
const lumen = counts["lumen"]; // number | undefined with noUncheckedIndexedAccess
```

For a fixed set of keys, `Record<Union, Value>` is exhaustive: every key must be present. For truly dynamic keys, a `Map<string, number>` is often clearer than an object, and has no prototype keys like `"constructor"` to worry about.

## readonly

`readonly` stops reassignment of a property through that type:

```ts
interface Follow {
  readonly channelId: string;
  readonly followedAt: Date;
}

declare const follow: Follow;
// @ts-expect-error: cannot assign to a read-only property
follow.channelId = "other";
```

It is shallow and compile-time only: `followedAt` can still be mutated with `setFullYear`, and nothing stops JavaScript code from writing to the object. Use `Readonly<T>` to make every property of a type readonly at once.

## Assignment

1. Read the Handbook's [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) and [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).
2. Write an interface `Emote` and a function that accepts it. Pass it an object with an extra property both as a literal and through a variable, and explain why only one fails.
3. Model a `Settings` object whose keys are a fixed union of setting names, using `Record`. Then model per-channel viewer counts with a `Map`. Write one sentence on why each fits its case.
