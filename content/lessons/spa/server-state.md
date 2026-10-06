---
title: Server State vs Client State
summary: Why data from the server needs a cache rather than useState, and what a data library does for you.
minutes: 25
objectives:
  - Distinguish server state from client state.
  - List the problems a server-state cache solves.
  - Choose fetch policies for freshness versus speed.
  - Decide what belongs in a global client store.
quiz:
  - question: Which is server state?
    options:
      - Whether the chat panel is collapsed.
      - The list of channels a viewer follows.
      - The draft text in the message composer.
    answer: 1
    explanation: Follows are owned by the server, shared across devices and can change without this client knowing. The other two exist only in this browser.
  - question: Two components on the same page request the same channel. What should a data library do?
    options:
      - Send two identical requests.
      - Deduplicate them into one request and share the result.
      - Fail the second one.
    answer: 1
    explanation: Deduplication and a shared cache are among the main reasons to use a data library instead of fetching in each component.
  - question: What does stale-while-revalidate behaviour mean in a data cache?
    options:
      - Show cached data immediately, then fetch fresh data in the background and update.
      - Never show cached data.
      - Cache data forever.
    answer: 0
    explanation: Users see something instantly, and the UI updates if the data changed. Apollo calls this fetch policy cache-and-network.
resources:
  - title: TanStack Query, does TanStack Query replace client state?
    url: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state
  - title: Apollo Client, queries and fetch policies
    url: https://www.apollographql.com/docs/react/data/queries
---

Most "state management" complexity in React apps is really **server state** handled as if it were client state: fetched into `useState`, copied into global stores, and kept fresh by hand. Separating the two simplifies almost everything.

## Two kinds of state

| | Client state | Server state |
| --- | --- | --- |
| Owned by | this browser tab | the server |
| Examples | open menus, drafts, theme, selected tab | channels, streams, follows, chat history |
| Can change without you knowing | no | yes |
| Shared with other users and devices | no | yes |
| Needs | storing and updating | fetching, caching, deduplicating, refreshing, invalidating |

## Doing it by hand

A component fetching into `useState` must solve, on its own:

- loading and error states,
- race conditions when inputs change,
- duplicate requests when two components need the same data,
- showing cached data when you navigate back instead of a spinner,
- refreshing stale data (on focus, on reconnect, on an interval),
- updating every place that shows an entity after a mutation,
- pagination and merging pages,
- retries with backoff.

Each is a small amount of code. Together, repeated across every component, they become the bulk of an app and the source of most of its bugs.

## A server-state cache

Data libraries solve these once. You declare what data a component needs; the library fetches, caches by key, deduplicates, and re-renders subscribers when the cached data changes:

- **Apollo Client**: for GraphQL, with a **normalised** cache where each entity is stored once by ID (next lessons).
- **TanStack Query**: for any async source, caching by query key.
- **Relay**: for GraphQL, with compiler-enforced fragment colocation.

```tsx nocheck
// TanStack Query
const { data, error, isPending } = useQuery({
  queryKey: ["channel", login],
  queryFn: ({ signal }) => fetchChannel(login, signal),
  staleTime: 30_000,
});

// Apollo Client
const { data, error, loading } = useQuery(CHANNEL_QUERY, { variables: { login } });
```

## Freshness

Every cache trades freshness for speed. Apollo expresses it as a **fetch policy**:

| Policy | Behaviour | Use for |
| --- | --- | --- |
| `cache-first` (default) | use the cache if it has the data; otherwise fetch | data that rarely changes |
| `cache-and-network` | show cached data, and fetch to update it | lists that change but where a quick first paint matters |
| `network-only` | always fetch, then write to the cache | data that must be current on every visit |
| `no-cache` | always fetch, do not write to the cache | one-off sensitive data |
| `cache-only` | never fetch | data you know is already cached |

Live values that change every second (viewer counts, chat) are better pushed over a real-time connection than polled; see [Real-Time](/lessons/spa/realtime/).

## What is left for client state

With server state in a cache, what remains is usually small: UI state in components, URL state in the router, and a few app-wide values (theme, the viewer's settings) in context or a small external store. Many apps need no global state library at all.

## Assignment

1. Read TanStack Query's [Does this replace client state?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) guide.
2. List every piece of state in your Lumen app and label it client, URL or server state.
3. Pick one component that fetches in an effect and list which of the problems above it handles and which it does not.
