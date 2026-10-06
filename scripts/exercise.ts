// Runs one exercise: type-checks its folder (which includes its type
// tests), then runs its tests. Usage: npm run exercise <name>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const exercises = join(root, "exercises");
const bin = (name: string) => join(root, "node_modules", ".bin", name);

const name = process.argv[2];
const available = readdirSync(exercises, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (!name || !existsSync(join(exercises, name, "tsconfig.json"))) {
  console.error(
    `Usage: npm run exercise <name>\nAvailable: ${available.join(", ")}`,
  );
  process.exit(1);
}

let failed = false;
try {
  execFileSync(bin("tsc"), ["-p", join(exercises, name)], { stdio: "inherit" });
  console.log("Types: passing");
} catch {
  failed = true;
  console.error("Types: failing (see above)\n");
}

try {
  execFileSync(
    bin("vitest"),
    ["run", "--config", join(exercises, "vitest.config.ts"), name],
    { stdio: "inherit" },
  );
} catch {
  failed = true;
}

process.exitCode = failed ? 1 : 0;
