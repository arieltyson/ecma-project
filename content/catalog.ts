// The order of every path, course and lesson. Each lesson slug maps to
// content/lessons/<course id>/<slug>.md, and the build fails if a slug
// has no file or a file has no slug.

export interface CourseSpec {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly lessons: readonly string[];
}

export interface PathSpec {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly courses: readonly CourseSpec[];
}

export const catalog = [
  {
    id: "foundations",
    title: "Foundations",
    summary:
      "How the web works, and the HTML, CSS and JavaScript every page is made of.",
    courses: [
      {
        id: "introduction",
        title: "Introduction",
        summary: "How the curriculum works and the tools you will use.",
        lessons: ["how-this-works", "setup", "devtools-tour"],
      },
    ],
  },
] as const satisfies readonly PathSpec[];
