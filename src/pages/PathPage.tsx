import { GroupedList, ListRow } from "../components/GroupedList.tsx";
import { Icon } from "../components/Icon.tsx";
import { ProgressRing } from "../components/ProgressRing.tsx";
import type { PathMeta } from "../content/schema.ts";
import { Link } from "../router/router.tsx";
import { useCompleted } from "../state/progress.ts";

export function PathPage({ path }: { readonly path: PathMeta }) {
  const completed = useCompleted();
  return (
    <div className="page page-narrow page-grouped">
      <header className="page-header">
        <Link to={{ name: "home" }} className="back-link">
          <Icon name="chevron-left" size="sm" />
          Home
        </Link>
        <h1>{path.title}</h1>
        <p className="page-summary">{path.summary}</p>
      </header>
      <GroupedList label="Courses">
        {path.courses.map((course) => {
          const done = course.lessons.filter((lesson) =>
            completed.has(lesson.id),
          ).length;
          return (
            <ListRow
              key={course.id}
              to={{ name: "course", courseId: course.id }}
              title={course.title}
              subtitle={course.summary}
              trailing={
                <ProgressRing done={done} total={course.lessons.length} />
              }
            />
          );
        })}
      </GroupedList>
    </div>
  );
}
