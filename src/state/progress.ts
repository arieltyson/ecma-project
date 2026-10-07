// Completed lessons, kept in this browser only. The store is external
// to React and read with useSyncExternalStore, which keeps every
// component consistent, follows changes made in other tabs, and renders
// "nothing completed" on the server so hydration always matches.
// Progress can be exported to a file and imported again, because some
// browsers delete site data after a period without a visit.

import { useSyncExternalStore } from "react";
import type { LessonMeta } from "../content/schema.ts";
import { readItem, writeItem } from "./storage.ts";

type LessonId = LessonMeta["id"];

const KEY = "ecma-progress";
const EMPTY: ReadonlySet<LessonId> = new Set();
const listeners = new Set<() => void>();

let snapshot: ReadonlySet<LessonId> | undefined;

function parse(raw: string | null): ReadonlySet<LessonId> {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? new Set(value.filter((id): id is LessonId => typeof id === "string"))
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Asks the browser not to evict site data under storage pressure. */
function requestPersistence() {
  void navigator.storage?.persist?.().catch(() => false);
}

function getSnapshot(): ReadonlySet<LessonId> {
  snapshot ??= parse(readItem(KEY));
  return snapshot;
}

function getServerSnapshot(): ReadonlySet<LessonId> {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  snapshot = parse(event.newValue);
  emit();
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function setCompleted(id: LessonId, completed: boolean): void {
  const next = new Set(getSnapshot());
  if (completed) next.add(id);
  else next.delete(id);
  commit(next);
  if (completed) requestPersistence();
}

function commit(next: ReadonlySet<LessonId>) {
  snapshot = next;
  writeItem(KEY, next.size > 0 ? JSON.stringify([...next]) : null);
  emit();
}

const FORMAT = "ecma-progress";

/** The completed lessons as the contents of a backup file. */
export function exportProgress(): string {
  return `${JSON.stringify({ format: FORMAT, version: 1, completed: [...getSnapshot()] }, null, 2)}\n`;
}

/**
 * Reads the lesson ids out of a backup file, keeping only ids in
 * `known`. Returns null when the text is not a backup file.
 */
export function parseBackup(
  text: string,
  known: ReadonlySet<string>,
): LessonId[] | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const { format, completed } = value as Record<string, unknown>;
  if (format !== FORMAT || !Array.isArray(completed)) return null;
  return completed.filter(
    (id): id is LessonId => typeof id === "string" && known.has(id),
  );
}

/** Adds the lessons in a backup to this browser's progress. */
export function importProgress(ids: readonly LessonId[]): number {
  const current = getSnapshot();
  const next = new Set([...current, ...ids]);
  commit(next);
  if (ids.length > 0) requestPersistence();
  return next.size - current.size;
}

export function resetProgress(): void {
  commit(EMPTY);
}

export function useCompleted(): ReadonlySet<LessonId> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
