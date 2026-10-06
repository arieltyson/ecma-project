---
title: Typed GraphQL with Codegen
summary: Generate TypeScript types from your schema and operations so every query, variable and fragment is checked at compile time.
minutes: 30
objectives:
  - Explain why hand-written response types drift from the schema.
  - Set up GraphQL Code Generator's client preset.
  - Use generated typed documents with Apollo Client hooks.
  - Colocate fragments and use fragment masking to keep components independent.
quiz:
  - question: Where do generated GraphQL types come from?
    options:
      - The server's responses at run time.
      - The schema plus the operations and fragments in your code, analysed at build time.
      - The browser's DevTools.
    answer: 1
    explanation: A code generator reads the schema and every document in your source, validates them, and writes exact result and variable types for each one.
  - question: A field is removed from the schema but still used in a query. With codegen in CI, when do you find out?
    options:
      - When a user hits the page.
      - When codegen or the type-check fails in CI.
      - Never.
    answer: 1
    explanation: Validating documents against the schema at build time turns API changes into compile errors.
  - question: What does fragment masking prevent?
    options:
      - Fetching fragments.
      - A parent component reading fields that only a child's fragment requested, which would couple the parent to the child's data needs.
      - Caching fragments.
    answer: 1
    explanation: With masking, a component can only read fields from its own fragment, so changing a child's fragment cannot break its parent.
resources:
  - title: GraphQL Code Generator, React and Vue guide
    url: https://the-guild.dev/graphql/codegen/docs/guides/react-vue
  - title: Apollo Client, TypeScript
    url: https://www.apollographql.com/docs/react/development-testing/static-typing
  - title: Apollo Client, data masking
    url: https://www.apollographql.com/docs/react/data/fragments#data-masking
  - title: gql.tada
    url: https://gql-tada.0no.co/
---

In the last two lessons you wrote result types for each GraphQL document by hand. That works for an example, but hand-written types drift: a field is renamed on the server, a query adds a field nobody added to the type, a nullable field is typed as non-null. **Code generation** derives the types from the schema and your documents, so they are exact and always current.

## How it works

1. The **schema** describes every type and field (fetched from the server or committed as a file).
2. Your **documents** (queries, mutations, fragments) live in your components.
3. A **generator** validates each document against the schema and writes TypeScript types for its result and variables, usually as `TypedDocumentNode`s.

Since Apollo's hooks accept `TypedDocumentNode`, everything downstream is typed with no annotations.

## GraphQL Code Generator

The client preset is the common setup:

```bash
npm install --save-dev @graphql-codegen/cli @graphql-codegen/client-preset
```

```ts nocheck
// codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "schema.graphql",
  documents: ["src/**/*.tsx"],
  generates: {
    "./src/graphql/": { preset: "client" },
  },
};

export default config;
```

Run `npx graphql-codegen` (in watch mode during development, and in CI before type-checking). It generates a `graphql()` function whose return type depends on the exact document string you pass:

```tsx nocheck
import { useQuery } from "@apollo/client/react";
import { graphql } from "../graphql";

const ChannelPageQuery = graphql(`
  query ChannelPage($login: String!) {
    channel(login: $login) {
      id
      displayName
      followerCount
    }
  }
`);

function ChannelHeader({ login }: { login: string }) {
  const { data } = useQuery(ChannelPageQuery, { variables: { login } });
  // data?.channel?.displayName is string; a typo is a compile error,
  // and so is forgetting a required variable.
}
```

## Fragment colocation and masking

Each component declares the fields it renders as a fragment and receives a reference to that fragment's data, not the raw object:

```tsx nocheck
import { graphql, useFragment, type FragmentType } from "../graphql";

export const StreamCardFragment = graphql(`
  fragment StreamCard_stream on Stream {
    id
    title
    viewerCount
  }
`);

export function StreamCard(props: { stream: FragmentType<typeof StreamCardFragment> }) {
  const stream = useFragment(StreamCardFragment, props.stream);
  return <h3>{stream.title}</h3>;
}

const DirectoryQuery = graphql(`
  query Directory {
    streams(first: 24) {
      edges { node { id ...StreamCard_stream } }
    }
  }
`);
```

With **fragment masking**, the parent can pass `node` to `StreamCard` but cannot read `node.title` itself, because only `StreamCard` asked for it. Changing `StreamCard`'s fragment can never break the directory page. Apollo Client also supports masking natively (`dataMasking: true` with its own `useFragment`), and Relay enforces the same idea with its compiler.

## Without a build step

**gql.tada** computes result types from the schema entirely in the type system, so there is no generated file to keep in sync. It trades a code generation step for heavier type-checking, the same trade-off described in [Template Literal Types](/lessons/typescript/template-literal-types/).

## In CI

Add a check that regenerates types and fails if they differ from what is committed, or generate before type-checking. Either way, a breaking schema change shows up as a failing build that names every affected component.

## Assignment

1. Read the GraphQL Code Generator [React guide](https://the-guild.dev/graphql/codegen/docs/guides/react-vue).
2. Add codegen to your Lumen app with your mock schema. Replace every hand-written result type.
3. Rename a field in the schema, run codegen, and list every compile error it produces. Then convert the directory's stream card to a masked fragment.
