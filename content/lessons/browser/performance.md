---
title: Web Performance and Core Web Vitals
summary: Measure what users experience with LCP, INP and CLS, and fix the common causes of each.
minutes: 30
objectives:
  - Define LCP, INP and CLS and their good thresholds.
  - Distinguish lab data from field data.
  - Fix common causes of slow loading, slow interactions and layout shifts.
  - Reduce JavaScript cost with code splitting.
quiz:
  - question: What does Interaction to Next Paint measure?
    options:
      - How long the page takes to load.
      - The delay from a user's interaction to the next frame painted in response, across the visit.
      - How many times the page repaints.
    answer: 1
    explanation: INP reports one of the slowest interactions in a visit. Under 200ms is good.
  - question: Which change prevents a layout shift when an image loads?
    options:
      - Adding `loading="lazy"`.
      - Giving the image width and height attributes (or an aspect-ratio) so space is reserved.
      - Converting it to PNG.
    answer: 1
    explanation: Without dimensions, the browser reserves no space and moves content down when the image arrives.
  - question: Why do field metrics matter more than a single Lighthouse score?
    options:
      - Lighthouse is inaccurate.
      - Field data comes from real users on real devices and networks, at the 75th percentile, which is what users experience.
      - Field data is faster to collect.
    answer: 1
    explanation: Lab tests are repeatable and good for debugging, but one simulated device cannot represent your users.
resources:
  - title: web.dev, Web Vitals
    url: https://web.dev/articles/vitals
  - title: web.dev, optimize INP
    url: https://web.dev/articles/optimize-inp
  - title: The web-vitals library
    url: https://github.com/GoogleChrome/web-vitals
---

Performance is measured by what users experience, not by how fast your laptop runs the app. Google's **Core Web Vitals** are three metrics that capture loading, responsiveness and visual stability. Each is judged at the 75th percentile of real visits.

## The three metrics

| Metric | Measures | Good |
| --- | --- | --- |
| **LCP**, Largest Contentful Paint | when the largest image or text block in the viewport is painted | ≤ 2.5 s |
| **INP**, Interaction to Next Paint | delay between an interaction and the next frame, for one of the slowest interactions in the visit | ≤ 200 ms |
| **CLS**, Cumulative Layout Shift | how much visible content moves unexpectedly | ≤ 0.1 |

Measure them in the field with the `web-vitals` library, and debug them in the lab with DevTools' Performance panel and Lighthouse.

```ts nocheck
import { onCLS, onINP, onLCP } from "web-vitals";

onLCP(report);
onINP(report);
onCLS(report);
```

## LCP

LCP is usually a hero image, a video poster or a heading. To improve it:

- Make the LCP resource discoverable in the HTML (not injected later by JavaScript), and give an image `fetchpriority="high"`.
- Never lazy-load the LCP image.
- Serve modern formats (AVIF, WebP) at the right size with `srcset`.
- Reduce TTFB with caching and a CDN.
- For client-rendered apps, the LCP element often waits for JavaScript and data. Prerendering or server rendering the shell helps the most.

## INP

INP is about the main thread being free when the user acts. Every interaction has three parts: **input delay** (waiting for other tasks), **processing** (your handlers) and **presentation** (rendering the result). Fixes:

- Break up long tasks (see [the event loop](/lessons/browser/event-loop/)).
- Do the minimum in the handler before the next paint; defer the rest. In React, `useTransition` marks updates as non-urgent so typing stays responsive (see [Transitions](/lessons/react/transitions/)).
- Avoid rendering huge lists; virtualise them.
- Watch third-party scripts, which run on the same thread.

## CLS

Layout shifts happen when content appears above what the user is reading:

- Give images, videos and embeds `width` and `height` or `aspect-ratio`.
- Reserve space for content that loads later (ads, banners, a "new messages" bar) or show it as an overlay.
- Use skeletons the same size as the real content.
- Load web fonts with fallbacks of similar size (`size-adjust`, or `font-display: optional`).

Shifts within 500ms of a user interaction (like expanding an accordion) do not count.

## JavaScript cost

JavaScript costs more than its download size: it must be parsed, compiled and executed on the main thread. Ship less of it:

- **Code split** by route with dynamic `import()`, so each page loads only its code. This site loads each lesson as its own chunk.
- Check what is in your bundle (`npx vite-bundle-visualizer` or similar) and remove large dependencies you barely use.
- Avoid shipping server-only or development-only code.

```tsx nocheck
import { lazy, Suspense } from "react";

const ChannelPage = lazy(() => import("./pages/ChannelPage.tsx"));

<Suspense fallback={<Spinner />}>
  <ChannelPage />
</Suspense>;
```

## Assignment

1. Read web.dev's [Web Vitals](https://web.dev/articles/vitals) overview and [Optimize INP](https://web.dev/articles/optimize-inp).
2. Run Lighthouse on a site you use often, on the mobile setting. Pick the worst metric and use the Performance panel to find its cause.
3. On this site, open the Performance panel, record navigating to a lesson and answering a quiz question, and read the interaction timing in the **Interactions** track.
