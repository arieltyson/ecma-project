---
title: The DOM and Events
summary: Find, create and change elements with JavaScript, and respond to user input with event listeners and delegation.
minutes: 30
objectives:
  - Select and update elements through the DOM.
  - Create elements safely, without innerHTML for untrusted content.
  - Listen for events and use event delegation.
  - Explain bubbling, capturing and preventDefault.
quiz:
  - question: Why is `element.textContent = userInput` safer than `element.innerHTML = userInput`?
    options:
      - textContent is faster.
      - textContent inserts plain text, so HTML in the input cannot run scripts.
      - innerHTML is deprecated.
    answer: 1
    explanation: Inserting untrusted strings as HTML enables cross-site scripting. Use textContent, or create elements.
  - question: What is event delegation?
    options:
      - Adding one listener per element.
      - Adding one listener to a common ancestor and using event.target to find which child was involved.
      - Passing events to a server.
    answer: 1
    explanation: Events bubble up the tree, so one listener can handle every item in a list, including items added later.
  - question: What does `event.preventDefault()` do on a form's submit event?
    options:
      - Stops the event bubbling.
      - Stops the browser's default action, submitting and navigating, so your code can handle it.
      - Deletes the form.
    answer: 1
    explanation: preventDefault cancels the default action. stopPropagation is the method that stops bubbling.
resources:
  - title: MDN, Manipulating documents
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting
  - title: MDN, Introduction to events
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events
  - title: MDN, Event bubbling
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
---

The **DOM** (Document Object Model) is the browser's live tree of the page. JavaScript reads and changes it to make pages interactive. React does this for you later, but knowing the underlying API makes React's behaviour (and its escape hatches) understandable.

## Selecting

```javascript
const list = document.querySelector("#chat-list");      // first match, or null
const buttons = document.querySelectorAll(".follow");   // static NodeList
const title = list?.closest("section")?.querySelector("h2");
```

## Changing

```javascript
title.textContent = "Chat";
button.classList.toggle("is-following");
button.setAttribute("aria-pressed", "true");
button.dataset.channelId = "c1";          // data-channel-id="c1"
element.hidden = true;
```

## Creating safely

```javascript
function renderMessage({ author, text }) {
  const item = document.createElement("li");
  const name = document.createElement("strong");
  name.textContent = author;
  item.append(name, `: ${text}`);
  return item;
}

list.append(renderMessage({ author: "nova", text: "<b>hi</b>" })); // shows the tags as text
```

Never put untrusted text into `innerHTML`: it is parsed as HTML and can run scripts (see [Security](/lessons/browser/security/)). Use `textContent` and `createElement`.

## Events

```javascript
button.addEventListener("click", (event) => {
  console.log("clicked", event.currentTarget);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();             // stop the native submit and navigation
  const data = new FormData(form);
  console.log(data.get("message"));
});
```

Common events: `click`, `input`, `change`, `submit`, `keydown`, `focus`, `blur`, `scroll`, `resize`, `pointerdown`.

## Bubbling and delegation

Events start at the target element and **bubble** up through its ancestors. One listener on a parent can handle events from all children, including ones added later:

```javascript
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='delete']");
  if (!button) return;
  button.closest("li")?.remove();
});
```

`event.target` is the element that was actually clicked; `event.currentTarget` is the element the listener is on. `stopPropagation()` stops bubbling; use it rarely. This site's lesson pages use delegation for every copy button and internal link.

## Assignment

1. Read MDN's [Introduction to events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) and [Event bubbling](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling).
2. Build a page with a message input and a list. Submitting adds a message; each message has a delete button handled by one delegated listener.
3. Add a character counter that updates on `input` and warns when over 200 characters.
