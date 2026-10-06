---
title: The Browser Event Loop
summary: How one thread runs your code, promise callbacks, timers and rendering, and why long tasks make pages feel slow.
minutes: 30
objectives:
  - Order tasks, microtasks and rendering correctly.
  - Predict the output of code mixing setTimeout, promises and queueMicrotask.
  - Explain long tasks and their effect on responsiveness.
  - Break up long work with yielding.
quiz:
  - question: "What does this log? `setTimeout(() => log(\"a\")); Promise.resolve().then(() => log(\"b\")); log(\"c\");`"
    options:
      - a, b, c
      - c, b, a
      - c, a, b
    answer: 1
    explanation: Synchronous code runs first (c). Then the microtask queue empties (b). The timer callback is a new task and runs later (a).
  - question: What happens if a microtask keeps queueing new microtasks forever?
    options:
      - The browser runs them between frames.
      - The page freezes, because the microtask queue must empty before rendering or the next task.
      - They are dropped after 1000.
    answer: 1
    explanation: The event loop drains the whole microtask queue, including microtasks added while draining, before it renders or picks another task.
  - question: What is a long task?
    options:
      - A task that runs for more than 50 milliseconds, blocking input handling and rendering.
      - Any setTimeout with a delay over one second.
      - A network request that takes more than a second.
    answer: 0
    explanation: While a task runs, the browser cannot respond to input or paint. Tasks over 50ms are flagged in DevTools and hurt Interaction to Next Paint.
resources:
  - title: Jake Archibald, Tasks, microtasks, queues and schedules
    url: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
  - title: MDN, the event loop
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
  - title: web.dev, optimize long tasks
    url: https://web.dev/articles/optimize-long-tasks
---

A page's JavaScript, event handlers, promise callbacks and rendering all share **one main thread**. The event loop decides what runs next. Once you know its rules, async ordering questions become mechanical, and you understand why a slow function makes a whole page unresponsive.

## The loop

Each turn of the loop:

1. **Run one task** from a task queue. Tasks include running a script, a timer callback, an event handler (click, keydown), or a message from a worker.
2. **Drain the microtask queue**: run every microtask, including ones queued while draining. Microtasks are promise reactions (`then`, `await` continuations), `queueMicrotask` callbacks and `MutationObserver` callbacks.
3. **Maybe render**: if it is time for a frame (typically every 16.7ms on a 60Hz screen), run `requestAnimationFrame` callbacks, then style, layout and paint.

Then repeat.

```text
┌ task ┐ ┌ microtasks ┐ ┌ render? ┐ ┌ task ┐ ┌ microtasks ┐ ...
```

## Ordering

```ts
const log: string[] = [];

setTimeout(() => log.push("timeout"), 0);
queueMicrotask(() => log.push("microtask"));
Promise.resolve().then(() => log.push("promise"));
requestAnimationFrame(() => log.push("frame"));
log.push("sync");

// sync, microtask, promise, then timeout and frame in either order
```

1. The current script is a task. `"sync"` runs first.
2. When it finishes, microtasks drain in the order they were queued.
3. The timer is a separate task; the animation frame runs in the next rendering step. Which comes first depends on where the loop is relative to the next frame.

`setTimeout(fn, 0)` means "as a new task, after at least 0ms", not "immediately". Nested timers are clamped to at least 4ms after five levels.

## await

`await` splits an async function: everything after it runs as a microtask once the awaited promise settles.

```ts
async function load(): Promise<void> {
  console.log("1");
  await null;
  console.log("3");
}

void load();
console.log("2");
```

## Long tasks

While a task runs, nothing else can: clicks wait, typing waits, frames are skipped. A task longer than **50ms** is a *long task*. Users perceive the delay between their input and the next painted frame, measured by **Interaction to Next Paint** (INP); see [Web Performance](/lessons/browser/performance/).

Common culprits: parsing a large JSON response, rendering a huge list, synchronous loops over thousands of items, and heavy work inside an input handler.

## Yielding

Split long work into chunks and give the browser a chance to handle input and render between them:

```ts
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processAll<T>(items: readonly T[], work: (item: T) => void): Promise<void> {
  let lastYield = performance.now();
  for (const item of items) {
    work(item);
    if (performance.now() - lastYield > 40) {
      await yieldToMain();
      lastYield = performance.now();
    }
  }
}
```

Chromium also provides `scheduler.yield()`, which yields but keeps your continuation ahead of other queued tasks. Feature-detect it and fall back to `setTimeout`. For truly heavy computation, move it off the main thread entirely with a **Web Worker**.

## Assignment

1. Read Jake Archibald's [Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) and work through its interactive examples.
2. Predict, then verify in the console, the output of a snippet mixing two `setTimeout`s, a `then` chain of three steps and an `async` function with two `await`s.
3. Write a click handler that loops for 500ms, record a click in the Performance panel, and find the long task. Then rewrite it with `processAll` and compare.
