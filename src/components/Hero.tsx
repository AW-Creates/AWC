import { motion } from 'motion/react';
import { ArrowRight, Scan } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import HeroBackground from './HeroBackground';

/* --- Sub-components --- */

function TypingLine({ text, delay, icon }: { text: string; delay: number; icon?: string }) {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(typeInterval);
      }, 20);
      return () => clearInterval(typeInterval);
    }, delay);
    return () => clearTimeout(showTimer);
  }, [text, delay]);

  if (!visible) return <div className="h-5" />;

  return (
    <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      {icon && <span>{icon} </span>}
      {displayText}
      {displayText.length < text.length && <span className="inline-block w-1.5 h-3 bg-brand-primary/60 ml-0.5 animate-pulse" />}
    </motion.p>
  );
}

function WordReveal({ words, className, delay = 0 }: { words: string[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function CountUp({ target, delay: startDelay }: { target: number; delay: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [started, target]);

  return <span className="font-mono text-2xl font-bold text-brand-primary">{count}</span>;
}

function RevenueMachineCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 }); // Slightly stronger tilt
  }, []);

  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="w-full flex justify-end perspective-1000 mt-12 lg:mt-0">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
        transition={{
          opacity: { duration: 0.8, delay: 0.5 },
          scale: { duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 6, delay: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="w-full max-w-md relative z-10"
      >
        <div
          ref={cardRef}
          onMouseLeave={handleMouseLeave}
          className="relative transition-transform duration-300 ease-out w-full"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Ambient Engine Glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-8 bg-brand-primary/20 blur-[60px] rounded-full"
            style={{ transform: 'translateZ(-50px)' }}
          />

          {/* Main Glass Card */}
          <div className="relative glass-morphism rounded-3xl p-6 md:p-8 border-brand-primary/20 shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">

            {/* Header / Status */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/30">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                    <Scan size={14} className="text-brand-accent/80" />
                  </motion.div>
                </div>
                <div>
                  <div className="font-mono text-xs text-brand-primary uppercase tracking-widest font-bold">Revenue Engine</div>
                  <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">System Active</div>
                </div>
              </div>
              <div className="flex gap-1.5 opacity-60">
                <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-brand-primary rounded-full" />
                <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 1.2, delay: 0.2, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-brand-primary rounded-full" />
                <motion.div animate={{ height: [6, 10, 6] }} transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-brand-accent rounded-full" />
              </div>
            </div>

            {/* Core Visualization: The Conversion Funnel */}
            <div className="space-y-4 mb-8">
              {/* Traffic Node */}
              <div className="flex items-center gap-4 group">
                <div className="font-mono text-[10px] text-white/30 uppercase w-16 text-right">Traffic</div>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
                    className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
                  />
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  />
                </div>
                <div className="font-mono text-[10px] font-bold text-white w-12"><CountUp target={1420} delay={1000} />+</div>
              </div>

              {/* Engagement Node */}
              <div className="flex items-center gap-4">
                <div className="font-mono text-[10px] text-brand-primary/50 uppercase w-16 text-right">Engaged</div>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
                    className="absolute inset-y-0 left-0 bg-brand-primary/40 rounded-full"
                  />
                </div>
                <div className="font-mono text-[10px] font-bold text-brand-primary w-12"><CountUp target={68} delay={1200} />%</div>
              </div>

              {/* Conversion Node (The Money) */}
              <div className="flex items-center gap-4">
                <div className="font-mono text-[10px] text-brand-accent uppercase w-16 text-right font-bold">Closed</div>
                <div className="flex-1 h-3 bg-brand-accent/10 rounded-full overflow-hidden relative border border-brand-accent/20 shadow-[0_0_10px_rgba(100,231,158,0.2)]">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "24%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1.4 }}
                    className="absolute inset-y-0 left-0 bg-brand-accent shadow-[0_0_8px_rgba(100,231,158,1)] rounded-full"
                  />
                </div>
                <div className="font-mono text-[10px] font-bold text-brand-accent w-12"><CountUp target={24} delay={1400} />%</div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent mb-6" />

            {/* Bottom Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Projected ROI</div>
                <div className="font-display text-2xl font-bold text-white flex items-end gap-1">
                  <CountUp target={420} delay={1600} /><span className="text-brand-accent text-lg mb-0.5">%</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">New Leads/Mo</div>
                <div className="font-display text-2xl font-bold text-white flex items-end gap-1">
                  +<CountUp target={85} delay={1800} />
                </div>
              </div>
            </div>

            {/* Continuous scanning laser effect */}
            <motion.div
              initial={{ top: '0%', opacity: 0 }}
              animate={{ top: ['0%', '100%', '0%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2 }}
              className="absolute left-0 right-0 h-px bg-brand-accent/50 shadow-[0_0_20px_rgba(100,231,158,0.8)] pointer-events-none z-20"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* --- Main Hero --- */

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center noise-overlay">
      <HeroBackground />

      {/* Ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-brand-primary/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-brand-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-12 items-center">
          {/* Left — Editorial headline (60%) */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-8">
              <span className="archival-label">Pennsylvania's AI-Driven Creative Agency</span>
            </motion.div>

            <div className="space-y-0">
              <h1 className="text-[12vw] md:text-[7vw] lg:text-[5.5vw] font-black leading-[0.85] tracking-tighter uppercase">
                <span className="block text-white/30 line-through decoration-white/10 decoration-2">
                  <WordReveal words={["We", "don't", "build"]} delay={0.3} />
                </span>
                <span className="block text-white/30 line-through decoration-white/10 decoration-2">
                  <WordReveal words={["websites."]} delay={0.55} />
                </span>
              </h1>
              <h1 className="text-[12vw] md:text-[7vw] lg:text-[5.5vw] font-black leading-[0.85] tracking-tighter uppercase mt-2">
                <span className="block text-white">
                  <WordReveal words={["We", "build"]} delay={0.8} />
                </span>
                <motion.span className="block text-brand-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}>
                  <WordReveal words={["revenue"]} delay={1.0} />
                  <motion.span
                    className="inline-block mr-[0.25em]"
                    initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                    animate={{
                      opacity: 1, y: 0, filter: 'blur(0px)',
                      textShadow: ['0 0 20px rgba(197,160,89,0.0)', '0 0 60px rgba(197,160,89,0.5)', '0 0 20px rgba(197,160,89,0.2)'],
                    }}
                    transition={{
                      opacity: { duration: 0.5, delay: 1.1 }, y: { duration: 0.5, delay: 1.1 }, filter: { duration: 0.5, delay: 1.1 },
                      textShadow: { duration: 3, delay: 1.6, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    machines.
                  </motion.span>
                </motion.span>
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-lg md:text-xl text-white/40 max-w-xl mt-8 mb-10 font-light leading-relaxed"
            >
              For PA businesses ready to stop guessing and start growing. We combine AI-driven marketing with scientific design to engineer results — not just pretty pages.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <a href="#audit" className="btn-primary flex items-center gap-3 group text-base">
                Get Free AI Audit
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#work" className="btn-secondary text-base">
                See Our Work
              </a>
            </motion.div>
          </div>

          {/* Right — Animated Revenue Machine UI (40%) */}
          <div className="lg:col-span-2 hidden lg:flex items-center justify-center relative w-full pr-4 xl:pr-8">
            <RevenueMachineCard />
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-brand-primary/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
