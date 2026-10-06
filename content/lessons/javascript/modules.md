---
title: ES Modules
summary: Import and export, how module loading works in browsers and bundlers, dynamic import, top-level await and import attributes.
minutes: 20
objectives:
  - Use named and default exports, re-exports and type-only imports.
  - Explain module evaluation order, live bindings and singletons.
  - Split code with dynamic import.
  - Use top-level await and import attributes appropriately.
quiz:
  - question: Two files import the same module. How many times does its top-level code run?
    options:
      - Once per import.
      - Once; every importer shares the same module instance.
      - Never, until a function is called.
    answer: 1
    explanation: Modules are singletons per realm. That is why a module-level store or cache is shared across the app.
  - question: What does `import("./chat.ts")` return?
    options:
      - The module synchronously.
      - A promise for the module namespace object, and bundlers split the module into its own chunk.
      - A string path.
    answer: 1
    explanation: Dynamic import loads on demand. It is the basis of route-based code splitting and React's lazy.
  - question: Why do many codebases prefer named exports over default exports?
    options:
      - Default exports are deprecated.
      - Names are consistent across imports, which helps search, refactoring and auto-imports.
      - Named exports are faster.
    answer: 1
    explanation: A default export can be imported under any name, so the same thing may be called different names in different files.
resources:
  - title: MDN, JavaScript modules
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
  - title: MDN, import attributes
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
---

Every file in a modern front end is an **ES module**: it has its own scope, declares what it exports, and imports what it needs. Browsers load modules natively; bundlers like Vite follow the same rules to build a dependency graph.

## Exports and imports

```ts nocheck
// format.ts
export function formatViewers(count: number): string { ... }
export const LOCALE = "en";
export type Formatter = (n: number) => string;

// channel-card.tsx
import { formatViewers, LOCALE } from "./format.ts";
import type { Formatter } from "./format.ts";
import * as format from "./format.ts"; // namespace import
```

- **Named exports** keep one name everywhere. Prefer them.
- **Default exports** (`export default function`) are required by a few APIs, such as `React.lazy`.
- **Re-exports** (`export { formatViewers } from "./format.ts"`) build a package's public surface. Avoid giant "barrel" files that re-export everything, which slow tooling and defeat tree-shaking in some setups.
- **`import type`** is erased completely; `verbatimModuleSyntax` requires it for type-only imports.

## How modules load

1. The loader parses a module, finds its static `import`s and fetches them, recursively, before running anything.
2. Modules run **once**, in dependency order. A module imported by ten files is evaluated once and shared, which makes module-level state a singleton.
3. Imports are **live bindings**, not copies: if a module reassigns an exported `let`, importers see the new value. (Do not rely on this; export functions instead.)
4. Module code runs in strict mode, and top-level `this` is `undefined`.

In browsers, `<script type="module">` is deferred by default and supports `import` directly. Vite serves your source this way in development.

## Dynamic import

`import()` loads a module on demand and returns a promise. Bundlers split dynamically imported modules into separate chunks:

```ts nocheck
button.addEventListener("click", async () => {
  const { openEmotePicker } = await import("./emote-picker.ts");
  openEmotePicker();
});
```

Use it for routes, rarely used features (moderation tools, settings) and heavy libraries.

## Top-level await

A module can `await` at the top level. Modules that import it wait until it finishes:

```ts nocheck
// config.ts
const response = await fetch("/config.json");
export const config: unknown = await response.json();
```

It is convenient but blocks every importer, so keep it out of the critical path. This site's client entry uses it to load the current lesson before hydrating.

## Import attributes

Non-JavaScript modules declare their type:

```ts nocheck
import emotes from "./emotes.json" with { type: "json" };
```

JSON modules are standard. Bundlers also support CSS, images and raw text imports with their own conventions (`import url from "./logo.svg"`, `import text from "./LICENSE?raw"`).

## Assignment

1. Read MDN's [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) guide.
2. Build two small modules in plain HTML (no bundler) loaded with `<script type="module">`, and watch them load in the Network panel.
3. In a Vite app, dynamically import a heavy module on click and confirm in the build output that it became its own chunk.
