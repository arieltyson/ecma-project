---
title: "Drills: React Components"
summary: Timed component-building problems with the requirements interviewers grade, from autocomplete to an accessible tabs widget.
minutes: 300
objectives:
  - Build common interview components quickly with correct state and effects.
  - Handle race conditions, cleanup and keyboard interaction under time pressure.
  - Explain component structure and trade-offs while building.
  - Review your own solution against a checklist.
quiz:
  - question: In an autocomplete, results for "lu" arrive after results for "lum". What prevents showing the wrong list?
    options:
      - Debouncing alone.
      - Aborting the previous request or ignoring responses that are not for the current query.
      - Sorting the results.
    answer: 1
    explanation: Debouncing reduces requests but cannot stop out-of-order responses. Abort in the effect cleanup or compare against the latest query.
  - question: Which keys should a tabs widget following the ARIA pattern support?
    options:
      - Only Tab.
      - Left and Right arrows to move between tabs, Home and End, with Tab moving into the panel.
      - Enter only.
    answer: 1
    explanation: The APG tabs pattern uses roving focus with arrow keys. Only the active tab is in the tab order.
  - question: A countdown timer component keeps running after it unmounts. What is missing?
    options:
      - A key.
      - An effect cleanup that clears the interval.
      - useMemo.
    answer: 1
    explanation: Every subscription or timer started in an effect needs a cleanup that stops it.
resources:
  - title: WAI-ARIA APG, tabs pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
  - title: WAI-ARIA APG, combobox pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
  - title: GreatFrontEnd, user interface questions
    url: https://www.greatfrontend.com/questions/user-interface
---

Front-end interviews often ask you to build a component in 45 to 60 minutes. Each drill below lists what a strong answer includes. Build each in a fresh Vite project, timed, narrating as in [Thinking Out Loud](/lessons/live-coding/thinking-out-loud/). Then review against the checklist at the end.

## The drills

### 1. Channel autocomplete (45 minutes)

A search box that suggests channels from `fetchChannels(query, signal)` (write a fake with random latency).

- Debounce or defer input; show nothing for an empty query.
- Abort stale requests so out-of-order responses never show.
- Loading, empty and error states.
- Keyboard: Up and Down move the active option, Enter selects, Escape closes. Follow the ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, `role="listbox"`).
- Highlight the matching part of each suggestion.

### 2. Accessible tabs (30 minutes)

Tabs for a channel page: Home, Videos, Clips, About.

- `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"` with `aria-labelledby`.
- Arrow keys, Home and End move focus and selection; only the active tab has `tabIndex={0}`.
- Selected tab stored in the URL.

### 3. Live viewer count badge (30 minutes)

A badge that subscribes to a fake feed (`subscribe(channelId, onCount) => unsubscribe`).

- Subscribes in an effect, unsubscribes in cleanup, resubscribes when `channelId` changes.
- Formats with `Intl.NumberFormat` compact notation ("1.2K").
- Animates changes without layout shift; respects reduced motion.
- Bonus: implement it with `useSyncExternalStore`.

### 4. Infinite list (45 minutes)

A list of clips loaded page by page from a cursor API.

- Loads the next page when a sentinel enters the viewport (`IntersectionObserver` in a callback ref or effect with cleanup).
- Never requests the same page twice; stops at the end.
- A "Load more" button for keyboard and screen reader users.

### 5. Modal confirmation (25 minutes)

"Unfollow lumen?" with Cancel and Unfollow.

- Native `<dialog>` with `showModal()`, labelled by its heading.
- Focus moves into the dialog and returns to the trigger on close.
- Escape and Cancel close; the action shows pending state.

### 6. Countdown and stopwatch (25 minutes)

A "stream starts in" countdown.

- Computes remaining time from a target timestamp each tick, so it does not drift.
- Clears its interval on unmount; pauses when the tab is hidden (`visibilitychange`).
- Accessible: the visible time is not a live region that announces every second.

### 7. Star rating (20 minutes)

- Built from radio inputs so it is keyboard and screen reader accessible for free.
- Hover preview that does not change the value until clicked.

## Review checklist

- [ ] State is minimal and nothing is derived into state.
- [ ] Every effect synchronises with something external and cleans up.
- [ ] Async work handles races and unmounting.
- [ ] Loading, empty and error states exist.
- [ ] Keyboard works and focus is visible and managed.
- [ ] Semantic elements first, ARIA only where needed.
- [ ] Props and state are typed precisely, with unions for states.
- [ ] You can state what re-renders when state changes.

## Assignment

1. Complete drills 1, 2 and 5 timed, and record which checklist items you missed.
2. Repeat the drill you did worst on a week later.
3. Explain your autocomplete's race-condition handling to someone else in under two minutes.
