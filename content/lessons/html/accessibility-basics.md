---
title: Accessibility Basics
summary: What web accessibility is, the WCAG principles, and the habits that make every page usable by more people.
minutes: 20
objectives:
  - Explain who accessibility serves and what WCAG is.
  - Apply the POUR principles to everyday markup and design.
  - Test a page with the keyboard and a screen reader.
  - Know when ARIA helps and when it hurts.
quiz:
  - question: What are the four WCAG principles?
    options:
      - Fast, Responsive, Secure, Simple
      - Perceivable, Operable, Understandable, Robust
      - Visible, Clickable, Readable, Valid
    answer: 1
    explanation: Every WCAG success criterion falls under one of these four principles.
  - question: What is the minimum contrast ratio for normal body text at level AA?
    options:
      - "3:1"
      - "4.5:1"
      - "7:1"
    answer: 1
    explanation: 4.5:1 for normal text, 3:1 for large text and for user interface component boundaries. 7:1 is level AAA.
  - question: What does adding `role="button"` to a div do?
    options:
      - Makes it behave exactly like a button.
      - Only changes how it is announced; you must still add focus and keyboard handling.
      - Nothing.
    answer: 1
    explanation: ARIA changes semantics, not behaviour. A real button element does all of it for free.
resources:
  - title: W3C, Introduction to web accessibility
    url: https://www.w3.org/WAI/fundamentals/accessibility-intro/
  - title: WCAG 2.2 at a glance
    url: https://www.w3.org/WAI/standards-guidelines/wcag/glance/
  - title: WebAIM, contrast checker
    url: https://webaim.org/resources/contrastchecker/
---

Accessibility means people can use your site regardless of disability or circumstance: blind users with screen readers, people who cannot use a mouse, people with low vision who zoom to 200%, users with cognitive disabilities, and anyone in bright sunlight or with a broken trackpad. It is also a legal requirement in many places.

## WCAG and POUR

The **Web Content Accessibility Guidelines** (WCAG 2.2) define testable success criteria at levels A, AA and AAA. Most organisations target **AA**. They are organised under four principles:

| Principle | Means | Examples |
| --- | --- | --- |
| **Perceivable** | users can perceive content | alt text, captions, 4.5:1 contrast, not relying on colour alone |
| **Operable** | users can operate the interface | everything works by keyboard, visible focus, enough time, no flashing |
| **Understandable** | content and behaviour make sense | clear labels and errors, consistent navigation, page language set |
| **Robust** | works with assistive technology | valid, semantic markup; correct names, roles and states |

## Habits

- Use **semantic HTML** first (see [Semantic HTML](/lessons/html/semantic-html/)).
- Give every image meaningful alt text, or `alt=""` if decorative.
- Give every control a visible label and an accessible name.
- Keep **focus visible**; never remove outlines without a replacement.
- Check **contrast** for text and controls in light and dark themes.
- Do not convey information by colour alone; add text or an icon.
- Support **zoom and text resizing**: use relative units and let layouts reflow.
- Respect `prefers-reduced-motion`.

## ARIA

ARIA attributes change what assistive technology is told about an element (its role, name and state). They add no behaviour. The first rule of ARIA: **if a native element does the job, use it.** ARIA is for patterns HTML lacks, such as tabs or a combobox, and for states like `aria-expanded` and `aria-pressed`. Wrong ARIA is worse than none.

## Testing

1. **Keyboard**: Tab through the page. Can you reach and operate everything, in a sensible order, and always see where you are?
2. **Screen reader**: VoiceOver (<kbd>⌘F5</kbd> on macOS), NVDA on Windows. Navigate by headings and landmarks.
3. **Zoom** to 200% and 400%. Does content reflow without horizontal scrolling?
4. **Automated checks**: Lighthouse or the axe extension. They catch some issues; manual testing catches the rest.

This site follows these practices; read its [Accessibility statement](/about/accessibility/).

## Assignment

1. Read the W3C [Introduction to web accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/).
2. Test a site you use often with only the keyboard and list three problems.
3. Turn on VoiceOver or NVDA and use this site to complete one lesson's quiz.
