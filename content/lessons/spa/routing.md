---
title: Routing in React
summary: Nested routes, layouts, URL parameters, search params and data loading with a router library.
minutes: 30
objectives:
  - Define nested routes with shared layouts and outlets.
  - Read path parameters and search parameters.
  - Load route data in parallel with loaders instead of effects.
  - Handle pending navigation and route-level errors.
quiz:
  - question: What renders in an `<Outlet />`?
    options:
      - The matched child route's element.
      - The root component.
      - Nothing; it is a placeholder for ads.
    answer: 0
    explanation: Nested routes render inside their parent's layout at the outlet, so shared chrome such as navigation persists across child pages.
  - question: Why load route data in a loader instead of in components' effects?
    options:
      - Effects cannot fetch.
      - Loaders for all matched routes start in parallel as soon as navigation begins, avoiding request waterfalls.
      - Loaders are cached forever.
    answer: 1
    explanation: With effects, a child cannot start fetching until its parent has rendered, which serialises requests.
  - question: Where should a directory page's sort order live so that links and reloads keep it?
    options:
      - In component state.
      - In the URL search params.
      - In a cookie.
    answer: 1
    explanation: Search params are part of the URL, so they survive reloads, can be shared and work with back and forward.
resources:
  - title: React Router documentation
    url: https://reactrouter.com/
  - title: TanStack Router documentation
    url: https://tanstack.com/router/latest
---

A router maps URLs to components, keeps the URL in sync with what is shown, and (in modern routers) loads each page's data. You built one by hand in [Project: A Router From Scratch](/lessons/browser/project-router/). Libraries add nested layouts, data loading, pending states and type safety on top.

## Nested routes and layouts

Routes nest the way the UI nests. A parent route renders shared layout and an `<Outlet />` where the matching child appears:

```tsx nocheck
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

function AppLayout() {
  return (
    <>
      <TopNav />
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "directory", element: <Directory /> },
      {
        path: ":login",
        element: <ChannelLayout />,
        children: [
          { index: true, element: <ChannelHome /> },
          { path: "videos", element: <Videos /> },
          { path: "clip/:clipId", element: <Clip /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

Navigating from `/lumen` to `/lumen/videos` keeps `AppLayout` and `ChannelLayout` mounted (and their state, like a playing video) and swaps only the inner page.

## Parameters

```tsx nocheck
import { useParams, useSearchParams } from "react-router";

function Directory() {
  const [params, setParams] = useSearchParams();
  const sort = params.get("sort") === "recent" ? "recent" : "viewers";
  return (
    <select
      value={sort}
      onChange={(e) => setParams((p) => { p.set("sort", e.target.value); return p; })}
    >
      <option value="viewers">Most viewers</option>
      <option value="recent">Recently started</option>
    </select>
  );
}

function Clip() {
  const { login, clipId } = useParams(); // string | undefined
}
```

Parameters are strings from the URL. Parse and validate them like any other boundary data.

## Data loading

A **loader** fetches a route's data before (or while) it renders. All matched routes' loaders start in parallel when navigation begins:

```tsx nocheck
{
  path: ":login",
  loader: ({ params, request }) =>
    fetchChannel(params.login!, { signal: request.signal }),
  element: <ChannelLayout />,
}

function ChannelLayout() {
  const channel = useLoaderData<typeof loader>();
}
```

Compare with fetching in effects: the parent renders, then fetches, then renders the child, which then fetches. That **waterfall** doubles the time to show the page. Many apps that use Apollo Client keep fetching in components with `useQuery` but start queries early (preloading in loaders or on link hover) for the same reason.

## Pending navigation

Router navigations are transitions: the old page stays visible until the new one's data and code are ready. Show progress without hiding content:

```tsx nocheck
import { useNavigation } from "react-router";

function GlobalSpinner() {
  const navigation = useNavigation();
  return navigation.state === "loading" ? <ProgressBar /> : null;
}
```

## Type-safe routing

Route paths and parameters are strings, which invites typos. Options, from least to most integrated:

- A typed route table and `href` builder (what you wrote in [Project: Type-Safe Route Builder](/lessons/typescript/project-route-builder/)).
- React Router's framework mode, which generates types for each route's params and loader data.
- TanStack Router, which infers parameter, search param and loader types from route definitions.

## Assignment

1. Read the React Router [tutorial](https://reactrouter.com/) for data routers (library or framework mode).
2. Convert your Lumen app to nested routes with an app layout, a channel layout and three channel tabs.
3. Move channel data loading into a loader, and use the Network panel to show that the channel and its videos now load in parallel.
