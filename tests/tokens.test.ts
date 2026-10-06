import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/design/contrast.ts";
import {
  breakpoints,
  colors,
  contrastPairs,
  cssVariables,
  syntax,
  uiPairs,
} from "../src/design/tokens.ts";

const THEMES = [
  ["light", 0],
  ["dark", 1],
] as const;

type ColorName = keyof typeof colors;

function pairs(table: Partial<Record<ColorName, readonly ColorName[]>>) {
  return Object.entries(table).flatMap(([fg, bgs]) =>
    (bgs ?? []).map((bg) => [fg as ColorName, bg] as const),
  );
}

describe("colour contrast", () => {
  for (const [theme, index] of THEMES) {
    for (const [fg, bg] of pairs(contrastPairs)) {
      it(`${fg} on ${bg} is at least 4.5:1 in ${theme}`, () => {
        const ratio = contrastRatio(colors[fg][index], colors[bg][index]);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
    for (const [fg, bg] of pairs(uiPairs)) {
      it(`${fg} against ${bg} is at least 3:1 in ${theme}`, () => {
        const ratio = contrastRatio(colors[fg][index], colors[bg][index]);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });
    }
    for (const [name, value] of Object.entries(syntax)) {
      if (name === "shiki-background") continue;
      it(`${name} on the code background is at least 4.5:1 in ${theme}`, () => {
        const background = syntax["shiki-background"][index];
        expect(contrastRatio(value[index], background)).toBeGreaterThanOrEqual(
          4.5,
        );
      });
    }
  }
});

describe("stylesheets", () => {
  const root = join(import.meta.dirname, "../src");
  const sheets = globSync("**/*.css", { cwd: root }).map(
    (file) => [file, readFileSync(join(root, file), "utf8")] as const,
  );

  it("exist", () => {
    expect(sheets.length).toBeGreaterThan(0);
  });

  for (const [file, css] of sheets) {
    const body = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("@media"))
      .join("\n");

    it(`${file} uses tokens instead of raw colours`, () => {
      expect(body.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi)).toBeNull();
    });

    it(`${file} uses tokens instead of raw lengths`, () => {
      const lengths = body.match(/\b\d*\.?\d+(px|rem|em|vh|vw|ms|s)\b/g) ?? [];
      expect(
        lengths.filter((length) => Number.parseFloat(length) !== 0),
      ).toEqual([]);
    });

    it(`${file} only queries the shared breakpoints`, () => {
      const allowed = new Set<string>(Object.values(breakpoints));
      const widths = [...css.matchAll(/width\s*[<>]=?\s*([\d.]+rem)/g)].map(
        (match) => match[1],
      );
      for (const width of widths) expect(allowed).toContain(width);
    });
  }
});

describe("cssVariables", () => {
  it("defines every colour with light-dark()", () => {
    const css = cssVariables();
    for (const [name, [light, dark]] of Object.entries(colors)) {
      expect(css).toContain(`--${name}: light-dark(${light}, ${dark});`);
    }
  });
});
