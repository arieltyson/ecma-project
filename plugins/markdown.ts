// Compiles one lesson's Markdown into HTML at build time: GitHub
// alerts become callouts, code is highlighted by Shiki into CSS
// variables (so light and dark share one theme), root-relative links
// gain the site's base path, and level-two headings are collected for
// the on-page contents.

import type { Element, ElementContent, Root as HastRoot } from "hast";
import type { Blockquote, Paragraph, Root as MdastRoot } from "mdast";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
  createCssVariablesTheme,
  createHighlighter,
  type ShikiTransformer,
} from "shiki";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";
import { Frontmatter, type Heading } from "../src/content/schema.ts";

export const LANGUAGES = [
  "bash",
  "css",
  "diff",
  "graphql",
  "html",
  "http",
  "javascript",
  "json",
  "jsx",
  "text",
  "tsx",
  "typescript",
] as const;

const theme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  fontStyle: true,
});

const highlighter = await createHighlighter({
  themes: [theme],
  langs: [...LANGUAGES],
});

const ALERTS = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Watch out",
  CAUTION: "Caution",
} as const;

type AlertKind = keyof typeof ALERTS;

function isAlertKind(value: string): value is AlertKind {
  return Object.hasOwn(ALERTS, value);
}

/** `> [!TIP]` blockquotes become `<div class="callout" role="note">`. */
function remarkCallouts() {
  return (tree: MdastRoot) => {
    for (const node of tree.children) {
      if (node.type !== "blockquote") continue;
      const kind = alertKind(node);
      if (!kind) continue;
      node.data = {
        hName: "div",
        hProperties: { className: ["callout"], dataKind: kind.toLowerCase() },
      };
      const label: Paragraph = {
        type: "paragraph",
        data: { hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: ALERTS[kind] }],
      };
      node.children.unshift(label);
    }
  };
}

function alertKind(node: Blockquote): AlertKind | undefined {
  const first = node.children[0];
  if (first?.type !== "paragraph") return undefined;
  const lead = first.children[0];
  if (lead?.type !== "text") return undefined;
  const match = /^\[!(\w+)\]\s*/.exec(lead.value);
  const kind = match?.[1];
  if (!match || !kind || !isAlertKind(kind)) return undefined;
  lead.value = lead.value.slice(match[0].length);
  if (lead.value === "") first.children.shift();
  if (first.children.length === 0) node.children.shift();
  return kind;
}

function walk(node: HastRoot | Element, visit: (el: Element) => void) {
  for (const child of node.children) {
    if (child.type !== "element") continue;
    visit(child);
    walk(child, visit);
  }
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

interface Collected {
  headings: Heading[];
}

function rehypeSite(base: string, collected: Collected) {
  return () => (tree: HastRoot) => {
    const wrappers: (() => void)[] = [];
    walk(tree, (el) => {
      if (el.tagName === "h2" && typeof el.properties["id"] === "string") {
        collected.headings.push({
          id: el.properties["id"],
          text: el.children.map(textOf).join(""),
        });
      }
      const href = el.properties["href"];
      if (el.tagName === "a" && typeof href === "string") {
        if (href.startsWith("/")) {
          el.properties["href"] = base + href.slice(1);
          el.properties["dataInternal"] = "";
        } else if (/^https?:/.test(href)) {
          el.properties["rel"] = ["noreferrer"];
        }
      }
      if (el.tagName === "table") wrappers.push(() => wrapTable(el));
      if (isTaskItem(el)) wrappers.push(() => labelTask(el));
    });
    for (const wrap of wrappers) wrap();
  };
}

function isTaskItem(el: Element): boolean {
  const className = el.properties["className"];
  return (
    el.tagName === "li" &&
    Array.isArray(className) &&
    className.includes("task-list-item")
  );
}

/**
 * GitHub task list items render a disabled, unlabelled checkbox. Wrap
 * each item's content in a label and enable the box, so a checklist can
 * be ticked off and every checkbox has an accessible name.
 */
function labelTask(item: Element) {
  for (const child of item.children) {
    if (child.type === "element" && child.tagName === "input") {
      delete child.properties["disabled"];
    }
  }
  item.children = [
    {
      type: "element",
      tagName: "label",
      properties: {},
      children: item.children,
    },
  ];
}

/** Lets wide tables scroll inside the reading column, not the page. */
function wrapTable(table: Element) {
  const inner: Element = { ...table };
  table.tagName = "div";
  table.properties = { className: ["table-scroll"], tabIndex: 0 };
  table.children = [inner];
}

/**
 * Wraps each highlighted block with a copy button, wired up on the
 * client by event delegation. This runs as a Shiki transformer because
 * Shiki replaces code blocks after later rehype plugins have run.
 */
const copyButton: ShikiTransformer = {
  name: "copy-button",
  root(root) {
    root.children = [
      {
        type: "element",
        tagName: "div",
        properties: { className: ["code-block"] },
        children: [
          {
            type: "element",
            tagName: "button",
            properties: { type: "button", className: ["copy"], dataCopy: "" },
            children: [{ type: "text", value: "Copy" }],
          },
          ...root.children.filter((node) => node.type === "element"),
        ],
      },
    ];
  },
};

export interface CompiledLesson {
  readonly frontmatter: Frontmatter;
  readonly html: string;
  readonly headings: readonly Heading[];
}

export function readFrontmatter(source: string, file: string): Frontmatter {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match?.[1]) throw new Error(`${file}: missing YAML frontmatter`);
  let data: unknown;
  try {
    data = parseYaml(match[1]);
  } catch (error) {
    throw new Error(`${file}: invalid YAML frontmatter`, { cause: error });
  }
  const result = Frontmatter.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`${file}: invalid frontmatter\n${issues}`);
  }
  return result.data;
}

export async function compileLesson(
  source: string,
  file: string,
  base = "/",
): Promise<CompiledLesson> {
  const frontmatter = readFrontmatter(source, file);
  const collected: Collected = { headings: [] };
  const html = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeShikiFromHighlighter, highlighter, {
      theme: "css-variables",
      defaultLanguage: "text",
      fallbackLanguage: "text",
      transformers: [copyButton],
    })
    .use(rehypeSite(base, collected))
    .use(rehypeStringify)
    .process(source);
  return { frontmatter, html: String(html), headings: collected.headings };
}
