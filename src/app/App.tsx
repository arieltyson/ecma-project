import { Suspense, useEffect, useState } from "react";
import { findCourse, findLesson, findPath } from "../content/catalog.ts";
import { ANNOUNCER_ID } from "../components/announce.ts";
import { Footer } from "../components/Footer.tsx";
import { NavBar } from "../components/NavBar.tsx";
import { SearchDialog } from "../components/SearchDialog.tsx";
import { AboutPage } from "../pages/AboutPage.tsx";
import { CoursePage } from "../pages/CoursePage.tsx";
import { HomePage } from "../pages/HomePage.tsx";
import { LessonPage } from "../pages/LessonPage.tsx";
import { NotFoundPage } from "../pages/NotFoundPage.tsx";
import { PathPage } from "../pages/PathPage.tsx";
import type { Route } from "../router/routes.ts";
import { Router, useRouter } from "../router/router.tsx";
import { pageMeta } from "./meta.ts";
import "../styles/base.css";
import "../styles/controls.css";
import "../styles/layout.css";
import "../styles/prose.css";

function Page({ route }: { readonly route: Route }) {
  switch (route.name) {
    case "home":
      return <HomePage />;
    case "path": {
      const path = findPath(route.pathId);
      return path ? <PathPage path={path} /> : <NotFoundPage />;
    }
    case "course": {
      const course = findCourse(route.courseId);
      return course ? <CoursePage course={course} /> : <NotFoundPage />;
    }
    case "lesson": {
      const lesson = findLesson(route.courseId, route.slug);
      return lesson ? <LessonPage lesson={lesson} /> : <NotFoundPage />;
    }
    case "about":
      return <AboutPage tab={route.tab} />;
    case "not-found":
      return <NotFoundPage />;
  }
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function Shell() {
  const { route } = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.title = pageMeta(route).title;
  }, [route]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut =
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isTyping(event.target));
      if (!shortcut) return;
      event.preventDefault();
      setSearchOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <NavBar onSearch={() => setSearchOpen(true)} />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<p className="loading">Loading…</p>}>
          <Page route={route} />
        </Suspense>
      </main>
      <Footer />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div id={ANNOUNCER_ID} className="visually-hidden" aria-live="polite" />
    </div>
  );
}

export function App({ url }: { readonly url: string }) {
  return (
    <Router url={url}>
      <Shell />
    </Router>
  );
}
