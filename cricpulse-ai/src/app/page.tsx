"use client";

import React, { useState, useEffect } from "react";
import OverPulse from "@/components/OverPulse";
import GeminiDugout from "@/components/GeminiDugout";
import FlashMerch from "@/components/FlashMerch";
import FanPods from "@/components/FanPods";
import { Activity } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export default function CricPulseDashboard() {
  const [matchData, setMatchData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fallback: If Firebase fails to connect or hangs, unlock the UI after 3 seconds
    const connectionTimeout = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 3000);

    // Listen to the top-level match state for live updates
    // In a real app, 'ipl_2026_m45' would be dynamically fetched based on the current schedule
    const matchRef = ref(realtimeDb, `live_matches/ipl_2026_m45/current_state`);
    const unsubscribe = onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Inject the match_id back into the object for child components to use
        setMatchData({ ...data, match_id: "ipl_2026_m45" });
      } else {
        setMatchData(null);
      }
      setIsLoading(false);
      clearTimeout(connectionTimeout);
    }, (error) => {
      console.error("Firebase connection error:", error);
      setIsLoading(false);
      clearTimeout(connectionTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(connectionTimeout);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <main className="app-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <div className="animate-pulse-glow" style={{ color: 'var(--neon-green)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity /> Connecting to Firebase Realtime Stream...
        </div>
      </main>
    );
  }

  if (!matchData) {
    return (
      <main className="app-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <div className="glass-panel glow-border-blue" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
          <h1 className="text-neon-blue" style={{ fontSize: '32px', marginBottom: '16px' }}>NO LIVE MATCH</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            There is currently no match broadcasting on the telemetry pipeline. 
            The scraper hasn't intercepted any live data for 'ipl_2026_m45'.
          </p>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '14px', textAlign: 'left', color: '#fff' }}>
            <strong>Dev Note:</strong> To start the match simulation, trigger the backend scraper cron job via:
            <br/><br/>
            <code style={{ color: 'var(--neon-green)' }}>curl -X GET http://localhost:3000/api/cron/scrape -H "Authorization: Bearer YOUR_CRON_SECRET"</code>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-grid">
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Header */}
        <header className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-neon-green" style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity className="animate-pulse-glow" /> CRICPULSE AI
            </h1>
            <p className="text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
              Live IPL Dashboard • Decoupled Serverless Engine
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-neon-blue" style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {matchData.batting_team} vs {matchData.bowling_team}
            </div>
            <div style={{ fontSize: '16px', color: '#fff', marginTop: '4px' }}>
              Over: {matchData.over_number}.{matchData.ball_number} • {matchData.batsman?.name} on strike
            </div>
          </div>
        </header>

        {/* Feature 1: Gamified Prediction Engine */}
        <OverPulse matchData={matchData} onDataUpdate={setMatchData} />

        {/* Feature 4: Secure Fan Pods */}
        <FanPods currentFaction={matchData.batting_team || "GT"} />

      </div>

      {/* Feature 2: Gemini Dugout Companion (Side-Car) */}
      <div className="side-panel" style={{ height: '100%' }}>
        <GeminiDugout matchContext={matchData} />
      </div>

      {/* Feature 3: Contextual Flash-Merch Overlay */}
      <FlashMerch matchData={matchData} />
    </main>
  );
}
