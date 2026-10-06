---
title: "Project: Viewer Poll"
summary: Build an interactive poll for a live stream in plain HTML, CSS and JavaScript, with results that survive a reload.
kind: project
minutes: 240
objectives:
  - An accessible poll form built from semantic HTML.
  - Results rendered from state with the DOM API, never innerHTML for user content.
  - State saved to localStorage and restored on load.
  - A countdown that closes the poll.
resources:
  - title: MDN, Web Storage API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
  - title: MDN, setInterval
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
---

Streamers run polls so chat can vote: "Which game next?" Build one with no frameworks. The goal is to practise state, rendering from state and events by hand, so React's model makes sense later.

## Requirements

1. **Create**: a form where the streamer enters a question and two to five options (with "Add option" and "Remove" buttons) and a duration of 30, 60 or 120 seconds. Native validation for required fields.
2. **Vote**: once started, options appear as a radio group with a Vote button. Each browser can vote once.
3. **Results**: a bar for each option showing votes and percentage, updated immediately after voting. Bars are drawn with CSS (`inline-size` from a custom property) and include the numbers as text.
4. **State**: all poll state lives in one object. A single `render(state)` function updates the page from it. No other code changes the DOM.
5. **Persistence**: state is saved to `localStorage` on every change and restored on load, so a reload mid-poll keeps votes and the remaining time.
6. **Countdown**: shows the time left and closes the poll at zero, highlighting the winner.
7. **Safety**: option text is inserted with `textContent`, never `innerHTML`.
8. **Accessibility**: labelled controls, keyboard operable, results announced politely once when the poll closes.

## Break it on purpose

1. Render option text with `innerHTML` and enter `<img src=x onerror=alert(1)>` as an option. Observe what happens, then fix it.
2. Store the countdown as "seconds remaining" and decrement it each second. Reload a few times and see the poll last longer than intended. Fix it by storing the end time instead.

## Stretch

- Simulate chat votes arriving at random every few hundred milliseconds.
- Sync two tabs with the `storage` event so votes in one appear in the other.

## Explain it

- Why does one `render(state)` function make the code easier to reason about? How does React take this idea further?
- What did you store in `localStorage`, and how do you handle data from an older version of your app?
- Why store an end time instead of remaining seconds?
