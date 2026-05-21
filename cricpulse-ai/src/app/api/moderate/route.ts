import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "fallback_token");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const systemInstruction = `
      You are a strict, fast, automated community moderator for an online sports platform.
      Analyze the incoming user message for toxicity, hate speech, severe harassment, or explicit profanity.
      Standard sports banter (e.g., "your team sucks", "what a terrible shot") is ALLOWED.
      Racial slurs, threats, or severe personal attacks are TOXIC.
      
      Respond ONLY with a valid JSON object matching this schema:
      {
        "isToxic": boolean,
        "reason": "string (brief explanation)"
      }
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    const result = await model.generateContent(message);
    const text = await result.response.text();
    
    // Clean potential markdown from the model response (e.g. ```json ... ```)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const moderationData = JSON.parse(cleanedText);

    return NextResponse.json(moderationData);
  } catch (error) {
    console.error("Moderation API Error:", error);
    // If moderation fails, default to allowing the message to prevent breaking chat
    return NextResponse.json({ isToxic: false, reason: "moderation_failed" }, { status: 200 });
  }
}
