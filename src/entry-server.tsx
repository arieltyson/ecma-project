// Used by scripts/prerender.ts to render every route to static HTML.

import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./app/App.tsx";
import { pageMeta, type PageMeta } from "./app/meta.ts";
import { courses, findLesson, lessons, paths } from "./content/catalog.ts";
import { loadLesson } from "./content/lessons.ts";
import { ABOUT_TABS, href, matchRoute, type Route } from "./router/routes.ts";

export { BASE } from "./router/routes.ts";

export function routes(): Route[] {
  return [
    { name: "home" },
    ...paths.map((path) => ({ name: "path", pathId: path.id }) as const),
    ...courses.map(
      (course) => ({ name: "course", courseId: course.id }) as const,
    ),
    ...lessons.map(
      (lesson) =>
        ({
          name: "lesson",
          courseId: lesson.courseId,
          slug: lesson.slug,
        }) as const,
    ),
    ...ABOUT_TABS.map((tab) => ({ name: "about", tab }) as const),
    { name: "not-found" },
  ];
}

export interface Rendered extends PageMeta {
  readonly url: string;
  readonly html: string;
}

export async function render(route: Route): Promise<Rendered> {
  const url = href(route);
  const matched = matchRoute(url);
  if (matched.name === "lesson") {
    const lesson = findLesson(matched.courseId, matched.slug);
    if (lesson) await loadLesson(lesson.id);
  }
  const html = renderToString(
    <StrictMode>
      <App url={`https://example.invalid${url}`} />
    </StrictMode>,
  );
  return { url, html, ...pageMeta(route) };
}
