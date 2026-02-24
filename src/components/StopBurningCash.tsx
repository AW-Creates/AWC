import React, { useState, useRef } from 'react';
import { motion, useTime, useTransform } from 'motion/react';
import { ShieldCheck, Zap, Lock, CreditCard } from 'lucide-react';

function ScannableCard({ children, codeContent, isOptimized = false }: { children: React.ReactNode, codeContent: string, isOptimized?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative group cursor-crosshair"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Card (Visual) */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Code Overlay (Revealed by Scanner) */}
      <motion.div 
        animate={{ 
          clipPath: isHovered ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' 
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm rounded-2xl p-6 font-mono text-[10px] text-brand-primary/70 overflow-hidden border border-brand-primary/30"
      >
        <div className="opacity-50">
          <pre className="whitespace-pre-wrap">
            {codeContent}
          </pre>
        </div>
      </motion.div>

      {/* Scanner Line (Only on Hover) */}
      {isHovered && (
        <motion.div 
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 w-0.5 bg-brand-primary z-30 shadow-[0_0_15px_rgba(197,160,89,1)]"
        />
      )}
    </div>
  );
}

export default function StopBurningCash() {
  const time = useTime();
  const scannerX = useTransform(time, (t) => `${(t / 40) % 150 - 25}%`);

  const badCode = `// CRITICAL VULNERABILITY DETECTED
// Path: /api/v1/checkout
function processPayment(data) {
  const { card, amount } = data;
  // Warning: Plaintext storage
  db.save('logs', { card }); 
  
  // Latency: 4.2s (Unoptimized)
  setTimeout(() => {
    return gateway.charge(amount);
  }, 4200);
}

/* 
  CONVERSION LEAK: 
  - No SSL verification
  - Missing form validation
  - 67% bounce rate predicted
*/`;

  const goodCode = `// PERFORMANCE OPTIMIZED
// Path: /api/v2/secure-checkout
import { encrypt } from '@awc/security';

export async function handlePayment(req) {
  const session = await stripe.sessions.create({
    payment_method_types: ['card'],
    line_items: req.items,
    success_url: '/success',
  });

  // Latency: 45ms (Edge Optimized)
  // Security: Level 4 PCI Compliant
  return { url: session.url };
}

/* 
  GROWTH ENGINE:
  - 4.2x Conversion Lift
  - Real-time fraud detection
  - 0% Data leakage
*/`;

  return (
    <section className="py-32 bg-brand-dark text-white overflow-hidden relative">
      {/* Background Code Snippets */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none font-mono text-[10px] leading-relaxed select-none">
        <div className="grid grid-cols-2 gap-8 p-8">
          <div>
            {`// compiled preview * scanner demo /* generated for visual e.
- not executed */ const SCAN_WIDTH = 8; const TRANSITION = 0.05;
t MAX_PARTICLES = 2500;+ const TRANSITION = 0.05; function cla
a, b) { return Math.max(a, Math.min(b, h)); } function lerp(
t) { return a + (b - a) * t; } const now = () => performance
); function rng(min, max) { return Math.random() * (max - min
in; } class Particle0 { constructor(x, y, vx, vy, r, a) { thi
x; this.y = y; this.vx = vx; this.vy = vy; this.r = r; this.a
p(dt) { this.x += this.vx * dt; this.y += this.vy * dt; } }`}
          </div>
          <div>
            {`// compiled preview * scanner demo /* generated for visual e.
- not executed */ const SCAN_WIDTH = 8; const TRANSITION = 0.05;
t MAX_PARTICLES = 2500;+ const TRANSITION = 0.05; function cla
a, b) { return Math.max(a, Math.min(b, h)); } function lerp(
t) { return a + (b - a) * t; } const now = () => performance
); function rng(min, max) { return Math.random() * (max - min
in; } class Particle0 { constructor(x, y, vx, vy, r, a) { thi
x; this.y = y; this.vx = vx; this.vy = vy; this.r = r; this.a
p(dt) { this.x += this.vx * dt; this.y += this.vy * dt; } }`}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
        >
          Stop Burning Cash on <br />
          <span className="text-brand-accent drop-shadow-[0_0_20px_rgba(191,255,7,0.3)]">Bad Websites</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-light mb-20"
        >
          We scan your business and reveal the hidden code to high-converting websites—without the expensive trial and error.
        </motion.p>

        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          {/* Global Scanner Line (Visual only) */}
          <motion.div 
            style={{ left: scannerX }}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-primary to-transparent z-40 opacity-30 hidden lg:block"
          />

          {/* Left Card - "Bad" State */}
          <ScannableCard codeContent={badCode}>
            <div className="relative w-72 h-44 bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="w-10 h-8 bg-white/10 rounded" />
                <div className="text-white/20 font-mono text-[10px]">DEBIT</div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-2 w-full bg-white/5 rounded" />
                <div className="h-2 w-2/3 bg-white/5 rounded" />
              </div>
              <div className="flex justify-between items-end">
                <div className="text-white/20 font-mono text-[8px]">0000 0000 0000 0000</div>
                <div className="text-white/40 font-bold text-[10px] italic">Elon Musk</div>
              </div>
              {/* Red Glow for "Bad" */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
            </div>
          </ScannableCard>

          {/* Right Card - "Optimized" State */}
          <ScannableCard codeContent={goodCode} isOptimized>
            <div className="relative w-80 h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Stripe-like Mesh Gradient */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--color-brand-accent)_0%,transparent_50%)] blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--color-brand-primary)_0%,transparent_50%)] blur-3xl translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-auto">
                  <div className="flex items-center gap-2">
                    <Zap size={20} className="text-brand-accent" />
                    <span className="font-bold text-sm tracking-tight">stripe</span>
                  </div>
                  <div className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Esther Howard</div>
                </div>
                
                <div className="mt-auto">
                  <div className="text-xl font-mono tracking-[0.2em] mb-4">1234 5678 9000 0000</div>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30" />
                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20" />
                    </div>
                    <ShieldCheck size={20} className="text-brand-accent opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </ScannableCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <button className="btn-primary group">
            <span className="flex items-center gap-2">
              Scan My Website <Zap size={18} className="group-hover:fill-black transition-all" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
