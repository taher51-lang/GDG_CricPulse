"use client";

import React, { useState, useEffect } from "react";
import { Tag, ShoppingCart, Timer } from "lucide-react";

export default function FlashMerch({ matchData }: any) {
  const [offer, setOffer] = useState<{ id: string, title: string, expiresAt: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Simulate automated state monitor listening for match milestone events
  useEffect(() => {
    // Check for Shubman Gill hitting a milestone
    if (matchData.batsman.name === "Shubman Gill" && matchData.batsman.score >= 50 && matchData.batsman.score < 55) {
      if (!offer) {
        // Trigger offer! (In production, this is a Firestore /flash_offers snapshot listener)
        setOffer({
          id: "sg_50_jersey",
          title: "Shubman Gill just hit 50! Secure his Official GT Jersey at 15% OFF",
          expiresAt: Date.now() + 60000 // 60 seconds
        });
      }
    }
  }, [matchData, offer]);

  useEffect(() => {
    if (!offer) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((offer.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        // Offer locked down securely
        setTimeout(() => setOffer(null), 2000); 
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [offer]);

  if (!offer) return null;

  return (
    <div 
      className="animate-slide-up"
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '500px'
      }}
    >
      <div 
        className="glass-panel glow-border-red"
        style={{
          padding: '20px',
          background: 'rgba(255, 0, 85, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--neon-red)', padding: '8px', borderRadius: '50%', color: '#000' }}>
            <Tag size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>FLASH DROP DETECTED</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{offer.title}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft === 0 ? 'var(--text-muted)' : 'var(--neon-red)' }}>
            <Timer size={16} />
            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '18px' }}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
            <span style={{ fontSize: '12px' }}>REMAINING</span>
          </div>

          <button
            disabled={timeLeft === 0}
            style={{
              background: timeLeft === 0 ? '#333' : 'var(--neon-red)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              color: timeLeft === 0 ? '#888' : '#fff',
              fontWeight: 700,
              cursor: timeLeft === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: timeLeft === 0 ? 'none' : '0 0 15px rgba(255,0,85,0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingCart size={16} />
            {timeLeft === 0 ? 'EXPIRED' : 'CLAIM NOW'}
          </button>
        </div>
      </div>
    </div>
  );
}
