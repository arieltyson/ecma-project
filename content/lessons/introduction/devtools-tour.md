---
title: A First Look at DevTools
summary: Open the browser's developer tools and find your way around the panels you will use every day.
minutes: 20
objectives:
  - Open DevTools and dock it where it suits you.
  - Inspect and live-edit an element and its styles.
  - Run JavaScript against the current page from the Console.
  - Read the list of requests a page makes in the Network panel.
quiz:
  - question: You change a colour in the Elements panel's Styles pane. What happens when you reload?
    options:
      - The change is saved to the site's CSS file.
      - The change is lost, because DevTools edits the page in memory.
      - The change is kept until you close the tab.
    answer: 1
    explanation: Edits in Elements and Styles change the live document only. Reloading fetches the original files again.
  - question: In the Console, what does `$0` refer to?
    options:
      - The first element on the page.
      - The element currently selected in the Elements panel.
      - The last value printed to the Console.
    answer: 1
    explanation: "`$0` is the selected element, `$1` the one before it. It is a quick way to move from inspecting an element to scripting it."
  - question: Why should "Disable cache" usually be on while developing?
    options:
      - It makes the browser load pages from the network every time, so you always see your latest files.
      - It stops the site from setting cookies.
      - It turns off JavaScript.
    answer: 0
    explanation: Without it, the browser may serve a cached copy of a file you just changed. The setting only applies while DevTools is open.
resources:
  - title: Chrome DevTools overview
    url: https://developer.chrome.com/docs/devtools/overview
  - title: Firefox DevTools user docs
    url: https://firefox-source-docs.mozilla.org/devtools-user/
---

DevTools is a set of panels built into every browser for inspecting and changing a page while it runs. You will use it in almost every lesson. This is a quick tour; [DevTools in Depth](/lessons/browser/devtools/) covers debugging and performance later.

## Opening DevTools

Press <kbd>⌥⌘I</kbd> on macOS or <kbd>Ctrl Shift I</kbd> elsewhere, or right-click any element and choose **Inspect**. Use the **⋮** menu to dock it to the side or bottom, or into its own window.

## Elements

The Elements panel shows the **DOM**: the live tree of nodes the browser built from the HTML, including anything JavaScript has added since. It is not the original source; for that, use **View Page Source**.

- Hover a node to highlight it on the page.
- Double-click text or an attribute to edit it.
- The **Styles** pane lists every rule that matches the selected element, in cascade order, with overridden declarations struck through.
- The **Computed** pane shows the final value of each property and the box model diagram.

## Console

The Console shows messages the page logs and lets you run JavaScript in the page's context.

```javascript
document.title;                        // the page title
document.querySelectorAll("a").length; // how many links
$0;                                    // the selected element
$0.style.outline = "2px solid red";    // change it
```

Errors from the page appear here in red with a link to the line that threw.

## Network

The Network panel lists every request the page makes: the document itself, stylesheets, scripts, images, fonts and data requests made by JavaScript. Reload with the panel open to capture them.

Click a request to see its **Headers**, **Response** and **Timing**. Two settings belong on while developing:

- **Disable cache**, so you always load your latest files.
- **Preserve log**, so requests survive a navigation.

## Application

The Application panel (Storage in Firefox, Safari) shows what a site keeps in the browser: cookies, local storage, session storage, IndexedDB and caches. Try it on this site: mark this lesson complete, then find the `ecma-progress` key under **Local storage**.

## Assignment

1. Open DevTools on this page. In Elements, select this lesson's heading and change its text.
2. In the Console, run `$0.textContent` with the heading selected.
3. Open the Network panel, turn on Disable cache and reload. Find the request for the document and read its response headers.
4. Mark this lesson complete and find the stored value in the Application panel.
