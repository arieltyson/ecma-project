// Inlines the cascade layer order and the design tokens in index.html.
// The order must come before any stylesheet: a layer's priority is set
// where it first appears, and component stylesheets load before
// base.css in the bundle.

import type { Plugin } from "vite";
import { cssVariables } from "../src/design/tokens.ts";

export const LAYERS = "@layer reset, base, components, utilities;";

export function tokens(): Plugin {
  return {
    name: "ecma:tokens",
    transformIndexHtml(html) {
      return html.replace(
        '<style id="tokens"></style>',
        `<style id="tokens">\n${LAYERS}\n${cssVariables()}</style>`,
      );
    },
  };
}
