// Completed lessons, kept in this browser only. The store is external
// to React and read with useSyncExternalStore, which keeps every
// component consistent, follows changes made in other tabs, and renders
// "nothing completed" on the server so hydration always matches.

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
  snapshot = next;
  writeItem(KEY, next.size > 0 ? JSON.stringify([...next]) : null);
  emit();
}

export function resetProgress(): void {
  snapshot = EMPTY;
  writeItem(KEY, null);
  emit();
}

export function useCompleted(): ReadonlySet<LessonId> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
