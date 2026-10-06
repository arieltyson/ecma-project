---
title: GraphQL Fundamentals
summary: Schemas, queries, mutations, fragments, variables and errors, from the client's point of view.
minutes: 35
objectives:
  - Read a GraphQL schema and write queries against it.
  - Use variables, aliases and fragments.
  - Write mutations and understand subscriptions.
  - Handle partial data and errors in a GraphQL response.
quiz:
  - question: What does a GraphQL response contain for a query that asks for `channel { login title }`?
    options:
      - Every field on the Channel type.
      - Exactly the fields requested, in the same shape as the query.
      - Only the ID.
    answer: 1
    explanation: Clients ask for exactly what they need, and the response mirrors the query's shape.
  - question: Why use variables instead of interpolating values into the query string?
    options:
      - Variables are faster to type.
      - The query text stays constant, so it can be validated, cached and persisted, and values are typed and safely encoded.
      - GraphQL does not support literals.
    answer: 1
    explanation: Building queries with string interpolation invites injection bugs and defeats tooling such as codegen and persisted queries.
  - question: A GraphQL response has both `data` and `errors`. What does that mean?
    options:
      - The request failed entirely.
      - Some fields resolved and some failed; data is partial and failed fields are null.
      - The server is misconfigured.
    answer: 1
    explanation: GraphQL can return partial results. A response can be HTTP 200 and still contain errors, so clients must check the errors array.
  - question: What is a fragment for?
    options:
      - Splitting a query across multiple HTTP requests.
      - Naming a reusable selection of fields on a type, typically colocated with the component that renders them.
      - Encrypting fields.
    answer: 1
    explanation: Fragments let each component declare the fields it needs. A page query composes its children's fragments.
resources:
  - title: GraphQL, introduction and learn
    url: https://graphql.org/learn/
  - title: GraphQL, queries
    url: https://graphql.org/learn/queries/
  - title: GraphQL over HTTP
    url: https://graphql.org/learn/serving-over-http/
---

GraphQL is a query language for APIs. The server publishes a typed **schema**; clients send **operations** that select exactly the fields they need, and get back JSON in the same shape. It suits front ends with many views over the same connected data, such as channels, their streams, their followers and their clips.

## The schema

```graphql
type Query {
  channel(login: String!): Channel
  streams(first: Int = 20, after: String, category: ID): StreamConnection!
  viewer: User
}

type Channel {
  id: ID!
  login: String!
  displayName: String!
  followerCount: Int!
  stream: Stream
}

type Stream {
  id: ID!
  title: String!
  viewerCount: Int!
  category: Category
}

type Category {
  id: ID!
  name: String!
}

type StreamConnection {
  edges: [StreamEdge!]!
  pageInfo: PageInfo!
}

type StreamEdge {
  cursor: String!
  node: Stream!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

type Mutation {
  followChannel(channelId: ID!): FollowChannelPayload!
}

type FollowChannelPayload {
  channel: Channel
  error: FollowError
}

enum FollowError {
  RATE_LIMITED
  NOT_FOUND
}
```

`!` means non-null. `[Stream!]!` is a non-null list of non-null streams. `channel` returns a nullable `Channel` because the login might not exist.

## Queries

```graphql
query ChannelPage($login: String!) {
  channel(login: $login) {
    id
    displayName
    followerCount
    stream {
      id
      title
      viewerCount
    }
  }
}
```

Sent over HTTP, usually as a `POST` with a JSON body:

```json
{
  "operationName": "ChannelPage",
  "query": "query ChannelPage($login: String!) { ... }",
  "variables": { "login": "lumen" }
}
```

```json
{
  "data": {
    "channel": {
      "id": "c1",
      "displayName": "Lumen",
      "followerCount": 3204,
      "stream": { "id": "s9", "title": "Any% practice", "viewerCount": 412 }
    }
  }
}
```

Always **name** operations (`ChannelPage`): names appear in server logs, DevTools and error tracking. Always use **variables** rather than building query strings.

## Aliases and fragments

**Aliases** rename fields, which lets you request the same field twice with different arguments:

```graphql
query Compare {
  left: channel(login: "lumen") { followerCount }
  right: channel(login: "nova") { followerCount }
}
```

**Fragments** name a selection on a type. Components declare the fields they render as a fragment, and the page query includes them:

```graphql
fragment StreamCard_stream on Stream {
  id
  title
  viewerCount
  category { id name }
}

query Directory($after: String) {
  streams(first: 24, after: $after) {
    edges { node { ...StreamCard_stream } }
    pageInfo { hasNextPage endCursor }
  }
}
```

This **colocation** means a component's data needs change in one place, and the page query always fetches exactly what its children render.

## Mutations

```graphql
mutation FollowChannel($channelId: ID!) {
  followChannel(channelId: $channelId) {
    channel { id followerCount }
    error
  }
}
```

Return the changed objects (with their `id`s) from mutations, so a normalised client cache can update every view showing them. Expected failures, such as rate limits, are best modelled in the schema (the `error` field) rather than as top-level errors.

## Subscriptions

A **subscription** asks the server to push results when something happens, usually over a WebSocket:

```graphql
subscription ViewerCount($channelId: ID!) {
  viewerCountUpdated(channelId: $channelId) { id viewerCount }
}
```

## Errors and partial data

A GraphQL response can contain `data`, `errors`, or both:

```json
{
  "data": { "channel": { "id": "c1", "stream": null } },
  "errors": [{ "message": "Stream service unavailable", "path": ["channel", "stream"] }]
}
```

The HTTP status is often `200` even when `errors` is present. A failed field becomes `null` (or makes its nearest nullable parent `null`). Clients must decide per view whether partial data is good enough to show.

## Pagination

The schema above uses **cursor-based connections** (the Relay convention): `edges` with `cursor`s and `pageInfo`. To load more, pass the previous `endCursor` as `after`. Cursors stay correct when items are inserted while the user scrolls, which offsets do not.

## Persisted queries

Large clients often send a **hash** of the query instead of its full text. The server looks up the query by hash (from a registry populated at build time, or on first use). This shrinks requests and lets the server allow only known operations.

## Assignment

1. Read the GraphQL [learn](https://graphql.org/learn/) pages from Queries through Validation.
2. Using a public GraphQL API (such as the GitHub GraphQL Explorer or the Countries API), write a named query with variables, a fragment and an alias.
3. Write the queries and fragments for Lumen's channel page: header, current stream, follow button and the first page of recent videos, with one fragment per component.
