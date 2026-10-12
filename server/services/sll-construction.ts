type SllMode = "GENERAL_ENGLISH" | "IELTS_PREPARATION";
type SupportLanguage = "en" | "vi" | "zh";
type Level = "basic" | "developed" | "extended" | "analytical";

export interface SllGenerationInput {
  prompt: string;
  mode: SllMode;
  level: Level;
  supportLanguage: SupportLanguage;
}

export interface SllGenerationOutput {
  model_answer: string;
  semantic_tree: Array<{
    idea: string;
    relationship: string;
    meaning_support: string;
  }>;
  meaning_support: string;
  adaptation_prompt: string;
}

const supportNames: Record<SupportLanguage, string> = {
  en: "English",
  vi: "Vietnamese",
  zh: "Chinese",
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    model_answer: { type: "STRING" },
    semantic_tree: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          idea: { type: "STRING" },
          relationship: { type: "STRING" },
          meaning_support: { type: "STRING" },
        },
        required: ["idea", "relationship", "meaning_support"],
      },
    },
    meaning_support: { type: "STRING" },
    adaptation_prompt: { type: "STRING" },
  },
  required: ["model_answer", "semantic_tree", "meaning_support", "adaptation_prompt"],
};

export async function generateSllConstruction(
  input: SllGenerationInput,
): Promise<SllGenerationOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("SLL_AI_NOT_CONFIGURED");

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const systemInstruction = [
    "You are an English-learning demonstration assistant.",
    "Generate one useful English model answer and a compact semantic tree explaining how its meaning, ideas, relationships, and reasoning connect.",
    "Write meaning_support in the requested support language. Keep model_answer in English.",
    "For IELTS preparation, respond to the supplied task as a learning example. Never claim an official score, examiner judgment, or guaranteed band.",
    "Be supportive and age-appropriate. Do not request personal or sensitive information.",
    "Return only the requested structured data.",
  ].join(" ");

  const requestText = JSON.stringify({
    mode: input.mode,
    level: input.level,
    learner_task: input.prompt,
    meaning_support_language: supportNames[input.supportLanguage],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: requestText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          maxOutputTokens: 1400,
          temperature: 0.4,
        },
      }),
      signal: AbortSignal.timeout(25000),
    },
  );

  if (!response.ok) throw new Error(`GEMINI_HTTP_${response.status}`);

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "").join("").trim();
  if (!raw || raw.length > 12000) throw new Error("GEMINI_OUTPUT_INVALID");

  let value: SllGenerationOutput;
  try {
    value = JSON.parse(raw) as SllGenerationOutput;
  } catch {
    throw new Error("GEMINI_OUTPUT_INVALID");
  }

  if (
    typeof value.model_answer !== "string" || value.model_answer.length > 4000 ||
    !Array.isArray(value.semantic_tree) ||
    value.semantic_tree.length < 2 || value.semantic_tree.length > 8 ||
    value.semantic_tree.some((node) =>
      !node || typeof node.idea !== "string" ||
      typeof node.relationship !== "string" ||
      typeof node.meaning_support !== "string"
    ) ||
    typeof value.meaning_support !== "string" ||
    typeof value.adaptation_prompt !== "string"
  ) {
    throw new Error("GEMINI_OUTPUT_INVALID");
  }

  return value;
}
