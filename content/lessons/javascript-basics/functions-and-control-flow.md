---
title: Functions and Control Flow
summary: Declare functions, pass them around, and control what runs with conditions, loops and early returns.
minutes: 25
objectives:
  - Write function declarations and arrow functions with default and rest parameters.
  - Pass functions as arguments and return them from functions.
  - Use if, switch and loops, and prefer early returns.
  - Handle errors with try and catch.
quiz:
  - question: What does an arrow function with no braces return, as in `(n) => n * 2`?
    options:
      - undefined
      - The value of the expression, n * 2.
      - The function itself.
    answer: 1
    explanation: A concise arrow body returns its expression. With braces you need an explicit return.
  - question: Why prefer `for...of` over `for...in` for arrays?
    options:
      - for...of iterates values; for...in iterates keys as strings, including inherited ones.
      - for...in is faster.
      - for...of only works on strings.
    answer: 0
    explanation: Use for...of for arrays and other iterables, and Object.entries for objects.
  - question: What is a callback?
    options:
      - A function passed to another function to be called later.
      - A phone call.
      - A loop.
    answer: 0
    explanation: Event handlers, array methods like map and timers all take callbacks.
resources:
  - title: MDN, Functions
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  - title: MDN, Control flow and error handling
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
---

Functions package up logic so you can name it, reuse it and pass it around. Control flow decides which code runs.

## Functions

```javascript
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const double = (n) => n * 2;            // arrow function, implicit return
const greet = (name, greeting = "Hi") => `${greeting}, ${name}`;  // default parameter
const sum = (...values) => values.reduce((total, v) => total + v, 0); // rest parameter
```

Functions are values: store them in variables, pass them as arguments (**callbacks**) and return them.

```javascript
const logins = ["lumen", "nova"];
logins.forEach((login) => console.log(login));

function makeCounter() {
  let count = 0;
  return () => ++count; // remembers count: a closure
}
```

## Conditions

```javascript
function badge(stream) {
  if (!stream) return "Offline";            // early return for the simple case
  if (stream.viewers > 10_000) return "Popular";
  return "Live";
}

switch (status) {
  case "live":
    show("LIVE");
    break;
  case "hosting":
    show("Hosting");
    break;
  default:
    show("Offline");
}
```

Early returns keep the main path un-nested and easy to read.

## Loops

```javascript
for (const login of logins) { }                     // values of an iterable
for (const [key, value] of Object.entries(channel)) { } // object entries
for (let i = 0; i < 3; i++) { }                     // counting
while (queue.length > 0) { queue.shift(); }         // until a condition changes
```

For transforming arrays, methods like `map` and `filter` (next lesson) are usually clearer than loops.

## Errors

```javascript
try {
  const settings = JSON.parse(localStorage.getItem("settings") ?? "{}");
  apply(settings);
} catch (error) {
  console.error("Could not read settings", error);
}

throw new Error("Channel not found");
```

## Assignment

1. Read MDN's [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) guide.
2. Write `formatDuration` above and test it in the console with 59, 3600 and 5025 seconds.
3. Write `chatColour(login)` that always returns the same colour from a list of six for the same login, using a simple hash of its characters.
