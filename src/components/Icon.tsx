// Line icons drawn on a 24 unit grid in the style of SF Symbols. They
// are decorative: the text or label next to them carries the meaning.

import "./Icon.css";

const PATHS = {
  "chevron-right": "M9 5.5 15.5 12 9 18.5",
  "chevron-left": "M15 5.5 8.5 12 15 18.5",
  search: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm4.75 11.25L20 20",
  check: "M5.5 12.5 10 17l8.5-9.5",
  close: "M6.5 6.5l11 11m0-11-11 11",
  book: "M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5v-13ZM12 6v13",
  hammer:
    "M13.5 6.5 17.5 10.5M4.5 19.5l9-9M11 4l2.5 2.5L15 5l4 4-1.5 1.5L20 13l-2 2-7-7-1.5-1.5L11 4Z",
  arrow: "M5 12h13.5M13 6.5l5.5 5.5-5.5 5.5",
  sun: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4",
  moon: "M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z",
  auto: "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 0v16",
  external:
    "M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V14M13 5h6v6m0-6-8.5 8.5",
  copy: "M8.5 8.5h10v10h-10zM15.5 8.5v-3h-10v10h3",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = "md",
}: {
  readonly name: IconName;
  readonly size?: "sm" | "md" | "lg";
}) {
  return (
    <svg
      className="icon"
      data-size={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
