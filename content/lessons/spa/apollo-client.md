---
title: Apollo Client
summary: Set up Apollo Client, query and mutate from React components, and handle loading, errors and refetching.
minutes: 35
objectives:
  - Create an ApolloClient with a link and an InMemoryCache and provide it to React.
  - Fetch data with useQuery and useSuspenseQuery, using typed documents.
  - Run mutations with useMutation, including optimistic responses.
  - Handle loading, partial data and the different kinds of errors.
quiz:
  - question: Where do Apollo Client 4's React hooks such as useQuery come from?
    options:
      - "`@apollo/client`"
      - "`@apollo/client/react`"
      - "`react-apollo`"
    answer: 1
    explanation: Apollo Client 4 moved the React integration to its own entry point, so the core client can be used without React.
  - question: A mutation returns the updated channel with its id and followerCount. What happens to a channel header elsewhere on the page that queried the same channel?
    options:
      - Nothing until it refetches.
      - It updates automatically, because the normalised cache merges the result into the same entity.
      - It throws an error.
    answer: 1
    explanation: Apollo stores entities by type and ID. Any query reading that entity re-renders with the new fields.
  - question: What does an optimisticResponse do?
    options:
      - Retries the mutation if it fails.
      - Writes a predicted result to the cache immediately, then replaces it with the real result or rolls it back on error.
      - Caches the mutation forever.
    answer: 1
    explanation: Optimistic responses make interactions such as following feel instant while keeping the cache correct.
resources:
  - title: Apollo Client, get started
    url: https://www.apollographql.com/docs/react/get-started
  - title: Apollo Client, queries
    url: https://www.apollographql.com/docs/react/data/queries
  - title: Apollo Client, mutations
    url: https://www.apollographql.com/docs/react/data/mutations
  - title: Apollo Client, error handling
    url: https://www.apollographql.com/docs/react/data/error-handling
---

Apollo Client is a GraphQL client with a normalised cache and React hooks. Components declare the data they need as GraphQL documents; Apollo fetches, caches and keeps every component in sync. The examples here use Apollo Client 4.

## Setup

```tsx
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

const client = new ApolloClient({
  link: new HttpLink({ uri: "/graphql", credentials: "same-origin" }),
  cache: new InMemoryCache(),
});

export function Providers({ children }: { readonly children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
```

The **link** decides how operations reach the server (HTTP here; WebSockets for subscriptions; links can be chained for auth headers, retries and logging). The **cache** stores results.

## Typed documents

Give each document its result and variable types, so hooks are typed end to end. In real projects, code generation writes these types for you (see [Typed GraphQL with Codegen](/lessons/spa/typed-graphql/)):

```ts
import { gql, type TypedDocumentNode } from "@apollo/client";

export interface ChannelPageData {
  readonly channel: {
    readonly __typename: "Channel";
    readonly id: string;
    readonly displayName: string;
    readonly followerCount: number;
    readonly isFollowing: boolean;
  } | null;
}

export interface ChannelPageVariables {
  readonly login: string;
}

export const CHANNEL_PAGE: TypedDocumentNode<ChannelPageData, ChannelPageVariables> = gql`
  query ChannelPage($login: String!) {
    channel(login: $login) {
      id
      displayName
      followerCount
      isFollowing
    }
  }
`;
```

## useQuery

```tsx
import { gql, type TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

interface Data {
  readonly channel: { readonly id: string; readonly displayName: string; readonly followerCount: number } | null;
}

const CHANNEL_PAGE: TypedDocumentNode<Data, { login: string }> = gql`
  query ChannelPage($login: String!) {
    channel(login: $login) {
      id
      displayName
      followerCount
    }
  }
`;

export function ChannelHeader({ login }: { readonly login: string }) {
  const { data, loading, error, refetch } = useQuery(CHANNEL_PAGE, {
    variables: { login },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <p>Loading…</p>;
  if (error) {
    return (
      <p role="alert">
        Could not load this channel. <button onClick={() => void refetch()}>Retry</button>
      </p>
    );
  }
  if (!data?.channel) return <p>Channel not found.</p>;

  return (
    <header>
      <h1>{data.channel.displayName}</h1>
      <p>{data.channel.followerCount.toLocaleString()} followers</p>
    </header>
  );
}
```

