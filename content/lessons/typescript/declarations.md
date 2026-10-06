---
title: Declaration Files, Modules and Augmentation
summary: How types reach your code from libraries and the platform, and how to add or extend them safely.
minutes: 25
objectives:
  - Explain what a .d.ts file is and where library types come from.
  - Write ambient declarations for globals and untyped modules.
  - Extend existing types with interface merging and module augmentation.
  - Choose lib and types settings deliberately.
quiz:
  - question: Where do the types for `document.querySelector` come from?
    options:
      - The `@types/dom` package.
      - "The `lib.dom.d.ts` file that ships with TypeScript, enabled by `\"dom\"` in `lib`."
      - The browser at run time.
    answer: 1
    explanation: Platform APIs are declared in TypeScript's own lib files. The `lib` option chooses which ones a project sees.
  - question: "How do you add a property to the global `Window` type?"
    options:
      - Edit lib.dom.d.ts in node_modules.
      - "Declare `interface Window { myProp: string }` inside `declare global` in a module."
      - Cast window to any.
    answer: 1
    explanation: Interfaces merge across declarations. In a module file, wrap the declaration in `declare global` to merge into the global scope.
  - question: "What does `declare const VERSION: string` emit?"
    options:
      - A variable set to an empty string.
      - Nothing; it only tells the checker that the value exists elsewhere.
      - An error if VERSION is not defined.
    answer: 1
    explanation: "`declare` describes something defined outside this file, such as a value injected by a bundler. It produces no JavaScript."
resources:
  - title: TypeScript Handbook, Declaration Files introduction
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
  - title: TypeScript Handbook, Declaration Merging
    url: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
---

Your code uses types it never declared: `fetch`, `Map`, `React.useState`. They come from **declaration files** (`.d.ts`), which contain only types. Knowing where they come from, and how to extend them, is part of working in any real codebase.

## Where types come from

| Source | Example | How it is chosen |
| --- | --- | --- |
| TypeScript's lib files | `Array.prototype.toSorted`, `fetch`, `HTMLElement` | `lib` option |
| A package's own types | `react` ships `index.d.ts`, `zod` too | `types` or `exports` in its `package.json` |
| DefinitelyTyped | `@types/node` | installed separately; `types` option limits which are global |
| Your declarations | `src/env.d.ts` | `include` |

`lib: ["es2024", "dom", "dom.iterable"]` gives you ES2024 built-ins and the browser DOM. A Node.js-only project leaves out `dom` so that `window` is an error.

## Ambient declarations

`declare` tells the checker something exists without creating it. Use it for values injected by build tools:

```ts
declare const __APP_VERSION__: string;

console.log(`Version ${__APP_VERSION__}`);
```

And for modules that have no types, such as a non-code import a bundler handles:

```ts nocheck
// src/assets.d.ts
declare module "*.svg" {
  const url: string;
  export default url;
}
```

Vite ships declarations like this in `vite/client`, which is why `import logo from "./logo.svg"` type-checks in a Vite project.

## Interface merging

Two `interface` declarations with the same name in the same scope merge. This is how you add to platform types. In a module (any file with `import` or `export`), wrap global additions in `declare global`:

```ts
declare global {
  interface Window {
    readonly lumenConfig?: { readonly apiUrl: string };
  }
}

const apiUrl = window.lumenConfig?.apiUrl ?? "/api";
```

## Module augmentation

To add to a library's types, re-open its module. Libraries design for this when they want you to register your own types. React Router, Apollo and i18n libraries use the pattern:

```ts nocheck
// Tell a hypothetical router library about this app's route names.
declare module "router-lib" {
  interface Register {
    routes: "home" | "directory" | "channel";
  }
}
```

The library then reads `Register["routes"]` in its own types, so `navigate("chanel")` becomes a compile error in your app.

## Writing a .d.ts for a library

When a package has no types and nothing on DefinitelyTyped, add a declaration in your project describing only what you use:

```ts nocheck
// src/types/tiny-emoji.d.ts
declare module "tiny-emoji" {
  export function parse(text: string): string;
}
```

Keep it minimal and correct. A wrong declaration is worse than none, because the compiler trusts it.

## skipLibCheck

`skipLibCheck: true` skips type-checking inside `.d.ts` files. It speeds up builds and avoids errors from conflicting third-party types. The cost is that mistakes in your own `.d.ts` files are not reported either, so keep those small.

## Assignment

1. Read the Handbook's [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
2. In a Vite project, add `define: { __APP_VERSION__: JSON.stringify("1.0.0") }` to the config and declare the global so it type-checks.
3. Add a typed `dataLayer` array to `Window` with `declare global`, and push a typed event into it.
