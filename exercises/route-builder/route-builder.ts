// Project: Type-Safe Route Builder
// https://arieltyson.github.io/ecma-project/lessons/typescript/project-route-builder/
//
// The types below are deliberately loose. The type tests in
// route-builder.test.ts fail until you tighten them, and the runtime
// tests fail until you implement defineRoutes.

/** The parameters in a path pattern, e.g. "/a/:b" gives { b: string }. */
export type PathParams<Pattern extends string> = Pattern extends string
  ? Record<string, string>
  : never;

export type RouteTable = Readonly<Record<string, string>>;

export interface Match<Table extends RouteTable> {
  readonly name: keyof Table;
  readonly params: Record<string, string>;
}

export interface Routes<Table extends RouteTable> {
  href(name: keyof Table, params?: Record<string, string>): string;
  match(pathname: string): Match<Table> | null;
}

export function defineRoutes<Table extends RouteTable>(
  table: Table,
): Routes<Table> {
  void table;
  throw new Error("Not implemented");
}
