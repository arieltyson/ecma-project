---
title: "Project: Live Chat Panel"
summary: Build a fast, accessible live chat panel that handles hundreds of messages per second.
kind: project
minutes: 480
objectives:
  - A chat panel fed by a simulated high-volume message stream through an external store.
  - Smart auto-scroll that pauses when the reader scrolls up and resumes on request.
  - Message sending with optimistic display and failure handling.
  - Rendering that stays responsive at high message rates, verified with the Profiler.
resources:
  - title: React, useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
  - title: React, useOptimistic
    url: https://react.dev/reference/react/useOptimistic
  - title: MDN, ARIA live regions
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
---

Live chat is the defining feature of a streaming site and one of the hardest UI problems in it: messages arrive constantly, the list must stay smooth, and the viewer must be able to read, scroll back and reply without the panel fighting them.

## Brief

Build a chat panel in React and TypeScript for a Lumen channel page. A fake server (a module you write) emits messages at a configurable rate, from 1 to 500 per second, with random authors, badges, emotes (`:wave:` style codes) and occasional deletions by moderators.

## Requirements

1. **Store**: incoming messages go into an external store read with `useSyncExternalStore`. The store keeps at most 250 messages. Writing messages to `useState` from the socket callback is not allowed.
2. **Rendering**: each message shows the author (coloured), badges and the text with emote codes replaced by images with alt text. Message components skip re-rendering when unchanged.
3. **Auto-scroll**: the panel stays pinned to the newest message. When the reader scrolls up, it stops following and buffers new messages, showing a "N new messages" button. Clicking it (or scrolling to the bottom) jumps down and resumes.
4. **Deletions**: a moderator deletion replaces the message text with "Message deleted" without shifting the list.
5. **Sending**: a composer sends messages through an action with `useOptimistic`. Sending fails 1 time in 10; a failed message is marked with a retry button.
6. **Rate limits**: the fake server rejects more than one message per second from the viewer. Show a countdown in the composer while limited.
7. **Accessibility**: the composer is labelled, the "new messages" button is keyboard reachable, and incoming messages are **not** announced by a live region at full rate (explain your choice). Pausing chat is possible from the keyboard.
8. **Performance**: at 200 messages per second, typing in the composer stays responsive. Record a Profiler session and a Performance panel trace before and after your optimisations and keep the screenshots.
9. **Tests**: test the store as plain functions (cap, buffering, deletion) and the panel's "new messages" behaviour with Testing Library.

## Break it on purpose

1. Store messages in `useState` in the panel component, appending in the socket callback. At 200 messages per second, record a Performance profile and describe what you see.
2. Use array indexes as keys. Delete a message near the top and watch what happens to the messages below it (focus, animations, emote images).
3. Put an `aria-live="polite"` region around the message list and listen with a screen reader at 20 messages per second.

## Stretch

- Batch store updates so React renders at most once per animation frame.
- Virtualise the list so only visible messages are in the DOM.
- Add replies: clicking a message quotes it in the composer.

## Explain it

- Why an external store instead of `useState` or context for the message list?
- Walk through your auto-scroll logic. How do you tell the difference between the user scrolling and your own programmatic scroll?
- What exactly re-renders when one new message arrives? Show the Profiler evidence.
- What would change if messages arrived over a real WebSocket with reconnection? See [Real-Time](/lessons/spa/realtime/).
