---
title: Setting Up Your Environment
summary: Install Node.js, an editor, Git and a modern browser, and check that each one works.
minutes: 30
objectives:
  - Install the current Node.js LTS release with a version manager.
  - Configure an editor for TypeScript and formatting on save.
  - Install Git and connect it to GitHub over SSH.
  - Run a TypeScript file directly with Node.js.
quiz:
  - question: Why install Node.js with a version manager instead of a system installer?
    options:
      - Version managers make Node.js run faster.
      - Different projects need different versions, and a version manager switches between them per project.
      - System installers cannot install the LTS release.
    answer: 1
    explanation: A version manager such as nvm or fnm installs several versions side by side and reads a project's `.nvmrc` to pick the right one.
  - question: What does `node greet.ts` do on Node.js 24?
    options:
      - Fails, because Node.js only runs JavaScript.
      - Type-checks the file, then runs it.
      - Strips the type annotations and runs the result, without type-checking.
    answer: 2
    explanation: Node.js removes erasable TypeScript syntax and runs what remains. It never checks types; that is the job of `tsc`.
  - question: Which file pins the Node.js version for a project?
    options:
      - "`.nvmrc`"
      - "`tsconfig.json`"
      - "`.gitignore`"
    answer: 0
    explanation: "`.nvmrc` holds a version such as `24`. Version managers and CI's `setup-node` action both read it, and `package.json` can state the same range under `engines`."
resources:
  - title: Node.js download and release schedule
    url: https://nodejs.org/en/about/previous-releases
  - title: Running TypeScript natively in Node.js
    url: https://nodejs.org/en/learn/typescript/run-natively
  - title: GitHub, connecting with SSH
    url: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
---

You need four tools: a version manager for Node.js, an editor, Git and a browser with good developer tools. This lesson installs each and checks that it works.

## Node.js

Node.js runs JavaScript outside the browser. You will use it to run tools (the TypeScript compiler, Vite, test runners) and, occasionally, your own scripts.

Install it through a version manager so each project can choose its own version. On macOS or Linux, [nvm](https://github.com/nvm-sh/nvm) is the most common:

```bash
nvm install 24
nvm use 24
node --version   # v24.x
```

Node.js 24 is the current long-term support (LTS) release. Pin it in every project with a `.nvmrc` file containing just `24`.

### Running TypeScript directly

Node.js 24 runs `.ts` files by **stripping** their types: it deletes annotations and runs the JavaScript that remains. Try it:

```typescript
// greet.ts
function greet(name: string): string {
  return `Hello, ${name}`;
}

console.log(greet("Lumen"));
```

```bash
node greet.ts   # Hello, Lumen
```

> [!IMPORTANT]
> Stripping is not checking. Change the call to `greet(42)` and Node.js still runs it. Type errors are found by the compiler, `tsc`, which you will set up in the TypeScript course.

Stripping only works for syntax that can be deleted without changing behaviour. `enum`, `namespace` with values, and constructor parameter properties generate code, so they need a full compiler. Modern TypeScript avoids them for that reason.

## An editor

Use [Visual Studio Code](https://code.visualstudio.com/) or another editor with a TypeScript language server. Install the **Prettier** extension and turn on format on save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

The last line makes the editor use each project's own TypeScript version instead of a bundled one, so the errors you see match the errors CI sees.

## Git and GitHub

Git records the history of your code. GitHub hosts it. Install Git, set your identity, and add an SSH key to your GitHub account:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
ssh-keygen -t ed25519 -C "you@example.com"
```

Then follow GitHub's guide to add the public key, and check the connection:

```bash
ssh -T git@github.com
```

## A browser

Any current Chromium browser, Firefox or Safari works. Lessons describe Chrome DevTools because it is the most widely used, but every panel mentioned has an equivalent in the others. In Safari, enable **Settings → Advanced → Show features for web developers** first.

## Assignment

1. Install Node.js 24 with a version manager and run `greet.ts` from this lesson.
2. Call `greet(42)`, run it again, and note that Node.js does not complain.
3. Install an editor and turn on format on save.
4. Install Git, add an SSH key to GitHub and confirm `ssh -T git@github.com` greets you by name.
