---
title: The Box Model
summary: Content, padding, border and margin, box-sizing, display types, and logical properties.
minutes: 20
objectives:
  - Describe the parts of the box model.
  - Use box-sizing border-box and explain why.
  - Distinguish block, inline and inline-block layout.
  - Use logical properties for direction-independent spacing.
quiz:
  - question: "With `box-sizing: border-box`, what does `width: 200px` include?"
    options:
      - Only the content.
      - Content, padding and border.
      - Content, padding, border and margin.
    answer: 1
    explanation: border-box makes the declared size the visible size, which is why most resets apply it to everything.
  - question: Two stacked paragraphs have margin-bottom 24px and margin-top 16px. What is the gap?
    options:
      - 40px
      - 24px, because vertical margins collapse to the larger one.
      - 16px
    answer: 1
    explanation: Adjacent vertical margins of block elements collapse. Flex and grid children do not collapse, which is one reason gap is preferred.
  - question: What does `margin-inline-start` mean?
    options:
      - Always the left margin.
      - The margin at the start of the line direction, which is left in English and right in Arabic.
      - The top margin.
    answer: 1
    explanation: Logical properties follow the writing direction, so layouts work in right-to-left languages without overrides.
resources:
  - title: MDN, The box model
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model
  - title: MDN, Logical properties
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values
---

Every element is a rectangle: content, surrounded by padding, then a border, then margin. Layout is mostly about sizing and spacing those boxes.

## The parts

```text
┌──────────────── margin ────────────────┐
│ ┌────────────── border ──────────────┐ │
│ │ ┌──────────── padding ───────────┐ │ │
│ │ │            content             │ │ │
│ │ └────────────────────────────────┘ │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

- **Padding** is space inside the border, with the element's background.
- **Margin** is space outside, transparent.

## box-sizing

By default, `width` sets only the content width, so padding and border make the box larger than declared. Almost every project resets this:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## Display

| `display` | Behaviour |
| --- | --- |
| `block` | full width, starts on a new line (`div`, `p`, `h1`) |
| `inline` | flows with text; width, height and vertical margin ignored (`span`, `a`) |
| `inline-block` | flows with text but respects size |
| `flex`, `grid` | the element lays out its children (next lessons) |
| `none` | removed from layout and the accessibility tree |

## Margin collapse and gap

Vertical margins between block siblings collapse to the larger of the two. Inside flex and grid containers, prefer `gap` for spacing between children: it does not collapse and does not add space at the edges.

## Logical properties

Use `inline` (the text direction) and `block` (the stacking direction) instead of left, right, top and bottom:

```css
.card {
  padding-block: 1rem;        /* top and bottom */
  padding-inline: 1.5rem;     /* left and right in English */
  margin-block-end: 2rem;
  border-inline-start: 3px solid var(--accent);
  inline-size: 100%;          /* width */
}
```

They work automatically in right-to-left languages and vertical writing modes.

## Units

Use `rem` for font sizes and spacing so they scale with the user's font size setting, `%` and `fr` for proportions, `ch` for text measure (`max-inline-size: 65ch`), and `px` only for hairlines.

## Assignment

1. Read MDN's [The box model](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model).
2. In DevTools, select an element on any page and read the box model diagram in the Computed pane.
3. Rewrite the spacing in your landing page project with logical properties and `rem`.
