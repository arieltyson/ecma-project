import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./app/App.tsx";
import { findLesson } from "./content/catalog.ts";
import { loadLesson } from "./content/lessons.ts";
import { matchRoute } from "./router/routes.ts";

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

if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
