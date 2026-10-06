import { lessons, paths } from "../content/catalog.ts";
import { Icon } from "../components/Icon.tsx";
import { ProgressRing } from "../components/ProgressRing.tsx";
import { Link } from "../router/router.tsx";
import { useCompleted } from "../state/progress.ts";
import "./HomePage.css";

export function HomePage() {
  const completed = useCompleted();
  const next = lessons.find((lesson) => !completed.has(lesson.id));
  const started = completed.size > 0;

  return (
    <div className="page home">
      <header className="hero">
        <h1>Learn the modern web by building it.</h1>
        <p className="hero-summary">
          A free, project-driven curriculum for JavaScript, TypeScript, React
          and the browser.
        </p>
        {next ? (
          <Link
            to={{ name: "lesson", courseId: next.courseId, slug: next.slug }}
            className="button button-primary hero-action"
          >
            {started ? `Continue: ${next.title}` : "Start learning"}
            <Icon name="arrow" size="sm" />
          </Link>
        ) : null}
      </header>

      <section aria-labelledby="paths-title">
        <h2 id="paths-title" className="visually-hidden">
          Paths
        </h2>
        <ul className="path-cards">
          {paths.map((path, index) => {
            const ids = path.courses.flatMap((course) =>
              course.lessons.map((lesson) => lesson.id),
            );
            const done = ids.filter((id) => completed.has(id)).length;
            return (
              <li key={path.id}>
                <Link
                  to={{ name: "path", pathId: path.id }}
                  className="path-card"
                >
                  <span className="path-step">Path {index + 1}</span>
                  <span className="path-title">{path.title}</span>
                  <span className="path-summary">{path.summary}</span>
                  <span className="path-meta">
                    <ProgressRing done={done} total={ids.length} />
                    {path.courses.length} courses · {ids.length} lessons
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
