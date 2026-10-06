---
title: "Project: Channel Landing Page"
summary: Build a channel's public landing page in semantic, accessible HTML with no CSS frameworks.
kind: project
minutes: 180
objectives:
  - A complete HTML page for a Lumen channel with correct landmarks and headings.
  - A schedule table, a list of recent videos and a newsletter form with native validation.
  - A page that passes keyboard, screen reader and automated accessibility checks.
resources:
  - title: W3C, HTML validator
    url: https://validator.w3.org/
  - title: axe DevTools browser extension
    url: https://www.deque.com/axe/devtools/
---

Every channel on Lumen has a public landing page for people who are not signed in. Build one for a channel of your choice in plain HTML. You will style it in the CSS course.

## Requirements

1. A valid document with `lang`, viewport meta, a descriptive `<title>` and a meta description.
2. A skip link, `header` with navigation, one `main`, and a `footer`.
3. One `h1` with the channel name; sections with `h2`s for About, Schedule, Recent videos and Newsletter. No skipped heading levels.
4. **About**: the channel avatar with meaningful alt text, a short bio and links to social profiles that say where they go.
5. **Schedule**: a `table` with a caption, column headers (`th scope="col"`) and `time` elements for each stream.
6. **Recent videos**: a list of at least four videos, each with a thumbnail (with `width`, `height` and alt text), title, duration and publish date.
7. **Newsletter**: a form with labelled email input (`type="email"`, `required`, `autocomplete="email"`), a frequency choice in a `fieldset` with radios, and a submit button.
8. No `div` used where a semantic element fits. No inline styles.
9. Passes the W3C validator with no errors, and axe with no violations.

## Break it on purpose

1. Replace the submit button with a `div` that has a click handler. Try to submit with the keyboard. Put the button back.
2. Remove the labels and use placeholders instead. Listen with a screen reader and describe what is announced.

## Explain it

- Why did you choose each landmark and heading level?
- How would a screen reader user find the schedule? How would a keyboard user submit the form?
- What did the validator or axe find that you did not?
