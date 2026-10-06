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
      {
        id: "web",
        title: "How the Web Works",
        summary: "URLs, DNS, HTTP and version control.",
        lessons: ["url-to-response", "git"],
      },
      {
        id: "html",
        title: "HTML",
        summary: "Semantic structure, forms and accessible markup.",
        lessons: [
          "semantic-html",
          "forms",
          "accessibility-basics",
          "project-landing-page",
        ],
      },
      {
        id: "css",
        title: "CSS",
        summary: "The cascade, layout and modern responsive design.",
        lessons: [
          "cascade",
          "box-model",
          "flexbox",
          "grid",
          "modern-css",
          "responsive-design",
          "project-directory-layout",
        ],
      },
      {
        id: "javascript-basics",
        title: "JavaScript Basics",
        summary: "Values, functions, collections and the DOM.",
        lessons: [
          "values-and-types",
          "functions-and-control-flow",
          "arrays-and-objects",
          "dom-and-events",
          "project-viewer-poll",
        ],
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
        id: "javascript",
        title: "JavaScript",
        summary: "The language features modern TypeScript is built on.",
        lessons: [
          "scope-and-closures",
          "objects-and-classes",
          "modules",
          "iterators-and-generators",
          "promises-and-async",
          "cancellation-and-errors",
          "modern-ecmascript",
          "project-chat-parser",
        ],
      },
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
      {
        id: "browser",
        title: "The Browser",
        summary:
          "Loading, rendering, the event loop, requests, cookies, storage, history and security.",
        lessons: [
          "navigation-to-pixels",
          "rendering-pipeline",
          "event-loop",
          "devtools",
          "http-and-caching",
          "document-vs-async-requests",
          "cookies",
          "storage",
          "history",
          "security",
          "performance",
          "project-router",
          "project-network-detective",
        ],
      },
      {
        id: "react",
        title: "React",
        summary: "Components, the render lifecycle, hooks and state.",
        lessons: [
          "components-and-jsx",
          "render-lifecycle",
          "state",
          "structuring-state",
          "forms-and-actions",
          "effects",
          "you-might-not-need-an-effect",
          "refs",
          "reducers-and-context",
          "custom-hooks",
          "external-stores",
          "memoization-and-the-compiler",
          "transitions",
          "suspense-and-error-boundaries",
          "typescript-patterns",
          "testing",
          "project-live-chat",
          "project-stream-directory",
        ],
      },
      {
        id: "spa",
        title: "Single-Page Apps",
        summary:
          "Architecture, routing, GraphQL, Apollo Client and real-time data.",
        lessons: [
          "architecture",
          "routing",
          "server-state",
          "graphql",
          "apollo-client",
          "apollo-cache",
          "typed-graphql",
          "realtime",
          "accessibility",
          "tooling",
          "project-capstone",
        ],
      },
      {
        id: "live-coding",
        title: "Live Coding",
        summary: "Practice problems and talking through your decisions.",
        lessons: [
          "thinking-out-loud",
          "utility-drills",
          "react-drills",
          "frontend-system-design",
        ],
      },
    ],
  },
] as const satisfies readonly PathSpec[];
