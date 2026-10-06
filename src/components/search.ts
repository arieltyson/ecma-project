// Ranks lessons against a query. Every word must appear in the title,
// summary or course name; title matches, and matches at the start of a
// word, rank higher.

import type { CourseMeta, LessonMeta } from "../content/schema.ts";

export interface SearchEntry {
  readonly lesson: LessonMeta;
  readonly course: CourseMeta;
}

function score(haystack: string, word: string, weight: number): number {
  const index = haystack.indexOf(word);
  if (index === -1) return 0;
  const atWordStart = index === 0 || /\W/.test(haystack[index - 1] ?? "");
  return weight * (atWordStart ? 2 : 1);
}

export function search(
  entries: readonly SearchEntry[],
  query: string,
  limit = 8,
): SearchEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return entries
    .map((entry) => {
      const title = entry.lesson.title.toLowerCase();
      const rest =
        `${entry.lesson.summary} ${entry.course.title}`.toLowerCase();
      let total = 0;
      for (const word of words) {
        const points = score(title, word, 3) || score(rest, word, 1);
        if (points === 0) return { entry, total: 0 };
        total += points;
      }
      return { entry, total };
    })
    .filter(({ total }) => total > 0)
    .toSorted((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
