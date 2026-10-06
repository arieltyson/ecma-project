// WCAG 2.2 relative luminance and contrast ratio for opaque sRGB hex
// colours. https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio

function channel(hex: string): number {
  const value = Number.parseInt(hex, 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function luminance(color: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (!match) throw new Error(`Expected an opaque #RRGGBB colour: ${color}`);
  const [, r = "", g = "", b = ""] = match;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].toSorted(
    (x, y) => y - x,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}
