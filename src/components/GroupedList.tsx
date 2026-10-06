// The inset grouped list from iOS Settings: rounded rows on a grouped
// background, each row one link with a title, an optional subtitle and
// a trailing accessory before the chevron.

import { useId, type ReactNode } from "react";
import type { Route } from "../router/routes.ts";
import { Link } from "../router/router.tsx";
import { Icon } from "./Icon.tsx";
import "./GroupedList.css";

export function GroupedList({
  label,
  children,
}: {
  readonly label?: string;
  readonly children: ReactNode;
}) {
  const id = useId();
  return (
    <section className="grouped" aria-labelledby={label ? id : undefined}>
      {label ? (
        <h2 className="grouped-label" id={id}>
          {label}
        </h2>
      ) : null}
      <ul className="grouped-list">{children}</ul>
    </section>
  );
}

export function ListRow({
  to,
  title,
  subtitle,
  leading,
  trailing,
}: {
  readonly to: Route;
  readonly title: string;
  readonly subtitle?: string;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
}) {
  return (
    <li className="row">
      <Link to={to} className="row-link">
        {leading ? <span className="row-leading">{leading}</span> : null}
        <span className="row-body">
          <span className="row-text">
            <span className="row-title">{title}</span>
            {subtitle ? <span className="row-subtitle">{subtitle}</span> : null}
          </span>
          {trailing ? <span className="row-trailing">{trailing}</span> : null}
          <span className="row-chevron">
            <Icon name="chevron-right" size="sm" />
          </span>
        </span>
      </Link>
    </li>
  );
}
