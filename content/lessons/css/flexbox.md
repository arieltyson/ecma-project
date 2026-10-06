---
title: Flexbox
summary: Lay out items in one dimension with flex containers, alignment, wrapping and flexible sizing.
minutes: 25
objectives:
  - Create a flex container and control direction and wrapping.
  - Align items on the main and cross axes.
  - Control how items grow and shrink with flex.
  - Recognise when grid is a better fit.
quiz:
  - question: In a row flex container, which property aligns items vertically?
    options:
      - "`justify-content`"
      - "`align-items`"
      - "`text-align`"
    answer: 1
    explanation: justify-content works on the main axis (horizontal in a row); align-items on the cross axis.
  - question: "What does `flex: 1` on an item do?"
    options:
      - Sets its width to 1px.
      - Lets it grow to take an equal share of the remaining space, from a base size of zero.
      - Prevents it from shrinking.
    answer: 1
    explanation: flex is shorthand for flex-grow, flex-shrink and flex-basis. flex 1 means 1 1 0%.
  - question: A row of tags should wrap onto new lines on narrow screens. Which property?
    options:
      - "`flex-wrap: wrap`"
      - "`overflow: hidden`"
      - "`white-space: nowrap`"
    answer: 0
    explanation: By default flex items stay on one line and shrink. flex-wrap lets them wrap.
resources:
  - title: MDN, Flexbox
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox
  - title: Flexbox Froggy
    url: https://flexboxfroggy.com/
---

Flexbox lays out items along one axis, a row or a column, and distributes space between them. It is the tool for toolbars, nav bars, cards' internal layout and centring.

## Containers and axes

```css
.toolbar {
  display: flex;
  flex-direction: row;      /* main axis: horizontal */
  align-items: center;      /* cross axis: vertical */
  justify-content: space-between;
  gap: 0.75rem;
}
```

The **main axis** follows `flex-direction`; the **cross axis** is perpendicular.

| Property | Axis | Common values |
| --- | --- | --- |
| `justify-content` | main | `flex-start`, `center`, `space-between` |
| `align-items` | cross | `stretch` (default), `center`, `baseline` |
| `align-self` | cross, one item | same as align-items |
| `gap` | both | spacing between items |

## Sizing items

`flex: <grow> <shrink> <basis>` controls how items share space:

```css
.channel-row {
  display: flex;
  gap: 0.75rem;
}

.channel-row .avatar {
  flex: none;      /* fixed size: do not grow or shrink */
}

.channel-row .details {
  flex: 1;         /* take the remaining space */
  min-inline-size: 0; /* allow text inside to truncate */
}
```

`min-inline-size: 0` matters: flex items default to `min-width: auto`, so long text can overflow instead of shrinking.

## Wrapping

```css
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

## Centring

```css
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

(`display: grid; place-items: center;` does the same in one line.)

## Flexbox or grid?

Use **flexbox** when content sizes drive the layout along one axis. Use **grid** when you want a two-dimensional structure of rows and columns, or items aligned across rows.

## Assignment

1. Play all levels of [Flexbox Froggy](https://flexboxfroggy.com/).
2. Build Lumen's top navigation bar: logo on the left, search in the middle growing to fill space, and buttons on the right.
3. Build a channel row (avatar, name and stream title truncated with an ellipsis, viewer count) that works at 320px wide.
