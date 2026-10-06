# Accessibility

[The ECMA Project](https://arieltyson.github.io/ecma-project/) aims to
meet WCAG 2.2 at level AA.

## Implemented

- Every page is prerendered to HTML, so lessons can be read without
  JavaScript.
- A skip link, landmarks and ordered headings support navigation.
  After a client-side navigation, focus moves to the new page's
  heading so screen readers announce it.
- Every control works with a keyboard and shows a visible focus ring.
  Search opens with `⌘K`, `Ctrl K` or `/`, follows the ARIA combobox
  pattern, and closes with Escape.
- Quiz feedback is announced through a polite live region and shown
  with text and an icon as well as colour.
- Checklists in lessons are labelled checkboxes.
- Text sizes use relative units and follow the browser font size.
  Controls meet the WCAG 2.2 minimum target size, and primary controls
  are at least 44 points tall.
- Appearance follows the system light or dark setting, with a manual
  override applied before first paint. Motion is removed when the
  system requests reduced motion.

## Verified automatically

[Token tests](../tests/tokens.test.ts) check every text and syntax
colour for a contrast ratio of at least 4.5:1, and control borders for
3:1, in both appearances. They also check that stylesheets use design
tokens rather than raw colours and lengths.

[Page tests](../tests/pages.test.ts) check every prerendered page for a
language, a title and description, one main landmark and one `h1`,
headings that do not skip levels, unique IDs, accessible names for
links, buttons and form controls, image alternative text, and a
content security policy. These checks run in CI before every deploy.

## Limitations and remaining checks

These checks do not establish full WCAG conformance. Manual assessment
is still needed with screen readers across browsers, at high zoom and
increased text spacing, in forced colours mode, and with touch input.

Search, quizzes, progress tracking and the appearance control require
JavaScript. Lesson content and navigation work without it.

## Report an accessibility problem

[Open an issue](https://github.com/arieltyson/ecma-project/issues/new)
with the page, what you tried, what happened, and what you expected.
Include your browser, operating system, assistive technology, and zoom
or text-size settings when relevant.
