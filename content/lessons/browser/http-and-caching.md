---
title: HTTP and Caching
summary: Methods, status codes and headers, and how Cache-Control, ETags and hashed filenames make repeat visits fast.
minutes: 30
objectives:
  - Read a request and response, including method, status and key headers.
  - Choose correct status codes for common API outcomes.
  - Configure Cache-Control for HTML, hashed assets and API responses.
  - Explain revalidation with ETag and 304 Not Modified.
quiz:
  - question: "What does `Cache-Control: no-cache` mean?"
    options:
      - Never store the response.
      - Store it, but revalidate with the server before every use.
      - Cache it for one hour.
    answer: 1
    explanation: "`no-cache` allows storage but requires revalidation. `no-store` is the directive that forbids storing at all."
  - question: Why can `/assets/app-3f9a1c.js` be cached for a year with `immutable`?
    options:
      - JavaScript files never change.
      - The filename contains a content hash, so any change produces a new URL.
      - Browsers ignore max-age for scripts.
    answer: 1
    explanation: A new build references new filenames from the HTML. Old URLs keep their old content forever, so caching them indefinitely is safe.
  - question: A request includes `If-None-Match` with an ETag that still matches. What should the server send?
    options:
      - 200 with the full body.
      - 304 Not Modified with no body.
      - 404 Not Found.
    answer: 1
    explanation: The browser already has the content. A 304 tells it to use its cached copy, saving the transfer.
  - question: Which status code fits a request with a valid session but no permission for the resource?
    options:
      - "401 Unauthorized"
      - "403 Forbidden"
      - "400 Bad Request"
    answer: 1
    explanation: 401 means not authenticated (who are you?). 403 means authenticated but not allowed.
resources:
  - title: MDN, HTTP caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
  - title: MDN, HTTP response status codes
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
  - title: web.dev, HTTP cache
    url: https://web.dev/articles/http-cache
---

Every resource a page uses arrives over HTTP. You do not need to configure servers to be a front-end engineer, but you need to read requests fluently and know how caching shapes what users actually download.

## Requests and responses

```http
GET /api/channels/lumen HTTP/2
Host: lumen.tv
Accept: application/json
Cookie: session=abc123
If-None-Match: "v42"
```

```http
HTTP/2 200
Content-Type: application/json
Cache-Control: private, no-cache
ETag: "v43"

{"login":"lumen","followers":3}
```

### Methods

| Method | Meaning | Safe | Idempotent |
| --- | --- | --- | --- |
| `GET` | read | yes | yes |
| `POST` | create or perform an action | no | no |
| `PUT` | replace | no | yes |
| `PATCH` | partial update | no | no |
| `DELETE` | remove | no | yes |

*Safe* means no side effects; *idempotent* means repeating it has the same effect as doing it once. GraphQL usually sends queries and mutations as `POST`, though queries can use `GET` to allow caching.

### Status codes

| Code | Use |
| --- | --- |
| `200 OK`, `201 Created`, `204 No Content` | success |
| `301`, `308` | moved permanently |
| `302`, `303`, `307` | moved temporarily |
| `304 Not Modified` | your cached copy is current |
| `400 Bad Request` | malformed input |
| `401 Unauthorized` | not signed in |
| `403 Forbidden` | signed in, not allowed |
| `404 Not Found` | no such resource |
| `409 Conflict`, `422 Unprocessable Content` | valid request, invalid state or data |
| `429 Too Many Requests` | rate limited; check `Retry-After` |
| `500`, `502`, `503`, `504` | server or gateway failure |

> [!IMPORTANT]
> `fetch` only rejects on network failure. A `404` or `500` resolves normally with `response.ok === false`, so always check it.

## Caching

Browsers keep a cache of responses keyed by URL (and some headers). `Cache-Control` on the response decides what happens next time:

| Directive | Meaning |
| --- | --- |
| `max-age=N` | fresh for N seconds; use without asking the server |
| `no-cache` | store, but revalidate before each use |
| `no-store` | do not store at all |
| `private` / `public` | only the browser may cache / shared caches (CDNs) may too |
| `immutable` | will never change; do not revalidate even on reload |
| `stale-while-revalidate=N` | serve stale for N seconds while fetching a fresh copy in the background |

### Revalidation

When a cached response is stale (or marked `no-cache`), the browser asks the server whether it changed, sending the validator it got last time:

- `ETag: "v43"` comes back as `If-None-Match: "v43"`.
- `Last-Modified: <date>` comes back as `If-Modified-Since: <date>`.

If nothing changed, the server answers `304 Not Modified` with no body, and the browser uses its copy.

### The standard setup for single-page apps

Bundlers name built files after a hash of their content: `app-3f9a1c.js`. That enables a simple, robust policy:

| Resource | `Cache-Control` | Why |
| --- | --- | --- |
| `index.html` | `no-cache` | always check for a new build, which references new filenames |
| `/assets/*-[hash].js`, `.css` | `public, max-age=31536000, immutable` | the URL changes when the content does |
| Personalised API responses | `private, no-cache` or `no-store` | never shared, always fresh |

A user who loads a new `index.html` gets new asset URLs immediately; everything unchanged comes straight from cache.

## Seeing it in DevTools

In the Network panel, the **Size** column shows `(memory cache)` or `(disk cache)` for responses served locally, and a small size for `304` revalidations. Turning on **Disable cache** bypasses all of it while DevTools is open.

## Assignment

1. Read MDN's [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) guide.
2. Open this site, reload twice, and identify which responses come from the cache and which are revalidated. Look up the `Cache-Control` headers GitHub Pages sends for the HTML and for `/assets/` files.
3. For each of these, write the status code you would return: a login with a wrong password, a request to edit someone else's clip, creating a clip, deleting a clip that is already gone, and a GraphQL request whose query has a syntax error.
