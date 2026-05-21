import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// We require the API key in the Vercel process environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "fallback_token_for_dev");

export async function POST(req: Request) {
  try {
    const { prompt, matchContext } = await req.json();

    // 1. We construct a secure system instruction wrapper encapsulating the real-time context
    const systemInstruction = `
      You are an elite, highly-analytical, and slightly cheeky cricket tactician in the 'Gemini Dugout'.
      You are analyzing a live IPL match. Provide brief, data-heavy, engaging responses (max 2-3 sentences).
      
      CURRENT LIVE CONTEXT:
      - Batting: ${matchContext.batting_team} vs Bowling: ${matchContext.bowling_team}
      - Over: ${matchContext.over_number}.${matchContext.ball_number}
      - Batsman on strike: ${matchContext.batsman.name} (Score: ${matchContext.batsman.score})
      - Bowler: ${matchContext.bowler.name} (Death Over Economy: ${matchContext.bowler.death_over_economy})
    `;

    // 2. Initialize the model (using gemini-1.5-flash for maximum sub-second responsiveness)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    // 3. Execute the serverless generation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini Edge API Error:", error);
    return NextResponse.json(
      { error: "Failed to process tactical analysis." },
      { status: 500 }
    );
  }
}
