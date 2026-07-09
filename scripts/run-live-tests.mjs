import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { isLiveSignupOpen, liveLaunchMode, paystackClientMode } from "./live-helpers.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const mode = await paystackClientMode();

// Errors test last: it exhausts the public profile rate limit for the runner IP.
const tests = [
  "live-cache-test.mjs",
  "live-static-pages-test.mjs",
];

if (isLiveSignupOpen()) {
  tests.push("live-signup-test.mjs", "live-signin-test.mjs");
} else {
  console.log(`Skipping signup/sign-in live tests (launch mode: ${liveLaunchMode()})\n`);
}

tests.push(
  "live-regions-test.mjs",
  "live-tips-test.mjs",
  "live-share-widget-test.mjs",
);

if (mode === "live") {
  tests.push("live-ke-mpesa-e2e-test.mjs");
}

tests.push("live-errors-test.mjs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`Running live test suite (Paystack ${mode})…\n`);

for (let index = 0; index < tests.length; index += 1) {
  const script = tests[index];
  if (index > 0) {
    await sleep(mode === "live" ? 8_000 : 12_000);
  }

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
