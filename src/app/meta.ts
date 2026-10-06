// The document title and description for each route, computed from the
// catalog alone so the prerenderer and the client agree.

import { findCourse, findLesson, findPath } from "../content/catalog.ts";
import type { Route } from "../router/routes.ts";

export const SITE_NAME = "The ECMA Project";
export const SITE_DESCRIPTION =
  "A free, project-driven curriculum for modern JavaScript, TypeScript, React and the browser.";

export interface PageMeta {
  readonly title: string;
  readonly description: string;
}

const ABOUT_TITLES = {
  overview: "About",
  accessibility: "Accessibility",
  privacy: "Privacy",
  license: "License",
} as const;

function titled(title: string, description = SITE_DESCRIPTION): PageMeta {
  return { title: `${title} · ${SITE_NAME}`, description };
}

export function pageMeta(route: Route): PageMeta {
  switch (route.name) {
    case "home":
      return { title: SITE_NAME, description: SITE_DESCRIPTION };
    case "path": {
      const path = findPath(route.pathId);
      return path ? titled(path.title, path.summary) : titled("Not Found");
    }
    case "course": {
      const course = findCourse(route.courseId);
      return course
        ? titled(course.title, course.summary)
        : titled("Not Found");
    }
    case "lesson": {
      const lesson = findLesson(route.courseId, route.slug);
      return lesson
        ? titled(lesson.title, lesson.summary)
        : titled("Not Found");
    }
    case "about":
      return titled(ABOUT_TITLES[route.tab]);
    case "not-found":
      return titled("Not Found");
  }
}
