---
title: "Project: Stream Directory Layout"
summary: Style a responsive, themeable stream directory and your channel landing page with a token-based design system and no frameworks.
kind: project
minutes: 300
objectives:
  - A token-based design system with light and dark themes that pass contrast checks.
  - A responsive directory grid of stream cards built with grid, flexbox and container queries.
  - Styled versions of your channel landing page and its form.
  - Layouts that work at 320px wide, at 400% zoom and with reduced motion.
resources:
  - title: WebAIM, contrast checker
    url: https://webaim.org/resources/contrastchecker/
  - title: MDN, CSS layout
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout
---

Give Lumen a look. In this project you write a small design system and use it to build the stream directory page and style the landing page from the HTML course, with plain CSS.

## Requirements

1. **Tokens**: a `tokens.css` file defining colours (with `light-dark()`), a 4-point spacing scale, radii, a type scale and motion durations as custom properties. No other file uses raw colours or lengths.
2. **Themes**: follows the system theme, with a manual override using a `data-theme` attribute. Every text colour passes 4.5:1 and every control border 3:1 in both themes; record the ratios in a table in your README.
3. **Layers**: styles organised with `@layer reset, base, components, utilities`.
4. **Directory page**: a header with navigation, a category filter bar that scrolls horizontally on small screens, and a grid of at least twelve stream cards using `repeat(auto-fill, minmax(...))`.
5. **Stream card**: a 16:9 thumbnail with a LIVE badge and viewer count overlaid, avatar, title truncated to two lines, channel name and tags. Uses `subgrid` so titles and metadata align across a row, and a container query to switch to a horizontal layout when wide.
6. **Landing page**: your HTML project styled with the same tokens, including a styled form with visible focus, `:user-invalid` states and error messages.
7. **Accessibility**: visible `:focus-visible` styles on every interactive element, no content lost at 320px or 400% zoom, and motion removed under `prefers-reduced-motion`.

## Break it on purpose

1. Give the thumbnails no aspect ratio, throttle the network, and watch the cards jump as images load. Restore it.
2. Set the base font size to 20px in your browser settings. Find anything that does not scale and fix it.

## Explain it

- How did you choose your spacing and type scales?
- Where did you use grid, where flexbox, and where a container query? Why?
- How would a component library share these tokens with a React app?
