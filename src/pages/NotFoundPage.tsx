import { Link } from "../router/router.tsx";

export function NotFoundPage() {
  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1>Page not found</h1>
        <p className="page-summary">
          This page does not exist, or it has moved.
        </p>
      </header>
      <Link to={{ name: "home" }} className="button button-primary">
        Go home
      </Link>
    </div>
  );
}
