import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";

import { openai } from "@/lib/openaiClient";
import { genAI } from "@/lib/geminiClient";

import { suggestions as LOCAL_SUGGESTIONS } from "@/data/suggestions";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const recentTexts = (user.messages || [])
      .slice(-5)
      .map((m) => m.content)
      .join("\n");

    const prompt = `
Generate 4 short supportive, friendly, anonymous messages.
Tone: chill, relatable, comforting (NO cringe or flirty tone).
Return each message on a NEW LINE. No numbers.

Context:
${recentTexts || "No previous messages."}
`;

    /* ============================================================
       1) TRY OPENAI → Best reliability, best latency
    ============================================================ */
    try {
      console.log("🔵 Trying OpenAI model: gpt-4o-mini");

      const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        n: 1,
        temperature: 0.7,
      });

      const text = result.choices[0]?.message?.content ?? "";
      const aiSuggestions = text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);

      if (aiSuggestions.length > 0) {
        return NextResponse.json({ success: true, suggestions: aiSuggestions });
      }

      throw new Error("OpenAI returned empty response");
    } catch (err) {
      console.warn("⚠️ OpenAI failed → switching to Gemini", err);
    }

    /* ============================================================
       2) TRY GEMINI (v1 models only)
    ============================================================ */
    try {
      console.log("🟡 Trying Gemini models...");

      const GEMINI_MODELS = [
        "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
      ].filter((m) => m);

      let result: any = null;

      for (const modelName of GEMINI_MODELS) {
        try {
          console.log("Trying Gemini:", modelName);

          const model = genAI.getGenerativeModel({
            model: modelName,
          });

          result = await model.generateContent(prompt);
          break;
        } catch (err) {
          console.warn("❌ Gemini model failed:", modelName, err);
        }
      }

      if (!result) throw new Error("All Gemini models failed");

      const text =
        result.response?.text?.() ??
        result.response?.candidates?.[0]?.content ??
        "";

      const aiSuggestions = text
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 4);

      if (aiSuggestions.length > 0) {
        return NextResponse.json({ success: true, suggestions: aiSuggestions });
      }

      throw new Error("Gemini returned empty response");
    } catch (err) {
      console.warn("⚠️ Gemini failed → final fallback", err);
    }

    /* ============================================================
       3) FINAL FALLBACK → LOCAL SUGGESTIONS
    ============================================================ */
    console.log("🟢 Using local fallback messages");

    const fallback = LOCAL_SUGGESTIONS.sort(() => Math.random() - 0.5).slice(0, 4);

    return NextResponse.json({ success: true, suggestions: fallback });
  } catch (err) {
    console.error("Server Error:", err);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
