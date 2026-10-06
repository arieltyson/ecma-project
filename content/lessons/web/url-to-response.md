---
title: From URL to Response
summary: What a URL is made of, how DNS finds a server, and what an HTTP request and response contain.
minutes: 20
objectives:
  - Name the parts of a URL.
  - Describe what DNS does and why it is cached.
  - Read a basic HTTP request and response.
  - Explain the difference between HTTP and HTTPS.
quiz:
  - question: "In `https://lumen.tv:443/channels/lumen?tab=videos#latest`, which part is never sent to the server?"
    options:
      - The query string `?tab=videos`.
      - The fragment `#latest`.
      - The path `/channels/lumen`.
    answer: 1
    explanation: The fragment stays in the browser. It identifies a place in the page and is often used for in-page links.
  - question: What does DNS do?
    options:
      - Encrypts traffic.
      - Translates a hostname such as lumen.tv into an IP address.
      - Stores cookies.
    answer: 1
    explanation: Computers connect by IP address. DNS answers are cached by the browser, the operating system and resolvers to avoid repeating the lookup.
  - question: What does HTTPS add to HTTP?
    options:
      - Faster downloads.
      - Encryption and verification of the server's identity using TLS.
      - Compression only.
    answer: 1
    explanation: TLS stops others on the network from reading or changing traffic, and the certificate proves you reached the real site.
resources:
  - title: MDN, What is a URL?
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL
  - title: MDN, How the web works
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works
  - title: MDN, An overview of HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview
---

Everything on the web starts with a URL and an HTTP request. This lesson covers the basics; [From Navigation to Pixels](/lessons/browser/navigation-to-pixels/) and [HTTP and Caching](/lessons/browser/http-and-caching/) go deeper later.

## Anatomy of a URL

```text
https://lumen.tv:443/channels/lumen?tab=videos&sort=recent#latest
└─┬─┘   └───┬──┘└┬┘└──────┬──────┘└──────────┬──────────┘└──┬─┘
scheme     host port     path              query          fragment
```

- **Scheme**: the protocol, almost always `https`.
- **Host**: the domain name. Together with scheme and port it forms the **origin**.
- **Port**: usually omitted (`443` for HTTPS, `80` for HTTP).
- **Path**: which resource on the server.
- **Query**: key and value parameters, readable in JavaScript with `URLSearchParams`.
- **Fragment**: a position within the page; never sent to the server.

```ts
const url = new URL("https://lumen.tv/channels/lumen?tab=videos#latest");
url.pathname;                  // "/channels/lumen"
url.searchParams.get("tab");   // "videos"
url.hash;                      // "#latest"
```

## DNS

Computers connect using IP addresses. The **Domain Name System** turns `lumen.tv` into an address like `203.0.113.7`. The answer is cached at several levels, so repeat visits skip the lookup.

## HTTP

The browser sends a **request**; the server returns a **response**:

```http
GET /channels/lumen HTTP/2
Host: lumen.tv
Accept: text/html
```

```http
HTTP/2 200
Content-Type: text/html; charset=utf-8

<!doctype html>...
```

A request has a **method** (`GET` to read, `POST` to send data), a path, and **headers**. A response has a **status code** (`200` OK, `404` Not Found, `500` server error), headers, and a **body**.

## HTTPS

HTTPS is HTTP over **TLS**. It encrypts traffic so nobody between you and the server can read or change it, and the server's certificate proves you reached the real site. Browsers restrict many features (service workers, geolocation, secure cookies) to HTTPS.

## Assignment

1. Read MDN's [How the web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works).
2. Open DevTools' Network panel, load any site, click the first request, and identify its method, status code, and three response headers.
3. In the console, parse a long URL from a site you use with `new URL()` and list its query parameters.
