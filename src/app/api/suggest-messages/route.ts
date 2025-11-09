import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { genAI } from "@/lib/geminiClient";
import { suggestions as LOCAL_SUGGESTIONS } from "@/data/suggestions";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
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

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text() ?? "";
      const aiSuggestions = text.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 4);

      return NextResponse.json({ success: true, suggestions: aiSuggestions });
    } catch (error) {
      console.warn("⚠️ Gemini unavailable → fallback suggestions", error);
      const fallback = LOCAL_SUGGESTIONS.sort(() => Math.random() - 0.5).slice(0, 4);
      return NextResponse.json({ success: true, suggestions: fallback });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
