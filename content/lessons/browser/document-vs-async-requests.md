---
title: Document Requests and Async Requests
summary: The difference between requests that load a page and requests made by JavaScript, and what that means for single-page apps.
minutes: 35
objectives:
  - Distinguish navigations, form submissions and subresource loads from fetch requests.
  - Predict how the browser treats the response of each kind of request.
  - Explain how cookies, redirects, CORS and errors differ between them.
  - Design server responses and front-end handling that work for both.
quiz:
  - question: A user submits an HTML form with method POST and no JavaScript. What kind of request is it?
    options:
      - An async request.
      - A document request; the response replaces the current page.
      - A preflight request.
    answer: 1
    explanation: A native form submission is a navigation. The browser loads whatever comes back as the new document, and the back button returns to the previous page.
  - question: A fetch request gets a 302 redirect to another page on the same site. What happens?
    options:
      - The browser navigates to the new page.
      - fetch follows the redirect and resolves with the final response; the page does not change.
      - fetch rejects.
    answer: 1
    explanation: Redirects of async requests are followed transparently. `response.redirected` and `response.url` tell you it happened. The address bar never changes.
  - question: Why should an API endpoint used by fetch return 401 rather than redirecting to the login page when a session expires?
    options:
      - Redirects are slower.
      - The fetch would follow the redirect and receive the login page's HTML, which the app then fails to parse as JSON.
      - Browsers block redirects on fetch.
    answer: 1
    explanation: Document requests can be redirected to a login page sensibly. Async requests need a status the code can recognise and handle, for example by showing a sign-in prompt.
  - question: Which header lets a server tell a navigation apart from a fetch request?
    options:
      - "`Sec-Fetch-Mode`, which is `navigate` for navigations and `cors`, `no-cors` or `same-origin` for others."
      - "`Content-Length`"
      - "`Cache-Control`"
    answer: 0
    explanation: Fetch metadata headers (`Sec-Fetch-Mode`, `Sec-Fetch-Dest`, `Sec-Fetch-Site`, `Sec-Fetch-User`) are set by the browser and cannot be forged by page scripts.
  - question: A user deep-links to `/channels/lumen` in a single-page app hosted on a static server that only has `index.html`. What goes wrong without configuration?
    options:
      - Nothing; the router handles it.
      - The server returns 404 for the document request, because no file exists at that path, before any JavaScript runs.
      - The browser refuses to load the page.
    answer: 1
    explanation: Client-side routing only works once the app has loaded. The document request must be answered with the app's HTML, by a server fallback rule or by prerendering a file for every route, as this site does.
resources:
  - title: MDN, Fetch API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - title: web.dev, fetch metadata request headers
    url: https://web.dev/articles/fetch-metadata
  - title: MDN, Sec-Fetch-Mode
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode
---

The browser makes two fundamentally different kinds of request. A **document request** loads a page: the browser itself decides what to do with the response, which usually means throwing away the current page. An **async request** is made by your JavaScript: the response is handed to your code, and the page stays exactly where it is.

Single-page apps rely on both, and many bugs come from treating one like the other.

## Document requests

These are **navigations**: the browser is loading a new document into a window or frame.

- typing a URL, clicking a normal `<a href>`, `location.href = "..."`
- submitting a `<form>` without JavaScript intercepting it
- reloading, and back and forward when the page is not restored from cache
- loading an `<iframe>`

What the browser does:

- Sends `Accept: text/html,...`, `Sec-Fetch-Mode: navigate`, `Sec-Fetch-Dest: document` (or `iframe`), and `Sec-Fetch-User: ?1` if the user caused it.
- Sends the site's cookies, subject to `SameSite` (top-level `GET` navigations from other sites include `Lax` cookies).
- Follows redirects and **updates the address bar** to the final URL.
- **Replaces the page** with the response: it parses the HTML, or downloads the file, or shows the browser's error page. The previous page's JavaScript state is gone.
- Adds a history entry (except for reloads and replacements).
- Is not subject to CORS: you can navigate to any origin.

