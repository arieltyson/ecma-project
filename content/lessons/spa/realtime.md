---
title: "Real-Time: WebSockets and Subscriptions"
summary: Push live data to the client with WebSockets, Server-Sent Events and GraphQL subscriptions, and keep connections healthy.
minutes: 35
objectives:
  - Choose between polling, Server-Sent Events and WebSockets.
  - Use the WebSocket API with typed, validated messages.
  - Reconnect with exponential backoff and jitter, and resubscribe after reconnecting.
  - Feed real-time events into a cache or external store without overwhelming React.
quiz:
  - question: Which transport suits a one-way stream of server events, such as viewer count updates, with automatic reconnection built in?
    options:
      - Server-Sent Events (EventSource)
      - Long polling
      - WebRTC
    answer: 0
    explanation: EventSource keeps an HTTP connection open for server-to-client events and reconnects automatically. WebSockets add client-to-server messages at the cost of managing reconnection yourself.
  - question: Why add random jitter to reconnection delays?
    options:
      - To make debugging harder.
      - So that thousands of clients disconnected at once do not all reconnect at the same moment and overload the server.
      - Browsers require it.
    answer: 1
    explanation: Synchronised retries create a thundering herd. Jitter spreads them out.
  - question: Messages arrive 300 times per second. What is a good way to get them into React?
    options:
      - Call setState for each message.
      - Push them into an external store and notify subscribers at most once per animation frame.
      - Reload the page every second.
    answer: 1
    explanation: Batching to the frame rate caps renders at what the screen can show, regardless of the message rate.
resources:
  - title: MDN, WebSocket
    url: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  - title: MDN, Server-Sent Events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
  - title: Apollo Client, subscriptions
    url: https://www.apollographql.com/docs/react/data/subscriptions
---

Chat, viewer counts, "now live" notifications and raids all need data pushed from the server as it happens. This lesson covers the transports and the client-side engineering that keeps live connections reliable.

## Choosing a transport

| | Polling | Server-Sent Events | WebSocket |
| --- | --- | --- | --- |
| Direction | client asks repeatedly | server to client | both ways |
| Protocol | ordinary HTTP | long-lived HTTP response | upgraded TCP connection |
| Reconnects | n/a | automatic | your code |
| Good for | data that changes every minute or so | notifications, counters, feeds | chat, presence, games |

## WebSockets

```ts
import { z } from "zod";

const ServerMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("chat"), id: z.string(), author: z.string(), text: z.string() }),
  z.object({ type: z.literal("viewers"), count: z.int().nonnegative() }),
  z.object({ type: z.literal("deleted"), id: z.string() }),
]);

export type ServerMessage = z.infer<typeof ServerMessage>;

export function connect(url: string, onMessage: (message: ServerMessage) => void): WebSocket {
  const socket = new WebSocket(url);
  socket.addEventListener("message", (event: MessageEvent<string>) => {
    try {
      const result = ServerMessage.safeParse(JSON.parse(event.data));
      if (result.success) onMessage(result.data);
    } catch {
      // Ignore malformed frames rather than crashing the client.
    }
  });
  return socket;
}
```

Messages are untyped strings at the boundary, so validate them like any other external data, and model them as a discriminated union.

## Staying connected

Connections drop: laptops sleep, phones change networks, servers deploy. A robust client:

1. **Reconnects with exponential backoff and jitter**, so a server restart does not cause every client to reconnect in the same instant.
2. **Resubscribes** to its channels after reconnecting, and fetches anything it missed (for example the last few chat messages) over HTTP.
3. **Sends heartbeats** (or relies on server pings) to detect dead connections that never fired `close`.
4. **Pauses when hidden** if appropriate, using `visibilitychange`, and reconnects when visible.
5. **Shows connection state** to the user ("Reconnecting…") instead of silently showing stale data.

```ts
export function backoff(attempt: number, baseMs = 500, maxMs = 30_000): number {
  const exponential = Math.min(maxMs, baseMs * 2 ** attempt);
  return Math.random() * exponential; // "full jitter"
}

export function keepAlive(url: string, onOpen: (socket: WebSocket) => void): () => void {
  let attempt = 0;
  let stopped = false;
  let socket: WebSocket | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function open() {
    socket = new WebSocket(url);
    socket.addEventListener("open", () => {
      attempt = 0;
      if (socket) onOpen(socket);
    });
    socket.addEventListener("close", () => {
      if (stopped) return;
      timer = setTimeout(open, backoff(attempt++));
    });
  }

  open();
  return () => {
    stopped = true;
    clearTimeout(timer);
    socket?.close();
  };
}
```

## Server-Sent Events

```ts
const events = new EventSource("/api/channels/lumen/events");
events.addEventListener("viewers", (event: MessageEvent<string>) => {
  console.log("viewers", Number(event.data));
});
// The browser reconnects automatically, sending Last-Event-ID so the server can resume.
```

## GraphQL subscriptions

With Apollo Client, subscriptions run over a separate link, commonly `graphql-ws`, and the HTTP link handles everything else. A **split link** routes each operation by type:

```ts nocheck
import { ApolloLink, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";

const link = ApolloLink.split(
  ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
  new GraphQLWsLink(createClient({ url: "wss://lumen.tv/graphql" })),
  new HttpLink({ uri: "/graphql" }),
);
```

`useSubscription` then delivers each event; returning entities with IDs (such as `{ id, viewerCount }`) updates the normalised cache, so any query showing that stream's viewer count updates too.

## Into React, efficiently

High-rate streams must not call `setState` per message. Put events into an external store (see [External Stores](/lessons/react/external-stores/)) and notify React at most once per frame:

```ts
export function frameBatched(notify: () => void): () => void {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      notify();
    });
  };
}
```

## Assignment

1. Read MDN's [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) and [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) guides.
2. Run a tiny local WebSocket server (Node.js with the `ws` package) that emits fake chat messages, and connect your chat panel to it with `keepAlive`. Kill and restart the server and watch the client reconnect.
3. Add a connection status indicator, and fetch missed messages over HTTP after reconnecting.
