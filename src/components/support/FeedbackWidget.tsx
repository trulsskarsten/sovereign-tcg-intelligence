"use client";

import React, { useState } from 'react';
import { MessageSquare, Send, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    setSubmitError(null);
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      if (res.ok) {
        setSent(true);
        setFeedback("");
        setTimeout(() => { setIsOpen(false); setSent(false); }, 3000);
      } else {
        setSubmitError('En feil oppstod. Prøv igjen senere.');
      }
    } catch (err) {
      setSubmitError('Nettverksfeil. Sjekk din tilkobling.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      {isOpen ? (
        <div className="glass-panel w-80 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#005bd3]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#1a1a1a]">Sovereign Support</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-[#6d7175] hover:text-[#1a1a1a]">
                <X size={18} />
             </button>
          </div>

          {sent ? (
            <div className="text-center py-8 space-y-4">
               <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <Send size={24} className="text-[#108043]" />
               </div>
               <p className="text-xs font-bold text-[#1a1a1a]">Takk for din tilbakemelding!</p>
               <p className="text-[10px] text-[#6d7175]">Vi har mottatt din melding og svarer deg så snart som mulig.</p>
            </div>
          ) : (
            <div className="space-y-4">
               <p className="text-[11px] text-[#6d7175] font-medium leading-relaxed">
                 Har du funnet en feil, eller har du forslag til forbedringer? Send oss en melding direkte.
               </p>
               {submitError && (
                 <p className="text-[10px] font-bold text-red-500 bg-red-50 rounded-xl px-3 py-2">{submitError}</p>
               )}
               <textarea 
                 value={feedback}
                 onChange={(e) => setFeedback(e.target.value)}
                 placeholder="Beskriv ditt problem eller ønske..."
                 className="w-full h-32 p-4 bg-white/40 border border-white/80 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-blue-500/5 outline-none resize-none transition-all"
               />
               <button 
                 disabled={sending || !feedback.trim()}
                 onClick={handleSubmit}
                 className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-black text-xs flex items-center justify-center shadow-xl shadow-black/10 hover:bg-black transition-all disabled:opacity-50"
               >
                 {sending ? "Sender..." : "Send til Utvikler"}
               </button>
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 group relative"
        >
          <MessageSquare size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#005bd3] rounded-full border-2 border-white animate-bounce" />
        </button>
      )}
    </div>
  );
}
