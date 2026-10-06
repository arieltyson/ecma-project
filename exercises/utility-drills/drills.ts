// Drills: JavaScript Utilities
// https://arieltyson.github.io/ecma-project/lessons/live-coding/utility-drills/
//
// Implement each function. The signatures are the specification the
// tests check against.

export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
  flush(): void;
}

/** Calls fn with the latest arguments once calls stop for ms. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): Debounced<A> {
  void fn;
  void ms;
  throw new Error("Not implemented");
}

/**
 * Calls fn immediately, then at most once per ms while calls continue,
 * finishing with a trailing call that uses the latest arguments.
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  void fn;
  void ms;
  throw new Error("Not implemented");
}

/** Caches results by key, which defaults to JSON.stringify(args). */
export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  key: (...args: A) => string = (...args) => JSON.stringify(args),
): (...args: A) => R {
  void fn;
  void key;
  throw new Error("Not implemented");
}

/** Behaves like Promise.all without using it. */
export function promiseAll<T>(
  values: readonly (T | PromiseLike<T>)[],
): Promise<T[]> {
  void values;
  throw new Error("Not implemented");
}

/**
 * Maps items with an async function, with at most `limit` calls in
 * flight. Results keep input order. The first rejection rejects the
 * result and no new calls start.
 */
export function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  void items;
  void limit;
  void fn;
  throw new Error("Not implemented");
}

/**
 * Calls fn up to `attempts` times, waiting delayMs * 2 ** (attempt - 1)
 * between attempts, and rejects with the last error.
 */
export function retry<T>(
  fn: () => Promise<T>,
  options: { readonly attempts: number; readonly delayMs: number },
): Promise<T> {
  void fn;
  void options;
  throw new Error("Not implemented");
}

/** A least-recently-used cache with O(1) get and set. */
export class LRUCache<K, V> {
  constructor(capacity: number) {
    void capacity;
  }

  get(key: K): V | undefined {
    void key;
    throw new Error("Not implemented");
  }

  set(key: K, value: V): void {
    void key;
    void value;
    throw new Error("Not implemented");
  }

  get size(): number {
    throw new Error("Not implemented");
  }
}

/**
 * Structural equality for primitives, arrays, plain objects, Dates, Maps
 * and Sets. NaN equals NaN; 0 and -0 are equal.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  void a;
  void b;
  throw new Error("Not implemented");
}
