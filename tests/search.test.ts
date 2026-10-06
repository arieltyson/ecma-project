import { describe, expect, it } from "vitest";
import { search, type SearchEntry } from "../src/components/search.ts";
import type { CourseMeta, LessonMeta } from "../src/content/schema.ts";

function entry(
  title: string,
  summary = "",
  courseTitle = "Course",
  keywords = "",
): SearchEntry {
  const lesson: LessonMeta = {
    id: `c/${title}`,
    courseId: "c",
    slug: title,
    title,
    summary,
    kind: "lesson",
    minutes: 1,
    keywords,
  };
  const course: CourseMeta = {
    id: "c",
    pathId: "p",
    title: courseTitle,
    summary: "",
    lessons: [lesson],
  };
  return { lesson, course };
}

describe("search", () => {
  const entries = [
    entry("Generics"),
    entry("Advanced Generics"),
    entry("Cookies", "SameSite and HttpOnly"),
    entry("Effects", "", "React"),
    entry(
      "The Normalized Cache",
      "",
      "Single-Page Apps",
      "Configure Apollo field policies",
    ),
  ];

  it("returns nothing for an empty query", () => {
    expect(search(entries, "  ")).toEqual([]);
  });

  it("ranks a title match at the start of a word first", () => {
    const titles = search(entries, "gen").map((e) => e.lesson.title);
    expect(titles).toEqual(["Generics", "Advanced Generics"]);
  });

  it("matches summaries and course titles", () => {
    expect(search(entries, "samesite")[0]?.lesson.title).toBe("Cookies");
    expect(search(entries, "react")[0]?.lesson.title).toBe("Effects");
  });

  it("matches objectives", () => {
    expect(search(entries, "apollo cache")[0]?.lesson.title).toBe(
      "The Normalized Cache",
    );
  });

  it("requires every word to match", () => {
    expect(search(entries, "generics cookies")).toEqual([]);
  });
});
