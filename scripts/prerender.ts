// Renders every route to its own index.html inside dist/, so each URL
// is a real document: readable without JavaScript, indexable, and
// served by GitHub Pages without a single-page fallback.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type * as Server from "../src/entry-server.tsx";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");

const server = (await import(
  pathToFileURL(join(root, "dist-server", "entry-server.js")).href
)) as typeof Server;

const { BASE } = server;
const template = await readFile(join(dist, "index.html"), "utf8");

function escape(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function outputFile(url: string): string {
  const relative = url.slice(BASE.length);
  return relative.endsWith(".html")
    ? join(dist, relative)
    : join(dist, relative, "index.html");
}

const routes = server.routes();
for (const route of routes) {
  const page = await server.render(route);
  const document = template
    .replace("<!--app-->", page.html)
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(
      '<meta name="description" content="" />',
      `<meta name="description" content="${escape(page.description)}" />`,
    );
  const file = outputFile(page.url);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, document);
}

console.log(`Prerendered ${routes.length} pages.`);
