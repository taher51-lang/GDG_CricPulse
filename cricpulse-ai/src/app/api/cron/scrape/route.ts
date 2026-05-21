export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import * as admin from "firebase-admin";

export async function GET(req: Request) {
  // Simple auth for the cron job (e.g. check a cron secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Initialize Firebase Admin inside the handler to prevent build-time crashes
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Safely handle private keys even if they are malformed during build
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    }

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY || 'fallback' });
    const db = admin.database();
    // 1. Scrape live cricket scores (Targeting a generic stats page for the demo)
    const url = "https://www.espncricinfo.com/live-cricket-score"; // Target URL
    
    // We use Firecrawl's JSON feature to pull structured telemetry directly
    const scrapeResult = (await firecrawl.scrape(url, {
      formats: ['json'],
      jsonOptions: {
        schema: {
          type: "object",
          properties: {
            batting_team: { type: "string" },
            bowling_team: { type: "string" },
            over_number: { type: "number" },
            ball_number: { type: "number" },
            last_ball_outcome: { type: "string" }, // "DOT", "SINGLE", "BOUNDARY", "WICKET"
            batsman: {
              type: "object",
              properties: { name: { type: "string" }, score: { type: "number" } }
            },
            bowler: {
              type: "object",
              properties: { name: { type: "string" }, death_over_economy: { type: "number" } }
            }
          },
          required: ["batting_team", "over_number", "ball_number"]
        }
      }
    })) as any;

    if (!scrapeResult || !scrapeResult.json) {
      throw new Error("Firecrawl failed to extract match telemetry.");
    }

    const telemetry = scrapeResult.json;

    // 2. Push the scraped structured data into Firebase Realtime DB
    // This instantly triggers all client-side 'onValue' listeners in our Next.js frontend!
    const matchId = "ipl_2026_m45"; // Static for hackathon demo
    const matchRef = db.ref(`live_matches/${matchId}`);
    
    await matchRef.child('current_state').set(telemetry);
    
    // Optionally trigger the Flash-Merch engine in Firestore if a milestone is hit
    if (telemetry.batsman?.score >= 50 && telemetry.batsman?.score < 55) {
      await admin.firestore().collection('flash_offers').add({
        id: `milestone_50_${Date.now()}`,
        title: `${telemetry.batsman.name} just hit 50! Secure his Official Jersey at 15% OFF`,
        expiresAt: Date.now() + 60000 
      });
    }

    return NextResponse.json({ success: true, injected: telemetry });

  } catch (error) {
    console.error("Scraper Cron Error:", error);
    return NextResponse.json({ error: "Telemetry pipeline failed." }, { status: 500 });
  }
}
