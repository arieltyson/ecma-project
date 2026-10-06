---
title: The Normalized Cache
summary: How Apollo Client's InMemoryCache stores entities by ID, how to configure keys and pagination, and how to update the cache after mutations.
minutes: 40
objectives:
  - Explain normalisation, cache IDs and references.
  - Configure keyFields and field policies, including cursor pagination.
  - Update lists after mutations with update functions, cache.modify and refetchQueries.
  - Read and write fragments, and evict data.
quiz:
  - question: How does InMemoryCache identify an object by default?
    options:
      - By its position in the query.
      - By __typename plus id (or _id), for example Channel:c1.
      - By a hash of all its fields.
    answer: 1
    explanation: Objects with an id are stored once under that cache ID and referenced from everywhere else. Objects without one are stored inside their parent.
  - question: A new follow should appear in the sidebar's followed channels list after a follow mutation. Returning the channel from the mutation is not enough. Why?
    options:
      - The channel has no id.
      - The cache cannot know which lists should now include the channel; you must add it with an update function or refetch the list.
      - Lists are never cached.
    answer: 1
    explanation: Normalisation updates existing entities automatically. Membership of lists is application logic the cache cannot infer.
  - question: Infinite scrolling with `after` cursors shows only the latest page. What is missing?
    options:
      - A key on each list item.
      - A field policy with keyArgs and a merge function (such as relayStylePagination) so pages are appended instead of stored separately.
      - A larger page size.
    answer: 1
    explanation: By default each set of arguments is a separate cache entry. A merge function combines pages into one list.
  - question: "What does `cache.evict({ id: cache.identify(channel) })` followed by `cache.gc()` do?"
    options:
      - Refetches the channel.
      - Removes the channel entity and then garbage-collects anything no longer reachable.
      - Clears the whole cache.
    answer: 1
    explanation: Eviction removes the entity; queries that referenced it refetch or show it as missing. gc cleans up orphaned objects.
resources:
  - title: Apollo Client, caching overview
    url: https://www.apollographql.com/docs/react/caching/overview
  - title: Apollo Client, configuring the cache
    url: https://www.apollographql.com/docs/react/caching/cache-configuration
  - title: Apollo Client, cursor-based pagination
    url: https://www.apollographql.com/docs/react/pagination/cursor-based
  - title: Apollo Client, cache interaction
    url: https://www.apollographql.com/docs/react/caching/cache-interaction
---

Apollo's `InMemoryCache` does not store query results as blobs. It **normalises** them: every object with an identity is stored once, and queries hold references to it. That is why updating a channel in one place updates it everywhere, and also why some updates need your help.

## Normalisation

The query result

```json
{
  "channel": {
    "__typename": "Channel",
    "id": "c1",
    "displayName": "Lumen",
    "stream": { "__typename": "Stream", "id": "s9", "title": "Any% practice" }
  }
}
```

is stored as flat entities keyed by **cache ID** (`__typename:id`):

```json
{
  "ROOT_QUERY": { "channel({\"login\":\"lumen\"})": { "__ref": "Channel:c1" } },
  "Channel:c1": { "__typename": "Channel", "id": "c1", "displayName": "Lumen", "stream": { "__ref": "Stream:s9" } },
  "Stream:s9": { "__typename": "Stream", "id": "s9", "title": "Any% practice" }
}
```

Any later result containing `Channel:c1` merges its fields into the same entity, and every query that references it re-renders. Always request `id` for entities, or the cache cannot normalise them.

## keyFields

If a type's identity is not `id`, say so:

```ts
import { InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

export const cache = new InMemoryCache({
  typePolicies: {
    Channel: { keyFields: ["login"] },
    Emote: { keyFields: ["setId", "code"] },
    ViewerSettings: { keyFields: [] }, // a singleton
    Query: {
      fields: {
        streams: relayStylePagination(["category", "sort"]),
      },
    },
  },
});
```

## Pagination

By default, `streams(after: "a")` and `streams(after: "b")` are separate cache entries, so loading page two replaces page one on screen. A **field policy** fixes this: `keyArgs` lists the arguments that identify a distinct list (filters, not cursors), and a `merge` function combines pages. `relayStylePagination` implements both for Relay-style connections:

```tsx nocheck
const { data, fetchMore } = useQuery(DIRECTORY, { variables: { category, first: 24 } });

function loadMore() {
  void fetchMore({ variables: { after: data?.streams.pageInfo.endCursor } });
}
```

`offsetLimitPagination` and `concatPagination` cover other styles; for anything else, write `merge` and `read` yourself.

## Updating lists after mutations

The cache cannot know that following a channel should add it to `viewer.follows`. You have three options.

### 1. Refetch

Simplest, at the cost of a request:

```tsx nocheck
useMutation(FOLLOW, { refetchQueries: ["FollowedChannels"] });
```

### 2. An update function

Edit the cache directly with the mutation result:

```ts
import { gql, type ApolloCache, type Reference } from "@apollo/client";

interface FollowResult {
  readonly followChannel: { readonly channel: { readonly __typename: "Channel"; readonly id: string } | null };
}

export function addFollow(cache: ApolloCache, result: FollowResult): void {
  const channel = result.followChannel.channel;
  const viewerId = cache.identify({ __typename: "User", id: "viewer" });
  if (!channel || !viewerId) return;
  cache.modify({
    id: viewerId,
    fields: {
      follows(existing: readonly Reference[] = [], { toReference, readField }) {
        const ref = toReference(channel);
        if (!ref) return existing;
        const already = existing.some((r) => readField("id", r) === channel.id);
        return already ? existing : [ref, ...existing];
      },
    },
  });
}

export const FOLLOWED_CHANNEL = gql`
  fragment FollowedChannel on Channel {
    id
    displayName
  }
`;
```

Pass it as `useMutation(FOLLOW, { update: (cache, { data }) => data && addFollow(cache, data) })`. The update also runs for the optimistic response, so the sidebar updates instantly and rolls back on failure.

### 3. Evict

When it is easier to let queries refetch:

```ts nocheck
cache.evict({ id: cache.identify({ __typename: "Clip", id: clipId }) });
cache.gc();
```

## Reading and writing fragments

Read or write one entity without a full query:

```ts nocheck
const channel = cache.readFragment({
  id: cache.identify({ __typename: "Channel", id: "c1" }),
  fragment: FOLLOWED_CHANNEL,
});

cache.writeFragment({
  id: "Channel:c1",
  fragment: gql`fragment Live on Channel { isLive }`,
  data: { isLive: true },
});
```

`useFragment` subscribes a component to one entity's fields in the cache, which pairs well with fragment colocation: a list renders IDs, and each row reads its own fragment.

## Common cache bugs

| Symptom | Likely cause |
| --- | --- |
| A list does not update after a mutation | list membership changed; use `update` or `refetchQueries` |
| Two queries overwrite each other's fields | an object without `id` stored inside different parents; add `id` or `keyFields` |
| Infinite scroll shows only the newest page | no field policy for the paginated field |
| Warning about merging objects without an ID | a non-normalised object replaced; add `keyFields` or a `merge: true` type policy |
| Stale data after navigating back | `cache-first` with data that changes; use `cache-and-network` |

## Assignment

1. Read Apollo's [caching overview](https://www.apollographql.com/docs/react/caching/overview) and [cursor-based pagination](https://www.apollographql.com/docs/react/pagination/cursor-based).
2. Inspect your Lumen app's cache in the Apollo Client Devtools, and find the normalised `Channel` entity and the references to it.
3. Implement infinite scrolling for the directory with `relayStylePagination`, then add the follow `update` function so the sidebar list updates optimistically.
