import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
// Errors test last: it exhausts the public profile rate limit for the runner IP.
const tests = [
  "live-cache-test.mjs",
  "live-signup-test.mjs",
  "live-signin-test.mjs",
  "live-errors-test.mjs",
];

console.log("Running live test suite…\n");

for (const script of tests) {
  console.log(`\n=== ${script} ===`);
  const code = await new Promise((resolve) => {
    const child = spawn("node", [path.join(scriptsDir, script)], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", resolve);
  });
  if (code !== 0) process.exit(code);
}

console.log("\nAll live tests passed.");
