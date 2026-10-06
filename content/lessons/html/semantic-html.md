---
title: Semantic HTML
summary: Structure documents with elements that describe their meaning, so browsers, assistive technology and search engines understand them.
minutes: 25
objectives:
  - Write a valid HTML document skeleton.
  - Use landmarks, headings and lists to structure content.
  - Choose between links and buttons correctly.
  - Write useful alt text for images.
quiz:
  - question: Which element should a "Follow" control that changes state on the page use?
    options:
      - "`<a href=\"#\">`"
      - "`<button type=\"button\">`"
      - "`<div onclick>`"
    answer: 1
    explanation: Buttons perform actions; links navigate. A button is focusable and works with Enter and Space automatically.
  - question: Why should headings never skip levels, such as h2 to h4?
    options:
      - Browsers reject the page.
      - Screen reader users navigate by heading level, and a skipped level suggests missing content.
      - h4 is deprecated.
    answer: 1
    explanation: Headings form an outline. Choose levels for structure and style them with CSS.
  - question: What alt text suits a decorative divider image?
    options:
      - "`alt=\"divider\"`"
      - "`alt=\"\"`, so screen readers skip it."
      - No alt attribute.
    answer: 1
    explanation: An empty alt marks an image as decorative. A missing alt makes screen readers read the file name.
resources:
  - title: MDN, HTML elements reference
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements
  - title: MDN, Structuring documents
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents
---

HTML describes what content **is**: a heading, a list, a navigation menu, a button. Browsers give each element default behaviour, screen readers announce it, and search engines index it. Choosing the right element is most of accessibility, and it costs nothing.

## The document

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lumen · Live streams</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    ...
  </body>
</html>
```

- `lang` tells screen readers which language to pronounce.
- The viewport meta tag makes the page render at device width on phones.
- `<title>` appears in tabs, history and search results.

## Landmarks

```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header>
    <nav aria-label="Primary">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/directory">Browse</a></li>
      </ul>
    </nav>
  </header>
  <main id="main">
    <h1>Live channels</h1>
    <section aria-labelledby="following">
      <h2 id="following">Following</h2>
      <ul>...</ul>
    </section>
  </main>
  <footer>...</footer>
</body>
```

`header`, `nav`, `main`, `aside` and `footer` are **landmarks**: screen reader users jump between them. Use one `main` per page. `article` is a self-contained item (a post, a card); `section` groups related content under a heading.

## Headings

Use one `h1` for the page, then `h2` for sections, `h3` within them, without skipping levels. Choose the level for structure, not size; CSS controls size.

## Links and buttons

| Use | Element |
| --- | --- |
| Go somewhere (another page, a section) | `<a href="...">` |
| Do something (submit, toggle, open) | `<button type="button">` |

Never use `<a href="#">` for actions or `<div onclick>` for buttons. Native elements are focusable, keyboard operable and announced correctly.

## Images

```html
<img src="/lumen-avatar.webp" alt="Lumen's avatar: a purple fox" width="64" height="64" />
<img src="/divider.svg" alt="" />
```

Alt text describes the image's purpose in context. Decorative images get `alt=""`. Always set `width` and `height` to reserve space.

## Lists, tables and more

Use `ul`/`ol` for lists (navigation menus are lists of links), `table` only for tabular data with `th` headers, `time` for dates (`<time datetime="2026-10-06T19:00Z">7 pm</time>`), and `strong`/`em` for importance and emphasis.

## Assignment

1. Read MDN's [Structuring documents](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents).
2. Mark up a channel page (header, navigation, main content with the stream title and description, a list of recent videos, a footer) using only HTML.
3. Open the page with the browser's accessibility tree view (DevTools → Elements → Accessibility) and check every landmark and heading appears.
