const url = process.env.OPEN_BRAIN_CAPTURE_URL?.replace(
  "capture-entry",
  "search-entries",
);

const anonKey = process.env.OPEN_BRAIN_ANON_KEY;

async function main() {
  const query = process.argv.slice(2).join(" ").trim();

  if (!query) {
    console.error('Usage: npm run brain:search -- "search text"');
    process.exit(1);
  }

  const response = await fetch(url!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      query,
      match_count: 5,
    }),
  });

  const data = await response.json();

  console.log("\nOpen Brain Search Results\n");

  if (!data.results?.length) {
    console.log("No matches found.");
    return;
  }

  for (const result of data.results) {
    console.log(`• ${result.content}`);
    console.log(`  similarity: ${result.similarity.toFixed(3)}`);
    console.log("");
  }
}

main();
