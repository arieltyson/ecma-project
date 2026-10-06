---
title: "Project: Lumen, a Streaming Web Client"
summary: Build a production-quality single-page streaming client with React, TypeScript, Apollo Client and a mock GraphQL API.
kind: project
minutes: 1800
objectives:
  - A single-page app with nested routes for home, directory, channel pages and settings.
  - A typed GraphQL data layer with Apollo Client, codegen, a normalised cache and optimistic mutations.
  - Live chat and viewer counts over a real-time connection.
  - Tests, accessibility checks, performance budgets and continuous deployment.
resources:
  - title: Apollo Client documentation
    url: https://www.apollographql.com/docs/react
  - title: Mock Service Worker, GraphQL
    url: https://mswjs.io/docs/graphql/
  - title: GraphQL Yoga
    url: https://the-guild.dev/graphql/yoga-server
  - title: Playwright
    url: https://playwright.dev/
---

This is the final project. You will build **Lumen**, a streaming site's web client, from an empty folder to a deployed app, using everything in this path. It is deliberately large: plan it, build it in slices, and commit as you go.

## Brief

Lumen has four areas:

- **Home**: live channels you follow, then recommended streams.
- **Directory**: browse live streams by category, with search, sorting and infinite scrolling (reuse [Project: Stream Directory](/lessons/react/project-stream-directory/)).
- **Channel**: `/:login` with a header (avatar, name, follow button, live viewer count), a video player area (a placeholder `<video>` or poster is fine), live chat (reuse [Project: Live Chat Panel](/lessons/react/project-live-chat/)), and tabs for About and Videos.
- **Settings**: display name, chat colour and appearance, saved through mutations.

A persistent sidebar lists followed channels with live indicators.

## The API

Write a GraphQL schema for Lumen (start from the one in [GraphQL Fundamentals](/lessons/spa/graphql/)) and serve it with mock data, either in the browser with MSW's `graphql` handlers or with a small local GraphQL Yoga server. Include:

- queries for the viewer, channels, streams (cursor-paginated by category) and videos,
- `followChannel`, `unfollowChannel` and `updateSettings` mutations, which fail sometimes and rate-limit,
- a subscription (or a WebSocket feed) for viewer counts and chat messages,
- artificial latency of 100 to 1500ms.

## Requirements

### Architecture

1. React 19, TypeScript 7 with every strict option from [A Strict tsconfig](/lessons/typescript/strict-config/), Vite, and the React Compiler.
2. Feature folders as described in [SPA Architecture](/lessons/spa/architecture/), with dependencies pointing inward.
3. Nested routes with a persistent app layout and channel layout. Each route's code is split.

### Data

4. Apollo Client with GraphQL Code Generator. No hand-written response types.
5. Every component that renders data declares a colocated fragment.
6. `typePolicies` for every entity whose key is not `id`, and `relayStylePagination` for the directory.
7. Follow and unfollow are optimistic, update the sidebar through the cache, and roll back with a visible error on failure.
8. Viewer counts update live through the cache, so the directory, sidebar and channel header all agree.
9. Route data starts loading before the route renders (preloading on navigation or link hover), so no page shows a waterfall of spinners.

### Experience

10. Suspense and error boundaries per region: the chat can fail without taking down the channel page.
11. Filters and tabs live in the URL.
12. Appearance (light, dark or system) is stored locally and applied before first paint.
13. Every interaction is keyboard operable, focus moves to the page heading on navigation, and axe reports no violations on any route.
14. Core Web Vitals in the lab on a throttled mobile profile: LCP under 2.5s, CLS under 0.1, and no interaction over 200ms during your test script.

### Quality

15. Unit tests for reducers, stores, parsers and cache update functions; component tests for follow, chat and the directory; at least three Playwright end-to-end tests (navigate to a channel, follow, send a chat message).
16. A GitHub Actions workflow that runs format, lint, type-check, codegen check, tests and build, and deploys to GitHub Pages.
17. A README describing the architecture and how to run it, written for a stranger.

## Break it on purpose

Introduce each failure, observe it, write down what you saw, then fix it:

1. Remove `id` from the channel header's fragment. Follow a channel and watch which parts of the page fail to update.
2. Remove the pagination field policy. Scroll the directory and describe what happens to earlier pages.
3. Fetch the channel's videos inside the Videos tab with no preloading. Record the waterfall in the Network panel.
4. Throw an error inside the chat panel's render and confirm the rest of the page survives.

## Stretch

- Render the public pages (directory, channel) on the server or prerender them, and measure the LCP difference.
- Add Apollo data masking and enforce it.
- Add a mini player that keeps playing while you navigate between channels.
- Add internationalisation for two languages, including number and date formatting with `Intl`.

## Explain it

Prepare to walk someone through the codebase in thirty minutes:

- Draw the architecture: routes, features, the data layer, the real-time layer. Where does each kind of state live and why?
- Trace a follow click from the button to the server and back to every component that changes, including the optimistic and failure paths.
- What did you do to avoid request waterfalls? Show the Network panel before and after.
- Which performance problem was hardest to find, and how did you find it?
- If the API added a breaking change to `Channel`, what would fail first, and where?
- What would you change if this had to support a million concurrent viewers in one channel's chat?
