import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./app/App.tsx";
import { findLesson } from "./content/catalog.ts";
import { loadLesson } from "./content/lessons.ts";
import { href, matchRoute } from "./router/routes.ts";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root");

// Load the current lesson before hydrating so the first client render
// matches the prerendered HTML without suspending.
const route = matchRoute(window.location.pathname);
if (route.name === "lesson") {
  const lesson = findLesson(route.courseId, route.slug);
  if (lesson) await loadLesson(lesson.id);
}

const app = (
  <StrictMode>
    <App url={window.location.href} />
  </StrictMode>
);

// Hydrate only HTML prerendered for this route. A host that answers an
// unknown path with another page's HTML, and the dev server, which has
// no prerendered HTML, get a fresh client render instead.
if (container.dataset["route"] === href(route)) {
  hydrateRoot(container, app);
} else {
  container.replaceChildren();
  createRoot(container).render(app);
}
