// The design system's single source of truth. Every colour, length,
// duration and type style on the site is defined here once, rendered
// into CSS custom properties by `cssVariables()`, and referenced by
// name from the stylesheets. tests/tokens.test.ts asserts WCAG AA
// contrast for every text pairing and that the stylesheets contain no
// raw colours or lengths.
//
// Values follow the Apple Human Interface Guidelines: the system font,
// the iOS text styles, a 4 point spacing grid, 44 point hit targets and
// the light and dark system palettes, shifted where needed to pass AA.

export type ColorPair = readonly [light: string, dark: string];

export const colors = {
  bg: ["#FFFFFF", "#000000"],
  "bg-grouped": ["#F5F5F7", "#000000"],
  surface: ["#FFFFFF", "#1C1C1E"],
  // A raised panel on the plain background, such as a card or the quiz.
  card: ["#F5F5F7", "#1C1C1E"],
  fill: ["#E8E8ED", "#2C2C2E"],
  "fill-strong": ["#D2D2D7", "#3A3A3C"],
  "code-bg": ["#F5F5F7", "#1C1C1E"],
  separator: ["#D2D2D7", "#38383A"],
  // Borders that identify a control, so they need 3:1 (WCAG 1.4.11).
  "separator-strong": ["#86868B", "#7C7C80"],
  label: ["#1D1D1F", "#F5F5F7"],
  "label-secondary": ["#636366", "#A1A1A6"],
  accent: ["#0066CC", "#2997FF"],
  "accent-fill": ["#0066CC", "#0071E3"],
  "on-accent": ["#FFFFFF", "#FFFFFF"],
  "accent-tint": ["#E8F1FB", "#0A2540"],
  success: ["#1A7F37", "#30D158"],
  "success-tint": ["#E9F6EC", "#0D2915"],
  danger: ["#C4211B", "#FF6961"],
  "danger-tint": ["#FCECEB", "#3A1311"],
  caution: ["#8F5300", "#FFD60A"],
  "caution-tint": ["#FFF5E0", "#2E2600"],
  // Translucent bar material, drawn over content with a backdrop blur.
  material: ["#FFFFFFEB", "#1C1C1EEB"],
  // Behind modal dialogs. Not text, so not contrast tested.
  scrim: ["#0000004D", "#00000099"],
} as const satisfies Record<string, ColorPair>;

// Shiki's css-variables theme reads these names. The palette is Xcode's
// default light and dark themes, adjusted to pass AA on `code-bg`.
export const syntax = {
  "shiki-foreground": ["#1D1D1F", "#F5F5F7"],
  "shiki-background": ["#F5F5F7", "#1C1C1E"],
  "shiki-token-keyword": ["#9B2393", "#FF7AB2"],
  "shiki-token-string": ["#B3261E", "#FF8170"],
  "shiki-token-string-expression": ["#B3261E", "#FF8170"],
  "shiki-token-comment": ["#5D6C79", "#8E9AA6"],
  "shiki-token-constant": ["#1C00CF", "#D9C97C"],
  "shiki-token-function": ["#326D74", "#67B7A4"],
  "shiki-token-parameter": ["#1D1D1F", "#F5F5F7"],
  "shiki-token-punctuation": ["#1D1D1F", "#F5F5F7"],
  "shiki-token-link": ["#0066CC", "#2997FF"],
  "shiki-token-inserted": ["#1A7F37", "#30D158"],
  "shiki-token-deleted": ["#C4211B", "#FF6961"],
} as const satisfies Record<string, ColorPair>;

/** Text colour → every background it is drawn on. */
export const contrastPairs = {
  label: [
    "bg",
    "bg-grouped",
    "surface",
    "fill",
    "code-bg",
    "card",
    "accent-tint",
    "success-tint",
    "danger-tint",
    "caution-tint",
  ],
  "label-secondary": ["bg", "bg-grouped", "surface", "code-bg", "card", "fill"],
  accent: ["bg", "bg-grouped", "surface", "code-bg", "card", "accent-tint"],
  "on-accent": ["accent-fill"],
  success: ["bg", "surface", "success-tint"],
  danger: ["bg", "surface", "danger-tint"],
  caution: ["bg", "caution-tint"],
} as const satisfies Partial<
  Record<keyof typeof colors, readonly (keyof typeof colors)[]>
