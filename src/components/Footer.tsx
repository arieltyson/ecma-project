import type { ReactNode } from "react";
import type { AboutTab } from "../router/routes.ts";
import { Link } from "../router/router.tsx";
import { setTheme, useTheme, type Theme } from "../state/theme.ts";
import { Icon } from "./Icon.tsx";
import { SegmentedControl } from "./SegmentedControl.tsx";
import "./Footer.css";

const LINKS: readonly (readonly [AboutTab, string])[] = [
  ["overview", "About"],
  ["accessibility", "Accessibility"],
  ["privacy", "Privacy"],
  ["license", "License"],
];

const THEME_OPTIONS = [
  { value: "system", label: <Icon name="auto" size="sm" />, name: "System" },
  { value: "light", label: <Icon name="sun" size="sm" />, name: "Light" },
  { value: "dark", label: <Icon name="moon" size="sm" />, name: "Dark" },
] as const satisfies readonly {
  value: Theme;
  label: ReactNode;
  name: string;
}[];

export function Footer() {
  const theme = useTheme();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <nav aria-label="Site">
          <ul className="footer-links">
            {LINKS.map(([tab, label]) => (
              <li key={tab}>
                <Link to={{ name: "about", tab }}>{label}</Link>
              </li>
            ))}
            <li>
              <a href="https://github.com/arieltyson/ecma-project">GitHub</a>
            </li>
          </ul>
        </nav>
        <SegmentedControl
          label="Appearance"
          value={theme}
          onChange={setTheme}
          options={THEME_OPTIONS.map(({ value, label, name }) => ({
            value,
            label: (
              <>
                {label}
                <span className="visually-hidden">{name}</span>
              </>
            ),
          }))}
        />
      </div>
    </footer>
  );
}
