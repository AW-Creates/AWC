import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { Bot, Check, RotateCcw, Send, User } from 'lucide-react';

const conversation = [
  { role: 'agent', text: 'Hi! Tell me what you are building and what you want your website to do.', at: 400 },
  { role: 'customer', text: 'We run a home renovation company. We need a new website that brings in better project inquiries.', at: 2000 },
  { role: 'agent', text: 'A clear service story and a simple inquiry flow would help. Do you need project galleries and a way to qualify leads?', at: 4000 },
  { role: 'customer', text: 'Yes — a project gallery, five service pages, and a form that asks about budget and timing.', at: 6000 },
  { role: 'agent', text: 'For that example scope, here is an illustrative starting range. A real proposal follows a discovery conversation.', at: 8200 },
] as const;

export default function QuoteAgent() {
  const reducedMotion = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const inView = useInView(section, { once: true, amount: 0.2 });
  const [count, setCount] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [replay, setReplay] = useState(0);
  const visibleCount = reducedMotion ? conversation.length : count;
  const quoteVisible = reducedMotion || showQuote;

  useEffect(() => {
    if (!inView || reducedMotion) return;
    const timers = conversation.map((message, index) => window.setTimeout(() => setCount(index + 1), message.at));
    timers.push(window.setTimeout(() => setShowQuote(true), 9600));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, reducedMotion, replay]);

  useEffect(() => {
    // Only scroll the transcript, never the surrounding page.
    if (!reducedMotion && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [visibleCount, quoteVisible, reducedMotion]);

  const restart = () => {
    setCount(0);
    setShowQuote(false);
    setReplay(value => value + 1);
  };

  return (
    <section ref={section} id="agent" className="py-20 md:py-28 relative overflow-hidden scroll-mt-28">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="min-w-0">
            <span className="archival-label text-brand-ink">A clearer starting point</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mt-5 mb-6">Your next project.<br /><span className="text-brand-ink">A better first conversation.</span></h2>
            <p className="text-muted-60 text-base md:text-lg font-light leading-relaxed max-w-lg">See how a few useful questions can turn an open-ended idea into a scope you can discuss.</p>
            <ul className="mt-7 space-y-3 text-sm text-muted-70">
              {['Clarify the outcome', 'Outline the right scope', 'Explore a working investment range'].map(label => (
                <li key={label} className="flex items-start gap-3"><Check size={17} className="text-brand-ink shrink-0 mt-0.5" aria-hidden="true" />{label}</li>
              ))}
            </ul>
            <p className="mt-7 text-xs leading-relaxed text-muted-50 max-w-md">Scripted demo with fictional project details. This is an illustrative estimate, not a live chat or binding quote.</p>
          </div>

          <div className="min-w-0 max-w-full glass-morphism rounded-3xl overflow-hidden border border-ink/10 shadow-[0_20px_80px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between gap-2 px-4 py-4 sm:px-6 border-b border-ink/10">
              <div className="min-w-0 flex items-center gap-3">
                <Bot size={20} className="text-brand-ink shrink-0" aria-hidden="true" />
                <div><h3 className="text-sm font-bold">AWC Quote Agent</h3><p className="text-xs text-muted-50">Illustrative consultation</p></div>
              </div>
              <span className="text-[10px] font-mono text-brand-ink border border-brand-primary/30 rounded-full px-2 py-1 shrink-0">DEMO</span>
            </div>

            <div ref={transcript} tabIndex={0} role="region" aria-label="Example quote conversation" className="h-[400px] overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
              {conversation.slice(0, visibleCount).map((message, index) => (
                <div key={index} className={`flex gap-2 items-start ${message.role === 'customer' ? 'flex-row-reverse' : ''}`}>
                  <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${message.role === 'customer' ? 'bg-ink/10 text-muted-60' : 'bg-brand-primary/15 text-brand-ink'}`} aria-hidden="true">{message.role === 'customer' ? <User size={13} /> : <Bot size={13} />}</span>
                  <div className={`min-w-0 max-w-[88%] rounded-2xl px-3 py-3 text-sm leading-relaxed break-words ${message.role === 'customer' ? 'bg-brand-primary/15 border border-brand-primary/25 rounded-tr-sm' : 'bg-ink/5 border border-ink/10 rounded-tl-sm'}`}>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-muted-50 mb-1">{message.role === 'customer' ? 'Customer' : 'Agent'}</span>
                    {message.text}
                  </div>
                </div>
              ))}
              {inView && !quoteVisible && <p className="text-xs text-muted-50" aria-hidden="true">{visibleCount > 0 && conversation[visibleCount - 1].role === 'agent' ? 'Customer is typing…' : 'Agent is typing…'}</p>}
              {quoteVisible && <div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-4" data-testid="illustrative-quote">
                <p className="text-xs font-semibold text-brand-ink">Illustrative estimate</p>
                <p className="font-display text-2xl sm:text-3xl font-bold mt-2 break-words">$9,800–$12,400</p>
                <p className="text-xs text-muted-60 leading-relaxed mt-3">Example scope: service pages, project gallery and a qualified inquiry flow. Final scope, price and timing require discovery.</p>
              </div>}
            </div>
            <p className="sr-only" role="status" aria-live="polite">{quoteVisible ? 'Illustrative estimate ready: $9,800 to $12,400.' : visibleCount ? `${conversation[visibleCount - 1].role}: ${conversation[visibleCount - 1].text}` : 'Scripted consultation demo ready.'}</p>

            <div className="border-t border-ink/10 p-4 sm:px-6">
              <div className="flex items-center gap-2 rounded-xl bg-ink/5 border border-ink/10 px-3 py-2">
                <input className="min-w-0 w-full bg-transparent text-xs text-muted-60 outline-none" aria-label="Demo composer, messaging unavailable" placeholder="Ask about your project…" disabled />
                <button type="button" disabled aria-label="Send unavailable in this demo" className="p-2 rounded-lg bg-brand-primary/20 text-brand-ink shrink-0"><Send size={15} aria-hidden="true" /></button>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-2 mt-3 text-[10px] text-muted-50">
                <span>Demo only · Messages are not sent</span>
                {!reducedMotion && <button type="button" onClick={restart} className="inline-flex items-center gap-1 min-h-8 text-muted-70 hover:text-brand-ink" aria-label="Replay example conversation"><RotateCcw size={12} aria-hidden="true" />Replay</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
