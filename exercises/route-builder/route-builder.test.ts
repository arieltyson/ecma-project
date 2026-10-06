import { describe, expect, expectTypeOf, it } from "vitest";
import { defineRoutes, type PathParams } from "./route-builder.ts";

const routes = defineRoutes({
  home: "/",
  directory: "/directory",
  channel: "/channels/:login",
  clip: "/channels/:login/clips/:clipId",
});

describe("href", () => {
  it("builds paths without parameters", () => {
    expect(routes.href("home")).toBe("/");
    expect(routes.href("directory")).toBe("/directory");
  });

  it("fills in parameters", () => {
    expect(routes.href("clip", { login: "lumen", clipId: "42" })).toBe(
      "/channels/lumen/clips/42",
    );
  });

  it("encodes parameter values", () => {
    expect(routes.href("channel", { login: "a b/c" })).toBe(
      "/channels/a%20b%2Fc",
    );
  });
});

describe("match", () => {
  it("matches static routes", () => {
    expect(routes.match("/directory")).toEqual({
      name: "directory",
      params: {},
    });
  });

  it("matches a trailing slash", () => {
    expect(routes.match("/directory/")?.name).toBe("directory");
  });

  it("extracts and decodes parameters", () => {
    expect(routes.match("/channels/a%20b%2Fc")).toEqual({
      name: "channel",
      params: { login: "a b/c" },
    });
  });

  it("round-trips href output", () => {
    const path = routes.href("clip", { login: "lumen", clipId: "a/b" });
    expect(routes.match(path)).toEqual({
      name: "clip",
      params: { login: "lumen", clipId: "a/b" },
    });
  });

  it("returns null when nothing matches", () => {
    expect(routes.match("/channels")).toBeNull();
    expect(routes.match("/channels/lumen/extra")).toBeNull();
  });
});

// Checked by the type checker only; never called.
export function typeTests() {
  expectTypeOf<PathParams<"/">>().toEqualTypeOf<{}>();
  expectTypeOf<PathParams<"/channels/:login">>().toEqualTypeOf<{
    login: string;
  }>();
  expectTypeOf<PathParams<"/c/:login/clips/:clipId">>().toEqualTypeOf<{
    login: string;
    clipId: string;
  }>();

  // @ts-expect-error: unknown route
  routes.href("settings");

  // @ts-expect-error: clip needs clipId
  routes.href("clip", { login: "lumen" });

  // @ts-expect-error: misspelled parameter
  routes.href("channel", { logn: "lumen" });

  // @ts-expect-error: home takes no parameters
  routes.href("home", { login: "lumen" });

  const match = routes.match("/");
  if (match?.name === "clip") {
    expectTypeOf(match.params).toEqualTypeOf<{
      login: string;
      clipId: string;
    }>();
  }
}
