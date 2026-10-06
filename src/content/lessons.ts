// Lesson bodies are code split, one chunk per lesson. `loadLesson`
// starts (or reuses) the import, and `useLessonBody` reads it, reading
// the cache synchronously once loaded so hydration and repeat visits
// never suspend.

import { use } from "react";
import type { LessonBody, LessonMeta } from "./schema.ts";

const modules = import.meta.glob<LessonBody>("/content/lessons/**/*.md", {
  import: "default",
});

const loaded = new Map<LessonMeta["id"], LessonBody>();
const pending = new Map<LessonMeta["id"], Promise<LessonBody>>();

export function loadLesson(id: LessonMeta["id"]): Promise<LessonBody> {
  const existing = pending.get(id);
  if (existing) return existing;
  const load = modules[`/content/lessons/${id}.md`];
  if (!load) return Promise.reject(new Error(`No lesson ${id}`));
  const promise = load().then((body) => {
    loaded.set(id, body);
    return body;
  });
  pending.set(id, promise);
  return promise;
}

export function useLessonBody(id: LessonMeta["id"]): LessonBody {
  return loaded.get(id) ?? use(loadLesson(id));
}
