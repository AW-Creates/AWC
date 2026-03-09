import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Zap } from 'lucide-react';

export default function AICritique() {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" id="audit">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Glow behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-primary/8 blur-[120px] rounded-full pointer-events-none" />

          {/* Breathing ambient glow wrapper */}
          <div className="relative">
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-primary/10 pointer-events-none"
            />

            <div className={`relative glass-morphism rounded-[2rem] p-8 md:p-14 transition-all duration-500 shadow-[0_20px_80px_rgba(0,0,0,0.4)] ${isFocused ? 'shadow-[0_20px_80px_rgba(197,160,89,0.12)]' : ''
              }`}>
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6"
                >
                  <Zap size={12} className="text-brand-primary" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-primary">Free AI-Powered Audit</span>
                </motion.div>

                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tighter">
                  Find Your Hidden <br />
                  <span className="text-brand-primary">Revenue Leaks</span>
                </h2>

                <p className="text-white/40 text-base md:text-lg mb-10 max-w-lg mx-auto font-light">
                  Paste your URL. Our AI scans your site for conversion killers and shows you exactly where money is being left on the table.
                </p>

                <div className="relative max-w-xl mx-auto">
                  <input
                    id="audit-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="https://yourwebsite.com"
                    aria-label="Enter your website URL for AI analysis"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 pr-36 focus:outline-none focus:border-brand-primary/40 transition-all text-white placeholder:text-white/20 font-light"
                  />
                  <button
                    className="absolute right-2 top-2 bottom-2 bg-brand-primary text-black font-bold px-6 rounded-xl hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all flex items-center gap-2 cursor-pointer text-sm"
                    aria-label="Analyze website"
                  >
                    <Search size={16} />
                    Analyze
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                  {['No Credit Card', 'Instant Results', '100% Free'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-brand-primary" />
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
