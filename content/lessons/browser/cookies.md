---
title: Cookies
summary: How cookies are set and sent, what every attribute does, and how SameSite, HttpOnly and third-party rules affect a web client.
minutes: 35
objectives:
  - Read and write Set-Cookie headers with every common attribute.
  - Predict which requests carry a cookie, given Domain, Path, Secure and SameSite.
  - Explain why session cookies should be HttpOnly and how that affects front-end code.
  - Describe first-party versus third-party cookies and partitioning.
quiz:
  - question: A session cookie is set with `HttpOnly`. What can front-end JavaScript do with it?
    options:
      - Read it with document.cookie.
      - Nothing directly, but the browser still sends it with matching requests.
      - Read it only over HTTPS.
    answer: 1
    explanation: HttpOnly hides the cookie from scripts so an XSS attack cannot steal it. Requests still carry it automatically.
  - question: A user on another site clicks a link to your site. Which of your cookies are sent with that navigation?
    options:
      - Only SameSite=None cookies.
      - SameSite=Lax and SameSite=None cookies, but not SameSite=Strict.
      - All cookies.
    answer: 1
    explanation: Lax cookies are sent on top-level GET navigations from other sites. Strict cookies are only sent when the request starts on your own site.
  - question: What does omitting the Domain attribute do?
    options:
      - The cookie is sent to every subdomain.
      - The cookie is host-only, sent to exactly the host that set it.
      - The cookie is rejected.
    answer: 1
    explanation: Setting `Domain=lumen.tv` widens a cookie to all subdomains. Leaving it out is the safer default.
  - question: Which is required for `SameSite=None`?
    options:
      - "`HttpOnly`"
      - "`Secure`"
      - "`Path=/`"
    answer: 1
    explanation: Browsers reject `SameSite=None` cookies that are not also `Secure`.
  - question: "What does the `__Host-` name prefix guarantee?"
    options:
      - The cookie was set over HTTPS with Secure, has Path=/ and no Domain, so it is locked to one host.
      - The cookie is HttpOnly.
      - The cookie expires when the browser closes.
    answer: 0
    explanation: Browsers refuse to set a `__Host-` cookie unless those rules hold, which prevents subdomains from overwriting it.
resources:
  - title: MDN, Using HTTP cookies
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
  - title: MDN, Set-Cookie
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
  - title: web.dev, SameSite cookies explained
    url: https://web.dev/articles/samesite-cookies-explained
---

A cookie is a small name and value the server asks the browser to store and send back with later requests. Cookies are how most sites keep you signed in. Front-end engineers rarely set them, but constantly debug what is and is not being sent.

## Setting and sending

A server sets a cookie with a response header:

```http
HTTP/2 200
Set-Cookie: session=7f3a9c; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=1209600
```

The browser stores it, and from then on adds it to matching requests:

```http
GET /api/me HTTP/2
Cookie: session=7f3a9c; theme=dark
```

The browser decides what "matching" means from the cookie's attributes.

## Attributes

| Attribute | Effect |
| --- | --- |
| `Max-Age=N` / `Expires=<date>` | lifetime; without either, a **session cookie** that ends when the browser session ends. `Max-Age` wins if both are set |
| `Domain=lumen.tv` | send to this domain **and its subdomains**. Omit it for a host-only cookie |
| `Path=/api` | send only for URLs under this path |
| `Secure` | send only over HTTPS |
| `HttpOnly` | hide from JavaScript (`document.cookie`) |
| `SameSite=Strict \| Lax \| None` | control sending on cross-site requests (below) |
| `Partitioned` | store separately per top-level site when embedded (below) |

To delete a cookie, the server sets it again with the same name, domain and path and `Max-Age=0`.

## SameSite

A request is **cross-site** when the page that started it is on a different site (roughly, a different registrable domain such as `lumen.tv` versus `example.com`) from the cookie's site.

| Value | Sent on same-site requests | Sent on cross-site top-level `GET` navigations | Sent on other cross-site requests (fetch, iframes, images, POST forms) |
| --- | --- | --- | --- |
| `Strict` | yes | no | no |
| `Lax` | yes | yes | no |
| `None` (requires `Secure`) | yes | yes | yes |

Browsers treat cookies without a `SameSite` attribute as `Lax`. `Lax` is a strong default against **cross-site request forgery** (CSRF): another site cannot make a signed-in `POST` to your API with your user's cookie. `Strict` is safer still but means a user arriving from a link elsewhere looks signed out on their first request.

## HttpOnly and the front end

Session cookies should be `HttpOnly`, so that if an attacker manages to run script on your page (XSS), they cannot read the session. This shapes front-end code:

- The app cannot read the session token, and does not need to: `fetch` to your own origin sends it automatically.
- To know whether the user is signed in, call an endpoint such as `/api/me` (or a GraphQL `viewer` query) rather than inspecting cookies.
- For cross-origin APIs, `fetch(url, { credentials: "include" })` sends cookies, and the server must reply with `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin`.

```ts
async function currentUser(): Promise<{ login: string } | null> {
  const response = await fetch("/api/me", { credentials: "same-origin" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  return typeof data === "object" && data !== null && "login" in data && typeof data.login === "string"
    ? { login: data.login }
    : null;
}
```

## Reading cookies from JavaScript

Non-`HttpOnly` cookies are visible through `document.cookie`, a single string of `name=value` pairs:

```ts
function readCookie(name: string): string | undefined {
  for (const pair of document.cookie.split("; ")) {
    const [key, ...rest] = pair.split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

document.cookie = `theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
```

Assigning to `document.cookie` sets **one** cookie; it does not replace the others. For preferences that the server never needs, `localStorage` is simpler (see [Storage](/lessons/browser/storage/)). Cookies are sent with every matching request, so they add bytes to all of them.

## Prefixes

Names starting with `__Host-` or `__Secure-` carry guarantees the browser enforces:

- `__Secure-` requires `Secure`.
- `__Host-` requires `Secure`, `Path=/` and **no** `Domain`, so the cookie is locked to one host and a subdomain cannot overwrite it. It is the best choice for session cookies.

## Third-party cookies and partitioning

A cookie is **third-party** when it belongs to a site other than the one in the address bar: an embedded video player, chat widget or ad. Browsers restrict these for privacy: Safari and Firefox block or partition them by default, and Chrome lets users block them.

The `Partitioned` attribute (CHIPS) opts a third-party cookie into **partitioned storage**: the embed gets a separate cookie jar for each top-level site it appears on, so it can keep state (such as a chat embed's session on one site) without tracking users across sites. An embeddable player or chat must be designed for this, for example by signing users in inside a popup or using the Storage Access API.

## Debugging

DevTools → **Application** → **Cookies** lists every cookie with its attributes. In the **Network** panel, a request's **Cookies** tab shows which cookies were sent and, for blocked ones, why (for example "SameSite=Lax on a cross-site request").

## Assignment

1. Read MDN's [Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) and web.dev's [SameSite cookies explained](https://web.dev/articles/samesite-cookies-explained).
2. Sign in to any site you use and find its session cookie in the Application panel. Note its `HttpOnly`, `Secure`, `SameSite`, `Domain` and expiry, and explain each choice.
3. For each scenario, say whether a `SameSite=Lax` session cookie is sent: clicking a link from a search result, a `fetch` from another site with `credentials: "include"`, an image on another site pointing at your API, and a `POST` form on another site submitting to your API.
