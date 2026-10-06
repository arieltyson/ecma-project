// Renders a lesson's build-time HTML. One delegated click listener
// handles every copy button and internal link inside it, rather than a
// listener per element.

import type { MouseEvent } from "react";
import { isModifiedClick, useRouter } from "../router/router.tsx";
import { announce } from "./announce.ts";

const COPIED_MS = 1600;

async function copy(button: HTMLButtonElement) {
  const code = button.parentElement?.querySelector("pre")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(code);
    button.textContent = "Copied";
    announce("Code copied");
  } catch {
    button.textContent = "Select and copy";
    announce("Copy failed. Select the code and copy it.");
  }
  setTimeout(() => {
    button.textContent = "Copy";
  }, COPIED_MS);
}

export function Article({ html }: { readonly html: string }) {
  const { navigate } = useRouter();

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as Element;
    const button = target.closest<HTMLButtonElement>("button[data-copy]");
    if (button) {
      void copy(button);
      return;
    }
    const link = target.closest<HTMLAnchorElement>("a[data-internal]");
    if (link && !isModifiedClick(event)) {
      event.preventDefault();
      navigate(link.getAttribute("href") ?? "/");
    }
  }

  return (
    // The listener only delegates clicks from the links and buttons
    // inside, which are keyboard accessible themselves.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="prose"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
