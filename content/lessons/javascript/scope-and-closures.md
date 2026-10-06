---
title: Scope and Closures
summary: How JavaScript resolves names, why let and const replaced var, and how closures power callbacks, hooks and private state.
minutes: 25
objectives:
  - Explain block, function and module scope.
  - Describe the temporal dead zone for let and const.
  - Explain what a closure captures and use closures deliberately.
  - Recognise stale closures in callbacks and React components.
quiz:
  - question: "What does this log? `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));`"
    options:
      - 0 1 2
      - 3 3 3
      - undefined three times
    answer: 1
    explanation: "`var` is function-scoped, so all three callbacks share one `i`, which is 3 when they run. With `let`, each iteration gets its own binding and it logs 0 1 2."
  - question: What does a closure capture?
    options:
      - A copy of each variable's value at creation time.
      - The variables themselves (bindings), so it sees later changes to them.
      - Only global variables.
    answer: 1
    explanation: Closures keep a live reference to the surrounding scope. That is why a counter returned from a factory keeps counting.
  - question: In React, why might a setInterval callback created in an effect with `[]` dependencies always see the initial state?
    options:
      - React freezes state.
      - The callback closed over the first render's state variable and never sees later renders' values.
      - setInterval copies arguments.
    answer: 1
    explanation: This is a stale closure. Use an updater function, list the state as a dependency, or read it through a ref or an effect event.
resources:
  - title: MDN, Closures
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
  - title: MDN, let
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
---

Every name in JavaScript is looked up in a chain of **scopes**. Functions remember the scope they were created in, even after it has finished running. That memory is a **closure**, and it is behind callbacks, event handlers, module privacy and React hooks.

## Scopes

```ts
const site = "lumen";            // module scope: visible in this file

function greet(name: string) {   // function scope
  const greeting = "Hi";
  if (name.length > 0) {         // block scope
    const message = `${greeting} ${name} on ${site}`;
    return message;
  }
  return greeting;
}
```

- `const` and `let` are **block scoped**: they exist from their declaration to the end of the nearest `{}`.
- Each ES module has its own top-level scope; nothing leaks to the global object unless you put it there.
- `var` is function scoped and hoisted, which causes the classic loop bug in the quiz. Do not use it.

Use `const` by default and `let` only when you reassign.

## The temporal dead zone

`let` and `const` are hoisted to the top of their block but cannot be used before the declaration line runs:

```ts nocheck
console.log(count); // ReferenceError, not undefined
let count = 0;
```

That window is the **temporal dead zone**. It turns ordering mistakes into immediate errors.

## Closures

A function created inside another function keeps access to the outer function's variables:

```ts
export function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    current: () => count,
  };
}

const viewers = createCounter(10);
viewers.increment();
viewers.current(); // 11
```

`count` is not accessible from outside, but both functions share it. Closures capture **bindings**, not values: when `increment` changes `count`, `current` sees the change.

### Closures in practice

```ts
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

The returned function closes over `timer`, so each call can cancel the previous one. You will write this in an interview sooner or later; see [Utility Drills](/lessons/live-coding/utility-drills/).

## Stale closures

Because a closure keeps the bindings from when it was created, it can hold on to an old value:

```tsx nocheck
function Ticker() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000); // count is always 0 here
    return () => clearInterval(id);
  }, []);
  return <p>{count}</p>;
}
```

Every React render creates new variables and new closures. The interval callback belongs to the first render, so `count` is forever `0` and the display sticks at 1. Fixes: `setCount((c) => c + 1)`, or include `count` in the dependencies, or read the latest value with `useEffectEvent`.

## Assignment

1. Read MDN's [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) guide.
2. Write `once(fn)`, which returns a function that calls `fn` the first time and returns the first result on every later call.
3. Reproduce the stale `Ticker` above in a Vite app, then fix it three different ways.
