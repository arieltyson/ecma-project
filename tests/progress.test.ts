import { describe, expect, it } from "vitest";
import { exportProgress, parseBackup } from "../src/state/progress.ts";

const known = new Set(["typescript/generics", "react/state"]);

describe("parseBackup", () => {
  it("reads the ids from an exported file", () => {
    const file = JSON.stringify({
      format: "ecma-progress",
      version: 1,
      completed: ["typescript/generics", "react/state"],
    });
    expect(parseBackup(file, known)).toEqual([
      "typescript/generics",
      "react/state",
    ]);
  });

  it("drops ids that are not lessons", () => {
    const file = JSON.stringify({
      format: "ecma-progress",
      completed: ["react/state", "old/lesson", 42],
    });
    expect(parseBackup(file, known)).toEqual(["react/state"]);
  });

  it.each([
    ["not JSON", "{"],
    ["another format", JSON.stringify({ completed: ["react/state"] })],
    ["a bare array", JSON.stringify(["react/state"])],
    ["null", "null"],
  ])("rejects %s", (_, text) => {
    expect(parseBackup(text, known)).toBeNull();
  });

  it("round-trips an export", () => {
    expect(parseBackup(exportProgress(), known)).toEqual([]);
  });
});
