---
title: Responsive Design and Units
summary: Build layouts that work from a small phone to a wide monitor, at any zoom level, with relative units and media queries.
minutes: 20
objectives:
  - Choose units that respect user settings.
  - Write mobile-first media queries with range syntax.
  - Serve responsive images with srcset and sizes.
  - Respect user preferences such as reduced motion.
quiz:
  - question: Why use rem rather than px for font sizes?
    options:
      - rem renders faster.
      - rem scales with the user's browser font size setting; px ignores it.
      - px is deprecated.
    answer: 1
    explanation: Users who need larger text set a larger default font size. rem-based layouts honour it.
  - question: "What does `@media (width >= 48rem)` mean?"
    options:
      - Styles apply when the viewport is at least 48rem wide.
      - Styles apply below 48rem.
      - Styles apply when printing.
    answer: 0
    explanation: Range syntax is clearer than min-width and max-width. Mobile-first styles add complexity as space grows.
  - question: What does the `sizes` attribute on an img tell the browser?
    options:
      - The file sizes of each image.
      - How wide the image will be displayed at different viewport widths, so it can pick the best file from srcset.
      - The image's aspect ratio.
    answer: 1
    explanation: With srcset and sizes, phones download small files and high-density screens get sharp ones.
resources:
  - title: MDN, Responsive design
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design
  - title: MDN, Responsive images
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
---

Responsive design means one page works on every screen size, input method and user setting. Modern CSS makes most of it automatic if you start from flexible defaults.

## Flexible by default

- Use `rem` for type and spacing, so everything scales with the user's font size.
- Use `%`, `fr`, `min()`, `max()` and `clamp()` for widths instead of fixed sizes.
- Limit line length for reading: `max-inline-size: 65ch`.
- Let grids reflow with `auto-fill` and `minmax` (see [CSS Grid](/lessons/css/grid/)).
- Use `100svh` (small viewport height) rather than `100vh` on mobile, where browser toolbars resize the viewport.

## Media queries

Write base styles for small screens, then add layout as space allows:

```css
.channel-page {
  display: grid;
  gap: 1rem;
}

@media (width >= 64rem) {
  .channel-page {
    grid-template-columns: 1fr 22rem;
  }
}
```

Choose breakpoints where **your content** breaks, not at device widths. For components, prefer container queries.

## Images

```html
<img
  src="thumb-640.avif"
  srcset="thumb-320.avif 320w, thumb-640.avif 640w, thumb-1280.avif 1280w"
  sizes="(width >= 64rem) 20rem, 100vw"
  width="640"
  height="360"
  alt="Speedrun of a platform game, level 3"
  loading="lazy"
/>
```

The browser picks the smallest file that is sharp enough for the displayed size and the screen's pixel density. `loading="lazy"` defers off-screen images; never lazy-load the main image at the top of the page.

## User preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }
}

@media (prefers-contrast: more) {
  :root {
    --separator: light-dark(#6e6e73, #a1a1a6);
  }
}

@media (hover: none) {
  .copy-button {
    opacity: 1; /* no hover on touch screens, so always show it */
  }
}
```

Also test at **200% and 400% zoom** and at **320px width**: content must reflow without horizontal scrolling (WCAG 1.4.10).

## Assignment

1. Read MDN's [Responsive design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design).
2. Use DevTools' device toolbar to test your landing page at 320px, 768px and 1440px wide, and at 200% zoom.
3. Add responsive thumbnails with `srcset` and `sizes` to the recent videos list.
