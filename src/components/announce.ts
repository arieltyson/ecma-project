// Speaks a short status message through the page's polite live region,
// for feedback that has no visible focus change.

export const ANNOUNCER_ID = "announcer";

export function announce(message: string): void {
  const region = document.getElementById(ANNOUNCER_ID);
  if (!region) return;
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
