// Lookups over the build-time catalog. Everything here is synchronous:
// the catalog is small metadata, and lesson bodies load separately.

import { paths } from "virtual:catalog";
import type { CourseMeta, LessonMeta, PathMeta } from "./schema.ts";

export { paths };

export const courses: readonly CourseMeta[] = paths.flatMap(
  (path) => path.courses,
);

export const lessons: readonly LessonMeta[] = courses.flatMap(
  (course) => course.lessons,
);

const pathById = new Map(paths.map((path) => [path.id, path]));
const courseById = new Map(courses.map((course) => [course.id, course]));
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function findPath(id: string): PathMeta | undefined {
  return pathById.get(id);
}

export function findCourse(id: string): CourseMeta | undefined {
  return courseById.get(id);
}

export function findLesson(
  courseId: string,
  slug: string,
): LessonMeta | undefined {
  return lessonById.get(`${courseId}/${slug}`);
}

/** The lessons either side of this one, across course boundaries. */
export function neighbours(lesson: LessonMeta): {
  readonly previous: LessonMeta | undefined;
  readonly next: LessonMeta | undefined;
} {
  const index = lessons.indexOf(lesson);
  return { previous: lessons[index - 1], next: lessons[index + 1] };
}

export function pathOf(course: CourseMeta): PathMeta {
  const path = pathById.get(course.pathId);
  if (!path) throw new Error(`Course ${course.id} has no path`);
  return path;
}
