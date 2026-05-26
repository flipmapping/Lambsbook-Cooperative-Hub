import { captureOpenBrainEntry } from "../src/lib/openBrain";

async function main() {
  const content = process.argv.slice(2).join(" ").trim();

  if (!content) {
    console.error('Usage: npm run brain:capture -- "Your memory text here"');
    process.exit(1);
  }

  const result = await captureOpenBrainEntry({
    content,
    type: "development_insight",
    metadata: {
      project: "Lambsbook Cooperative Hub",
      category: "manual_capture",
      confidence: "medium",
    },
    source: "replit-cli",
  });

  console.log("Open Brain capture success:");
  console.log(result);
}

main().catch((error) => {
  console.error("Open Brain capture failed:");
  console.error(error);
  process.exit(1);
});
