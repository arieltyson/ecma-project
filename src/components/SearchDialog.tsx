// Lesson search in a modal <dialog>, which supplies the focus trap,
// Escape to close and an inert background. The input and list follow
// the ARIA combobox pattern: arrow keys move the active option while
// focus stays in the input. Native <select> and <datalist> cannot
// express this pattern, so the listbox and options use ARIA roles.
/* oxlint-disable jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/prefer-tag-over-role */

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { courses } from "../content/catalog.ts";
import { href } from "../router/routes.ts";
import { useRouter } from "../router/router.tsx";
import { Icon } from "./Icon.tsx";
import { search, type SearchEntry } from "./search.ts";
import "./SearchDialog.css";

const ENTRIES: readonly SearchEntry[] = courses.flatMap((course) =>
  course.lessons.map((lesson) => ({ lesson, course })),
);

export function SearchDialog({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const { navigate } = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const results = search(ENTRIES, query);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function choose(entry: SearchEntry) {
    onClose();
    setQuery("");
    navigate(
      href({
        name: "lesson",
        courseId: entry.course.id,
        slug: entry.lesson.slug,
      }),
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[active];
      if (entry) choose(entry);
    }
  }

  const optionId = (index: number) => `${listId}-${index}`;

  return (
    // Clicking the backdrop closes the dialog; Escape does the same from
    // the keyboard, natively.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className="search"
      aria-label="Search lessons"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="search-field">
        <Icon name="search" />
        <input
          type="search"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            results.length > 0 ? optionId(active) : undefined
          }
          aria-label="Search lessons"
          placeholder="Search lessons"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="search-close"
          onClick={onClose}
          aria-label="Close search"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label="Lessons"
        className="search-results"
      >
        {results.map((entry, index) => (
          // Options are chosen with the keyboard from the combobox input.
          // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={entry.lesson.id}
            id={optionId(index)}
            role="option"
            aria-selected={index === active}
            className="search-result"
            onClick={() => choose(entry)}
            onMouseMove={() => setActive(index)}
          >
            <span className="search-result-title">{entry.lesson.title}</span>
            <span className="search-result-course">{entry.course.title}</span>
          </li>
        ))}
      </ul>
      {query && results.length === 0 ? (
        <p className="search-empty">No lessons match “{query}”.</p>
      ) : null}
      <p className="visually-hidden" aria-live="polite">
        {query ? `${results.length} results` : ""}
      </p>
    </dialog>
  );
}
