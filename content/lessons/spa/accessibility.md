---
title: Accessible Single-Page Apps
summary: Make client-side navigation, dynamic updates, dialogs and custom controls work for keyboard and screen reader users.
minutes: 35
objectives:
  - Manage focus and announcements on client-side navigation.
  - Announce dynamic content with live regions, at a sensible rate.
  - Build dialogs, menus and other widgets with native elements first and ARIA second.
  - Test with a keyboard, a screen reader and automated tools.
quiz:
  - question: What is the first rule of ARIA?
    options:
      - Add a role to every element.
      - If a native HTML element or attribute has the semantics and behaviour you need, use it instead of ARIA.
      - Use aria-label on everything.
    answer: 1
    explanation: Native elements bring keyboard support, focus behaviour and semantics for free. ARIA only changes what assistive technology is told; it adds no behaviour.
  - question: A div with an onClick handler acts as a button. What is missing?
    options:
      - Nothing.
      - A role, keyboard focus, and activation with Enter and Space, all of which a real button provides.
      - A CSS class.
    answer: 1
    explanation: Use a button element. Recreating it with a div requires role, tabIndex and key handlers, and is still easy to get wrong.
  - question: What does a native `<dialog>` opened with showModal() provide?
    options:
      - Only styling.
      - Focus moved into the dialog, an inert background, Escape to close and focus returned on close.
      - Automatic translations.
    answer: 1
    explanation: The modal dialog element handles the hard parts of the dialog pattern natively.
resources:
  - title: WAI-ARIA Authoring Practices Guide
    url: https://www.w3.org/WAI/ARIA/apg/
  - title: WCAG 2.2 at a glance
    url: https://www.w3.org/WAI/standards-guidelines/wcag/glance/
  - title: MDN, ARIA live regions
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
---

A server-rendered site gets a lot of accessibility for free: every navigation loads a new page, the screen reader announces its title, and focus starts at the top. A single-page app replaces navigation with JavaScript, so it has to rebuild those behaviours deliberately.

## Navigation

On every client-side route change:

1. **Update `document.title`** to describe the new page.
2. **Move focus** to the new page's main heading (with `tabindex="-1"`) or the main region, so screen readers announce where the user is and keyboard users continue from the top of the content.
3. **Restore scroll** appropriately (top for new pages, previous position for back).
4. Keep a **skip link** to the main content as the first focusable element.

This site does all four; see `src/router/router.tsx` and `src/app/App.tsx`.

## Dynamic updates

Content that changes without a page load is invisible to screen readers unless announced. **Live regions** do this:

```tsx
export function SearchStatus({ count, query }: { readonly count: number; readonly query: string }) {
  return (
    <p role="status" className="visually-hidden">
      {query ? `${count} channels match ${query}` : ""}
    </p>
  );
}
```

- `role="status"` (polite) waits for the user to pause; `role="alert"` (assertive) interrupts. Use alerts only for errors that need immediate attention.
- The region must be **in the DOM before** its content changes.
- Announce **summaries**, not floods. A chat at 50 messages per second must not be a live region; announce mentions or a "new messages" count instead.

## Native elements first

| Need | Use |
| --- | --- |
| an action | `<button>` |
| navigation | `<a href>` |
| a modal | `<dialog>` with `showModal()` |
| a disclosure | `<details>` and `<summary>` |
| a choice | `<input type="radio">`, `<select>` |
| a toggle | `<button aria-pressed>` or `<input type="checkbox">` |
| a popup menu or tooltip | the `popover` attribute |

Native elements are focusable, operable with the keyboard, and announced correctly. When you must build a custom widget (a combobox, tabs, a tree), follow the **ARIA Authoring Practices** pattern for it exactly, including its keyboard interactions.

```tsx
import { useEffect, useRef, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="modal-title">
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </dialog>
  );
}
```

## Visual requirements

- **Contrast**: 4.5:1 for text, 3:1 for large text and for the boundaries of controls (WCAG 1.4.3, 1.4.11).
- **Focus visible**: never remove outlines without a clear replacement.
- **Target size**: at least 24 by 24 CSS pixels (WCAG 2.5.8); 44 points is Apple's guideline.
- **Do not rely on colour alone**: pair colour with text or an icon (this site's quiz shows "Correct." and a check mark, not just green).
- **Reduced motion**: honour `prefers-reduced-motion`.
- **Zoom and reflow**: the layout works at 400% zoom and 320 CSS pixels wide without horizontal scrolling.

## Testing

- **Keyboard**: unplug the mouse. Can you reach and operate everything, in a sensible order, and always see where focus is?
- **Screen reader**: VoiceOver on macOS and iOS, NVDA on Windows, TalkBack on Android. Navigate by headings and landmarks.
- **Automated**: axe (browser extension, `jest-axe`, or Playwright with `@axe-core/playwright`) and Lighthouse catch roughly a third of issues, such as missing labels and low contrast.
- **Role queries in tests**: Testing Library's `getByRole` fails when controls lack accessible names.

## Assignment

1. Read the APG patterns for [dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
2. Navigate your Lumen app with only a keyboard, then with VoiceOver, and write down every problem you find. Fix them.
3. Run axe on every route and fix every violation.
