---
title: Front-End System Design
summary: A framework for designing large front-end features out loud, applied to live chat and a stream directory.
minutes: 45
objectives:
  - Structure a front-end system design discussion with a repeatable framework.
  - Define requirements, components, data model, API and state before optimising.
  - Discuss performance, accessibility, reliability and observability trade-offs.
  - Apply the framework to live chat and a browse page.
quiz:
  - question: What should come first in a front-end system design interview?
    options:
      - Choosing a state management library.
      - Clarifying functional and non-functional requirements and scope.
      - Drawing the database schema.
    answer: 1
    explanation: Requirements decide everything else. Ask about users, devices, scale, real-time needs, accessibility and what is out of scope.
  - question: In a chat design, where should incoming messages live?
    options:
      - In a React context, updated on every message.
      - In an external store with a size cap, read through useSyncExternalStore, with renders batched per frame.
      - In localStorage.
    answer: 1
    explanation: High-frequency data needs a store outside React's render cycle, bounded memory and batched updates.
  - question: Which belongs under non-functional requirements?
    options:
      - Users can send messages.
      - Typing stays responsive at 300 incoming messages per second, and the panel works with a screen reader.
      - Messages show the author's name.
    answer: 1
    explanation: Non-functional requirements cover performance, accessibility, reliability, security and internationalisation.
resources:
  - title: GreatFrontEnd, front end system design playbook
    url: https://www.greatfrontend.com/front-end-system-design-playbook
  - title: web.dev, Core Web Vitals
    url: https://web.dev/articles/vitals
---

In a front-end system design round you are asked to design a feature, such as a live chat, a news feed or an autocomplete, at the level of components, data, state and APIs. There is no single right answer; the assessment is how you structure the problem and reason about trade-offs.

## A framework

Work through these in order, spending roughly the time shown in a 45-minute round:

1. **Requirements** (5 to 8 minutes): functional (what users can do) and non-functional (performance, scale, devices, accessibility, internationalisation, offline). Agree on scope.
2. **Architecture** (5 to 8 minutes): a component diagram, and where data comes from (REST, GraphQL, WebSocket).
3. **Data model** (5 minutes): client-side entities, their identity, and where each kind of state lives (server cache, client store, URL, component).
4. **Interface** (5 minutes): the API between client and server, including pagination, real-time events and errors; and the props of key components.
5. **Optimisations and deep dives** (the rest): performance, accessibility, reliability, security, observability. Go deep on the parts the interviewer cares about.

Draw as you talk. Keep a list of open questions and decisions on the side.

## Example: live chat

**Requirements.** Read and send messages in a channel's chat; emotes, badges, mentions; moderators delete messages and time out users. Up to 500 messages per second in large channels; works on low-end laptops; keyboard and screen reader accessible; reconnects automatically.

**Architecture.**

```text
ChatPanel
├── ChatHeader (connection status, settings)
├── MessageList (virtualised)
│   └── MessageRow (author, badges, text with emotes)
├── NewMessagesButton (when scrolled up)
└── Composer (input, emote picker, rate-limit countdown)

ChatConnection (WebSocket, reconnect, heartbeat) → MessageStore → React
```

**Data model.** `Message { id, author { id, login, colour, badges }, fragments: (text | emote | mention)[], sentAt, state: "sent" | "pending" | "failed" | "deleted" }`. Messages are parsed into fragments once when they arrive, not on every render. The store holds the last N messages (a ring buffer), plus a buffer while the reader is scrolled up.

**Interface.** WebSocket events `message`, `delete`, `clear`, `timeout`; on reconnect, fetch recent history over HTTP with a cursor. Sending uses a mutation that returns the server's ID so optimistic messages can be reconciled.

**Deep dives.**

- **Rendering at high rates**: batch store notifications to once per animation frame; virtualise the list; memoise rows by message ID; cap the DOM size.
- **Scrolling**: auto-scroll only when pinned to the bottom; distinguish user scrolls from programmatic ones; preserve position when older messages load.
- **Accessibility**: no live region for the full stream; announce mentions and moderation actions; labelled composer; keyboard access to pause chat.
- **Reliability**: exponential backoff with jitter; show "Reconnecting…"; deduplicate by ID after reconnecting.
- **Security**: render text, never HTML; validate emote and link URLs; rate-limit on the client to give feedback, enforce on the server.
- **Observability**: track dropped frames, message lag, reconnect counts and send failures.

## Example: stream directory

**Requirements.** Browse live streams by category, sort, filter by tags, infinite scroll, thumbnails, live viewer counts. Fast first load on mobile. Shareable URLs.

**Key decisions.**

- Filters live in the **URL**; data in a normalised **GraphQL cache** with cursor pagination.
- First page **server-rendered or prerendered** for LCP; later pages fetched client-side.
- Thumbnails with fixed aspect ratio (no CLS), responsive `srcset`, lazy loading below the fold, high priority for the first row.
- Viewer counts refreshed in batches (polling a lightweight query or a subscription per visible card), not per card per second.
- Scroll position restored on back navigation; deduplicate streams that move between pages as counts change.

## Tips

- State assumptions explicitly ("I'll assume a GraphQL API with cursor pagination").
- Quantify where you can ("at 300 messages per second, rendering each one is 300 renders per second").
- Offer two options and choose one with a reason.
- Mention accessibility and performance unprompted. They are where senior front-end judgement shows.

## Assignment

1. Read the GreatFrontEnd [system design playbook](https://www.greatfrontend.com/front-end-system-design-playbook) introduction.
2. Design, out loud and timed at 45 minutes, a "clips" feature: create a 30-second clip from a live stream, then browse and share clips.
3. Write a one-page design for the notifications drop-down (follows, raids, mentions) using the framework.
