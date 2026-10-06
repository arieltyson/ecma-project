---
title: Same-Origin Policy, CORS, XSS and CSRF
summary: The browser's security model and the attacks a front end must defend against.
minutes: 35
objectives:
  - Define an origin and explain what the same-origin policy restricts.
  - Explain CORS, including preflight requests and credentials.
  - Prevent XSS in React and in plain DOM code, and describe Content Security Policy.
  - Explain CSRF and the role of SameSite cookies.
quiz:
  - question: Which pair is same-origin?
    options:
      - "`https://lumen.tv` and `http://lumen.tv`"
      - "`https://lumen.tv` and `https://lumen.tv:443/chat`"
      - "`https://lumen.tv` and `https://api.lumen.tv`"
    answer: 1
    explanation: An origin is scheme, host and port. 443 is the default HTTPS port, so the second pair matches. A different scheme or subdomain is a different origin.
  - question: What does CORS control?
    options:
      - Whether a cross-origin request can be sent at all.
      - Whether the page's JavaScript may read a cross-origin response.
      - Whether cookies are encrypted.
    answer: 1
    explanation: Simple cross-origin requests are still sent. CORS headers decide whether the browser hands the response to your code. That is why CORS is not a CSRF defence.
  - question: Which request triggers a CORS preflight?
    options:
      - A GET with no custom headers.
      - "A POST with `Content-Type: application/json`."
      - A navigation to another site.
    answer: 1
    explanation: JSON content type is not one of the "simple" types, so the browser first sends an OPTIONS request asking whether the real request is allowed.
  - question: Why is `dangerouslySetInnerHTML` dangerous?
    options:
      - It is slow.
      - It inserts HTML without escaping, so untrusted content can run script.
      - It breaks hydration.
    answer: 1
    explanation: React escapes text by default. Inserting raw HTML bypasses that; only use it with content you trust or have sanitised.
resources:
  - title: MDN, Same-origin policy
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
  - title: MDN, CORS
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
  - title: OWASP, Cross Site Scripting prevention
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
  - title: MDN, Content Security Policy
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
---

Browsers run code from millions of sites side by side. The security model that keeps them apart is built on the **origin**, and most front-end vulnerabilities come from misunderstanding where its protections stop.

## Origins

An origin is the **scheme**, **host** and **port** of a URL:

| URL | Same origin as `https://lumen.tv`? |
| --- | --- |
| `https://lumen.tv/directory` | yes |
| `http://lumen.tv` | no, different scheme |
| `https://api.lumen.tv` | no, different host |
| `https://lumen.tv:8443` | no, different port |

A **site** is broader: the scheme plus the registrable domain, so `api.lumen.tv` and `lumen.tv` are same-site but cross-origin. Cookies' `SameSite` uses sites; most other rules use origins.

## The same-origin policy

Script on one origin cannot read another origin's data: its DOM (in an iframe), its storage, or its responses. It **can** still embed images, scripts, styles and iframes from other origins, submit forms to them, and navigate to them. Those requests are sent; what the page cannot do is read the results.

## CORS

Cross-Origin Resource Sharing lets a server opt in to having its responses read by other origins:

```http
GET /api/streams HTTP/2
Origin: https://lumen.tv
```

```http
HTTP/2 200
Access-Control-Allow-Origin: https://lumen.tv
Vary: Origin
```

### Preflight

Requests that a plain HTML form could not have made (methods other than GET, HEAD and POST; custom headers such as `Authorization`; or `Content-Type: application/json`) first send a **preflight**:

```http
OPTIONS /api/follows HTTP/2
Origin: https://lumen.tv
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

The server must answer with matching `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`, or the real request is never sent.

### Credentials

With `fetch(url, { credentials: "include" })`, cookies are sent cross-origin, and the response is only readable if the server sends `Access-Control-Allow-Credentials: true` and a specific origin (not `*`).

When you see a CORS error in the console, the fix is on the server (or a proxy in development). The browser is doing its job.

## XSS

**Cross-site scripting** is when an attacker gets their script to run on your origin, for example by putting `<img src=x onerror=...>` in a chat message that your page renders as HTML. Script on your origin can read anything your users can.

React escapes text by default:

```tsx
function Message({ body }: { readonly body: string }) {
  return <p>{body}</p>; // "<img onerror=...>" is shown as text
}
```

The ways around that are where XSS comes back:

- `dangerouslySetInnerHTML` with untrusted content. Sanitise with a library such as DOMPurify, or render structured data instead of HTML.
- Untrusted URLs in `href` or `src`: a `javascript:` URL runs code when clicked. Allow only `https:` (and maybe `mailto:`).
- Direct DOM APIs: `element.innerHTML = userInput`, `insertAdjacentHTML`, `document.write`.

```ts
function safeUrl(input: string): string | undefined {
  try {
    const url = new URL(input);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
```

### Content Security Policy

A CSP header limits where scripts can come from, so even an injected tag cannot run:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
```

`frame-ancestors 'none'` also stops other sites framing yours (clickjacking).

## CSRF

**Cross-site request forgery** tricks a signed-in user's browser into sending a request to your site from another site, for example a hidden form that posts to `/api/follow`. The browser attaches cookies, so the request looks authentic, and CORS does not stop it (the attacker does not need to read the response).

Defences:

1. **`SameSite=Lax` or `Strict` session cookies**, so cross-site POSTs carry no session. This is the browser default.
2. **Reject unexpected cross-site requests** on the server using `Sec-Fetch-Site` or `Origin`.
3. **CSRF tokens** for older setups: a secret value the page includes in each request that another site cannot know.
4. Use proper methods: never change state on `GET`.

## Assignment

1. Read MDN's [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) and [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) guides.
2. In the console on any site, `fetch` another site's homepage and read the CORS error. Then fetch a public API that allows CORS and compare the response headers.
3. Find every `dangerouslySetInnerHTML` in a React project and decide whether its input is trusted. On this site there is one, in `Article.tsx`; explain why its input is trusted.
