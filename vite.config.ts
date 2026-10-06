import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { content } from "./plugins/content.ts";
import { tokens } from "./plugins/tokens.ts";

// Served from https://arieltyson.github.io/ecma-project/.
export const BASE = "/ecma-project/";

export default defineConfig({
  base: BASE,
  plugins: [
    content(),
    tokens(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    target: "es2024",
    manifest: true,
  },
});
