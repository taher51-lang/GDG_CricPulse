"use client";

import React, { useState, useEffect } from "react";
import { Zap, Trophy, ShieldAlert, Target } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function OverPulse({ matchData, onDataUpdate }: any) {
  const [streak, setStreak] = useState(1);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const multiplier = streak >= 5 ? 5 : streak >= 3 ? 2 : 1;

  // Real-time Firebase Handshake
  useEffect(() => {
    if (!selectedPrediction) return;
    setResolving(true);

    // Correct path matches the cron job output
    const matchRef = ref(realtimeDb, `live_matches/${matchData.match_id}/current_state/last_ball_outcome`);
    
    // Listen for the actual outcome from the live telemetry stream
    const unsubscribe = onValue(matchRef, (snapshot) => {
      const actualOutcome = snapshot.val();
      
      if (actualOutcome) {
        resolvePrediction(actualOutcome);
      }
    });

    // Fallback Mock for Hackathon Demo
    // If the backend cron job hasn't been fired, we auto-resolve after 3 seconds so the UI doesn't hang
    const demoFallback = setTimeout(() => {
      const outcomes = ["DOT", "SINGLE", "BOUNDARY", "WICKET"];
      const mockOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      resolvePrediction(mockOutcome);
    }, 3500);

    function resolvePrediction(actualOutcome: string) {
      if (selectedPrediction === actualOutcome) {
        setStreak(s => s + 1);
        setLastResult(`SUCCESS! Won ${100 * multiplier} XP`);
      } else {
        setStreak(1);
        setLastResult(`MISSED! It was a ${actualOutcome}`);
      }
      
      setSelectedPrediction(null);
      setResolving(false);
      unsubscribe();
      clearTimeout(demoFallback);
    }

    return () => {
      unsubscribe();
      clearTimeout(demoFallback);
    };
  }, [selectedPrediction, multiplier, matchData.match_id]);

  const predictions = [
    { id: "DOT", label: "Dot Ball", color: "text-muted", icon: <ShieldAlert size={18} /> },
    { id: "SINGLE", label: "Single/Two", color: "text-white", icon: <Target size={18} /> },
    { id: "BOUNDARY", label: "Boundary (4/6)", color: "text-neon-blue", icon: <Zap size={18} /> },
    { id: "WICKET", label: "Wicket", color: "text-neon-red", icon: <Trophy size={18} /> },
  ];

  return (
    <section className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic glow effect based on streak */}
      <div 
        style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', 
          background: multiplier > 1 ? 'var(--neon-green)' : 'var(--neon-blue)',
          boxShadow: multiplier > 1 ? '0 0 15px var(--neon-green)' : 'none',
          transition: 'all 0.3s ease'
        }} 
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 600 }}>The Over Pulse</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#8b949e' }}>Streak Multiplier</span>
          <div className="glow-border-green" style={{ 
            padding: '4px 12px', borderRadius: '20px', background: 'rgba(57, 255, 20, 0.1)',
            fontWeight: 800, fontSize: '18px', color: 'var(--neon-green)'
          }}>
            {multiplier}x
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#fff' }}>Predict outcome for Over {matchData.over_number}, Ball {matchData.ball_number + 1}</p>
        <p style={{ fontSize: '14px', color: 'var(--neon-red)', marginTop: '4px' }}>{lastResult}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', perspective: '1000px' }}>
        {predictions.map(p => (
          <motion.button
            key={p.id}
            disabled={!!selectedPrediction || resolving}
            onClick={() => setSelectedPrediction(p.id)}
            whileHover={{ scale: 1.05, rotateX: 10, rotateY: -10, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: selectedPrediction === p.id ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${selectedPrediction === p.id ? 'var(--neon-blue)' : 'rgba(255,255,255,0.1)'}`,
              padding: '16px',
              borderRadius: '12px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: (selectedPrediction || resolving) ? 'not-allowed' : 'pointer',
              boxShadow: selectedPrediction === p.id ? '0 0 15px rgba(0,240,255,0.2)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              opacity: (selectedPrediction && selectedPrediction !== p.id) ? 0.5 : 1,
              transformStyle: 'preserve-3d'
            }}
          >
            <span className={p.color}>{p.icon}</span>
            <span style={{ fontWeight: 500 }}>{p.label}</span>
          </motion.button>
        ))}
      </div>

      {resolving && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--neon-blue)' }} className="animate-pulse-glow">
          Resolving state via Firebase Realtime Streams...
        </div>
      )}
    </section>
  );
}
