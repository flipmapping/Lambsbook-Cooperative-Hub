export async function captureOpenBrainEntry(params: {
  content: string;
  type?: string;
  metadata?: Record<string, unknown>;
  source?: string;
}) {
  const url = process.env.OPEN_BRAIN_CAPTURE_URL;
  const anonKey = process.env.OPEN_BRAIN_ANON_KEY;

  if (!url) {
    throw new Error("Missing OPEN_BRAIN_CAPTURE_URL");
  }

  if (!anonKey) {
    throw new Error("Missing OPEN_BRAIN_ANON_KEY");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      content: params.content,
      type: params.type ?? "development_insight",
      metadata: params.metadata ?? {},
      source: params.source ?? "replit-manual",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Open Brain capture failed: ${data?.error ?? "Unknown error"}`
    );
  }

  return data;
}