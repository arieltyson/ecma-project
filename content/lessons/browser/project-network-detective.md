---
title: "Project: Network Detective"
summary: Investigate a real site with DevTools and write up how it loads, what it requests, how it caches and where its cookies go.
kind: project
minutes: 150
objectives:
  - A written report on how a production single-page app loads and fetches data.
  - Evidence from the Network, Application and Performance panels for every claim.
  - An explanation of the site's document requests, async requests, caching and cookies.
resources:
  - title: Chrome DevTools, Network features reference
    url: https://developer.chrome.com/docs/devtools/network/reference
  - title: Chrome DevTools, view and change cookies
    url: https://developer.chrome.com/docs/devtools/application/cookies
---

Reading other people's production traffic is one of the fastest ways to learn how real web clients work. In this project you pick a large single-page app (a streaming site, a social network or a web mail client) and document how it works using only DevTools.

## Requirements

Write a report (a Markdown file in your `ecma` folder is fine) with a section for each item below. Include a screenshot or copied header for every claim.

1. **First load**: the document request's status, size, `Cache-Control` and TTFB. Which requests block rendering? What is the LCP element (from the Performance panel)?
2. **Scripts**: how many JavaScript files load on the first page, their total transferred size, and whether they use hashed filenames and long cache lifetimes.
3. **Navigation**: click to another page in the app. Is it a document request or async requests? List the async requests it makes, their method, and whether they look like REST or GraphQL. For GraphQL, record an operation name and the variables sent.
4. **Fetch metadata**: compare `Sec-Fetch-Mode`, `Sec-Fetch-Dest` and `Sec-Fetch-Site` between the document request and one async request.
5. **Cookies**: list the cookies set for the site. For the one that appears to hold the session, record its `HttpOnly`, `Secure`, `SameSite`, `Domain` and lifetime, and explain what each choice protects against. Identify any third-party cookies.
6. **Storage**: what the site keeps in `localStorage`, `sessionStorage` and IndexedDB.
7. **Caching**: reload the page and identify which responses come from the memory or disk cache and which are revalidated with `304`.
8. **Real time**: does the site use WebSockets or Server-Sent Events (Network → **WS** filter, or `EventStream`)? Describe what flows over the connection.
9. **One problem**: find one performance or accessibility issue (a long task, a layout shift, a missing label) and suggest a fix.

## Break it on purpose

1. Throttle the network to **Slow 4G** and reload. Describe what the user sees and when.
2. Use **Block request URL** on the site's main data endpoint and describe how the app handles the failure.

## Explain it

- Explain the difference between this site's document requests and async requests to someone who has never opened DevTools.
- If you were on the team, which one change would most improve first load, and how would you measure it?
- What would break if the session cookie were not `HttpOnly`? If it were `SameSite=None`?
