---
title: "Drills: JavaScript Utilities"
summary: Implement the utility functions front-end interviews ask for most, with tests, types and edge cases.
minutes: 240
objectives:
  - Implement debounce, throttle and memoize with correct this, arguments and cleanup.
  - Implement Promise.all and a concurrency-limited map.
  - Implement retry with backoff and an LRU cache.
  - Implement deep equality and explain its edge cases.
quiz:
  - question: How does throttle differ from debounce?
    options:
      - They are the same.
      - Throttle runs at most once per interval while calls keep coming; debounce waits until calls stop for the interval.
      - Debounce runs immediately; throttle never does.
    answer: 1
    explanation: Debounce suits search-as-you-type; throttle suits scroll or resize handlers that should update steadily.
  - question: Your Promise.all implementation receives an empty array. What should it return?
    options:
      - A promise that never resolves.
      - A promise that resolves immediately with an empty array.
      - A rejected promise.
    answer: 1
    explanation: That matches the built-in and is a classic edge case. Results must also keep input order regardless of completion order.
  - question: Which data structure gives an LRU cache O(1) get and set in JavaScript?
    options:
      - An array.
      - A Map, because it keeps insertion order; delete and re-insert on access, and evict the first key.
      - An object.
    answer: 1
    explanation: Map iteration order is insertion order, so the first key is always the least recently used.
resources:
  - title: MDN, Promise.all
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
  - title: MDN, Map
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
---

These are the utilities front-end interviewers ask candidates to implement most often. Each one is small, but each has two or three edge cases that separate a good answer from a great one. Starter files and tests are in [`exercises/utility-drills`](https://github.com/arieltyson/ecma-project/tree/main/exercises/utility-drills):

```bash
npm run exercise utility-drills
```

Solve each one in under 20 minutes, out loud, following [Thinking Out Loud](/lessons/live-coding/thinking-out-loud/). Only look at the tests after you have listed the edge cases yourself.

## The drills

| Function | Edge cases to discuss |
| --- | --- |
| `debounce(fn, ms)` | arguments of the last call win; `cancel()` and `flush()`; timers per instance |
| `throttle(fn, ms)` | leading call runs immediately; trailing call runs with the latest arguments |
| `memoize(fn, key?)` | cache key for multiple arguments; unbounded memory |
| `promiseAll(values)` | empty input; non-promise values; order of results; first rejection wins |
| `mapWithConcurrency(items, limit, fn)` | never more than `limit` in flight; results in input order; rejection stops new work |
| `retry(fn, { attempts, delayMs })` | exponential delay; give up after the last attempt with the last error |
| `LRUCache(capacity)` | `get` refreshes recency; updating an existing key does not evict |
| `deepEqual(a, b)` | `NaN`, `-0`, arrays versus objects, `Date`, `Map`, `Set`, different key counts |

## Debounce in detail

A reference shape, so you know what level of detail interviewers expect:

```ts
export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
  flush(): void;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const run = () => {
    timer = undefined;
    if (pending) {
      const args = pending;
      pending = undefined;
      fn(...args);
    }
  };

  const debounced = (...args: A) => {
    pending = args;
    clearTimeout(timer);
    timer = setTimeout(run, ms);
  };

  return Object.assign(debounced, {
    cancel() {
      clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    },
    flush() {
      clearTimeout(timer);
      run();
    },
  });
}
```

Talking points: why `ReturnType<typeof setTimeout>` instead of `number` (Node.js and browsers differ), why arguments are captured per call, and how this relates to `useDebouncedValue` in React.

## Explaining complexity

For each drill, be ready to state time and space complexity and to say what you would change at scale, for example bounding `memoize` with the LRU cache from the same exercise.

## Assignment

1. Implement every function in `exercises/utility-drills` until `npm run exercise utility-drills` passes.
2. For each, write one sentence on the edge case you found hardest.
3. A week later, re-implement `mapWithConcurrency` and `LRUCache` from scratch in 15 minutes each.
