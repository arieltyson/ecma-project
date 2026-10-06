import { pathOf } from "../content/catalog.ts";
import { GroupedList, ListRow } from "../components/GroupedList.tsx";
import { Icon } from "../components/Icon.tsx";
import type { CourseMeta, LessonMeta } from "../content/schema.ts";
import { Link } from "../router/router.tsx";
import { useCompleted } from "../state/progress.ts";
import { formatMinutes } from "./format.ts";
import "./CoursePage.css";

function StatusIcon({
  lesson,
  done,
}: {
  readonly lesson: LessonMeta;
  readonly done: boolean;
}) {
  if (done) {
    return (
      <span className="status status-done">
        <Icon name="check" size="sm" />
        <span className="visually-hidden">Completed</span>
      </span>
    );
  }
  return (
    <span className="status">
      <Icon name={lesson.kind === "project" ? "hammer" : "book"} size="sm" />
    </span>
  );
}

export function CoursePage({ course }: { readonly course: CourseMeta }) {
  const completed = useCompleted();
  const path = pathOf(course);
  const minutes = course.lessons.reduce((sum, l) => sum + l.minutes, 0);
  return (
    <div className="page page-narrow page-grouped">
      <header className="page-header">
        <Link to={{ name: "path", pathId: path.id }} className="back-link">
          <Icon name="chevron-left" size="sm" />
          {path.title}
        </Link>
        <h1>{course.title}</h1>
        <p className="page-summary">{course.summary}</p>
        <p className="eyebrow">
          <span>{course.lessons.length} lessons</span>
          <span aria-hidden="true">·</span>
          <span>{formatMinutes(minutes)}</span>
        </p>
      </header>
      <GroupedList>
        {course.lessons.map((lesson) => (
          <ListRow
            key={lesson.id}
            to={{ name: "lesson", courseId: course.id, slug: lesson.slug }}
            title={lesson.title}
            subtitle={
              lesson.kind === "project"
                ? `Project · ${formatMinutes(lesson.minutes)}`
                : formatMinutes(lesson.minutes)
            }
            leading={
              <StatusIcon lesson={lesson} done={completed.has(lesson.id)} />
            }
          />
        ))}
      </GroupedList>
    </div>
  );
}
