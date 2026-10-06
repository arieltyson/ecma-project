---
title: Promises and async/await
summary: How promises represent future values, how to combine them, and how async functions read like synchronous code.
minutes: 30
objectives:
  - Explain promise states and how then chains propagate values and errors.
  - Write async functions with correct error handling.
  - Run work concurrently with Promise.all, allSettled, race and any.
  - Avoid accidental sequential awaits and unhandled rejections.
quiz:
  - question: What is wrong with `for (const id of ids) results.push(await fetchChannel(id));` when the requests are independent?
    options:
      - Nothing.
      - Each request waits for the previous one, so total time is the sum of all requests instead of the slowest one.
      - await is not allowed in loops.
    answer: 1
    explanation: Start them together and await `Promise.all(ids.map(fetchChannel))`, or limit concurrency if there are many.
  - question: Promise.all receives three promises and one rejects. What happens?
    options:
      - It waits for all three, then rejects.
      - It rejects immediately with that error; the other promises keep running but their results are ignored.
      - It resolves with two results.
    answer: 1
    explanation: Use Promise.allSettled when you want every outcome regardless of failures.
  - question: What is an unhandled rejection?
    options:
      - A promise that never settles.
      - A rejected promise with no handler attached, which the runtime reports as an error.
      - A promise rejected with a string.
    answer: 1
    explanation: Every promise you create should be awaited, returned, or given a catch handler. Lint rules like no-floating-promises catch forgotten ones.
resources:
  - title: MDN, Using promises
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
  - title: MDN, async function
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  - title: MDN, Promise
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
---

A **promise** is an object representing a value that will be available later, or an error. Almost every browser API that waits (network, timers via wrappers, storage, media) returns one, and `async`/`await` makes working with them read like ordinary code.

## States

A promise is **pending**, then settles once, either **fulfilled** with a value or **rejected** with a reason. Handlers attached with `then` and `catch` run as microtasks after it settles (see [the event loop](/lessons/browser/event-loop/)).

```ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const { promise, resolve } = Promise.withResolvers<string>();
setTimeout(() => resolve("ready"), 100);
await promise; // "ready"
```

`Promise.withResolvers()` gives you the promise and its resolve and reject functions without the constructor callback, which is handy when the resolving happens elsewhere.

## Chaining

`then` returns a new promise for whatever its callback returns, so steps chain. An error anywhere skips to the next `catch`:

```ts nocheck
fetch("/api/channels/lumen")
  .then((response) => response.json())
  .then((channel) => render(channel))
  .catch((error) => showError(error))
  .finally(() => hideSpinner());
```

## async and await

An `async` function always returns a promise. `await` pauses it until a promise settles, giving its value or throwing its error:

```ts
interface Channel {
  readonly login: string;
  readonly followers: number;
}

export async function loadChannel(login: string): Promise<Channel> {
  const response = await fetch(`/api/channels/${encodeURIComponent(login)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Channel;
}

export async function showChannel(login: string): Promise<void> {
  try {
    const channel = await loadChannel(login);
    console.log(channel.followers);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  }
}
```

## Concurrency

`await` in sequence waits for each step before starting the next. When steps are independent, start them together:

```ts
declare function fetchChannel(id: string): Promise<{ id: string }>;
declare function fetchStream(id: string): Promise<{ title: string }>;

export async function channelPage(id: string) {
  // Both requests are in flight at once.
  const [channel, stream] = await Promise.all([fetchChannel(id), fetchStream(id)]);
  return { channel, stream };
}
```

| Combinator | Resolves when | Rejects when |
| --- | --- | --- |
| `Promise.all` | all fulfil (array of values) | any rejects (first error) |
| `Promise.allSettled` | all settle (array of `{ status, value \| reason }`) | never |
| `Promise.race` | the first settles, either way | the first settles by rejecting |
| `Promise.any` | the first fulfils | all reject (`AggregateError`) |

With hundreds of items, starting everything at once can overwhelm a server or the browser's connection limit. Limit concurrency with a pool; you will write one in [Utility Drills](/lessons/live-coding/utility-drills/).

## Pitfalls

- **Floating promises**: calling an async function without `await`, `return` or `.catch` loses its errors. Mark intentional fire-and-forget calls with `void doThing()` and handle errors inside.
- **`forEach` with async callbacks** does not wait: use `for...of` with `await`, or `Promise.all(items.map(...))`.
- **Mixing styles**: prefer `async`/`await` throughout; use `then` only for short one-liners.
- **`Promise.try(fn)`** runs `fn` and always returns a promise, turning synchronous throws into rejections, which is useful when `fn` may or may not be async.

## Assignment

1. Read MDN's [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises).
2. Write `timeout<T>(promise: Promise<T>, ms: number): Promise<T>` that rejects with a `TimeoutError` if the promise takes too long.
3. Load a channel, its stream and its last ten videos concurrently, then show a partial page if only the videos request fails, using `Promise.allSettled`.
