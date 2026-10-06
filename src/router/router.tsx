// A small client-side router on the History API. Navigations push a
// history entry and render the next route inside a transition, so the
// current page stays on screen while a lesson chunk loads. Each entry
// remembers its scroll position, which is restored on back and forward.
// After a navigation, focus moves to the new page's heading so screen
// readers announce it.

import {
  createContext,
  startTransition,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { href, matchRoute, type Route } from "./routes.ts";

interface Location {
  readonly pathname: string;
  readonly hash: string;
  /** Why this location is current, which decides scroll and focus. */
  readonly cause: "initial" | "push" | "pop";
}

interface HistoryState {
  readonly scrollY?: number;
}

interface RouterValue {
  readonly route: Route;
  readonly location: Location;
  readonly navigate: (url: string) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function useRouter(): RouterValue {
  const value = use(RouterContext);
  if (!value) throw new Error("useRouter must be used inside <Router>");
  return value;
}

function parse(url: string, cause: Location["cause"]): Location {
  const { pathname, hash } = new URL(url, "https://placeholder.invalid");
  return { pathname, hash, cause };
}

function readScroll(state: unknown): number {
  const scrollY = (state as HistoryState | null)?.scrollY;
  return typeof scrollY === "number" ? scrollY : 0;
}

export function focusPageHeading(): void {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

export function Router({
  url,
  children,
}: {
  readonly url: string;
  readonly children: ReactNode;
}) {
  const [location, setLocation] = useState(() => parse(url, "initial"));
  const restoreTo = useRef(0);
  const currentPathname = useRef(location.pathname);

  useEffect(() => {
    history.scrollRestoration = "manual";
    function onPopState(event: PopStateEvent) {
      const next = parse(window.location.href, "pop");
      if (next.pathname === currentPathname.current) {
        // A fragment link on the same page: the document is unchanged.
        if (next.hash) {
          document
            .getElementById(decodeURIComponent(next.hash.slice(1)))
            ?.scrollIntoView();
        }
        return;
      }
      restoreTo.current = readScroll(event.state);
      startTransition(() => setLocation(next));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    currentPathname.current = location.pathname;
    if (location.cause === "initial") return;
    if (location.cause === "pop") {
      window.scrollTo(0, restoreTo.current);
    } else if (location.hash) {
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    focusPageHeading();
  }, [location]);

  function navigate(to: string) {
    const next = parse(to, "push");
    if (next.pathname === location.pathname && next.hash === location.hash) {
      return;
    }
    const state: HistoryState = { scrollY: window.scrollY };
    history.replaceState(state, "");
    history.pushState(null, "", to);
    startTransition(() => setLocation(next));
  }

  const value: RouterValue = {
    route: matchRoute(location.pathname),
    location,
    navigate,
  };
  return <RouterContext value={value}>{children}</RouterContext>;
}

/** True when the browser should handle the click itself. */
export function isModifiedClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  readonly to: Route;
  readonly hash?: string;
};

export function Link({ to, hash, onClick, children, ...props }: LinkProps) {
  const { navigate, route } = useRouter();
  const url = href(to) + (hash ? `#${hash}` : "");
  const current = href(route) === href(to) && !hash;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (isModifiedClick(event) || props.target) return;
    event.preventDefault();
    navigate(url);
  }

  return (
    <a
      href={url}
      aria-current={current ? "page" : undefined}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
