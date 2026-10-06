---
title: Testing React
summary: Test components the way users use them with Vitest, Testing Library and user-event, and mock the network at the boundary.
minutes: 35
objectives:
  - Set up Vitest with jsdom and Testing Library in a Vite project.
  - Query by role and accessible name, and simulate input with user-event.
  - Test asynchronous UI with findBy queries.
  - Mock network requests at the HTTP level and test hooks and reducers directly.
quiz:
  - question: Which query does Testing Library recommend first?
    options:
      - "`getByTestId`"
      - "`getByRole`, with an accessible name"
      - "`container.querySelector`"
    answer: 1
    explanation: Role queries find elements the way assistive technology does, so tests also check that the UI is accessible. Test IDs are a last resort.
  - question: Data appears after a fetch resolves. Which query waits for it?
    options:
      - "`getByText`"
      - "`findByText`"
      - "`queryByText`"
    answer: 1
    explanation: findBy queries return a promise that retries until the element appears or a timeout passes. getBy throws immediately; queryBy returns null.
  - question: Why prefer `userEvent.type` over `fireEvent.change`?
    options:
      - It is shorter.
      - It simulates the full sequence of real interactions (focus, key events, input events), catching bugs that a single synthetic event misses.
      - fireEvent is deprecated.
    answer: 1
    explanation: user-event behaves like a user. fireEvent dispatches exactly one event, which can pass tests that real input would fail.
resources:
  - title: Vitest, getting started
    url: https://vitest.dev/guide/
  - title: Testing Library, guiding principles and queries
    url: https://testing-library.com/docs/queries/about
  - title: user-event
    url: https://testing-library.com/docs/user-event/intro
  - title: Mock Service Worker
    url: https://mswjs.io/docs/
---

Good React tests render a component, interact with it as a user would, and assert on what a user would see. They avoid implementation details (state variables, internal functions, CSS classes), so they keep passing when you refactor and fail when behaviour breaks.

## Setup

In a Vite project:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

```ts nocheck
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./src/test-setup.ts"] },
});
```

`src/test-setup.ts` imports `@testing-library/jest-dom/vitest` for matchers like `toBeInTheDocument`, and calls `cleanup` after each test if globals are off.

## A component test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test } from "vitest";

function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <button aria-pressed={following} onClick={() => setFollowing(!following)}>
      {following ? "Following" : "Follow"}
    </button>
  );
}

test("toggles following", async () => {
  const user = userEvent.setup();
  render(<FollowButton />);

  const button = screen.getByRole("button", { name: "Follow" });
  await user.click(button);

  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.textContent).toBe("Following");
});
```

### Queries

Choose in this order:

1. `getByRole("button", { name: "Follow" })`: how assistive technology sees the page.
2. `getByLabelText("Message")`: form fields.
3. `getByText("No one is live")`: non-interactive text.
4. `getByTestId("chat-log")`: only when nothing else identifies the element.

Each comes in three forms: `getBy` (throws if missing), `queryBy` (returns `null`, for asserting absence) and `findBy` (async, waits).

If a role query cannot find your control, often the component is not accessible: a `<div onClick>` instead of a `<button>`, or an input with no label.

## Async UI

```tsx nocheck
test("shows the channel title after loading", async () => {
  render(<ChannelHeader login="lumen" />);
  expect(screen.getByText("Loading…")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Speedrunning" })).toBeInTheDocument();
});
```

Avoid arbitrary `setTimeout` waits. `findBy` and `waitFor` retry until the assertion passes.

## Mocking the network

Mock at the HTTP boundary rather than mocking your own fetch functions. **Mock Service Worker** (MSW) intercepts requests in tests (and optionally in the browser during development):

```ts nocheck
import { http, HttpResponse, graphql } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/channels/:login", ({ params }) =>
    HttpResponse.json({ login: params.login, title: "Speedrunning" }),
  ),
  graphql.query("ChannelPage", () => HttpResponse.json({ data: { channel: { title: "Speedrunning" } } })),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Override a handler inside one test (`server.use(...)`) to test error states. Your components, hooks and data library run unchanged.

## Testing logic directly

Reducers, parsers and stores are plain functions: test them without rendering.

```ts
import { expect, test } from "vitest";

type State = { readonly count: number };
type Action = { readonly type: "increment" } | { readonly type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "reset":
      return { count: 0 };
  }
}

test("increments", () => {
  expect(reducer({ count: 1 }, { type: "increment" })).toEqual({ count: 2 });
});
```

For custom hooks, `renderHook` from Testing Library renders a hook in a test component:

```tsx nocheck
const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
  initialProps: { value: "a" },
});
```

## What to test

- The behaviour your users and other components rely on: what renders for each state, what happens on interaction, what is sent to the server.
- Edge cases: empty lists, errors, slow responses, long text.
- Accessibility basics come for free with role queries; add `jest-axe` or Playwright with axe for broader checks.

End-to-end tests with **Playwright** complement these by running the real app in real browsers, for the few critical flows that must never break.

## Assignment

1. Read Testing Library's [About Queries](https://testing-library.com/docs/queries/about) page.
2. Add Vitest and Testing Library to your Lumen project and test the follow button, including an error from a mocked API.
3. Test a channel search: type a query with `user.type`, and assert that only matching channels are listed and that "No results" appears for a nonsense query.
