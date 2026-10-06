import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  debounce,
  deepEqual,
  LRUCache,
  mapWithConcurrency,
  memoize,
  promiseAll,
  retry,
  throttle,
} from "./drills.ts";

describe("timers", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounce calls once with the latest arguments", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d("a");
    vi.advanceTimersByTime(50);
    d("b");
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("debounce can be cancelled and flushed", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d("a");
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    d("b");
    d.flush();
    expect(fn).toHaveBeenCalledExactlyOnceWith("b");
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throttle runs leading and trailing calls", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    t(2);
    t(3);
    expect(fn.mock.calls).toEqual([[1]]);
    vi.advanceTimersByTime(100);
    expect(fn.mock.calls).toEqual([[1], [3]]);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retry backs off exponentially and gives up with the last error", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("1"))
      .mockRejectedValueOnce(new Error("2"))
      .mockRejectedValueOnce(new Error("3"));
    const result = retry(fn, { attempts: 3, delayMs: 100 });
    const assertion = expect(result).rejects.toThrow("3");
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(199);
    expect(fn).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(3);
    await assertion;
  });

  it("retry resolves as soon as an attempt succeeds", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("1"))
      .mockResolvedValueOnce("ok");
    const result = retry(fn, { attempts: 5, delayMs: 10 });
    await vi.advanceTimersByTimeAsync(10);
    await expect(result).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("memoize", () => {
  it("caches by arguments", () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const add = memoize(fn);
    expect(add(1, 2)).toBe(3);
    expect(add(1, 2)).toBe(3);
    expect(add(2, 1)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("promiseAll", () => {
  it("resolves empty input immediately", async () => {
    await expect(promiseAll([])).resolves.toEqual([]);
  });

  it("keeps input order and accepts plain values", async () => {
    const slow = new Promise<number>((r) => setTimeout(() => r(1), 20));
    await expect(promiseAll([slow, 2, Promise.resolve(3)])).resolves.toEqual([
      1, 2, 3,
    ]);
  });

  it("rejects with the first rejection", async () => {
    await expect(
      promiseAll([Promise.resolve(1), Promise.reject(new Error("no"))]),
    ).rejects.toThrow("no");
  });
});

describe("mapWithConcurrency", () => {
  it("limits concurrency and keeps order", async () => {
    let active = 0;
    let peak = 0;
    const result = await mapWithConcurrency(
      [30, 10, 20, 5, 15],
      2,
      async (ms, i) => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, ms));
        active--;
        return i;
      },
    );
    expect(result).toEqual([0, 1, 2, 3, 4]);
    expect(peak).toBe(2);
  });

  it("stops starting work after a rejection", async () => {
    const started: number[] = [];
    await expect(
      mapWithConcurrency([1, 2, 3, 4], 1, async (n) => {
        started.push(n);
        if (n === 2) throw new Error("fail");
        return n;
      }),
    ).rejects.toThrow("fail");
    expect(started).toEqual([1, 2]);
  });

  it("handles empty input", async () => {
    await expect(mapWithConcurrency([], 3, async (n) => n)).resolves.toEqual(
      [],
    );
  });
});

describe("LRUCache", () => {
  it("evicts the least recently used entry", () => {
    const cache = new LRUCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    cache.set("c", 3);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe(1);
    expect(cache.size).toBe(2);
  });

  it("does not evict when updating an existing key", () => {
    const cache = new LRUCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 10);
    expect(cache.get("b")).toBe(2);
    expect(cache.get("a")).toBe(10);
  });
});

describe("deepEqual", () => {
  it.each([
    [1, 1, true],
    [Number.NaN, Number.NaN, true],
    [0, -0, true],
    ["a", "b", false],
    [[1, [2]], [1, [2]], true],
    [[1], { 0: 1 }, false],
    [{ a: 1, b: { c: [1] } }, { b: { c: [1] }, a: 1 }, true],
    [{ a: 1 }, { a: 1, b: undefined }, false],
    [new Date(1), new Date(1), true],
    [new Date(1), new Date(2), false],
    [new Map([["a", { x: 1 }]]), new Map([["a", { x: 1 }]]), true],
    [new Set([1, 2]), new Set([2, 1]), true],
    [new Set([1]), new Set([2]), false],
    [null, undefined, false],
    [null, {}, false],
  ])("deepEqual(%o, %o) is %s", (a, b, expected) => {
    expect(deepEqual(a, b)).toBe(expected);
  });
});
