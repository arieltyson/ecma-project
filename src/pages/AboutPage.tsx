import type { JSX } from "react";
import license from "../../LICENSE?raw";
import { lessons } from "../content/catalog.ts";
import { ABOUT_TABS, type AboutTab } from "../router/routes.ts";
import { Link } from "../router/router.tsx";
import { resetProgress, useCompleted } from "../state/progress.ts";
import "./AboutPage.css";

const LABELS: Record<AboutTab, string> = {
  overview: "About",
  accessibility: "Accessibility",
  privacy: "Privacy",
  license: "License",
};

const REPO = "https://github.com/arieltyson/ecma-project";

function Overview() {
  const projects = lessons.filter((lesson) => lesson.kind === "project");
  return (
    <>
      <p>
        The ECMA Project is a free curriculum for building for the web with
        modern JavaScript, TypeScript and React. It has {lessons.length}{" "}
        lessons, {projects.length} of them projects, arranged in two paths.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>
          A <strong>path</strong> is a sequence of courses. Start with
          Foundations if HTML, CSS and JavaScript are new to you.
        </li>
        <li>
          Each <strong>lesson</strong> explains one idea, gives you an
          assignment and ends with a short knowledge check.
        </li>
        <li>
          Each <strong>project</strong> describes something to build on your own
          machine, with requirements and questions to answer about it.
        </li>
        <li>
          Mark a lesson complete to track your progress. Progress is saved in
          this browser only.
        </li>
      </ul>
      <h2>Standards</h2>
      <p>
        Examples follow the current ECMAScript specification, TypeScript 7 with
        every strict compiler option, and React 19 as described in the official
        React documentation.
      </p>
      <p>
        <a href={REPO}>View the source on GitHub</a>
      </p>
    </>
  );
}

function Accessibility() {
  return (
    <>
      <p>The site aims to meet WCAG 2.2 at level AA.</p>
      <h2>Implemented</h2>
      <ul>
        <li>
          Every page is prerendered to HTML, so lessons can be read without
          JavaScript.
        </li>
        <li>
          A skip link, landmarks and ordered headings support navigation. After
          moving to a new page, focus moves to its heading.
        </li>
        <li>
          Every control works with a keyboard and shows a visible focus ring.
          Search opens with <kbd>⌘K</kbd>, <kbd>Ctrl K</kbd> or <kbd>/</kbd>.
        </li>
        <li>
          Quiz feedback is announced to screen readers and shown with text and
          icons as well as colour.
        </li>
        <li>
          Text sizes use relative units and follow your browser font size.
          Controls are at least 44 points tall.
        </li>
        <li>
          Appearance follows your system light or dark setting, with a manual
          override. Motion is removed when your system asks for reduced motion.
        </li>
      </ul>
      <h2>Verified automatically</h2>
      <p>
        Tests check every text and syntax colour for a contrast ratio of at
        least 4.5:1 in both appearances, and every control border for 3:1. Tests
        also check the built pages for a language, a title, unique IDs, ordered
        headings and named controls.
      </p>
      <h2>Report a problem</h2>
      <p>
        <a href={`${REPO}/issues/new`}>Open an issue</a> with the page, what you
        tried, what happened, and your browser and assistive technology.
      </p>
    </>
  );
}

function Privacy() {
  const completed = useCompleted();
  return (
    <>
      <p>
        The ECMA Project does not use cookies, analytics or trackers, and makes
        no requests to third parties.
      </p>
      <h2>What is stored</h2>
      <p>
        Your completed lessons and your appearance choice are saved in this
        browser's local storage. They never leave your device.
      </p>
      <button
        type="button"
        className="button button-secondary"
        disabled={completed.size === 0}
        onClick={resetProgress}
      >
        Reset progress
      </button>
      <h2>Hosting</h2>
      <p>
        The site is hosted by GitHub Pages, which may log visitor IP addresses
        under the{" "}
        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
          GitHub Privacy Statement
        </a>
        .
      </p>
    </>
  );
}

function License() {
  return (
    <>
      <p>
        The ECMA Project is open source under the MIT License. You are free to
        use, copy and adapt it.
      </p>
      <pre className="license">{license}</pre>
    </>
  );
}

const PANELS: Record<AboutTab, () => JSX.Element> = {
  overview: Overview,
  accessibility: Accessibility,
  privacy: Privacy,
  license: License,
};

export function AboutPage({ tab }: { readonly tab: AboutTab }) {
  const Panel = PANELS[tab];
  return (
    <div className="page page-narrow about">
      <header className="page-header">
        <h1>{LABELS[tab]}</h1>
      </header>
      <nav className="about-tabs" aria-label="About">
        {ABOUT_TABS.map((value) => (
          <Link key={value} to={{ name: "about", tab: value }}>
            {LABELS[value]}
          </Link>
        ))}
      </nav>
      <div className="prose about-body">
        <Panel />
      </div>
    </div>
  );
}
