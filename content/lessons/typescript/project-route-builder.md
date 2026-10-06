---
title: "Project: Type-Safe Route Builder"
summary: Build a route table whose path patterns produce typed parameters, so links and matches are checked at compile time.
kind: project
minutes: 240
objectives:
  - A type that extracts parameter names from a path pattern such as /channels/:login.
  - A typed href builder that requires exactly the parameters a route needs.
  - A matcher that turns a pathname into a discriminated union of routes.
  - Correct encoding and decoding of parameter values.
resources:
  - title: TypeScript Handbook, Template Literal Types
    url: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
  - title: MDN, encodeURIComponent
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
---

Every link in a single-page app is a string, and strings are easy to get wrong: a renamed route, a missing parameter, a typo in a path. In this project you build a small route table where the compiler checks every link and every match.

## Brief

```ts nocheck
const routes = defineRoutes({
  home: "/",
  directory: "/directory",
  channel: "/channels/:login",
  clip: "/channels/:login/clips/:clipId",
});

routes.href("clip", { login: "lumen", clipId: "42" }); // "/channels/lumen/clips/42"
routes.href("home");                                   // "/"

const match = routes.match("/channels/lumen/clips/42");
if (match?.name === "clip") {
  match.params.clipId; // string
}
```

## Requirements

1. `PathParams<"/channels/:login/clips/:clipId">` is `{ login: string; clipId: string }`. A pattern with no parameters gives `{}`. Write it with template literal types and `infer`.
2. `defineRoutes(table)` keeps the literal types of every pattern (use a `const` type parameter) and returns `href` and `match`.
3. `href(name, params)` requires a known route name and exactly that route's parameters. Routes without parameters take no second argument. Missing, extra or misspelled parameters are compile errors.
4. `href` encodes every parameter value with `encodeURIComponent`.
5. `match(pathname)` returns `{ name, params }` for the first route whose pattern matches, typed as a discriminated union over all routes so that checking `name` narrows `params`; or `null`. It decodes parameter values.
6. Trailing slashes match: `/directory/` matches `/directory`.
7. No `any`.

## Getting started

Starter files and tests are in [`exercises/route-builder`](https://github.com/arieltyson/ecma-project/tree/main/exercises/route-builder).

```bash
npm run exercise route-builder
```

## Break it on purpose

1. Remove the encoding from `href` and build a link for a clip whose ID is `"a/b"`. Pass the result to `match` and see what comes back. Restore the encoding and explain the round trip.
2. Write the `PathParams` type without recursion, so it only handles one parameter. Add a second parameter to a route and see where the types go wrong.

## Stretch

- Support optional segments written as `:page?`, typed as `page?: string`.
- Add a `search` option to `href` that serialises a typed query object with `URLSearchParams`.
- Use your `match` as the route table for the router you build in [Project: A Router From Scratch](/lessons/browser/project-router/).

## Explain it

- Walk through how `PathParams` evaluates for a pattern with two parameters, step by step.
- How does the conditional rest parameter in `href` make the second argument disappear for routes without parameters?
- What are the costs of type-level parsing like this, and where in a codebase is it worth paying them?
- How does a real router library (React Router, TanStack Router) give you typed parameters? Look it up and compare.
