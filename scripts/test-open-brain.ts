import { captureOpenBrainEntry } from "../src/lib/openBrain";

async function main() {
  const result = await captureOpenBrainEntry({
    content:
      "Development insight: Replit is now connected to the Open Brain capture pipeline for Lambsbook project memory.",
    type: "development_insight",
    metadata: {
      project: "Lambsbook Cooperative Hub",
      category: "integration",
      confidence: "high",
    },
    source: "replit-test",
  });

  console.log("Open Brain capture success:");
  console.log(result);
}

main().catch((error) => {
  console.error("Open Brain capture test failed:");
  console.error(error);
  process.exit(1);
});
