// Project: Typed Event Bus
// https://arieltyson.github.io/ecma-project/lessons/typescript/project-event-bus/
//
// The types below are deliberately loose: `emit` accepts any payload, or
// none. The type tests in event-bus.test.ts fail until you tighten them.
// The runtime tests fail until you implement createEventBus.

export type Handler<Payload> = (payload: Payload) => void;

export interface SubscribeOptions {
  readonly signal?: AbortSignal;
}

export interface EventBusOptions {
  readonly onError?: (error: unknown, name: PropertyKey) => void;
}

export interface EventBus<Events extends object> {
  on<K extends keyof Events>(
    name: K,
    handler: Handler<Events[K]>,
    options?: SubscribeOptions,
  ): () => void;
  once<K extends keyof Events>(
    name: K,
    handler: Handler<Events[K]>,
  ): () => void;
  emit<K extends keyof Events>(name: K, payload?: unknown): void;
}

export function createEventBus<Events extends object>(
  options: EventBusOptions = {},
): EventBus<Events> {
  void options;
  throw new Error("Not implemented");
}
