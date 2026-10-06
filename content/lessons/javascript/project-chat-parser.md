---
title: "Project: Chat Log Parser"
summary: Parse raw chat logs into a typed model, report malformed lines precisely, and compute statistics, in one dependency-free TypeScript module.
kind: project
minutes: 240
objectives:
  - A parser from raw log text to a discriminated union of chat events.
  - Precise, typed errors for malformed lines that never stop the rest of the log parsing.
  - Statistics computed from the parsed events with modern array, Map and Set methods.
  - Edge cases handled deliberately and tested.
resources:
  - title: MDN, RegExp named capture groups
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group
  - title: MDN, Map.groupBy
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy
---

Lumen keeps chat logs as plain text. Moderators want a tool that turns a log into structured data: who said what, which moderation actions happened, and which emotes are popular. This project is pure TypeScript with no dependencies and no UI. It is the kind of problem asked in live coding interviews: a realistic domain, one file, and edge cases that decide the grade.

## The format

```text
[2026-10-06T19:22:01Z] <lumen> welcome in everyone :wave:
[2026-10-06T19:22:04Z] <nova_fan> @lumen hi! :wave: :heart:
[2026-10-06T19:22:09Z] * nova raided with 120 viewers
[2026-10-06T19:23:10Z] /timeout spammer 600 links in chat
[2026-10-06T19:23:12Z] /ban spammer2
[2026-10-06T19:23:15Z] /delete m-1042
```

- Every line starts with an ISO 8601 UTC timestamp in brackets.
- `<login>` lines are chat messages. Logins are 3 to 25 characters of lowercase letters, digits and underscores. Messages may mention users (`@login`) and use emotes (`:name:`).
- `* ` lines are system events: raids (`* <from> raided with <n> viewers`) and follows (`* <login> followed`).
- `/` lines are moderation commands: `/timeout <login> <seconds> [reason]`, `/ban <login> [reason]`, `/delete <messageId>`.

## Requirements

1. `parseLog(text: string): ParseResult` returns every successfully parsed event **and** every error. One bad line never stops the rest.
2. Events are a **discriminated union** (`message`, `raid`, `follow`, `timeout`, `ban`, `delete`), each with only the fields it needs and a `Date` timestamp.
3. Errors are typed: each has a 1-based line number, the raw line and a `reason` from a fixed union (`"bad-timestamp"`, `"bad-login"`, `"unknown-command"`, `"missing-argument"`, `"bad-number"`, `"unrecognised"`).
4. Messages expose their `mentions` and `emotes` as arrays, in order of appearance.
5. Handles: an empty string, blank lines (skipped, not errors), Windows line endings, trailing whitespace, multiple spaces between words, a timeout with no reason, and a timeout with a non-numeric or negative duration (an error).
6. `stats(events)` returns: messages per login sorted by count then login, the top five emotes, the number of unique chatters, total raid viewers, and the busiest minute (`"19:22"`) by message count.
7. No `any`, no type assertions except where you explain them, no dependencies.

## Getting started

Starter files and tests are in [`exercises/chat-parser`](https://github.com/arieltyson/ecma-project/tree/main/exercises/chat-parser). The starter defines the types the tests expect. Before reading them, sketch your own model on paper and compare.

```bash
npm run exercise chat-parser
```

## Break it on purpose

1. Split lines with `text.split("\n")` only, and feed it a log saved on Windows. Describe the failure, then fix it.
2. Make the parser throw on the first bad line. Explain to a moderator why a single malformed line hiding a whole log is worse than skipping it.

## Stretch

- Stream the parser: accept an `AsyncIterable<string>` of lines and yield events as they arrive.
- Add `/unban` and replay moderation state to answer "who is currently banned or timed out at time T?".

## Explain it

Practise these out loud, timed, as if in an interview:

- Walk through your types first. Why a discriminated union for events and a separate union for error reasons?
- Which edge cases did you handle, and how did you discover each one?
- What is the time complexity of `stats`? Could the busiest minute be computed in one pass?
- If logs were 2 GB, what would you change?
