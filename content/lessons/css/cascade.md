---
title: The Cascade, Specificity and Layers
summary: How the browser decides which CSS declaration wins, and how cascade layers make large stylesheets predictable.
minutes: 25
objectives:
  - Write selectors and explain specificity.
  - List the order in which the cascade resolves conflicts.
  - Organise styles with @layer.
  - Know which properties inherit.
quiz:
  - question: Which selector has higher specificity?
    options:
      - "`.channel .title`"
      - "`#header`"
      - "`main article h2`"
    answer: 1
    explanation: An ID outranks any number of classes, which outrank any number of element selectors. That is why IDs are avoided for styling.
  - question: A rule in a later @layer conflicts with an unlayered rule. Which wins?
    options:
      - The layered rule, because it comes later.
      - The unlayered rule; unlayered styles beat all layers for normal declarations.
      - The more specific one.
    answer: 1
    explanation: Layer order is checked before specificity, and unlayered styles form an implicit final layer.
  - question: Which property is inherited by default?
    options:
      - "`border`"
      - "`color`"
      - "`margin`"
    answer: 1
    explanation: Text properties such as color, font and line-height inherit. Box properties such as margin, padding and border do not.
resources:
  - title: MDN, Cascade, specificity and inheritance
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts
  - title: MDN, @layer
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
---

When two declarations set the same property on the same element, the **cascade** decides which wins. Understanding it is the difference between CSS that behaves and CSS that you fight with `!important`.

## Selectors

```css
h2 { }                       /* element */
.card { }                    /* class */
#main { }                    /* id */
.card > h3 { }               /* child */
.card h3 { }                 /* descendant */
button:hover { }             /* pseudo-class */
.card:has(img) { }           /* parent selector */
input:user-invalid { }       /* state after interaction */
a[href^="https"] { }         /* attribute */
```

## The cascade, in order

For each property on each element, the browser compares competing declarations by:

1. **Origin and importance**: browser defaults, then your styles; `!important` reverses the order.
2. **Cascade layers**: later layers beat earlier ones; unlayered styles beat all layers.
3. **Specificity**: more specific selectors win.
4. **Order**: among equals, the last one wins.

## Specificity

Specificity is counted as (IDs, classes and attributes and pseudo-classes, elements):

| Selector | Specificity |
| --- | --- |
| `h2` | 0, 0, 1 |
| `.title` | 0, 1, 0 |
| `.card .title` | 0, 2, 0 |
| `#main h2` | 1, 0, 1 |
| `:where(.card) .title` | 0, 1, 0 (`:where` counts as zero) |

Keep specificity low and flat: style with single classes, avoid IDs and long chains, and use `:where()` for defaults that should be easy to override.

## Layers

`@layer` lets you decide precedence by **purpose** rather than by selector weight:

```css
@layer reset, base, components, utilities;

@layer base {
  a { color: var(--accent); }
}

@layer components {
  .nav-link { color: var(--label); } /* wins over base, whatever the specificity */
}
```

The first statement fixes the order; it must come before the layers are used. This site declares its layers inline in the HTML for exactly that reason.

## Inheritance

Text-related properties (`color`, `font-*`, `line-height`, `text-align`) inherit from parent to child. Box properties (`margin`, `padding`, `border`, `width`) do not. Use `inherit`, `initial`, `unset` or `revert` to control it explicitly.

## Assignment

1. Read MDN's [Cascade, specificity and inheritance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts).
2. In DevTools, inspect a heading on this site and find which rules are overridden (struck through) and why.
3. Rewrite a stylesheet that uses `!important` so that layers or lower specificity achieve the same result.
