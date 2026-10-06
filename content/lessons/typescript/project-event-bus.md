---
title: "Project: Typed Event Bus"
summary: Build a fully typed publish and subscribe event bus where every event name knows its payload.
kind: project
minutes: 180
objectives:
  - A generic event bus whose emit and on calls are checked against an event map.
  - Events without payloads that are emitted with no second argument.
  - Unsubscribing by return value and by AbortSignal.
  - Isolation, so one failing handler does not stop the others.
resources:
  - title: MDN, EventTarget
    url: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  - title: MDN, AbortSignal
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
---

Many parts of Lumen's front end react to the same things happening: someone follows the channel, a raid arrives, the stream goes offline, the chat socket reconnects. An event bus lets those parts communicate without importing each other. Your job is to build one where TypeScript knows exactly what each event carries.

## Brief

```ts nocheck
interface LumenEvents {
  follow: { login: string };
  raid: { from: string; viewers: number };
  "stream-offline": undefined;
}

const bus = createEventBus<LumenEvents>();

const stop = bus.on("raid", ({ from, viewers }) => {
  console.log(`${from} raided with ${viewers}`);
});

bus.emit("raid", { from: "nova", viewers: 120 });
bus.emit("stream-offline");
stop();
```

## Requirements

1. `createEventBus<Events>()` takes an event map type (event name to payload type) and returns a bus.
2. `on(name, handler)` registers a handler and returns a function that removes it. The handler's parameter type comes from the event map.
3. `emit(name, payload)` calls every handler for that event in registration order. The payload must match the event's type.
4. Events whose payload type is `undefined` are emitted with **no** second argument: `bus.emit("stream-offline")`. Passing a payload for them, or omitting one for other events, is a compile error.
5. `once(name, handler)` registers a handler that removes itself after its first call.
6. `on` accepts an options object with an `AbortSignal`; aborting removes the handler.
7. A handler that throws does not prevent the remaining handlers from running. Errors go to an optional `onError` callback passed to `createEventBus`.
8. Removing a handler while an event is being emitted (including a handler removing itself) never causes another handler for that emit to be skipped.
9. No `any`. One narrowly scoped type assertion inside the implementation is acceptable if you explain it.

## Getting started

Starter files and tests are in [`exercises/event-bus`](https://github.com/arieltyson/ecma-project/tree/main/exercises/event-bus) in this site's repository. The tests check behaviour at run time and the API's types with `@ts-expect-error`.

```bash
git clone https://github.com/arieltyson/ecma-project.git
cd ecma-project && npm ci
npm run exercise event-bus
```

All tests fail until you implement `src/event-bus.ts`.

## Break it on purpose

1. Store handlers in an array and remove them with `splice` inside `off`. Write a `once` handler registered before a normal handler, emit once, and observe that the second handler is skipped. Explain why, then fix it (iterate over a copy, or use a `Set`, which handles deletion during iteration).
2. Remove the `try`/`catch` around handler calls and show which requirement breaks.

## Stretch

- Add `bus.wait("follow", { signal })` that returns a promise resolving with the next payload.
- Add wildcard listeners that receive `{ name, payload }` as a discriminated union of every event.

## Explain it

Answer these out loud, as if in a code review:

- How did you make the payload argument optional only for `undefined` events? What is the type of `emit`'s parameters?
- Your handler storage holds handlers for different payload types in one `Map`. What type does it have, and why is a type assertion (or a cast-free alternative) needed there?
- Why is a `Set` safe to delete from during iteration when an array is not?
- When would you use the DOM's built-in `EventTarget` instead of this?
