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
  {
    id: "typescript-react",
    title: "TypeScript and React",
    summary:
      "Modern JavaScript, TypeScript in depth, the browser platform and React, ending in a single-page app you build yourself.",
    courses: [
      {
        id: "typescript",
        title: "TypeScript",
        summary: "From everyday types to type-level programming.",
        lessons: [
          "the-compiler",
          "strict-config",
          "everyday-types",
          "literal-types",
          "unions-and-narrowing",
          "discriminated-unions",
          "object-types",
          "functions",
          "generics",
          "advanced-generics",
          "type-operators",
          "conditional-types",
          "mapped-types",
          "template-literal-types",
          "utility-types",
          "assignability",
          "branded-types",
          "runtime-validation",
          "declarations",
          "type-testing",
          "project-event-bus",
          "project-route-builder",
        ],
      },
    ],
  },
] as const satisfies readonly PathSpec[];
