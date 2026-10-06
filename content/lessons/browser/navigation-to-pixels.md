---
title: From Navigation to Pixels
summary: What the browser does between pressing Enter and showing a page, and which parts your HTML controls.
minutes: 30
objectives:
  - Trace a navigation through DNS, connection, request, response and parsing.
  - Explain render-blocking CSS and parser-blocking scripts.
  - Choose between classic, defer, async and module scripts.
  - Use DOMContentLoaded, load and resource hints correctly.
quiz:
  - question: Why does a plain `<script src>` in the head delay the page?
    options:
      - Scripts are downloaded after images.
      - The parser stops building the DOM until the script is downloaded and executed.
      - The browser cannot download two files at once.
    answer: 1
    explanation: A classic script may call `document.write` or read the DOM so far, so the parser must wait for it. `defer`, `async` and `type="module"` remove that wait.
  - question: How does `type="module"` load by default?
    options:
      - Like a classic blocking script.
      - Deferred, executed in order after parsing finishes.
      - Async, executed as soon as it downloads.
    answer: 1
    explanation: Module scripts behave like `defer` unless you add `async`.
  - question: Which event fires first?
    options:
      - "`load`"
      - "`DOMContentLoaded`"
    answer: 1
    explanation: DOMContentLoaded fires when the HTML is parsed and deferred scripts have run. `load` waits for images, stylesheets and other subresources too.
  - question: Why is CSS called render-blocking?
    options:
      - The browser will not paint until the stylesheets in the head are loaded, to avoid showing unstyled content.
      - CSS blocks JavaScript from downloading.
      - CSS files are always downloaded last.
    answer: 0
    explanation: Painting before styles arrive would show a flash of unstyled content, so the browser waits. Keep critical CSS small and avoid chains of `@import`.
resources:
  - title: web.dev, critical rendering path
    url: https://web.dev/articles/critical-rendering-path
  - title: MDN, the script element
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
  - title: How browsers work (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work
---

Typing a URL and pressing Enter starts a **navigation**. Understanding its steps tells you why some pages appear instantly and others stall, and which of those steps you control.

## The network part

1. **DNS lookup**: the hostname is resolved to an IP address, unless it is cached.
2. **Connection**: a TCP connection and a TLS handshake (for HTTPS), or a QUIC connection for HTTP/3. Each round trip costs latency, which is why connections are reused.
3. **Request**: the browser sends `GET /path` with headers describing what it wants: `Accept: text/html`, cookies for the site, and `Sec-Fetch-Mode: navigate`.
4. **Response**: the server replies with a status, headers and the HTML. The time until the first byte arrives is **TTFB**.

If the response is a redirect (`301`, `302`, `307`, `308`), the browser repeats the steps for the new URL and updates the address bar.

## Parsing

The browser does not wait for the whole HTML file. It **parses as bytes arrive**, building the DOM tree node by node. Meanwhile a **preload scanner** reads ahead and starts downloading stylesheets, scripts and images it finds, so they arrive sooner.

Two kinds of resources interrupt this:

- **Stylesheets block rendering.** The browser will not paint until the CSS in the `<head>` has loaded and been parsed into the CSSOM, so you never see unstyled content.
- **Classic scripts block parsing.** A `<script src>` without attributes stops the parser until the file is downloaded and run, because the script might change the document being parsed.

## Script loading

```html
<script src="classic.js"></script>               <!-- blocks parsing -->
<script src="analytics.js" async></script>      <!-- runs whenever it arrives -->
<script src="app.js" defer></script>            <!-- runs in order, after parsing -->
<script src="main.js" type="module"></script>   <!-- deferred by default -->
```

| Attribute | Blocks parser | Runs | Order kept |
| --- | --- | --- | --- |
| none | yes | immediately | yes |
| `async` | no | as soon as downloaded | no |
| `defer` | no | after parsing, before DOMContentLoaded | yes |
| `type="module"` | no | like `defer` | yes |

Modern apps built with Vite ship a single `<script type="module">`, which is why the HTML parses without waiting on JavaScript.

## Lifecycle events

```ts
document.addEventListener("DOMContentLoaded", () => {
  // The DOM is complete and deferred scripts have run.
});

window.addEventListener("load", () => {
  // Images, stylesheets and iframes have loaded too.
});
```

Module and deferred scripts already run after the DOM is parsed, so they rarely need `DOMContentLoaded`.

## Resource hints

You can tell the browser about work before it discovers it:

```html
<link rel="preconnect" href="https://api.lumen.tv" />
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="modulepreload" href="/assets/channel-page.js" />
<img src="/hero.avif" fetchpriority="high" alt="" />
```

- `preconnect` opens a connection early to an origin you will use soon.
- `preload` fetches a resource the preload scanner cannot see (fonts referenced from CSS, for example).
- `modulepreload` fetches and parses a JavaScript module ahead of time.
- `fetchpriority="high"` raises the priority of the image that will be the largest thing on screen.

Hints cost bandwidth. Use them for a handful of critical resources, not everything.

## What a single-page app changes

In a single-page app, this full sequence happens once, for the first document. After that, clicking a link does not navigate: JavaScript fetches data and updates the DOM. [Document Requests and Async Requests](/lessons/browser/document-vs-async-requests/) covers the difference in detail.

## Assignment

1. Read MDN's [How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work).
2. Open DevTools' Network panel on a news site, reload, and identify the document request, the render-blocking stylesheets and any `async` or `defer` scripts (the **Initiator** and **Priority** columns help; right-click the header row to add them).
3. Make a page with a classic script in the `<head>` that loops for two seconds. Observe the blank page, then add `defer` and compare.
