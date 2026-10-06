// The appearance setting. "system" follows prefers-color-scheme through
// CSS light-dark(); "light" and "dark" pin color-scheme with a
// data-theme attribute, which an inline script in index.html applies
// before first paint so a pinned theme never flashes.

import { useSyncExternalStore } from "react";
import { readItem, writeItem } from "./storage.ts";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_KEY = "ecma-theme";

const listeners = new Set<() => void>();

function isTheme(value: string | null): value is Theme {
  return (THEMES as readonly (string | null)[]).includes(value);
}

function getSnapshot(): Theme {
  const stored = readItem(THEME_KEY);
  return isTheme(stored) ? stored : "system";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(theme: Theme): void {
  writeItem(THEME_KEY, theme === "system" ? null : theme);
  if (theme === "system") delete document.documentElement.dataset["theme"];
  else document.documentElement.dataset["theme"] = theme;
  for (const listener of listeners) listener();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, () => "system");
}
