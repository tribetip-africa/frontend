import { defaultIndexNowUrls, submitIndexNowUrls } from "@/lib/indexnow";

async function main() {
  const response = await submitIndexNowUrls(defaultIndexNowUrls());

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow submission failed (${response.status}): ${body}`);
  }

  console.log(`IndexNow submission accepted (${response.status}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
