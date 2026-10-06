---
title: Validating Data at the Boundary
summary: Turn unknown data from the network, storage and URLs into typed values with a schema, and keep the type and the check in one place.
minutes: 30
objectives:
  - Identify every boundary where untyped data enters a front end.
  - Validate unknown data with hand-written guards and with a schema library.
  - Infer static types from a schema instead of writing them twice.
  - Decide what to do when validation fails.
quiz:
  - question: What type does `await response.json()` return?
    options:
      - The type you annotate the variable with.
      - "`any`, so it should be treated as unknown and validated."
      - "`unknown`"
    answer: 1
    explanation: The DOM types declare `json()` as returning `Promise<any>`. Annotating the result does not check it; assign it to `unknown` and parse it.
  - question: Why derive the TypeScript type from a schema with `z.infer` rather than writing an interface by hand?
    options:
      - The type and the runtime check cannot drift apart.
      - Interfaces are slower.
      - Schemas generate smaller bundles.
    answer: 0
    explanation: With one source of truth, adding a field to the schema updates the type automatically, and the check always matches what the type promises.
  - question: When is a type assertion like `data as Channel` acceptable?
    options:
      - Whenever the API is documented.
      - Rarely; only after a check the compiler cannot follow, or in tests.
      - Always, since types are erased anyway.
    answer: 1
    explanation: An assertion tells the compiler to trust you without any check. Data from outside the program can be anything, including an error page or an old API version.
resources:
  - title: Zod documentation
    url: https://zod.dev/
  - title: Standard Schema, a common interface for schema libraries
    url: https://standardschema.dev/
---

Types are erased, so the compiler can only check data your own code created. Everything that crosses into the program from outside starts out untrusted. A front end has many of these boundaries:

- `fetch` responses and GraphQL results
- `JSON.parse`, `localStorage` and `sessionStorage`
- URL path segments, query strings and hashes
- `postMessage` events, WebSocket messages
- form fields and `FormData`

At each one, the value is effectively `unknown`. The job is to check it once and produce a typed value.

## By hand

For small shapes, a type predicate is enough:

```ts
interface Follow {
  readonly channelId: string;
  readonly followedAt: string;
}

function isFollow(value: unknown): value is Follow {
  return (
    typeof value === "object" &&
    value !== null &&
    "channelId" in value &&
    typeof value.channelId === "string" &&
    "followedAt" in value &&
    typeof value.followedAt === "string"
  );
}

const parsed: unknown = JSON.parse(localStorage.getItem("follow") ?? "null");
const follow = isFollow(parsed) ? parsed : undefined;
```

This works, but the interface and the guard are two copies of the same information, and nothing stops them drifting apart.

## With a schema

A schema library describes the shape once, as a runtime value, and infers the type from it. [Zod](https://zod.dev/) is the most widely used:

```ts
import { z } from "zod";

const Channel = z.object({
  id: z.string(),
  login: z.string().min(1),
  followers: z.int().nonnegative(),
  live: z.boolean(),
  game: z.string().nullable(),
});

type Channel = z.infer<typeof Channel>;

async function fetchChannel(login: string, signal?: AbortSignal): Promise<Channel> {
  const response = await fetch(`/api/channels/${encodeURIComponent(login)}`, signal ? { signal } : {});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  return Channel.parse(data); // throws a ZodError describing every problem
}
```

The same name for the schema value and the type is a common convention; TypeScript keeps values and types in separate namespaces.

`parse` throws; `safeParse` returns a discriminated union instead, which suits places where failure is expected:

```ts
import { z } from "zod";

const Settings = z.object({
  volume: z.number().min(0).max(1).default(0.5),
  quality: z.enum(["auto", "720p", "1080p"]).default("auto"),
});

function loadSettings(): z.infer<typeof Settings> {
  let raw: unknown = {};
  try {
    raw = JSON.parse(localStorage.getItem("settings") ?? "{}");
  } catch {
    // Corrupt JSON falls through to the defaults.
  }
  const result = Settings.safeParse(raw);
  return result.success ? result.data : Settings.parse({});
}
```

Valibot and ArkType are alternatives with smaller bundles or different syntax. Many libraries implement [Standard Schema](https://standardschema.dev/), a shared interface, so tools such as form libraries accept any of them.

## When validation fails

Decide per boundary:

| Boundary | Sensible failure |
| --- | --- |
| Your own API | Throw, report to error tracking, show an error state |
| Local storage | Fall back to defaults and overwrite |
| URL parameters | Treat as not found, or redirect |
| Third-party data | Drop the invalid items and keep the rest |

Never let unvalidated data flow inward with an `as` assertion. When the API changes shape, a schema fails loudly at the boundary; an assertion fails somewhere unrelated, later.

## GraphQL

With GraphQL, the schema is known ahead of time, so code generation can produce types for every query (see [Typed GraphQL with Codegen](/lessons/spa/typed-graphql/)). That gives compile-time types for responses, but the server is still another program. Teams typically trust generated types for their own GraphQL API and validate anything else.

## Assignment

1. Read Zod's [basic usage](https://zod.dev/basics) guide.
2. Write a schema for a paginated list of streams with a cursor, infer its type, and write a `fetchStreams` function that returns the validated page.
3. Write `readQuery(search: string)` that parses `?sort=viewers&page=2` into `{ sort: "viewers" | "recent"; page: number }`, with defaults for missing or invalid values.