## Async requests

These are made by script with `fetch` (or the older `XMLHttpRequest`). The response goes to your code:

```ts
async function follow(channelId: string, signal: AbortSignal): Promise<void> {
  const response = await fetch(`/api/follows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channelId }),
    signal,
  });
  if (response.status === 401) throw new Error("Signed out");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
```

What the browser does:

- Sends `Sec-Fetch-Mode: cors` (or `same-origin`, `no-cors`) and `Sec-Fetch-Dest: empty`.
- Sends cookies according to `credentials`: the default `"same-origin"` sends them only to your own origin; `"include"` sends them cross-origin too (if CORS allows).
- **Follows redirects silently.** The promise resolves with the final response; `response.redirected` is `true`. Nothing changes on screen or in the address bar.
- **Never changes the page or history** by itself.
- **Enforces CORS** for cross-origin requests: your code can only read the response if the server allows your origin. See [Security](/lessons/browser/security/).
- Resolves for any HTTP status, including `404` and `500`. It only rejects for network errors, CORS failures and aborts.

## Side by side

| | Document request | Async request |
| --- | --- | --- |
| Started by | the browser (links, forms, URL bar) | your code (`fetch`) |
| Response goes to | the window, replacing the page | your code |
| Redirects | followed; address bar updates | followed silently |
| History | new entry | unchanged |
| Errors | browser error page, or your HTML error page | your code must check `response.ok` |
| CORS | not applied | applied to cross-origin requests |
| `Sec-Fetch-Mode` | `navigate` | `cors`, `same-origin` or `no-cors` |
| Typical response | HTML | JSON, GraphQL |

## In a single-page app

A single-page app makes **one** document request, then turns would-be navigations into async requests:

1. The first visit is a document request for `index.html` (or a prerendered page). The app's JavaScript loads.
2. Clicking an in-app link is intercepted: the router calls `preventDefault()`, updates the URL with the History API, and fetches only the data the next view needs.
3. Forms are usually intercepted the same way and submitted with `fetch` (or React 19 form actions).

Consequences you must design for:

- **Deep links and reloads are document requests.** The server must answer every app URL with the app's HTML. Static hosts need a fallback rule, or a prerendered file per route. This site prerenders every page, so `/lessons/browser/cookies/` is a real file.
- **Expired sessions.** For document requests, redirecting to `/login` is fine. For async requests, a redirect would hand your JSON parser a login page. APIs should return `401`, and the app should handle it.
- **Errors look different.** A failed navigation shows the browser's error page. A failed fetch shows whatever your code renders, so every data request needs loading, error and empty states.
- **Downloads and external links** should stay as real navigations: do not intercept `<a download>`, `target="_blank"`, links to other origins, or clicks with modifier keys (which open new tabs).

The server can tell the two apart from the fetch metadata headers, which pages cannot forge. That lets one route return HTML to a navigation and JSON to a fetch, or reject unexpected cross-site requests.

## Seeing it

In DevTools' Network panel, the **Doc** filter shows document requests and **Fetch/XHR** shows async ones. Click a request and compare its `Sec-Fetch-*` headers. Turn on **Preserve log** to keep requests across real navigations.

## Assignment

1. Read web.dev's [fetch metadata](https://web.dev/articles/fetch-metadata) article.
2. On this site, open the Network panel, load a lesson directly (a document request), then click to the next lesson (an async request for its chunk). Compare their `Sec-Fetch-Mode`, `Sec-Fetch-Dest` and `Accept` headers.
3. Write a fetch wrapper `requestJson<T>(url, parse, init)` that throws a typed `SignedOutError` for `401`, an `HttpError` with the status for other failures, and returns the parsed body otherwise.
4. In one paragraph, explain what happens when a signed-out user submits a native HTML form to an endpoint that redirects to `/login`, and what happens when the same endpoint is called with `fetch`.