>;

/** Non-text boundaries that must reach 3:1 against their surroundings. */
export const uiPairs = {
  "separator-strong": ["bg", "bg-grouped", "surface"],
  accent: ["bg", "surface"],
} as const satisfies Partial<
  Record<keyof typeof colors, readonly (keyof typeof colors)[]>
>;

// A 4 point grid, in rem so spacing follows the reader's font size.
export const space = {
  "0": "0",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
  "16": "4rem",
  "20": "5rem",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.625rem",
  lg: "0.875rem",
  xl: "1.25rem",
  pill: "62.5rem",
} as const;

export const size = {
  hairline: "1px",
  "focus-ring": "3px",
  "underline-offset": "0.2em",
  "code-inline": "0.9em",
  // The HIG minimum hit target, 44 points.
  "hit-target": "2.75rem",
  "nav-height": "3.25rem",
  icon: "1.25rem",
  "icon-sm": "1rem",
  "icon-lg": "1.75rem",
  "ring-sm": "1.75rem",
  measure: "42rem",
  "hero-measure": "14em",
  content: "62rem",
  dialog: "36rem",
  sidebar: "14rem",
  "blur-material": "20px",
} as const;

export const font = {
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif',
  display:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
} as const;

// The iOS text styles at the default Dynamic Type size, as
// [font size, line height, weight, tracking].
export type TextStyle = readonly [
  size: string,
  leading: string,
  weight: number,
  tracking: string,
];

export const text = {
  hero: ["clamp(2.5rem, 2rem + 3vw, 4rem)", "1.05", 700, "-0.025em"],
  "large-title": ["2.125rem", "1.2", 700, "-0.02em"],
  title1: ["1.75rem", "1.2", 700, "-0.015em"],
  title2: ["1.375rem", "1.27", 650, "-0.01em"],
  title3: ["1.25rem", "1.3", 600, "-0.005em"],
  headline: ["1.0625rem", "1.4", 600, "0"],
  body: ["1.0625rem", "1.6", 400, "0"],
  callout: ["1rem", "1.5", 400, "0"],
  subheadline: ["0.9375rem", "1.45", 400, "0"],
  footnote: ["0.8125rem", "1.4", 400, "0"],
  caption: ["0.75rem", "1.35", 500, "0.01em"],
  code: ["0.875rem", "1.6", 400, "0"],
} as const satisfies Record<string, TextStyle>;

export const motion = {
  fast: "150ms",
  base: "250ms",
  slow: "400ms",
  // Apple's default ease and a soft spring-like settle.
  ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  settle: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

export const shadow = {
  raised: "0 1px 2px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.06)",
  dialog: "0 8px 40px rgb(0 0 0 / 0.24)",
} as const;

/** Viewport widths for @media queries, which cannot read variables. */
export const breakpoints = {
  wide: "64rem",
  medium: "48rem",
} as const;

function block(prefix: string, values: Record<string, string>): string[] {
  return Object.entries(values).map(
    ([name, value]) => `  --${prefix}${name}: ${value};`,
  );
}

export function cssVariables(): string {
  const palette = Object.entries({ ...colors, ...syntax }).map(
    ([name, [light, dark]]) => `  --${name}: light-dark(${light}, ${dark});`,
  );
  const textStyles = Object.entries(text).flatMap(
    ([name, [fontSize, leading, weight, tracking]]) => [
      `  --text-${name}-size: ${fontSize};`,
      `  --text-${name}-leading: ${leading};`,
      `  --text-${name}-weight: ${weight};`,
      `  --text-${name}-tracking: ${tracking};`,
    ],
  );
  const lines = [
    ...palette,
    ...block("space-", space),
    ...block("radius-", radius),
    ...block("size-", size),
    ...block("font-", font),
    ...textStyles,
    ...block("motion-", motion),
    ...block("shadow-", shadow),
  ];
  return `:root {\n${lines.join("\n")}\n}\n`;
}
