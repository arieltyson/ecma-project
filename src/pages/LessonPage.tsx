import { findCourse, neighbours } from "../content/catalog.ts";
import { useLessonBody } from "../content/lessons.ts";
import type { LessonMeta } from "../content/schema.ts";
import { Article } from "../components/Article.tsx";
import { Icon } from "../components/Icon.tsx";
import { Quiz } from "../components/Quiz.tsx";
import { Link } from "../router/router.tsx";
import { setCompleted, useCompleted } from "../state/progress.ts";
import { formatMinutes } from "./format.ts";
import "./LessonPage.css";

function lessonRoute(lesson: LessonMeta) {
  return {
    name: "lesson",
    courseId: lesson.courseId,
    slug: lesson.slug,
  } as const;
}

export function LessonPage({ lesson }: { readonly lesson: LessonMeta }) {
  const body = useLessonBody(lesson.id);
  const course = findCourse(lesson.courseId);
  const completed = useCompleted().has(lesson.id);
  const { previous, next } = neighbours(lesson);
  const position = (course?.lessons.indexOf(lesson) ?? 0) + 1;
  const isProject = lesson.kind === "project";

  return (
    <div className="page lesson">
      <div className="lesson-main">
        <header className="page-header">
          {course ? (
            <Link
              to={{ name: "course", courseId: course.id }}
              className="back-link"
            >
              <Icon name="chevron-left" size="sm" />
              {course.title}
            </Link>
          ) : null}
          <p className="eyebrow">
            <span>
              {isProject ? "Project" : "Lesson"} {position} of{" "}
              {course?.lessons.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatMinutes(lesson.minutes)}</span>
          </p>
          <h1>{lesson.title}</h1>
          <p className="page-summary">{lesson.summary}</p>
        </header>

        <section className="overview" aria-labelledby="overview-title">
          <h2 id="overview-title" className="overview-title">
            {isProject ? "You will build" : "You will learn"}
          </h2>
          <ul>
            {body.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>

        <Article html={body.html} />

        {body.quiz.length > 0 ? (
          <section aria-labelledby="quiz-title">
            <h2 id="quiz-title" className="section-title">
              Knowledge check
            </h2>
            <Quiz key={lesson.id} questions={body.quiz} />
          </section>
        ) : null}

        {body.resources.length > 0 ? (
          <details className="resources">
            <summary>
              Additional resources
              <Icon name="chevron-right" size="sm" />
            </summary>
            <ul>
              {body.resources.map((resource) => (
                <li key={resource.url}>
                  <a href={resource.url} rel="noreferrer">
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="lesson-complete">
          <button
            type="button"
            className="button button-secondary"
            aria-pressed={completed}
            onClick={() => setCompleted(lesson.id, !completed)}
          >
            <Icon name="check" size="sm" />
            {completed ? "Completed" : "Mark as complete"}
          </button>
        </div>

        <nav className="pager" aria-label="Lessons">
          {previous ? (
            <Link to={lessonRoute(previous)} className="pager-link" rel="prev">
              <span className="pager-label">Previous</span>
              <span className="pager-title">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={lessonRoute(next)}
              className="pager-link pager-next"
              rel="next"
            >
              <span className="pager-label">Next</span>
              <span className="pager-title">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </div>

      {body.headings.length > 1 ? (
        <nav className="toc" aria-label="On this page">
          <p className="toc-title" aria-hidden="true">
            On this page
          </p>
          <ul>
            {body.headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
