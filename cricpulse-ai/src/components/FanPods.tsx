"use client";

import React, { useState, useRef, useEffect } from "react";
import { Users, ShieldCheck, Send } from "lucide-react";

export default function FanPods({ currentFaction }: { currentFaction: string }) {
  const [messages, setMessages] = useState([
    { id: '1', user: 'GT_Fan_99', text: 'Gill is looking dangerous tonight!', moderated: false },
    { id: '2', user: 'CrickNerd', text: 'Need a big over here to release pressure.', moderated: false },
    { id: '3', user: 'ToxicTroll', text: '[Message removed by Auto-Moderator]', moderated: true },
  ]);
  const [input, setInput] = useState("");
  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const messageText = input;
    setInput(""); // Clear input early for better UX

    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      
      const { isToxic } = await response.json();
      
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          user: 'You', 
          text: isToxic ? '[Message removed by Auto-Moderator]' : messageText, 
          moderated: isToxic 
        }
      ]);
    } catch (error) {
      console.error("Moderation check failed", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '350px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users className="text-neon-red" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{currentFaction} Fan Pod</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="var(--neon-green)" />
              Auto-Moderated Environment
            </p>
          </div>
        </div>
        <div style={{ background: 'rgba(255, 0, 85, 0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: 'var(--neon-red)', border: '1px solid var(--neon-red)' }}>
          12.4k Live
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
        {messages.map(m => (
          <div key={m.id} style={{
            background: m.moderated ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            padding: '10px 14px',
            borderRadius: '8px',
            borderLeft: m.moderated ? '3px solid var(--text-muted)' : `3px solid ${m.user === 'You' ? 'var(--neon-blue)' : 'var(--neon-red)'}`
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              {m.user}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: m.moderated ? 'var(--text-muted)' : '#fff',
              fontStyle: m.moderated ? 'italic' : 'normal'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endOfChatRef} />
      </div>

      {/* Input */}
      <div style={{ marginTop: '16px' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your banter safely... (try typing 'idiot')" 
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--neon-red)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button 
            type="submit"
            style={{
              background: 'var(--neon-red)',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
