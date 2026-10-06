// A Vite plugin that turns content/ into modules: `virtual:catalog`
// exports every path, course and lesson's metadata, and each lesson's
// `.md` file compiles to a module exporting its HTML, headings, quiz
// and resources, so lesson bodies are code split.

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Plugin } from "vite";
import { catalog } from "../content/catalog.ts";
import type {
  LessonBody,
  LessonMeta,
  PathMeta,
} from "../src/content/schema.ts";
import { compileLesson, readFrontmatter } from "./markdown.ts";

const VIRTUAL_ID = "virtual:catalog";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

export function lessonsDir(root: string): string {
  return join(root, "content", "lessons");
}

/** Throws unless the catalog and the lesson files match one to one. */
export function checkCatalog(root: string): void {
  const dir = lessonsDir(root);
  const listed = new Set(
    catalog.flatMap((path) =>
      path.courses.flatMap((course) =>
        course.lessons.map((slug) => `${course.id}/${slug}.md`),
      ),
    ),
  );
  const onDisk = new Set(
    readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.split(sep).join("/")),
  );
  const missing = [...listed].filter((file) => !onDisk.has(file));
  const unlisted = [...onDisk].filter((file) => !listed.has(file));
  if (missing.length > 0 || unlisted.length > 0) {
    throw new Error(
      [
        missing.length > 0 && `Missing lesson files: ${missing.join(", ")}`,
        unlisted.length > 0 && `Not in catalog: ${unlisted.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

export function buildCatalog(root: string): PathMeta[] {
  checkCatalog(root);
  return catalog.map((path) => ({
    id: path.id,
    title: path.title,
    summary: path.summary,
    courses: path.courses.map((course) => ({
      id: course.id,
      pathId: path.id,
      title: course.title,
      summary: course.summary,
      lessons: course.lessons.map((slug): LessonMeta => {
        const file = join(lessonsDir(root), course.id, `${slug}.md`);
        const { title, summary, kind, minutes } = readFrontmatter(
          readFileSync(file, "utf8"),
          file,
        );
        return {
          id: `${course.id}/${slug}`,
          courseId: course.id,
          slug,
          title,
          summary,
          kind,
          minutes,
        };
      }),
    })),
  }));
}

export function content(): Plugin {
  let root = process.cwd();
  let base = "/";
  return {
    name: "ecma:content",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
      base = config.base;
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const dir = lessonsDir(root);
      this.addWatchFile(join(root, "content", "catalog.ts"));
      for (const file of readdirSync(dir, { recursive: true })) {
        this.addWatchFile(join(dir, String(file)));
      }
      return `export const paths = ${JSON.stringify(buildCatalog(root))};`;
    },
    async transform(source, id) {
      if (!id.endsWith(".md")) return undefined;
      const file = relative(root, id);
      const { frontmatter, html, headings } = await compileLesson(
        source,
        file,
        base,
      );
      const body: LessonBody = {
        html,
        headings,
        objectives: frontmatter.objectives,
        quiz: frontmatter.quiz,
        resources: frontmatter.resources,
      };
      return { code: `export default ${JSON.stringify(body)};`, map: null };
    },
    hotUpdate({ file }) {
      if (!file.endsWith(".md") && !file.endsWith("catalog.ts")) return;
      const { moduleGraph } = this.environment;
      const module = moduleGraph.getModuleById(RESOLVED_ID);
      if (module) moduleGraph.invalidateModule(module);
    },
  };
}
