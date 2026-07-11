import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WEB_BASE, waitForServices } from "./live-helpers.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

await waitForServices();

console.log("1. SEO audit (robots, sitemap, llms, metadata, JSON-LD)");
const result = spawnSync("npx", ["tsx", path.join(scriptsDir, "seo-audit.ts")], {
  stdio: "inherit",
  env: {
    ...process.env,
    SEO_AUDIT_BASE_URL: WEB_BASE,
  },
});

if (result.status !== 0) {
  console.error("FAIL: SEO audit");
  process.exit(result.status ?? 1);
}

console.log("PASS: SEO audit");
