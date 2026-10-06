import { describe, expect, it } from "vitest";
import { compileLesson, readFrontmatter } from "../plugins/markdown.ts";

const FRONTMATTER = `---
title: Example
summary: An example lesson.
minutes: 5
objectives:
  - Learn something.
---
`;

describe("readFrontmatter", () => {
  it("applies defaults", () => {
    const data = readFrontmatter(FRONTMATTER, "example.md");
    expect(data.kind).toBe("lesson");
    expect(data.quiz).toEqual([]);
  });

  it("rejects a quiz answer outside the options", () => {
    const source = FRONTMATTER.replace(
      "---\n",
      "---\nquiz:\n  - question: Q?\n    options: [a, b]\n    answer: 2\n    explanation: E.\n",
    );
    expect(() => readFrontmatter(source, "bad.md")).toThrow(/answer/);
  });

  it("rejects unknown keys", () => {
    const source = FRONTMATTER.replace("minutes: 5", "minutes: 5\nauthor: x");
    expect(() => readFrontmatter(source, "bad.md")).toThrow(/bad\.md/);
  });

  it("requires frontmatter", () => {
    expect(() => readFrontmatter("# Hi", "none.md")).toThrow(/frontmatter/);
  });
});

describe("compileLesson", () => {
  it("collects level-two headings", async () => {
    const { headings } = await compileLesson(
      `${FRONTMATTER}\n## First\n\n### Skipped\n\n## Second \`code\`\n`,
      "x.md",
    );
    expect(headings).toEqual([
      { id: "first", text: "First" },
      { id: "second-code", text: "Second code" },
    ]);
  });

  it("highlights code into CSS variables with a copy button", async () => {
    const { html } = await compileLesson(
      `${FRONTMATTER}\n\`\`\`ts\nconst a = 1;\n\`\`\`\n`,
      "x.md",
    );
    expect(html).toContain('<div class="code-block">');
    expect(html).toContain("data-copy");
    expect(html).toContain("var(--shiki-token-keyword)");
  });

  it("turns alerts into labelled callouts", async () => {
    const { html } = await compileLesson(
      `${FRONTMATTER}\n> [!TIP]\n> Try it.\n`,
      "x.md",
    );
    expect(html).toContain('class="callout" data-kind="tip"');
    expect(html).toContain('<p class="callout-title">Tip</p>');
    expect(html).not.toContain("[!TIP]");
  });

  it("prefixes root-relative links with the base path", async () => {
    const { html } = await compileLesson(
      `${FRONTMATTER}\n[a](/lessons/x/y/) [b](https://example.com)\n`,
      "x.md",
      "/base/",
    );
    expect(html).toContain('href="/base/lessons/x/y/" data-internal');
    expect(html).toContain('href="https://example.com" rel="noreferrer"');
  });

  it("wraps tables so they scroll inside the column", async () => {
    const { html } = await compileLesson(
      `${FRONTMATTER}\n| a |\n| - |\n| 1 |\n`,
      "x.md",
    );
    expect(html).toMatch(/<div class="table-scroll" tabindex="0"><table>/);
  });
});

describe("task lists", () => {
  it("label each checkbox and enable it", async () => {
    const { html } = await compileLesson(
      `${FRONTMATTER}\n- [ ] Tested\n`,
      "x.md",
    );
    expect(html).toMatch(
      /<li class="task-list-item"><label><input type="checkbox">/,
    );
    expect(html).not.toContain("disabled");
  });
});
