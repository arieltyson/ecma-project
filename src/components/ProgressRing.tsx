import "./ProgressRing.css";

/**
 * A circular progress gauge; the visible count doubles as its label.
 * Nothing is shown until there is progress to show.
 */
export function ProgressRing({
  done,
  total,
}: {
  readonly done: number;
  readonly total: number;
}) {
  if (done === 0) return null;
  const fraction = total === 0 ? 0 : done / total;
  const complete = total > 0 && done === total;
  return (
    <span className="progress" data-complete={complete || undefined}>
      <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
        <circle className="progress-track" cx="18" cy="18" r="15.5" />
        <circle
          className="progress-value"
          cx="18"
          cy="18"
          r="15.5"
          pathLength="1"
          strokeDasharray={`${fraction} 1`}
        />
      </svg>
      <span className="progress-label">
        {done}
        <span className="visually-hidden"> of {total} complete</span>
      </span>
    </span>
  );
}
