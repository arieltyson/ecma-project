import { describe, expect, it, vi } from "vitest";
import { createEventBus } from "./event-bus.ts";

interface LumenEvents {
  follow: { login: string };
  raid: { from: string; viewers: number };
  "stream-offline": undefined;
}

describe("createEventBus", () => {
  it("calls handlers in registration order with the payload", () => {
    const bus = createEventBus<LumenEvents>();
    const calls: string[] = [];
    bus.on("follow", ({ login }) => calls.push(`a:${login}`));
    bus.on("follow", ({ login }) => calls.push(`b:${login}`));
    bus.emit("follow", { login: "lumen" });
    expect(calls).toEqual(["a:lumen", "b:lumen"]);
  });

  it("only calls handlers for the emitted event", () => {
    const bus = createEventBus<LumenEvents>();
    const follow = vi.fn();
    bus.on("follow", follow);
    bus.emit("raid", { from: "nova", viewers: 3 });
    expect(follow).not.toHaveBeenCalled();
  });

  it("emits events without a payload", () => {
    const bus = createEventBus<LumenEvents>();
    const offline = vi.fn();
    bus.on("stream-offline", offline);
    bus.emit("stream-offline");
    expect(offline).toHaveBeenCalledTimes(1);
  });

  it("removes a handler with the returned function", () => {
    const bus = createEventBus<LumenEvents>();
    const handler = vi.fn();
    const off = bus.on("follow", handler);
    off();
    off();
    bus.emit("follow", { login: "lumen" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls a once handler a single time", () => {
    const bus = createEventBus<LumenEvents>();
    const handler = vi.fn();
    bus.once("follow", handler);
    bus.emit("follow", { login: "a" });
    bus.emit("follow", { login: "b" });
    expect(handler).toHaveBeenCalledExactlyOnceWith({ login: "a" });
  });

  it("removes a handler when its signal aborts", () => {
    const bus = createEventBus<LumenEvents>();
    const controller = new AbortController();
    const handler = vi.fn();
    bus.on("follow", handler, { signal: controller.signal });
    controller.abort();
    bus.emit("follow", { login: "lumen" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores a handler whose signal is already aborted", () => {
    const bus = createEventBus<LumenEvents>();
    const handler = vi.fn();
    bus.on("follow", handler, { signal: AbortSignal.abort() });
    bus.emit("follow", { login: "lumen" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("keeps calling handlers after one throws, and reports the error", () => {
    const onError = vi.fn();
    const bus = createEventBus<LumenEvents>({ onError });
    const failure = new Error("boom");
    const after = vi.fn();
    bus.on("follow", () => {
      throw failure;
    });
    bus.on("follow", after);
    bus.emit("follow", { login: "lumen" });
    expect(after).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(failure, "follow");
  });

  it("does not skip handlers when one removes itself during emit", () => {
    const bus = createEventBus<LumenEvents>();
    const calls: string[] = [];
    bus.once("follow", () => calls.push("once"));
    bus.on("follow", () => calls.push("always"));
    bus.emit("follow", { login: "lumen" });
    expect(calls).toEqual(["once", "always"]);
  });
});

// Checked by the type checker only; never called.
export function typeTests() {
  const bus = createEventBus<LumenEvents>();

  bus.on("raid", (payload) => {
    const viewers: number = payload.viewers;
    void viewers;
  });

  // @ts-expect-error: unknown event name
  bus.on("subscribe", () => {});

  // @ts-expect-error: wrong payload shape
  bus.emit("follow", { user: "lumen" });

  // @ts-expect-error: follow requires a payload
  bus.emit("follow");

  // @ts-expect-error: stream-offline takes no payload
  bus.emit("stream-offline", { reason: "done" });
}
