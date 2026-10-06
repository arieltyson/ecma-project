---
title: Build Tooling and Code Quality
summary: What Vite does in development and production, and the type-checking, linting, formatting, testing and CI that keep a large codebase healthy.
minutes: 30
objectives:
  - Explain how Vite serves code in development and bundles it for production.
  - Use environment variables safely.
  - Configure type-checking, linting and formatting that run the same locally and in CI.
  - Describe the checks a front-end pull request should pass.
quiz:
  - question: Why does Vite's dev server start almost instantly, even for large apps?
    options:
      - It skips TypeScript.
      - It serves source files as native ES modules on demand and transforms each one only when the browser requests it, instead of bundling first.
      - It caches the production build.
    answer: 1
    explanation: The browser's module loader requests files as it needs them. Production builds still bundle for efficient loading.
  - question: Which environment variables does Vite expose to client code?
    options:
      - All of them.
      - Only those prefixed with VITE_, through import.meta.env.
      - None.
    answer: 1
    explanation: The prefix prevents server secrets from being bundled by accident. Anything in client code is public, so never put secrets there at all.
  - question: Type-checking passes locally but fails in CI. What is a likely cause?
    options:
      - CI computers are slower.
      - A different TypeScript version, or the editor using a bundled TypeScript instead of the project's.
      - Type-checking is random.
    answer: 1
    explanation: Pin versions with a lockfile and point the editor at the workspace TypeScript, so everyone runs the same compiler.
resources:
  - title: Vite, guide
    url: https://vite.dev/guide/
  - title: Vite, env variables and modes
    url: https://vite.dev/guide/env-and-mode
  - title: typescript-eslint, shared configs
    url: https://typescript-eslint.io/users/configs
  - title: Oxlint
    url: https://oxc.rs/docs/guide/usage/linter
---

Large front-end codebases stay healthy because of their tooling as much as their code: fast feedback while you work, and automatic checks that stop mistakes before they merge.

## Vite

**In development**, Vite serves your source as native ES modules. When the browser requests `/src/App.tsx`, Vite strips the types, transforms the JSX and returns JavaScript. Nothing is bundled up front, so start-up is fast regardless of app size. **Hot module replacement** swaps edited modules in place, and React Fast Refresh keeps component state across edits.

**In production**, `vite build` bundles with Rolldown: tree-shaking unused code, splitting chunks at dynamic `import()` boundaries, minifying, hashing filenames for caching and emitting source maps.

```bash
npm create vite@latest lumen -- --template react-ts
npm run dev      # dev server with HMR
npm run build    # production bundle in dist/
npm run preview  # serve dist/ locally
```

## Environment variables

```ts nocheck
const apiUrl = import.meta.env.VITE_API_URL; // from .env, .env.production, or the shell
const isDev = import.meta.env.DEV;
```

Only variables prefixed `VITE_` reach client code. Everything in the bundle is public: an API key in client code is visible to anyone who opens DevTools. Type them by augmenting `ImportMetaEnv` in a `vite-env.d.ts` file.

## Type-checking

Vite does not type-check (it only strips types), so run the compiler separately:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "check": "npm run format:check && npm run lint && npm run typecheck && npm test"
  }
}
```

Use the strict configuration from [A Strict tsconfig](/lessons/typescript/strict-config/). In large repositories, **project references** split the codebase into separately checked projects, so changing one package does not re-check everything.

## Linting

Linters catch bugs types cannot: unhandled promises, misused hooks, accessibility mistakes.

- **ESLint** with **typescript-eslint**'s `strictTypeChecked` config uses type information for rules such as `no-floating-promises` and `no-unnecessary-condition`. Add `eslint-plugin-react-hooks` for the Rules of Hooks and React Compiler diagnostics, and `eslint-plugin-jsx-a11y` for accessibility.
- **Oxlint** is a much faster Rust linter with most popular rules built in, increasingly used alongside or instead of ESLint. This site uses it.

Treat warnings as errors in CI, or they accumulate until nobody reads them.

## Formatting

**Prettier** removes formatting from code review entirely. Format on save in the editor, and check in CI with `prettier --check`.

## Continuous integration

Every pull request should run, in order of speed:

1. format check
2. lint
3. type-check
4. unit and component tests
5. build (which catches bundling problems)
6. end-to-end tests on critical flows (Playwright)

Add a **bundle size budget** and a **Lighthouse** or Web Vitals check on important pages so performance regressions are caught like bugs. This site's workflow, in `.github/workflows/deploy.yml`, runs format, lint, type-check, snippet checks, tests and the build before every deploy.

## Monorepos

Large web clients often live in a monorepo with packages for the app, the design system, the GraphQL schema and shared utilities. Workspaces (npm, pnpm, Yarn) link packages locally, and task runners such as Turborepo or Nx cache results so CI only rebuilds what changed.

## Assignment

1. Read Vite's [guide](https://vite.dev/guide/) through "Env Variables and Modes".
2. Add `typecheck`, `lint`, `format:check`, `test` and `check` scripts to your Lumen app, and a GitHub Actions workflow that runs `npm run check` on every pull request.
3. Enable `@typescript-eslint/no-floating-promises` and fix every report.
