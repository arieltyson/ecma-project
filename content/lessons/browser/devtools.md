---
title: DevTools in Depth
summary: Debug with breakpoints, investigate requests, profile performance and inspect React from the browser.
minutes: 40
objectives:
  - Pause code with line, conditional, DOM, event and fetch breakpoints, and use logpoints.
  - Read a request's waterfall timing and initiator chain in the Network panel.
  - Record and read a Performance profile.
  - Use the React DevTools Components and Profiler tabs.
quiz:
  - question: You need to find which code changes an element's class. Which breakpoint helps most?
    options:
      - A line breakpoint in your main file.
      - "A DOM breakpoint: Break on attribute modifications."
      - An exception breakpoint.
    answer: 1
    explanation: DOM breakpoints pause on the line that modifies the subtree, attributes or removes the node, wherever that code lives.
  - question: In the Network panel's timing breakdown, what does "Waiting for server response" measure?
    options:
      - The time to download the response body.
      - The time from sending the request to receiving the first byte of the response (TTFB).
      - The DNS lookup.
    answer: 1
    explanation: It covers server processing plus one network round trip. A large value points at the server, not the client.
  - question: What is a logpoint?
    options:
      - A breakpoint that logs an expression to the console instead of pausing.
      - A console.log statement committed to the code.
      - A network log export.
    answer: 0
    explanation: Logpoints let you add logging to running code, including third-party or production code, without editing files.
  - question: The React Profiler shows a component rendering on every keystroke in an unrelated input. What does that suggest?
    options:
      - The component's props or context change on every keystroke, or it is not memoised and its parent re-renders.
      - React is broken.
      - The component has too many children.
    answer: 0
    explanation: Turn on "Record why each component rendered" in the Profiler settings to see whether props, state, hooks or context triggered it.
resources:
  - title: Chrome DevTools, JavaScript debugging reference
    url: https://developer.chrome.com/docs/devtools/javascript/reference
  - title: Chrome DevTools, Network features reference
    url: https://developer.chrome.com/docs/devtools/network/reference
  - title: Chrome DevTools, Performance panel
    url: https://developer.chrome.com/docs/devtools/performance
  - title: React Developer Tools
    url: https://react.dev/learn/react-developer-tools
---

[A First Look at DevTools](/lessons/introduction/devtools-tour/) covered the panels. This lesson covers the techniques you use when something is actually wrong.

## Breakpoints

Open **Sources**, find a file (<kbd>⌘P</kbd>) and click a line number to pause there. While paused you can hover variables, inspect the **Scope** and **Call Stack** panes, and step over, into or out of functions.

| Breakpoint | Use it when |
| --- | --- |
| Line | You know where to look |
| Conditional (right-click a line number) | A line runs often and you care about one case, e.g. `login === "lumen"` |
| Logpoint | You want a log without pausing or editing code |
| DOM (Elements → right-click → Break on) | Something changes the DOM and you do not know what |
| Event listener (Sources sidebar) | You want to pause in whatever handles `click` or `keydown` |
| XHR/fetch (Sources sidebar) | You want to pause where a request to a URL containing some text is made |
| Pause on exceptions | An error is caught and swallowed somewhere |

You can also write `debugger;` in your own code. Source maps (which Vite generates in development) map the bundled code back to your TypeScript files, so breakpoints work in the files you wrote.

## Console techniques

```javascript
console.table(streams);          // arrays of objects as a table
copy(JSON.stringify(state));     // copy a value to the clipboard
$_;                              // the last evaluated result
getEventListeners($0);           // listeners on the selected element
monitorEvents(window, "resize"); // log events as they fire
```

**Live expressions** (the eye icon) re-evaluate an expression continuously, which is handy for `document.activeElement` while debugging focus.

## Network

Filter by type: **Doc** shows document requests, **Fetch/XHR** shows requests made by JavaScript. That split matters for single-page apps; see [Document Requests and Async Requests](/lessons/browser/document-vs-async-requests/).

For any request:

- **Headers** shows the method, status, request and response headers, including cookies sent and set.
- **Payload** shows the query string and request body (for example a GraphQL query and variables).
- **Initiator** shows the call stack that caused the request.
- **Timing** breaks the time down:

| Phase | Meaning |
| --- | --- |
| Queueing, stalled | Waiting for a connection slot or a higher-priority request |
| DNS lookup, initial connection, SSL | Connection setup, often zero for reused connections |
| Waiting for server response | Time to first byte |
| Content download | Receiving the body |

Other tools: **Throttling** simulates slow networks, right-click → **Block request URL** tests failure handling, right-click → **Copy as fetch** or **Copy as cURL** reproduces a request elsewhere, and **Overrides** let you replace a response with a local file.

## Performance

Click record, interact with the page, stop. The profile shows:

- A **Main** track flame chart: each bar is a function call, nested by call stack. Long tasks have a red corner.
- **Interactions**: each click or keypress and how long until the next paint.
- **Layout shifts** and frames.

Start from the slowest interaction or the longest task, then read the flame chart downward to find which of your functions took the time. Use **Bottom-Up** to see which functions took the most self time overall.

## Memory

A **heap snapshot** (Memory panel) lists every object. Search it for `Detached` to find DOM nodes removed from the page but still referenced from JavaScript, a common leak in apps that forget to remove listeners or clear caches.

## React DevTools

Install the browser extension. It adds two tabs:

- **Components**: the component tree with each component's props, state and hooks. Select a component and press the eye icon to find its DOM node; edit props and state live.
- **Profiler**: record an interaction and see which components rendered, how long each took and, with the setting turned on, **why** each one rendered.

Turn on **Highlight updates when components render** to see re-renders flash on screen.

## Assignment

1. Read the Chrome [JavaScript debugging reference](https://developer.chrome.com/docs/devtools/javascript/reference).
2. On this site, set an event listener breakpoint for `click`, click a quiz option, and step until you reach the quiz reducer.
3. Find this site's lesson chunk requests in the Network panel when you navigate between lessons, and read their initiators.
4. Install React DevTools, open the Components tab on this site and find the `Quiz` component's state while answering a question.
