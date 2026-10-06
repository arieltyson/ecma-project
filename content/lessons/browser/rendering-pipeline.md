---
title: Style, Layout, Paint and Composite
summary: How the browser turns the DOM and CSS into pixels on every frame, and how to keep that work cheap.
minutes: 25
objectives:
  - Name the stages of the rendering pipeline and what triggers each.
  - Recognise forced synchronous layout and layout thrashing.
  - Animate with properties the compositor can handle alone.
  - Use requestAnimationFrame and content-visibility.
quiz:
  - question: Which property change can usually skip both layout and paint?
    options:
      - "`width`"
      - "`transform`"
      - "`top`"
    answer: 1
    explanation: "`transform` and `opacity` can be applied by the compositor to an existing layer. Changing `width` or `top` moves other content and requires layout."
  - question: What causes layout thrashing?
    options:
      - Using too many CSS classes.
      - Alternating DOM writes with reads of layout properties such as offsetHeight inside a loop.
      - Loading CSS after JavaScript.
    answer: 1
    explanation: Each read after a write forces the browser to run layout immediately to return an accurate value. Batch reads first, then writes.
  - question: When does a requestAnimationFrame callback run?
    options:
      - Immediately.
      - Before the next frame is rendered, after the current task and its microtasks.
      - After the page has been idle for 50ms.
    answer: 1
    explanation: rAF callbacks run in the rendering step of the event loop, right before style and layout, so DOM updates made there are shown in that frame.
resources:
  - title: web.dev, rendering performance
    url: https://web.dev/articles/rendering-performance
  - title: What forces layout (Paul Irish)
    url: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
  - title: MDN, content-visibility
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
---

To show a frame, the browser runs a pipeline. At 60 frames per second it has about 16 milliseconds for everything, including your JavaScript. Knowing which stage a change triggers is the key to smooth interfaces.

## The pipeline

```text
JavaScript → Style → Layout → Paint → Composite
```

1. **Style**: work out which CSS rules apply to each element and compute final values.
2. **Layout**: compute every box's size and position. Changing one element's size can move many others.
3. **Paint**: fill in pixels for text, colours, borders and shadows, into one or more layers.
4. **Composite**: combine the layers on the GPU, applying `transform` and `opacity`.

Each stage only runs when needed, and later stages depend on earlier ones:

| You change | Stages that run |
| --- | --- |
| `width`, `height`, `top`, `font-size`, adding nodes | style, layout, paint, composite |
| `color`, `background`, `box-shadow` | style, paint, composite |
| `transform`, `opacity` (on a composited layer) | style, composite |

## Animate transform and opacity

To move, scale or fade something smoothly, animate `transform` and `opacity`. The compositor can do this on its own thread, even while the main thread is busy:

```css
.toast {
  transition:
    transform 250ms ease,
    opacity 250ms ease;
}

.toast[hidden] {
  transform: translateY(1rem);
  opacity: 0;
}
```

Animating `top` or `height` instead runs layout on every frame and stutters when JavaScript is busy.

## Forced synchronous layout

The browser normally batches layout until the end of a task. Reading a layout property (such as `offsetHeight`, `getBoundingClientRect()` or `scrollTop`) after changing the DOM forces it to run layout immediately so the value is accurate. Doing that in a loop is **layout thrashing**:

```ts
declare const cards: HTMLElement[];

// Slow: every iteration writes, then forces layout with a read.
for (const card of cards) {
  card.style.height = `${card.offsetWidth * 0.5625}px`;
}

// Fast: read everything, then write everything.
const widths = cards.map((card) => card.offsetWidth);
cards.forEach((card, i) => {
  card.style.height = `${(widths[i] ?? 0) * 0.5625}px`;
});
```

(For aspect ratios specifically, CSS `aspect-ratio: 16 / 9` avoids JavaScript entirely.)

DevTools' Performance panel marks forced layouts with a purple bar and a warning.

## requestAnimationFrame

`requestAnimationFrame(callback)` runs your callback just before the next frame's style and layout. Use it for visual updates driven by JavaScript, so you do one update per frame instead of several, or one that misses the frame:

```ts
let frame = 0;

function onScroll() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    document.documentElement.style.setProperty("--scroll", String(window.scrollY));
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
```

`{ passive: true }` promises the listener will not call `preventDefault()`, so the browser can scroll without waiting for it.

## Skipping work entirely

`content-visibility: auto` lets the browser skip style, layout and paint for off-screen sections until they approach the viewport. Pair it with `contain-intrinsic-size` so the scrollbar does not jump:

```css
.chat-history-day {
  content-visibility: auto;
  contain-intrinsic-size: auto 40rem;
}
```

## Assignment

1. Read web.dev's [rendering performance](https://web.dev/articles/rendering-performance) series.
2. Build a page with 500 cards and the slow loop above. Record it in the Performance panel and find the forced layout warnings. Then apply the fix and compare.
3. Animate a box across the screen once with `left` and once with `transform`. In DevTools, open **Rendering** from the command menu (<kbd>⌘⇧P</kbd>) and turn on **Paint flashing** to see the difference.
