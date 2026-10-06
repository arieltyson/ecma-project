---
title: Arrays and Objects
summary: Store collections and records, transform them with array methods, and copy them without mutation.
minutes: 30
objectives:
  - Create, read and update objects and arrays.
  - Transform arrays with map, filter, find, some, every and reduce.
  - Copy and combine with spread and destructuring.
  - Choose Map and Set when they fit better than objects and arrays.
quiz:
  - question: What does `streams.filter((s) => s.live).map((s) => s.title)` return?
    options:
      - The first live stream.
      - A new array of the titles of live streams.
      - A boolean.
    answer: 1
    explanation: filter keeps matching items and map transforms each one. Neither changes the original array.
  - question: "What does `const copy = { ...channel, live: true }` do?"
    options:
      - Changes channel.
      - Creates a new object with channel's properties and live set to true.
      - Creates a deep copy.
    answer: 1
    explanation: Spread makes a shallow copy. Nested objects are still shared.
  - question: When is a Set better than an array?
    options:
      - When order matters most.
      - When you need unique values and fast membership checks.
      - Never.
    answer: 1
    explanation: set.has(x) is fast and duplicates are ignored automatically.
resources:
  - title: MDN, Array
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
  - title: MDN, Working with objects
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
---

Most front-end data is a list of records: streams, messages, channels. Arrays hold lists; objects hold records.

## Objects

```javascript
const channel = {
  login: "lumen",
  followers: 3204,
  live: true,
  stream: { title: "Any% practice", viewers: 412 },
};

channel.login;              // "lumen"
channel["followers"];       // 3204
channel.stream.title;       // "Any% practice"
const { login, live } = channel;          // destructuring
const updated = { ...channel, followers: channel.followers + 1 }; // copy with a change
Object.entries(channel);    // [["login", "lumen"], ...]
```

## Arrays

```javascript
const streams = [
  { title: "Any% practice", viewers: 412, live: true },
  { title: "Chess with chat", viewers: 1204, live: true },
  { title: "VOD", viewers: 0, live: false },
];

streams.length;                                   // 3
streams[0];                                       // first
streams.at(-1);                                   // last
const [first, ...rest] = streams;                 // destructuring
const more = [...streams, { title: "New", viewers: 1, live: true }]; // copy and add
```

## Array methods

| Method | Returns |
| --- | --- |
| `map(fn)` | a new array of transformed items |
| `filter(fn)` | a new array of items where `fn` is true |
| `find(fn)` | the first matching item, or `undefined` |
| `some(fn)`, `every(fn)` | booleans |
| `reduce(fn, start)` | a single accumulated value |
| `toSorted(compare)` | a new sorted array |
| `includes(x)` | a boolean |

```javascript
const liveTitles = streams.filter((s) => s.live).map((s) => s.title);
const total = streams.reduce((sum, s) => sum + s.viewers, 0);
const top = streams.toSorted((a, b) => b.viewers - a.viewers)[0];
```

These never change the original array. Prefer them to methods that mutate (`push`, `sort`, `splice`) when the data is shared, as it always is in React.

## Map and Set

```javascript
const followers = new Set(["lumen", "nova"]);
followers.add("lumen");       // ignored: already present
followers.has("nova");        // true

const viewersByLogin = new Map([["lumen", 412]]);
viewersByLogin.set("nova", 1204);
viewersByLogin.get("lumen");  // 412
```

Use `Set` for unique values and membership checks, and `Map` for lookups by key, especially non-string keys or frequently changing entries.

## JSON

```javascript
const text = JSON.stringify(channel);   // to a string, for storage or the network
const back = JSON.parse(text);          // and back
```

## Assignment

1. Read MDN's [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) reference, the methods section.
2. Given an array of 20 fake streams, compute: total viewers, the top three titles, whether any is mature, and streams grouped by game.
3. Count the number of messages per user in an array of chat messages using a `Map`.
