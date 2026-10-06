// Every page on the site is one of these routes. `matchRoute` parses a
// pathname into a route and `href` builds the canonical URL for one, so
// links are typed and always carry the trailing slash GitHub Pages
// serves directories with.

export const ABOUT_TABS = [
  "overview",
  "accessibility",
  "privacy",
  "license",
] as const;

export type AboutTab = (typeof ABOUT_TABS)[number];

export type Route =
  | { readonly name: "home" }
  | { readonly name: "path"; readonly pathId: string }
  | { readonly name: "course"; readonly courseId: string }
  | {
      readonly name: "lesson";
      readonly courseId: string;
      readonly slug: string;
    }
  | { readonly name: "about"; readonly tab: AboutTab }
  | { readonly name: "not-found" };

export const BASE: string = import.meta.env.BASE_URL;

function isAboutTab(value: string): value is AboutTab {
  return (ABOUT_TABS as readonly string[]).includes(value);
}

export function matchRoute(pathname: string): Route {
  const relative = pathname.startsWith(BASE)
    ? pathname.slice(BASE.length)
    : pathname.replace(/^\//, "");
  const segments = relative.split("/").filter(Boolean).map(decodeURIComponent);

  switch (segments[0]) {
    case undefined:
      return { name: "home" };
    case "paths":
      if (segments.length === 2 && segments[1]) {
        return { name: "path", pathId: segments[1] };
      }
      break;
    case "courses":
      if (segments.length === 2 && segments[1]) {
        return { name: "course", courseId: segments[1] };
      }
      break;
    case "lessons":
      if (segments.length === 3 && segments[1] && segments[2]) {
        return { name: "lesson", courseId: segments[1], slug: segments[2] };
      }
      break;
    case "about": {
      const tab = segments[1] ?? "overview";
      if (segments.length <= 2 && isAboutTab(tab)) {
        return { name: "about", tab };
      }
      break;
    }
  }
  return { name: "not-found" };
}

function path(route: Route): string {
  switch (route.name) {
    case "home":
      return "";
    case "path":
      return `paths/${route.pathId}/`;
    case "course":
      return `courses/${route.courseId}/`;
    case "lesson":
      return `lessons/${route.courseId}/${route.slug}/`;
    case "about":
      return route.tab === "overview" ? "about/" : `about/${route.tab}/`;
    case "not-found":
      return "404.html";
  }
}

export function href(route: Route): string {
  return BASE + path(route);
}

export function sameRoute(a: Route, b: Route): boolean {
  return href(a) === href(b);
}
