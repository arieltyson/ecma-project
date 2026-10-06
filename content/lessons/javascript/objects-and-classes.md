---
title: Objects, Prototypes and Classes
summary: How objects inherit through prototypes, what classes add, private fields, this, and when plain objects and functions are the better choice.
minutes: 30
objectives:
  - Explain the prototype chain and property lookup.
  - Write classes with fields, private members, static members and accessors.
  - Predict the value of this in methods, callbacks and arrow functions.
  - Choose between classes, plain objects and closures.
quiz:
  - question: What does `#count` in a class body declare?
    options:
      - A comment.
      - A private field that cannot be read or written from outside the class, enforced at run time.
      - A static field.
    answer: 1
    explanation: Hash-prefixed names are truly private. TypeScript's `private` keyword is only a compile-time check.
  - question: "`const { start } = player; start();` throws because `this` is undefined. Why?"
    options:
      - Destructuring copies the method without its object, and a plain function call sets this to undefined in strict code.
      - start is private.
      - Classes cannot be destructured.
    answer: 0
    explanation: "`this` is decided by how a function is called. Use an arrow function field or `.bind`, or call it as `player.start()`."
  - question: What does `Object.hasOwn(channel, "login")` check?
    options:
      - Whether login exists anywhere on the prototype chain.
      - Whether channel itself has a login property, ignoring inherited ones.
      - Whether login is a string.
    answer: 1
    explanation: The `in` operator also finds inherited properties. Object.hasOwn checks only the object's own properties.
resources:
  - title: MDN, Inheritance and the prototype chain
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain
  - title: MDN, Classes
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  - title: MDN, this
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
---

JavaScript objects inherit from other objects through **prototypes**. Classes are a clearer syntax for the same mechanism, plus genuinely new features such as private fields.

## Prototypes

Every object has a hidden link to a prototype. Reading a property that the object does not have continues up the chain:

```ts
const base = { describe(): string { return "a channel"; } };
const channel = Object.create(base) as typeof base & { login?: string };
channel.login = "lumen";

channel.describe();              // found on base
Object.hasOwn(channel, "login"); // true
Object.hasOwn(channel, "describe"); // false: inherited
"describe" in channel;           // true: in checks the chain
```

Arrays get `map` from `Array.prototype`, which gets `hasOwnProperty` from `Object.prototype`. Methods live once on the prototype, not on every instance.

## Classes

```ts
export class ViewerCounter {
  static readonly MAX_HISTORY = 60;

  readonly channel: string;
  #count = 0;
  #history: number[] = [];

  constructor(channel: string) {
    this.channel = channel;
  }

  get count(): number {
    return this.#count;
  }

  record(count: number): void {
    this.#count = count;
    this.#history = [...this.#history, count].slice(-ViewerCounter.MAX_HISTORY);
  }

  peak(): number {
    return Math.max(0, ...this.#history);
  }
}

const counter = new ViewerCounter("lumen");
counter.record(40);
counter.count; // 40
```

- **Fields** (`#count = 0`) are set on each instance before the constructor body runs.
- **`#private`** members are enforced by the language: outside code cannot read them, not even with bracket access. Prefer them to TypeScript's `private` keyword, which disappears at run time.
- **`static`** members belong to the class itself.
- **Accessors** (`get`, `set`) look like properties but run code.
- `extends` and `super` set up inheritance between classes. Prefer composition over deep hierarchies.

## this

`this` is set by **how** a function is called, not where it is defined:

| Call | `this` |
| --- | --- |
| `counter.record(1)` | `counter` |
| `const f = counter.record; f(1)` | `undefined` (modules and classes are strict) |
| `f.call(obj, 1)`, `f.bind(obj)` | `obj` |
| arrow function | `this` of the surrounding scope |
| `new ViewerCounter()` | the new instance |

Passing a method as a callback (`button.addEventListener("click", counter.reset)`) loses its object. Use an arrow function, `counter.reset.bind(counter)`, or define the method as an arrow function field.

## When to use classes

Classes suit things with identity and encapsulated, changing internal state: a WebSocket connection manager, a cache, a custom error type. For data, plain objects and types are simpler, serialise to JSON cleanly and work with structural typing. For behaviour, plain functions and closures compose better. React components are functions; React state should hold plain data, not class instances you mutate.

## Assignment

1. Read MDN's [Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain).
2. Write a `RateLimiter` class with a private queue that allows at most N calls per window, with a `tryAcquire(): boolean` method.
3. Write the same limiter as a closure-returning function, and list one advantage of each version.
