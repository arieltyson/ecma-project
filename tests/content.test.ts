import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readFrontmatter } from "../plugins/markdown.ts";

const root = join(import.meta.dirname, "..");
const files = globSync("content/lessons/**/*.md", { cwd: root });

describe.each(files)("%s", (file) => {
  const source = readFileSync(join(root, file), "utf8");
  const frontmatter = readFrontmatter(source, file);
  const body = source.slice(source.indexOf("\n---\n") + 5);

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

  if (frontmatter.kind === "lesson") {
    it("ends with an assignment and has a knowledge check", () => {
      expect(body).toMatch(/^## Assignment$/m);
      expect(frontmatter.quiz.length).toBeGreaterThanOrEqual(3);
    });
  } else {
    it("states requirements and questions to explain", () => {
      expect(body).toMatch(/^## Requirements$/m);
      expect(body).toMatch(/^## Explain it$/m);
    });
  }

  it("uses no em or en dashes", () => {
    expect(source).not.toMatch(/[–—]/);
  });

  it("does not start with a level-one heading", () => {
    expect(body).not.toMatch(/^# /m);
  });
});
