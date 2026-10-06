---
title: Thinking Out Loud
summary: A repeatable approach to live coding rounds in front-end interviews, from clarifying the problem to testing your solution.
minutes: 20
objectives:
  - Follow a five-step structure for live coding problems.
  - Ask clarifying questions that surface edge cases early.
  - Narrate trade-offs while writing code.
  - Test your own code before the interviewer does.
quiz:
  - question: What should you do in the first few minutes of a live coding problem?
    options:
      - Start typing immediately to show speed.
      - Restate the problem, ask about inputs, outputs and edge cases, and agree on an example.
      - Ask for the solution.
    answer: 1
    explanation: Clarifying first prevents solving the wrong problem and shows the structured thinking interviewers are assessing.
  - question: You notice a better approach halfway through. What is the best move?
    options:
      - Silently rewrite everything.
      - Say what you noticed and the trade-off, then decide with the interviewer whether to switch or finish first.
      - Ignore it.
    answer: 1
    explanation: Explaining the trade-off is itself a strong signal. Interviewers care about reasoning as much as the final code.
  - question: How should you test your solution at the end?
    options:
      - Wait for the interviewer to find bugs.
      - Walk through the agreed example and the edge cases you listed, line by line, out loud.
      - Say it should work.
    answer: 1
    explanation: Tracing your own code catches most bugs and demonstrates ownership of correctness.
resources:
  - title: Tech Interview Handbook, coding interview techniques
    url: https://www.techinterviewhandbook.org/coding-interview-techniques/
  - title: GreatFrontEnd, front end interview guidebook
    url: https://www.greatfrontend.com/front-end-interview-playbook
---

Front-end live coding rounds rarely ask abstract algorithm puzzles. More often they ask you to build something real in a short time: a debounced search, a small component, a parser for a realistic format, or a utility like `Promise.all`. What is assessed is how you think: whether you clarify, structure, communicate trade-offs and check your own work.

## A five-step structure

1. **Clarify** (2 to 5 minutes). Restate the problem in your own words. Ask about inputs, outputs, sizes, invalid input and edge cases. Agree on one concrete example.
2. **Plan** (2 to 5 minutes). Describe your approach and its complexity before coding. Name the data structures and types you will use. Mention one alternative and why you are not choosing it.
3. **Implement** (most of the time). Write clean, typed code. Narrate decisions as you make them, not every keystroke.
4. **Test** (5 minutes). Trace your example, then each edge case, out loud. Fix what you find.
5. **Extend** (remaining time). Discuss what you would add with more time: performance, accessibility, error handling, tests.

## Clarifying questions

For a "build an autocomplete" prompt:

- Where do suggestions come from? Is there an API, and does it have latency or rate limits?
- How many results, and how should they be ranked?
- Should typing quickly cancel earlier requests? (Yes: race conditions are the real problem here.)
- Keyboard support? Screen reader support? (Mention the combobox pattern.)
- What happens on errors, empty results and an empty input?

For a parsing or data problem:

- What does valid input look like? What about empty input, whitespace, duplicates, very large input, unexpected characters?
- Should invalid input throw, be skipped or be reported?
- What should the output types look like?

## Narrating

Good narration explains **why**, briefly:

- "I'll model the states as a discriminated union so the loading and error cases can't overlap."
- "I'm using a `Map` here because I need insertion order and O(1) lookups."
- "I'll abort the previous request when the query changes, otherwise a slow response could overwrite a newer one."
- "I'm skipping input validation for now to get the core working; I'll come back to it."

If you are stuck, say what you are considering. Interviewers can help with a hint only if they know where you are.

## Writing the code

- **Types first.** Sketch the types for inputs, outputs and state before logic. In TypeScript this is fast and it structures everything that follows.
- **Small functions** with clear names beat one long function.
- **Handle the main path first**, then edge cases, telling the interviewer you are doing so.
- Use the platform: `Map`, `Set`, `Array.prototype.toSorted`, `structuredClone`, `AbortController`, `Intl.NumberFormat`. Knowing what exists is a signal.

## Testing

Walk through the code with your example, tracking variables out loud. Then run through the edge cases you listed during clarification. If you have a runtime, write two or three quick assertions. Finally, state the time and space complexity.

## Practising

- Time yourself: 45 minutes per problem, including clarification.
- Practise **out loud**, even alone. Narration is a skill that improves with repetition.
- Re-solve the same problem a week later without notes.
- Record yourself once and watch it back.

## Assignment

1. Pick one problem from [Utility Drills](/lessons/live-coding/utility-drills/) and solve it in 30 minutes, out loud, following the five steps.
2. Write down every clarifying question you would ask for "build a live viewer count badge that updates in real time".
3. Re-solve the [Chat Log Parser](/lessons/javascript/project-chat-parser/) project in 45 minutes from scratch, narrating.
