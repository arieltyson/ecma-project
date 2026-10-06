---
title: Iterators and Generators
summary: The iteration protocol behind for...of and spread, generator functions, async iteration and the new iterator helpers.
minutes: 25
objectives:
  - Explain the iterable and iterator protocols.
  - Write generator functions for lazy sequences.
  - Consume async iterables with for await...of, such as streamed responses.
  - Use iterator helpers to transform sequences lazily.
quiz:
  - question: What makes an object iterable?
    options:
      - Having a length property.
      - Having a Symbol.iterator method that returns an iterator with a next method.
      - Being an array.
    answer: 1
    explanation: Arrays, strings, Maps, Sets and NodeLists all implement Symbol.iterator, which is what for...of and spread use.
  - question: What happens when a generator function is called?
    options:
      - Its body runs to completion.
      - It returns an iterator; the body runs only as next() is called, pausing at each yield.
      - It returns a promise.
    answer: 1
    explanation: Generators are lazy, which lets them describe infinite or expensive sequences.
  - question: How do iterator helpers like `.map` on an iterator differ from Array.prototype.map?
    options:
      - They are identical.
      - They are lazy, processing one element at a time as the result is consumed, without building intermediate arrays.
      - They only work on numbers.
    answer: 1
    explanation: "`iterator.filter(...).map(...).take(10)` touches only as many elements as needed."
resources:
  - title: MDN, Iteration protocols
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
  - title: MDN, Iterator helpers
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator
---

`for...of`, spread (`[...x]`), destructuring, `Array.from`, `new Map(entries)` and `Promise.all` all work on **iterables**. Knowing the protocol lets you make your own types iterable, and generators make that easy.

## The protocol

An **iterable** has a `[Symbol.iterator]()` method that returns an **iterator**: an object with `next()`, which returns `{ value, done }`.

```ts
const tags = new Set(["chess", "speedrun"]);
const iterator = tags[Symbol.iterator]();
iterator.next(); // { value: "chess", done: false }
iterator.next(); // { value: "speedrun", done: false }
iterator.next(); // { value: undefined, done: true }
```

## Generators

A generator function (`function*`) returns an iterator, running its body lazily up to each `yield`:

```ts
function* pages(total: number, size: number): Generator<{ start: number; end: number }> {
  for (let start = 0; start < total; start += size) {
    yield { start, end: Math.min(start + size, total) };
  }
}

for (const page of pages(95, 20)) {
  console.log(page.start, page.end);
}

function* ids(prefix: string) {
  let n = 0;
  while (true) yield `${prefix}-${n++}`; // infinite, but lazy
}

const next = ids("msg");
next.next().value; // "msg-0"
```

Make a class iterable by delegating to a generator:

```ts
class Playlist {
  readonly #items: string[] = [];
  add(item: string): void {
    this.#items.push(item);
  }
  *[Symbol.iterator](): Generator<string> {
    yield* this.#items;
  }
}

const playlist = new Playlist();
playlist.add("intro");
const all = [...playlist]; // ["intro"]
```

## Iterator helpers

Iterators now have lazy `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `some`, `every`, `find` and `toArray` methods:

```ts
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

const firstEvenSquares = naturals()
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .take(3)
  .toArray(); // [4, 16, 36]

const liveLogins = new Map([["lumen", true], ["nova", false]])
  .entries()
  .filter(([, live]) => live)
  .map(([login]) => login)
  .toArray(); // ["lumen"]
```

No intermediate arrays are built, and an infinite source is fine because `take` stops pulling. `Iterator.from(x)` wraps any iterator-like object to give it these methods.

## Async iteration

An **async iterable** yields promises; `for await...of` waits for each one. Streams are async iterable, which makes reading a streamed response straightforward:

```ts
async function* lines(response: Response): AsyncGenerator<string> {
  if (!response.body) return;
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    yield* parts;
  }
  if (buffer) yield buffer;
}
```

This pattern reads newline-delimited JSON, server logs or streamed AI responses one line at a time as they arrive.

## Assignment

1. Read MDN's [Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
2. Write a generator `chunk<T>(items: Iterable<T>, size: number)` that yields arrays of at most `size` items.
3. Use iterator helpers to find the first five channels with more than 1,000 viewers from a generator that pages through a fake API.
