import { describe, expect, it } from "vitest";
import {
  ABOUT_TABS,
  href,
  matchRoute,
  type Route,
} from "../src/router/routes.ts";

const BASE = import.meta.env.BASE_URL;

describe("routes", () => {
  const examples: Route[] = [
    { name: "home" },
    { name: "path", pathId: "foundations" },
    { name: "course", courseId: "typescript" },
    { name: "lesson", courseId: "typescript", slug: "generics" },
    ...ABOUT_TABS.map((tab) => ({ name: "about", tab }) as const),
  ];

  for (const route of examples) {
    it(`round-trips ${href(route)}`, () => {
      expect(matchRoute(href(route))).toEqual(route);
    });
  }

  it("builds trailing-slash URLs under the base path", () => {
    expect(href({ name: "course", courseId: "react" })).toBe(
      `${BASE}courses/react/`,
    );
  });

  it("accepts URLs without the trailing slash", () => {
    expect(matchRoute(`${BASE}courses/react`)).toEqual({
      name: "course",
      courseId: "react",
    });
  });

  it.each([
    "paths",
    "paths/a/b",
    "lessons/only-course",
    "about/unknown",
    "nowhere",
  ])("does not match %s", (path) => {
    expect(matchRoute(BASE + path)).toEqual({ name: "not-found" });
  });
});
