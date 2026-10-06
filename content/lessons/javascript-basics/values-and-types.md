---
title: Values, Types and Operators
summary: JavaScript's primitive types, objects, equality, truthiness and the operators you use every day.
minutes: 25
objectives:
  - Name JavaScript's primitive types and how they differ from objects.
  - Use strict equality and explain why loose equality is avoided.
  - Predict truthy and falsy values.
  - Use optional chaining, nullish coalescing and template literals.
quiz:
  - question: What is `0.1 + 0.2 === 0.3`?
    options:
      - "true"
      - "false, because numbers are binary floating point and 0.1 + 0.2 is 0.30000000000000004"
      - An error.
    answer: 1
    explanation: Compare with a tolerance, or work in integers (cents rather than dollars) when exactness matters.
  - question: Which values are falsy?
    options:
      - "\"0\", [] and {}"
      - false, 0, -0, 0n, "", null, undefined and NaN
      - Only false and null.
    answer: 1
    explanation: Everything else is truthy, including the string "0", empty arrays and empty objects.
  - question: What does `count ?? 10` return when count is 0?
    options:
      - "10"
      - "0"
      - undefined
    answer: 1
    explanation: "`??` only falls back for null and undefined. `count || 10` would return 10 because 0 is falsy."
resources:
  - title: MDN, JavaScript data types and data structures
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures
  - title: MDN, Equality comparisons and sameness
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness
---

JavaScript is the language of the browser. This course covers just enough of it to build interactive pages; the [JavaScript course](/lessons/javascript/scope-and-closures/) in the next path goes deeper, and TypeScript adds types on top.

## Values

JavaScript has seven **primitive** types and **objects**:

```javascript
const login = "lumen";          // string
const viewers = 1204;           // number (integers and decimals)
const big = 9007199254740993n;  // bigint
const live = true;              // boolean
let game;                       // undefined: no value assigned
const away = null;              // null: deliberately empty
const id = Symbol("id");        // symbol: a unique key

const channel = { login, viewers };  // object
const tags = ["chess", "rapid"];     // arrays are objects
```

Primitives are immutable and compared by value. Objects are compared by **reference**: two objects with the same contents are not equal unless they are the same object.

```javascript
"lumen" === "lumen";          // true
({ a: 1 }) === ({ a: 1 });    // false: different objects
```

Check types with `typeof` (`typeof 1` is `"number"`; note `typeof null` is `"object"`) and arrays with `Array.isArray`.

## Numbers

All numbers are 64-bit floating point, so decimal fractions are approximate:

```javascript
0.1 + 0.2;                       // 0.30000000000000004
Number.parseInt("42px", 10);     // 42
Number("42px");                  // NaN
Number.isNaN(Number("x"));       // true
(1204.5).toFixed(0);             // "1205"
new Intl.NumberFormat("en", { notation: "compact" }).format(1204); // "1.2K"
```

## Equality

Always use `===` and `!==`. The loose `==` converts types first and gives surprising results (`"" == 0` is `true`).

## Truthiness

In conditions, values are converted to booleans. The **falsy** values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy, including `"0"`, `[]` and `{}`.

## Everyday operators

```javascript
const greeting = `Hi ${login}, ${viewers} watching`; // template literal
const title = channel.stream?.title;                  // optional chaining: undefined if stream is missing
const limit = settings.limit ?? 10;                   // nullish coalescing: only for null or undefined
const label = live ? "LIVE" : "Offline";              // conditional (ternary)
```

Prefer `??` to `||` for defaults, because `||` also replaces `0` and `""`.

## Assignment

1. Read MDN's [JavaScript data types and data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures).
2. In the browser console, predict then check: `typeof []`, `[] === []`, `"5" * 2`, `"5" + 2`, `0 || "fallback"`, `0 ?? "fallback"`.
3. Write a function that formats a viewer count as `"1.2K watching"`, returning `"Offline"` for `null`.
