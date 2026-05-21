"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Cpu } from "lucide-react";

export default function GeminiDugout({ matchContext }: any) {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hey! I'm your Gemini Dugout tactician. Ask me anything about the match." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Real API call to the Vercel Edge Function wrapping Gemini
    try {
      const response = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, matchContext }) 
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Comms link disrupted. Tactical analysis offline." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Cpu className="text-neon-blue animate-pulse-glow" />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Gemini Dugout</h2>
          <p style={{ fontSize: '12px', color: 'var(--neon-green)' }}>Live AI Injection Active</p>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: m.role === 'user' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: m.role === 'user' ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 16px',
            borderRadius: m.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {m.content}
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', gap: '4px', padding: '12px' }} className="text-neon-blue">
            <span className="animate-pulse-glow">.</span>
            <span className="animate-pulse-glow" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-pulse-glow" style={{ animationDelay: '0.4s' }}>.</span>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for tactical insights..." 
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '12px 20px',
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--neon-blue)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            style={{
              background: 'var(--neon-blue)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              opacity: input.trim() ? 1 : 0.5
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
