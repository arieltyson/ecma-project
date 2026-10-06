---
title: SPA Architecture
summary: How single-page apps are structured, how they compare with server rendering, static generation and Server Components, and what hydration does.
minutes: 30
objectives:
  - Compare client rendering, server rendering, static generation and React Server Components.
  - Explain hydration and hydration mismatches.
  - Organise a large single-page app into layers and features.
  - Recognise the trade-offs each rendering strategy makes.
quiz:
  - question: What does hydration do?
    options:
      - Downloads the HTML.
      - Attaches React to server-rendered HTML, reusing the existing DOM and adding event handlers.
      - Compresses JavaScript.
    answer: 1
    explanation: The HTML is already visible; hydration makes it interactive. React expects the first client render to match the HTML exactly.
  - question: What causes a hydration mismatch?
    options:
      - Using CSS modules.
      - The first client render producing different output from the server, for example by reading Date.now(), localStorage or window during render.
      - Using TypeScript.
    answer: 1
    explanation: Values that differ between server and client must be read after hydration, in an effect, or with useSyncExternalStore and a server snapshot.
  - question: Which strategy gives the fastest first paint for content that changes once a day and is the same for every visitor?
    options:
      - Client-side rendering.
      - Static generation, prerendering HTML at build time.
      - Rendering on every request.
    answer: 1
    explanation: Prerendered HTML is served from a CDN immediately. Personalised or rapidly changing content suits server or client rendering better.
resources:
  - title: web.dev, rendering on the web
    url: https://web.dev/articles/rendering-on-the-web
  - title: React, hydrateRoot
    url: https://react.dev/reference/react-dom/client/hydrateRoot
  - title: React, Server Components
    url: https://react.dev/reference/rsc/server-components
---

A **single-page app** (SPA) loads one document and then renders every view in the browser with JavaScript, fetching data as needed. It trades a heavier first load for fast, app-like navigation afterwards. Large web clients for streaming, mail and social products are typically built this way.

## Rendering strategies

| Strategy | HTML is produced | First paint | Good for |
| --- | --- | --- | --- |
| Client-side rendering (CSR) | in the browser, after JavaScript loads | slowest | logged-in, highly interactive apps |
| Server-side rendering (SSR) | on the server, per request | fast | personalised pages that must load fast and be indexable |
| Static generation (SSG) | at build time | fastest | content that is the same for everyone |
| React Server Components (RSC) | components run on the server and stream a description to the client | fast | mixing server data access with client interactivity |

These combine. A typical setup prerenders or server-renders the shell and public pages, then behaves as an SPA after load. This site prerenders every page at build time, then hydrates and routes on the client.

## Hydration

When HTML comes from a server or a prerender, React does not re-create it. `hydrateRoot` walks the existing DOM, attaches event handlers and takes over:

```tsx nocheck
import { hydrateRoot } from "react-dom/client";
hydrateRoot(document.getElementById("root")!, <App />);
```

For this to work, the client's first render must produce **exactly** the same output as the server. Anything that differs between them causes a **hydration mismatch**: `Date.now()`, `Math.random()`, `window.innerWidth`, `localStorage`, the user's locale or time zone. Read those after hydration, in an effect or with `useSyncExternalStore` and a server snapshot.

## Structure of a large SPA

Large apps stay manageable by separating concerns into layers and grouping code by feature:

```text
src/
  app/            entry points, providers, router, error boundaries
  routes/         one module per route: data requirements and layout
  features/
    chat/         components, hooks, GraphQL operations, tests for chat
    directory/
    follows/
  ui/             design system components with no product knowledge
  lib/            framework-free utilities: formatting, parsing, storage
  graphql/        generated types and the client setup
```

Guidelines that hold up at scale:

- **Dependencies point inward**: features use `ui` and `lib`; `ui` never imports from features.
- **Colocate** a component's styles, tests, hooks and GraphQL fragments with it.
- **Each route declares its data needs**, so data for a page can be fetched in parallel instead of in a waterfall of nested effects.
- **Split code by route**, so each page loads only what it needs.
- **Put error and loading boundaries per region**, so one failing panel does not take down the page.

## Server Components, briefly

React Server Components run only on the server (or at build time), can read databases or APIs directly, and send no JavaScript for themselves. Interactive parts are marked `"use client"`. RSC needs a framework (Next.js, React Router's framework mode and others) and a server. Many existing SPAs, including ones backed by a GraphQL API, remain client-rendered and get most of the same benefits from prerendering, code splitting and a good data cache.

## Assignment

1. Read web.dev's [Rendering on the Web](https://web.dev/articles/rendering-on-the-web).
2. On this site, view the page source of a lesson (the prerendered HTML), then compare it with the Elements panel after hydration.
3. Create a component that renders `new Date().toLocaleTimeString()` in a prerendered page, observe the hydration warning in the console, and fix it.
