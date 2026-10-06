---
title: TypeScript Patterns for React
summary: Type props, children, events, refs, context, generic components and polymorphic components precisely.
minutes: 30
objectives:
  - Type props with interfaces, children with ReactNode and events with React's event types.
  - Extend native element props with ComponentProps.
  - Write generic components such as typed lists and selects.
  - Model mutually exclusive props with discriminated unions.
quiz:
  - question: Which type should a component accept for its `children`?
    options:
      - "`JSX.Element`"
      - "`ReactNode`"
      - "`string`"
    answer: 1
    explanation: ReactNode covers everything React can render, including strings, numbers, null and arrays. JSX.Element allows only a single element.
  - question: How do you accept every attribute a native button supports, plus your own props?
    options:
      - Copy them into an interface.
      - "Intersect with `ComponentProps<\"button\">` and spread the rest onto the element."
      - Use `any`.
    answer: 1
    explanation: ComponentProps gives the exact props React accepts for that element, including aria attributes and event handlers.
  - question: A Select component should infer its option type from the `options` prop and type `onChange` accordingly. What do you use?
    options:
      - "A generic component, `function Select<T>(props: SelectProps<T>)`."
      - "`any` for the options."
      - Overloads for every possible type.
    answer: 0
    explanation: Function components can be generic. TypeScript infers T from the props at each use.
resources:
  - title: React, Using TypeScript
    url: https://react.dev/learn/typescript
  - title: React TypeScript Cheatsheet
    url: https://react-typescript-cheatsheet.netlify.app/
---

React's types live in `@types/react`. A handful of patterns cover almost every component you will write.

## Props and children

```tsx
import type { ReactNode } from "react";

interface CardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

export function Card({ title, subtitle, actions, children }: CardProps) {
  return (
    <section>
      <header>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
        {actions}
      </header>
      {children}
    </section>
  );
}
```

Use `ReactNode` for anything renderable. Avoid the old `React.FC` type; annotate the props parameter instead.

## Events

Inline handlers are typed by context. Standalone handlers use React's event types, parameterised by the element:

```tsx
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

export function Composer({ onSend }: { readonly onSend: (text: string) => void }) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    console.log(event.target.value.length);
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get("text");
    if (typeof text === "string" && text.trim()) onSend(text.trim());
  }
  return (
    <form onSubmit={handleSubmit}>
      <textarea name="text" onKeyDown={handleKeyDown} onChange={handleChange} aria-label="Message" />
    </form>
  );
}
```

`currentTarget` is the element the handler is attached to, typed precisely. `target` is whatever was actually clicked, which might be a child.

## Extending native elements

Accept everything a native element supports with `ComponentProps<"button">`, add your own props, and spread the rest:

```tsx
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  readonly variant?: "primary" | "secondary";
};

export function Button({ variant = "secondary", className, ...rest }: ButtonProps) {
  return <button className={`button button-${variant} ${className ?? ""}`} {...rest} />;
}
```

`ComponentProps<typeof Card>` gets the props of one of your own components.

## Generic components

A component can be generic, so its callback types follow its data:

```tsx
interface SelectProps<T> {
  readonly label: string;
  readonly options: readonly T[];
  readonly value: T;
  readonly getKey: (option: T) => string;
  readonly getLabel: (option: T) => string;
  readonly onChange: (option: T) => void;
}

export function Select<T>({ label, options, value, getKey, getLabel, onChange }: SelectProps<T>) {
  return (
    <label>
      {label}
      <select
        value={getKey(value)}
        onChange={(e) => {
          const next = options.find((o) => getKey(o) === e.target.value);
          if (next !== undefined) onChange(next);
        }}
      >
        {options.map((o) => (
          <option key={getKey(o)} value={getKey(o)}>
            {getLabel(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

const QUALITIES = [{ id: "720p", fps: 30 }, { id: "1080p", fps: 60 }] as const;

export function QualityPicker() {
  return (
    <Select
      label="Quality"
      options={QUALITIES}
      value={QUALITIES[0]}
      getKey={(q) => q.id}
      getLabel={(q) => `${q.id}${q.fps}`}
      onChange={(q) => console.log(q.fps)}
    />
  );
}
```

## Mutually exclusive props

When some props only make sense together, use a discriminated union, exactly as for state:

```tsx
type AvatarProps =
  | { readonly kind: "image"; readonly src: string; readonly alt: string }
  | { readonly kind: "initials"; readonly name: string };

export function Avatar(props: AvatarProps) {
  return props.kind === "image" ? (
    <img src={props.src} alt={props.alt} />
  ) : (
    <span aria-hidden="true">{props.name.slice(0, 2).toUpperCase()}</span>
  );
}
```

`<Avatar kind="image" name="x" />` is now a compile error.

## Polymorphic components

Design-system components sometimes render as different elements (`as="a"` or `as="button"`). A simple, type-safe version restricts `as` to a union and picks props accordingly:

```tsx
import type { ComponentProps } from "react";

type LinkOrButton =
  | ({ readonly as: "a" } & ComponentProps<"a">)
  | ({ readonly as: "button" } & ComponentProps<"button">);

export function Action(props: LinkOrButton) {
  if (props.as === "a") {
    const { as: _as, ...rest } = props;
    return <a {...rest} />;
  }
  const { as: _as, ...rest } = props;
  return <button type="button" {...rest} />;
}
```

Fully generic polymorphic components (`as` accepting any element or component) are possible but complex; prefer a small union.

## Assignment

1. Read [Using TypeScript](https://react.dev/learn/typescript) in the React docs.
2. Write a typed `List<T>` component with `items`, `getKey` and a `renderItem` prop, and use it for channels and for clips.
3. Write a `Button` that extends native button props and requires an `aria-label` when it has no text children, using a union type.
