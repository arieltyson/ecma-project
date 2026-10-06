---
title: Cancellation and Errors
summary: Cancel work with AbortController, design error types that carry context, and handle failures at the right level.
minutes: 25
objectives:
  - Cancel fetches and other work with AbortController and AbortSignal.
  - Combine and time out signals with AbortSignal.any and AbortSignal.timeout.
  - Create custom error classes with causes.
  - Decide where errors are caught, reported and shown.
quiz:
  - question: What happens to a fetch when its AbortSignal is aborted?
    options:
      - Nothing; fetch cannot be cancelled.
      - The request is cancelled and the promise rejects with an AbortError DOMException.
      - The promise resolves with null.
    answer: 1
    explanation: Check for `error.name === "AbortError"` and usually ignore it, because the caller asked for the cancellation.
  - question: "What does `new Error(\"Could not load channel\", { cause: error })` preserve?"
    options:
      - Nothing extra.
      - The original error as `cause`, so logs and error tracking show both the context and the root failure.
      - A stack trace of the cause only.
    answer: 1
    explanation: Wrapping with a cause adds meaning at each layer without losing the underlying error.
  - question: Which signal aborts after five seconds or when the user navigates away, whichever comes first?
    options:
      - "`AbortSignal.timeout(5000)`"
      - "`AbortSignal.any([navigationSignal, AbortSignal.timeout(5000)])`"
      - "`new AbortController()`"
    answer: 1
    explanation: AbortSignal.any combines signals; the result aborts when any input does.
resources:
  - title: MDN, AbortController
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  - title: MDN, Error cause
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
---

Real users navigate away mid-request, lose their connection and hit rate limits. Robust clients cancel work nobody needs any more, and fail in ways that are easy to diagnose and recover from.

## AbortController

An `AbortController` produces a **signal** you pass to cancellable work, and an `abort()` method to cancel it:

```ts
export async function search(query: string, signal: AbortSignal): Promise<string[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as string[];
}

let current: AbortController | undefined;

export async function onInput(query: string): Promise<void> {
  current?.abort(); // cancel the previous search
  current = new AbortController();
  try {
    const results = await search(query, current.signal);
    console.log(results);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    throw error;
  }
}
```

Many APIs accept a signal: `fetch`, `addEventListener` (removes the listener on abort), streams, and your own functions. Accept one in any async function that could become irrelevant:

```ts
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
```

### Timeouts and combinations

```ts
declare const pageSignal: AbortSignal;

const signal = AbortSignal.any([pageSignal, AbortSignal.timeout(5000)]);
await fetch("/api/streams", { signal });
```

`AbortSignal.timeout(ms)` aborts with a `TimeoutError`; `AbortSignal.any` aborts when any input does.

## Error types

Custom error classes let callers tell failures apart with `instanceof` and carry useful fields:

```ts
export class HttpError extends Error {
  override readonly name = "HttpError";
  readonly status: number;

  constructor(status: number, url: string, options?: ErrorOptions) {
    super(`HTTP ${status} for ${url}`, options);
    this.status = status;
  }
}

export class SignedOutError extends Error {
  override readonly name = "SignedOutError";
}

export async function requestJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, signal ? { signal } : {});
  } catch (error) {
    throw new Error(`Network error for ${url}`, { cause: error });
  }
  if (response.status === 401) throw new SignedOutError("Session expired");
  if (!response.ok) throw new HttpError(response.status, url);
  return response.json();
}
```

`{ cause }` keeps the original error attached, so logs show both what you were doing and what actually failed. `AggregateError` groups several errors, as `Promise.any` does.

## Where to handle errors

- **Catch where you can do something useful**: retry, fall back, or show a specific message. Do not catch just to log and rethrow at every layer.
- **Expected failures are data**: a rate limit or validation error is part of the domain. Return a discriminated union (`{ ok: false, reason: "rate-limited" }`) instead of throwing, so the type system makes callers handle it.
- **Unexpected failures propagate** to a boundary (an error boundary in React, a global handler) that reports them and shows a generic error.
- **Never swallow errors silently.** At minimum, report them.

```ts
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection", event.reason);
});
```

## Assignment

1. Read MDN's [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) page.
2. Build a search box that aborts in-flight requests as the user types and never shows results for an old query.
3. Write `retry<T>(fn: (signal: AbortSignal) => Promise<T>, options: { attempts: number; signal?: AbortSignal })` with exponential backoff that stops immediately when the outer signal aborts and does not retry `4xx` errors other than `429`.
