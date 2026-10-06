---
title: A Strict tsconfig
summary: Configure the compiler with every strict check that catches real bugs, and understand what each option does.
minutes: 25
objectives:
  - Write a tsconfig.json for a modern bundled application.
  - Explain what strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes each catch.
  - Choose module and moduleResolution settings for a bundler.
  - Know why verbatimModuleSyntax and isolatedModules exist.
quiz:
  - question: With `noUncheckedIndexedAccess`, what is the type of `names[0]` when `names` is `string[]`?
    options:
      - "`string`"
      - "`string | undefined`"
      - "`unknown`"
    answer: 1
    explanation: An index might be out of range, so the option adds `undefined` to every index access. You narrow it before use, which catches empty-array bugs.
  - question: "With `exactOptionalPropertyTypes`, which assignment fails for `{ title?: string }`?"
    options:
      - "`{}`"
      - "`{ title: \"Live\" }`"
      - "`{ title: undefined }`"
    answer: 2
    explanation: "The option distinguishes a missing property from one explicitly set to `undefined`. If you want to allow both, write `title?: string | undefined`."
  - question: What does `verbatimModuleSyntax` require?
    options:
      - That every import uses a file extension.
      - That imports used only as types are written with `import type`, so tools can delete them without type information.
      - That modules use CommonJS.
    answer: 1
    explanation: A single-file transformer cannot know whether an import is a type. Writing `import type` makes the intent explicit, and the import is always removed.
  - question: Which `moduleResolution` suits an app built with Vite?
    options:
      - "`node10`"
      - "`bundler`"
      - "`classic`"
    answer: 1
    explanation: "`bundler` models how Vite and other bundlers resolve imports: package `exports`, no required extensions, and TypeScript extensions allowed with `allowImportingTsExtensions`."
resources:
  - title: TSConfig reference
    url: https://www.typescriptlang.org/tsconfig/
  - title: The strict flag and what it enables
    url: https://www.typescriptlang.org/tsconfig/#strict
  - title: Modules, choosing compiler options
    url: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html
---

`tsconfig.json` decides how strict the checker is. The default is lenient for compatibility with old JavaScript. A new project should turn on everything that catches real mistakes. This lesson builds that file option by option.

## The configuration

This is the configuration this site is built with, and the one every example in the curriculum is checked against:

```json
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["es2024", "dom", "dom.iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## strict

`strict` is a bundle of checks. The two that matter most:

- **`strictNullChecks`**: `null` and `undefined` are their own types, not members of every type. A `string` can never be `null`, so you must handle the missing case explicitly.
- **`noImplicitAny`**: when TypeScript cannot infer a type, it reports an error instead of silently using `any`.

It also enables `strictFunctionTypes`, `strictPropertyInitialization`, `useUnknownInCatchVariables` (a caught error is `unknown`, not `any`) and others. New strict checks added in future versions join the bundle automatically.

## Beyond strict

### noUncheckedIndexedAccess

Arrays and records can be indexed with values that do not exist. This option makes the type say so:

```ts
const viewers: number[] = [];
const first = viewers[0]; // number | undefined

if (first !== undefined) {
  console.log(first.toFixed(0));
}

const counts: Record<string, number> = {};
const lumen = counts["lumen"] ?? 0; // number
```

Loops with `for...of` and methods like `map` are unaffected, because they only visit elements that exist.

### exactOptionalPropertyTypes

An optional property can be missing. Without this option it can also be set to `undefined`, which is a different thing (`"title" in obj` is true, and spreading it overwrites a default):

```ts
interface StreamSettings {
  title?: string;
}

const a: StreamSettings = {};
// @ts-expect-error: undefined is not the same as missing
const b: StreamSettings = { title: undefined };
```

### The rest

| Option | Catches |
| --- | --- |
| `noImplicitOverride` | A subclass method that overrides without the `override` keyword |
| `noImplicitReturns` | A code path in a function that forgets to return |
| `noFallthroughCasesInSwitch` | A `case` that falls into the next by accident |
| `noPropertyAccessFromIndexSignature` | Writing `obj.typo` on a record; you must write `obj["typo"]` to show the key is dynamic |
| `noUnusedLocals`, `noUnusedParameters` | Dead code |

## Module settings

- **`module: "esnext"`** and **`moduleResolution: "bundler"`** describe a project where a bundler resolves imports. For a Node.js library, use `"nodenext"` for both instead.
- **`verbatimModuleSyntax`** requires `import type` for imports used only as types, so a transformer can delete them without knowing the types.
- **`isolatedModules`** reports code that cannot be transformed one file at a time, which is how Vite and esbuild work.
- **`noEmit`** because the bundler produces the JavaScript; `tsc` only checks.

```ts nocheck
import type { User } from "./user.ts"; // always removed
import { fetchUser } from "./api.ts";  // kept
```

## Assignment

1. Read the [TSConfig reference](https://www.typescriptlang.org/tsconfig/) entries for every option in the configuration above.
2. Copy the configuration into the project from the previous lesson. Write a function that returns the first element of an array, and fix the error `noUncheckedIndexedAccess` gives you without using `!`.
3. Turn `strict` off, introduce a `null` bug, and see that it compiles. Turn it back on.
