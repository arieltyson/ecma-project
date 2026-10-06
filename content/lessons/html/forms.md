---
title: Forms
summary: Build forms with labelled inputs, the right input types, native validation and accessible error messages.
minutes: 25
objectives:
  - Label every input and group related controls.
  - Choose input types that bring the right keyboards and validation.
  - Use native validation attributes and show accessible errors.
  - Explain what happens when a form submits without JavaScript.
quiz:
  - question: Why should every input have a label element?
    options:
      - Labels are required by browsers.
      - It gives the input an accessible name and makes the label clickable to focus the input.
      - It styles the input.
    answer: 1
    explanation: Placeholders are not labels; they disappear when typing and are often low contrast.
  - question: What does `type="email"` give you?
    options:
      - Nothing beyond type=text.
      - An email keyboard on phones and built-in format validation.
      - Automatic email sending.
    answer: 1
    explanation: Input types bring appropriate on-screen keyboards, autofill and validation for free.
  - question: A form with `method="post"` submits without JavaScript. What happens?
    options:
      - Nothing.
      - The browser sends the fields to the action URL and loads the response as a new page.
      - The fields are saved in localStorage.
    answer: 1
    explanation: A native submission is a navigation. Single-page apps usually intercept it and use fetch instead.
resources:
  - title: MDN, Web forms
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms
  - title: MDN, Client-side form validation
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
---

Forms are how users give you information. Native HTML forms already handle labels, keyboards, validation, autofill and submission; build on them rather than around them.

## Labels and grouping

```html
<form action="/settings" method="post">
  <label for="display-name">Display name</label>
  <input id="display-name" name="displayName" autocomplete="nickname" required maxlength="25" />

  <fieldset>
    <legend>Who can chat</legend>
    <label><input type="radio" name="chat" value="everyone" checked /> Everyone</label>
    <label><input type="radio" name="chat" value="followers" /> Followers only</label>
  </fieldset>

  <label>
    <input type="checkbox" name="mature" /> Mature content
  </label>

  <button>Save</button>
</form>
```

Every control needs a label, either with `for` and `id` or by wrapping. Group related radios and checkboxes in a `fieldset` with a `legend`. A `button` inside a form submits it by default; use `type="button"` for other buttons.

## Input types

| Type | Gives you |
| --- | --- |
| `email`, `url`, `tel` | the right keyboard and format checks |
| `number`, `range` | numeric input |
| `date`, `time`, `datetime-local` | native pickers |
| `search` | a clear button and search keyboard |
| `password` | hidden text and password manager integration |

`autocomplete` values (`email`, `username`, `current-password`, `new-password`) make autofill reliable.

## Validation

Native attributes validate before submitting: `required`, `minlength`, `maxlength`, `min`, `max`, `pattern`, and the type itself. Style states with `:user-invalid`, which applies only after the user has interacted:

```css
input:user-invalid {
  border-color: var(--danger);
}
```

Show specific error messages next to fields and link them with `aria-describedby` so screen readers read them:

```html
<label for="title">Stream title</label>
<input id="title" name="title" required aria-describedby="title-error" aria-invalid="true" />
<p id="title-error">Enter a title between 1 and 140 characters.</p>
```

Client-side validation is a convenience. The server must validate everything again.

## Submission

Without JavaScript, submitting sends the fields (by `name`) to `action` with `method`, and the browser loads the response as a new page. Read about what changes when JavaScript intercepts it in [Document Requests and Async Requests](/lessons/browser/document-vs-async-requests/) and [Forms and Actions](/lessons/react/forms-and-actions/).

## Assignment

1. Read MDN's [Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation).
2. Build a "create account" form with display name, email, password, date of birth and a terms checkbox, using only native validation.
3. Fill it in with only the keyboard, then with a screen reader, and fix anything confusing.
