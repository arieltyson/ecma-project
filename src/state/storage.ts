// localStorage can be missing or throw (private windows, blocked site
// data), so every read and write goes through these and fails quietly.

export function readItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Progress and theme are conveniences; the site works without them.
  }
}
