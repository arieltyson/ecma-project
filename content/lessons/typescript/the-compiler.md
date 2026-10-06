---
title: TypeScript and the Compiler
summary: What TypeScript adds to JavaScript, what the compiler actually does, and why types disappear at run time.
minutes: 20
objectives:
  - Explain the difference between type-checking and running code.
  - Describe what type erasure means and what it rules out.
  - Know which TypeScript features generate code and why modern code avoids them.
  - Run the compiler in check-only mode.
quiz:
  - question: "A function is annotated `(id: string) => void` and called with a number from parsed JSON at run time. What happens?"
    options:
      - TypeScript throws a TypeError at run time.
      - The call runs with a number; types do not exist at run time.
      - The compiler inserts a conversion to string.
    answer: 1
    explanation: Types are erased before the code runs. Data that crosses a boundary (JSON, URL parameters, storage) has to be checked at run time, which the Validating Data at the Boundary lesson covers.
  - question: Which of these is NOT erasable syntax?
    options:
      - "`const x: number = 1`"
      - "`enum Direction { Up, Down }`"
      - "`type Id = string`"
      - "`function f<T>(x: T): T`"
    answer: 1
    explanation: An enum produces a JavaScript object at run time, so it cannot simply be deleted. `erasableSyntaxOnly` reports it as an error.
  - question: What does `tsc --noEmit` do?
    options:
      - Type-checks the project and writes no files.
      - Compiles the project without type-checking.
      - Deletes previously emitted files.
    answer: 0
    explanation: Most modern projects let a bundler or Node.js strip types and use `tsc` only as a checker, so `--noEmit` (or `noEmit` in tsconfig) is the usual setting.
  - question: What is TypeScript 7?
    options:
      - A new language that replaces TypeScript.
      - A port of the TypeScript compiler to Go, with the same type system and much faster checks.
      - A runtime that executes TypeScript in the browser.
    answer: 1
    explanation: TypeScript 7 is the native compiler. The language and its checking rules carry over; builds and editor feedback get much faster.
resources:
  - title: TypeScript Handbook, The Basics
    url: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
  - title: TypeScript for JavaScript Programmers
    url: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html
  - title: The erasableSyntaxOnly option
    url: https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly
---

TypeScript is JavaScript with a type system on top. You write JavaScript plus annotations; a **type checker** reads the whole program and reports places where values could be used in ways that do not fit. Then the annotations are removed and ordinary JavaScript runs.

## Two separate jobs

People say "the TypeScript compiler" for two different jobs:

| Job | What it does | Who does it in a modern project |
| --- | --- | --- |
| Type-checking | Reads every file, infers and checks types, reports errors | `tsc` |
| Transforming | Removes type syntax so the code can run | Vite, esbuild, Node.js, Bun |

The transformer does not look at types at all. It deletes them. That is why a Vite dev server starts instantly and why `node file.ts` works: neither waits for the checker.

So your workflow has two loops. The editor runs the checker continuously and underlines errors. CI runs `tsc --noEmit` and fails the build if there are any.

```bash
npx tsc --noEmit
```

## Type erasure

Because types are deleted before the code runs, **nothing about a type exists at run time**. You cannot ask "is this value a `User`?" by mentioning `User`:

```ts
interface User {
  readonly id: string;
  readonly name: string;
}

function greet(user: User) {
  return `Hi ${user.name}`;
}

// After erasure this is just:
// function greet(user) { return `Hi ${user.name}`; }
```

This has two consequences you will meet constantly:

1. **Types describe, they do not enforce.** Data that comes from outside your program (a `fetch` response, `JSON.parse`, `localStorage`, a URL) has whatever shape it has. You must check it at run time and only then tell the type system what it is.
2. **Runtime checks use JavaScript.** Narrowing (`typeof`, `in`, `instanceof`, comparing a tag field) works because those operators exist at run time.

## Erasable syntax

Most TypeScript syntax can be deleted without changing behaviour. A few older features cannot, because they generate JavaScript:

```ts nocheck
enum Status { Live, Offline }       // creates an object
namespace Chat { export const x = 1 } // creates an object
class Channel {
  constructor(private login: string) {} // assigns this.login
}
```

Modern TypeScript avoids these. Use a union of string literals instead of an enum, ES modules instead of namespaces, and explicit fields instead of parameter properties:

```ts
type Status = "live" | "offline";

class Channel {
  readonly login: string;
  constructor(login: string) {
    this.login = login;
  }
}
```

The `erasableSyntaxOnly` compiler option reports the old forms as errors, which keeps your code runnable by any type-stripping tool.

## TypeScript 7

TypeScript 7 is the compiler ported from TypeScript to Go. The type system is the same; checks run many times faster and use less memory, which matters on large codebases. You install and run it the same way:

```bash
npm install --save-dev typescript
npx tsc --version
```

## Assignment

1. Read the Handbook's [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) page.
2. In a new folder, run `npm init -y`, `npm install --save-dev typescript`, and create `index.ts` containing the `greet` example above.
3. Call `greet({ id: "1" })` and run `npx tsc --noEmit index.ts`. Read the error. Then run `node index.ts` and note that it runs anyway.
4. Add an `enum` and run `npx tsc --noEmit --erasableSyntaxOnly index.ts`.
