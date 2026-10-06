---
title: Custom Properties, Nesting, :has() and Container Queries
summary: The modern CSS features that replace preprocessors and much layout JavaScript, and how to build a token-based design system with them.
minutes: 30
objectives:
  - Define and use custom properties for design tokens and theming.
  - Support light and dark themes with color-scheme and light-dark().
  - Write nested CSS and use :has() for parent and state selectors.
  - Make components respond to their container with container queries.
quiz:
  - question: "What does `color: light-dark(#1d1d1f, #f5f5f7)` do?"
    options:
      - Picks a random colour.
      - Uses the first colour when the element's used color-scheme is light and the second when it is dark.
      - Blends the two colours.
    answer: 1
    explanation: "Combined with `color-scheme: light dark` on the root, one declaration covers both themes and follows the system setting."
  - question: What does `.card:has(img)` select?
    options:
      - Images inside cards.
      - Cards that contain an image.
      - Nothing; :has is not valid CSS.
    answer: 1
    explanation: ":has() is a relational selector. It enables parent selection and state-based styling without JavaScript."
  - question: How does a container query differ from a media query?
    options:
      - It responds to the size of an ancestor container rather than the viewport.
      - It is faster.
      - It only works in grid.
    answer: 0
    explanation: Components can adapt to wherever they are placed, a narrow sidebar or a wide main column, regardless of the window size.
resources:
  - title: MDN, Using CSS custom properties
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
  - title: MDN, light-dark()
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
  - title: MDN, CSS container queries
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
  - title: MDN, :has()
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/:has
---

CSS has absorbed most of what preprocessors and layout JavaScript used to provide. This lesson covers the features you will use in every new project.

## Custom properties and design tokens

Custom properties (CSS variables) hold values you reuse. Define your design system's **tokens** once and reference them everywhere:

```css
:root {
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-md: 0.625rem;
  --text-body: 1.0625rem;
  --accent: #0066cc;
}

.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--accent);
}
```

Unlike preprocessor variables, custom properties are live: they cascade, inherit, can be changed per component or by JavaScript, and can be read with `getComputedStyle`. This site defines every colour, length and duration as a token and has a test that fails if a stylesheet uses a raw value.

## Light and dark themes

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#ffffff, #000000);
  --label: light-dark(#1d1d1f, #f5f5f7);
}

:root[data-theme="dark"] {
  color-scheme: dark; /* a manual override */
}

body {
  background: var(--bg);
  color: var(--label);
}
```

`color-scheme` also tells the browser to draw form controls and scrollbars in the matching theme. Check contrast in **both** themes.

## Nesting

Native CSS supports nesting:

```css
.card {
  padding: var(--space-4);

  & h3 {
    margin-block-end: var(--space-2);
  }

  &:hover {
    background: var(--fill);
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: background 150ms ease;
  }
}
```

Keep nesting shallow; deep nesting recreates specificity problems.

## :has()

```css
/* A card with an image uses a two-column layout. */
.card:has(img) {
  grid-template-columns: 6rem 1fr;
}

/* Highlight a form row whose input is invalid. */
.field:has(input:user-invalid) label {
  color: var(--danger);
}

/* Stop the page scrolling while a modal dialog is open. */
body:has(dialog[open]) {
  overflow: hidden;
}
```

## Container queries

A component should adapt to the space it is given, not the window:

```css
.stream-card-container {
  container-type: inline-size;
}

.stream-card {
  display: grid;
  gap: var(--space-2);
}

@container (width > 28rem) {
  .stream-card {
    grid-template-columns: 12rem 1fr;
  }
}
```

The same card works in a narrow sidebar and a wide grid.

## Other modern features

- `clamp()` for fluid type: `font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem)`.
- `aspect-ratio: 16 / 9` for media boxes.
- `text-wrap: balance` for headings and `pretty` for paragraphs.
- `@property` to type custom properties and animate them.
- `:focus-visible` to show focus rings for keyboard users only.
- `@starting-style` and `transition-behavior: allow-discrete` to animate elements appearing.

## Assignment

1. Read MDN's [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties).
2. Define a small token set (colours in light and dark, a spacing scale, radii, type sizes) for your landing page and use only tokens in your styles.
3. Build a stream card that switches layout with a container query, and place it in both a sidebar and a grid.
