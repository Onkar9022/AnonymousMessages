// src/lib/aiClient.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type AISuggestionOptions = {
  recipientName?: string;
  tone?: "friendly" | "formal" | "casual" | "professional" | "funny";
  length?: "short" | "medium" | "long";
  context?: string;
  count?: number;
};

export async function generateSuggestions(
  promptInput: string,
  opts: AISuggestionOptions = {}
): Promise<string[]> {
  const { tone = "friendly", length = "short", count = 3, context } = opts;

  const system = `You generate short, safe message suggestions.
Always produce EXACTLY ${count} suggestions as a JSON array of strings.`;

  const userPrompt = `
Context: ${context ?? "General"}
Recipient: ${opts.recipientName ?? "recipient"}
Tone: ${tone}
Length: ${length}
Count: ${count}
Task: Generate message suggestions.
`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt + promptInput },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  // ✅ FIXED — only use message.content
  const text = resp.choices?.[0]?.message?.content || "";

  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      return json.map((s) => String(s));
    }
  } catch {
    // fallback
  }

  // ✅ FIXED — typed parameters
  const parts = text
    .split(/\n|###|[-–—•]/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0)
    .slice(0, count);

  return parts.length > 0 ? parts : [text];
}