When `login` changes, Apollo fetches the new channel (or reads it from the cache). Requests for the same query and variables from several components are deduplicated.

### With Suspense

`useSuspenseQuery` suspends instead of returning `loading`, and throws errors to the nearest error boundary, so the component only handles the success case:

```tsx nocheck
import { useSuspenseQuery } from "@apollo/client/react";

function ChannelHeader({ login }: { readonly login: string }) {
  const { data } = useSuspenseQuery(CHANNEL_PAGE, { variables: { login } });
  return <h1>{data.channel?.displayName ?? "Channel not found"}</h1>;
}
```

`useBackgroundQuery` with `useReadQuery`, or `createQueryPreloader`, start a query early (for example in a router loader or on link hover) and read it later, which avoids request waterfalls.

## useMutation

```tsx
import { gql, type TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

interface FollowData {
  readonly followChannel: {
    readonly __typename: "FollowChannelPayload";
    readonly channel: {
      readonly __typename: "Channel";
      readonly id: string;
      readonly isFollowing: boolean;
      readonly followerCount: number;
    } | null;
  };
}

const FOLLOW: TypedDocumentNode<FollowData, { channelId: string }> = gql`
  mutation FollowChannel($channelId: ID!) {
    followChannel(channelId: $channelId) {
      channel {
        id
        isFollowing
        followerCount
      }
    }
  }
`;

export function FollowButton({
  channelId,
  isFollowing,
  followerCount,
}: {
  readonly channelId: string;
  readonly isFollowing: boolean;
  readonly followerCount: number;
}) {
  const [follow, { loading, error }] = useMutation(FOLLOW, {
    variables: { channelId },
    optimisticResponse: {
      followChannel: {
        __typename: "FollowChannelPayload",
        channel: { __typename: "Channel", id: channelId, isFollowing: true, followerCount: followerCount + 1 },
      },
    },
  });

  return (
    <>
      <button aria-pressed={isFollowing} disabled={loading || isFollowing} onClick={() => void follow()}>
        {isFollowing ? "Following" : "Follow"}
      </button>
      {error ? <p role="alert">Could not follow. Try again.</p> : null}
    </>
  );
}
```

Because the mutation returns the channel with its `id`, Apollo merges `isFollowing` and `followerCount` into the cached `Channel`, and every component showing that channel updates. The optimistic response does the same instantly, and is rolled back if the mutation fails.

When a mutation changes **lists** (a new follow should appear in the sidebar), returning the entity is not enough; update the cache directly or refetch the affected queries. The next lesson covers both.

## Errors

Apollo reports errors in `error`, which you can tell apart by class:

```ts
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";

export function describeError(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    // The server answered with GraphQL errors.
    return error.errors.map((e) => e.message).join("; ");
  }
  if (ServerError.is(error)) {
    // A non-2xx HTTP response.
    return `HTTP ${error.statusCode}`;
  }
  return "Network error"; // offline, DNS, CORS or an abort
}
```

The `errorPolicy` option chooses what happens with partial data: `"none"` (default) treats any GraphQL error as failure; `"all"` returns both `data` and `error` so you can render what succeeded.

## Developer tools

The **Apollo Client Devtools** browser extension shows every active query, the cache contents by entity, and lets you run operations. Use it alongside the Network panel's **Fetch/XHR** filter, where each GraphQL request's payload shows its operation name and variables.

## Assignment

1. Work through Apollo's [get started](https://www.apollographql.com/docs/react/get-started) guide.
2. Set up Apollo Client in your Lumen app against a mock GraphQL server (MSW's `graphql` handlers or a local `graphql-yoga` server), and render the channel header with `useQuery`.
3. Add the follow mutation with an optimistic response, make the mock fail one time in three, and confirm the button rolls back.
