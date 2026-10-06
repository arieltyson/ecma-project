import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCatalog } from "../plugins/content.ts";
import { readFrontmatter } from "../plugins/markdown.ts";
import { matchRoute } from "../src/router/routes.ts";

const root = join(import.meta.dirname, "..");
const files = globSync("content/lessons/**/*.md", { cwd: root });

describe.each(files)("%s", (file) => {
  const source = readFileSync(join(root, file), "utf8");
  const frontmatter = readFrontmatter(source, file);
  const body = source.slice(source.indexOf("\n---\n") + 5);
  const prose = body.replace(/^```[\s\S]*?^```$/gm, "");

  it("has no escaped characters left in its text", () => {
    const strings = [
      frontmatter.title,
      frontmatter.summary,
      ...frontmatter.objectives,
      ...frontmatter.quiz.flatMap((q) => [
        q.question,
        q.explanation,
        ...q.options,
      ]),
    ];
    for (const text of strings) expect(text).not.toContain("\\");
  });

  it("has distinct quiz options", () => {
    for (const { options } of frontmatter.quiz) {
      expect(new Set(options).size).toBe(options.length);
    }
  });

  const isLesson = frontmatter.kind === "lesson";

  it.runIf(isLesson)(
    "ends with an assignment and has a knowledge check",
    () => {
      expect(prose).toMatch(/^## Assignment$/m);
      expect(frontmatter.quiz.length).toBeGreaterThanOrEqual(3);
    },
  );

  it.runIf(!isLesson)("states requirements and questions to explain", () => {
    expect(body).toMatch(/^## Requirements$/m);
    expect(body).toMatch(/^## Explain it$/m);
  });

  it("uses no em or en dashes", () => {
    expect(source).not.toMatch(/[–—]/);
  });

  it("does not start with a level-one heading", () => {
    expect(prose).not.toMatch(/^# /m);
  });
});

describe("internal links", () => {
  const paths = buildCatalog(root);
  const lessonIds = new Set(
    paths.flatMap((p) => p.courses.flatMap((c) => c.lessons.map((l) => l.id))),
  );
  const courseIds = new Set(paths.flatMap((p) => p.courses.map((c) => c.id)));
  const pathIds = new Set(paths.map((p) => p.id));

  function exists(href: string): boolean {
    const route = matchRoute(href);
    switch (route.name) {
      case "home":
      case "about":
        return true;
      case "path":
        return pathIds.has(route.pathId);
      case "course":
        return courseIds.has(route.courseId);
      case "lesson":
        return lessonIds.has(`${route.courseId}/${route.slug}`);
      case "not-found":
        return false;
    }
  }

  it.each(files)("%s links only to pages that exist", (file) => {
    const source = readFileSync(join(root, file), "utf8");
    const hrefs = [...source.matchAll(/\]\((\/[^)\s#]*)/g)].map(
      (m) => m[1] ?? "",
    );
    for (const href of hrefs) expect(exists(href), href).toBe(true);
  });
});
