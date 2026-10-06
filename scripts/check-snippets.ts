// Type-checks every ```ts and ```tsx block in the lessons under the
// project's strict compiler options. Each block becomes its own module,
// so blocks never see each other's names. Blocks that are deliberately
// partial are fenced as ```ts nocheck. Deliberate errors are marked
// with // @ts-expect-error, which fails if the error goes away.

import { execFileSync } from "node:child_process";
import {
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, ".cache", "snippets");
const FENCE = /^```(tsx|typescript|ts)([^\n]*)\n([\s\S]*?)^```$/gm;

interface Snippet {
  readonly file: string;
  readonly line: number;
  readonly code: string;
  readonly ext: "ts" | "tsx";
}

function collect(): Snippet[] {
  const files = globSync("content/lessons/**/*.md", { cwd: root });
  return files.flatMap((file) => {
    const source = readFileSync(join(root, file), "utf8");
    return [...source.matchAll(FENCE)]
      .filter(([, , meta = ""]) => !/\bnocheck\b/.test(meta))
      .map(([, lang = "ts", , code = ""], i, all) => ({
        file,
        line: source.slice(0, all[i]?.index).split("\n").length + 1,
        code,
        ext: lang === "tsx" ? "tsx" : "ts",
      }));
  });
}

const snippets = collect();
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const [i, snippet] of snippets.entries()) {
  const name = `s${String(i).padStart(4, "0")}.${snippet.ext}`;
  writeFileSync(join(out, name), `${snippet.code}\nexport {};\n`);
}

writeFileSync(
  join(out, "tsconfig.json"),
  JSON.stringify({
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      lib: ["es2024", "esnext.disposable", "dom", "dom.iterable"],
      jsx: "react-jsx",
      types: ["node"],
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowUnreachableCode: true,
    },
    include: ["*.ts", "*.tsx"],
  }),
);

try {
  execFileSync(join(root, "node_modules", ".bin", "tsc"), ["-p", out], {
    encoding: "utf8",
  });
  console.log(`Type-checked ${snippets.length} snippets.`);
} catch (error) {
  const output = String((error as { stdout?: string }).stdout ?? error);
  const located = output.replace(
    /(?:[^\s(]*\/)?s(\d{4})\.tsx?\((\d+),(\d+)\)/g,
    (match, index: string, line: string, column: string) => {
      const snippet = snippets[Number(index)];
      if (!snippet) return match;
      const at = snippet.line + Number(line) - 1;
      return `${relative(root, join(root, snippet.file))}:${at}:${column}`;
    },
  );
  console.error(located);
  process.exitCode = 1;
}
