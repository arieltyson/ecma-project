import { z } from "zod";

const text = z.string().trim().min(1);

export const QuizQuestion = z
  .strictObject({
    question: text,
    options: z.array(text).min(2).max(5),
    answer: z.int().nonnegative(),
    explanation: text,
  })
  .refine((q) => q.answer < q.options.length, {
    message: "answer must index into options",
    path: ["answer"],
  });

export const Resource = z.strictObject({
  title: text,
  url: z.url({ protocol: /^https$/ }),
});

export const Frontmatter = z.strictObject({
  title: text,
  summary: text,
  kind: z.enum(["lesson", "project"]).default("lesson"),
  minutes: z.int().positive(),
  objectives: z.array(text).min(1),
  quiz: z.array(QuizQuestion).default([]),
  resources: z.array(Resource).default([]),
});

export type QuizQuestion = z.infer<typeof QuizQuestion>;
export type Resource = z.infer<typeof Resource>;
export type Frontmatter = z.infer<typeof Frontmatter>;
export type LessonKind = Frontmatter["kind"];

export interface Heading {
  readonly id: string;
  readonly text: string;
}

/** What a compiled lesson module exports. */
export interface LessonBody {
  readonly html: string;
  readonly headings: readonly Heading[];
  readonly objectives: readonly string[];
  readonly quiz: readonly QuizQuestion[];
  readonly resources: readonly Resource[];
}

/** Catalog metadata for one lesson, available without loading its body. */
export interface LessonMeta {
  readonly id: `${string}/${string}`;
  readonly courseId: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly kind: LessonKind;
  readonly minutes: number;
}

export interface CourseMeta {
  readonly id: string;
  readonly pathId: string;
  readonly title: string;
  readonly summary: string;
  readonly lessons: readonly LessonMeta[];
}

export interface PathMeta {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly courses: readonly CourseMeta[];
}
