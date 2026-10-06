declare module "virtual:catalog" {
  export const paths: readonly import("./schema.ts").PathMeta[];
}

declare module "*.md" {
  const lesson: import("./schema.ts").LessonBody;
  export default lesson;
}
