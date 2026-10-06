import { Link } from "../router/router.tsx";
import { Icon } from "./Icon.tsx";
import "./NavBar.css";

export function NavBar({ onSearch }: { readonly onSearch: () => void }) {
  return (
    <header className="nav-bar">
      <nav className="nav-bar-inner" aria-label="Primary">
        <Link to={{ name: "home" }} className="nav-brand">
          <span className="nav-mark" aria-hidden="true">
            ES
          </span>
          <span>The ECMA Project</span>
        </Link>
        <div className="nav-actions">
          <Link to={{ name: "about", tab: "overview" }} className="nav-link">
            About
          </Link>
          <button
            type="button"
            className="nav-search"
            onClick={onSearch}
            aria-label="Search lessons"
            aria-keyshortcuts="Meta+K Control+K /"
          >
            <Icon name="search" size="sm" />
            <span className="nav-search-label">Search</span>
            <kbd className="nav-search-key" aria-hidden="true">
              ⌘K
            </kbd>
          </button>
        </div>
      </nav>
    </header>
  );
}
