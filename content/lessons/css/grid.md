---
title: CSS Grid
summary: Build two-dimensional layouts with grid tracks, fr units, auto-fill, named areas and subgrid.
minutes: 30
objectives:
  - Define grid columns and rows with fr, minmax and repeat.
  - Build responsive card grids with auto-fill and minmax without media queries.
  - Place items with lines and named areas.
  - Align nested content across cards with subgrid.
quiz:
  - question: What does `repeat(auto-fill, minmax(16rem, 1fr))` create?
    options:
      - Exactly 16 columns.
      - As many columns of at least 16rem as fit, sharing leftover space equally.
      - One column 16rem wide.
    answer: 1
    explanation: The grid adds or removes columns as the container resizes, which makes card grids responsive without breakpoints.
  - question: What is an fr unit?
    options:
      - A fixed pixel size.
      - A fraction of the free space in the grid container.
      - A font-relative unit.
    answer: 1
    explanation: "`1fr 2fr` splits the free space into thirds, giving the second column two of them."
  - question: What does subgrid let card children do?
    options:
      - Load faster.
      - Use the parent grid's tracks, so titles and footers line up across cards in a row.
      - Become flex containers.
    answer: 1
    explanation: With grid-template-rows set to subgrid, each card's rows are shared with its neighbours.
resources:
  - title: MDN, Grids
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids
  - title: CSS Grid Garden
    url: https://cssgridgarden.com/
---

Grid lays out items in rows **and** columns at once. It is the tool for page layouts and for grids of cards, like Lumen's stream directory.

## Tracks

```css
.page {
  display: grid;
  grid-template-columns: 15rem 1fr;        /* sidebar and content */
  grid-template-rows: auto 1fr auto;       /* header, main, footer */
  min-block-size: 100svh;
  gap: 1rem;
}
```

- `fr` shares free space: `1fr 2fr` gives thirds.
- `minmax(min, max)` bounds a track.
- `repeat(3, 1fr)` repeats a pattern.
- `auto` sizes to content.

## Responsive card grids

```css
.directory {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: 1.5rem 1rem;
}
```

This creates as many columns of at least 16rem as fit, and stretches them to fill the row. No media queries. The `min(16rem, 100%)` stops cards overflowing containers narrower than 16rem.

## Placement and areas

```css
.channel-page {
  display: grid;
  grid-template-columns: 1fr 22rem;
  grid-template-areas:
    "player chat"
    "info   chat";
}

.player { grid-area: player; }
.info   { grid-area: info; }
.chat   { grid-area: chat; }

@media (width < 60rem) {
  .channel-page {
    grid-template-columns: 1fr;
    grid-template-areas: "player" "chat" "info";
  }
}
```

Named areas make layouts readable and easy to rearrange. Changing visual order does not change DOM order, so keep the DOM in a sensible reading order for keyboard and screen reader users.

## Subgrid

Cards in a row often have titles of different lengths, which misaligns their footers. `subgrid` lets each card use rows from the parent:

```css
.directory {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}

.stream-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* thumbnail, title, meta share rows across the row of cards */
}
```

## Assignment

1. Play all levels of [CSS Grid Garden](https://cssgridgarden.com/).
2. Build the channel page layout above with named areas, switching to one column on narrow screens.
3. Build a stream card grid with `auto-fill` and use `subgrid` so every card's metadata lines up.
