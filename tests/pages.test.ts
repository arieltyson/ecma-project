// Checks the prerendered pages in dist/. Runs after `npm run build`
// (the order `npm run check` uses) and is skipped when dist/ is absent.

import { createHash } from "node:crypto";
import { existsSync, globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const dist = join(import.meta.dirname, "../dist");
const pages = existsSync(dist) ? globSync("**/*.html", { cwd: dist }) : [];

function accessibleName(element: Element): string {
  const labelledBy = element.getAttribute("aria-labelledby");
  const labelled = labelledBy
    ? element.ownerDocument.getElementById(labelledBy)?.textContent
    : undefined;
  return (
    element.getAttribute("aria-label") ??
    labelled ??
    element.textContent ??
    ""
  ).trim();
}

describe.runIf(pages.length > 0)("prerendered pages", () => {
  it("include every route", () => {
    expect(pages.length).toBeGreaterThan(100);
    expect(pages).toContain("404.html");
  });

  describe.each(pages)("%s", (file) => {
    const html = readFileSync(join(dist, file), "utf8");
    const { document } = new JSDOM(html).window;

    it("declares English and has a title and description", () => {
      expect(document.documentElement.lang).toBe("en");
      expect(document.title).toMatch(/The ECMA Project/);
      const description = document.querySelector('meta[name="description"]');
      expect(description?.getAttribute("content")?.length).toBeGreaterThan(10);
    });

    it("has one main landmark and one h1", () => {
      expect(document.querySelectorAll("main")).toHaveLength(1);
      expect(document.querySelectorAll("h1")).toHaveLength(1);
    });

    it("has headings that do not skip levels", () => {
      const levels = [
        ...document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
      ].map((h) => Number(h.tagName[1]));
      const skips = levels.filter(
        (level, i) => i > 0 && level > (levels[i - 1] ?? 1) + 1,
      );
      expect(skips).toEqual([]);
    });

    it("has unique ids", () => {
      const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(duplicates).toEqual([]);
    });

    it("names every link, button and form control", () => {
      const unnamed = [...document.querySelectorAll("a, button")]
        .filter((el) => accessibleName(el) === "")
        .map((el) => el.outerHTML.slice(0, 80));
      expect(unnamed).toEqual([]);
      const inputs = [
        ...document.querySelectorAll("input, select, textarea"),
      ].filter(
        (el) =>
          !el.closest("label") &&
          !el.getAttribute("aria-label") &&
          !document.querySelector(`label[for="${el.id}"]`),
      );
      expect(inputs).toEqual([]);
    });

    it("gives every image alternative text", () => {
      expect(document.querySelectorAll("img:not([alt])")).toHaveLength(0);
    });

    it("allows its inline scripts by hash in the security policy", () => {
      const policy =
        document
          .querySelector('meta[http-equiv="Content-Security-Policy"]')
          ?.getAttribute("content") ?? "";
      expect(policy).toContain("object-src 'none'");
      for (const script of document.querySelectorAll("script:not([src])")) {
        const hash = createHash("sha256")
          .update(script.textContent ?? "")
          .digest("base64");
        expect(policy).toContain(`'sha256-${hash}'`);
      }
    });

    it("records the route it was rendered for", () => {
      const route = document.getElementById("root")?.dataset["route"] ?? "";
      const expected = file.endsWith("index.html")
        ? `/ecma-project/${file.replace(/index\.html$/, "")}`
        : `/ecma-project/${file}`;
      expect(route).toBe(expected);
    });

    it("renders the page content without JavaScript", () => {
      expect(
        document.querySelector("#root main")?.textContent?.length,
      ).toBeGreaterThan(20);
    });
  });
});
