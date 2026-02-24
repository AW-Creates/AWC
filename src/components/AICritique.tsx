import { motion } from 'motion/react';
import { Search, Zap } from 'lucide-react';

export default function AICritique() {
  return (
    <section className="py-24 relative overflow-hidden" id="critique">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto glass rounded-[3rem] p-8 md:p-16 border-white/10 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold tracking-widest uppercase mb-6"
            >
              <Zap size={12} />
              AI-Powered Audit
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight uppercase tracking-tighter">
              Free AI Conversion <br />
              <span className="text-brand-primary">Critique</span>
            </h2>
            
            <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
              Paste your URL or explain your funnel. Our AI CRO expert identifies profit leaks in under 10 seconds.
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <input 
                type="text" 
                placeholder="https://yourwebsite.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-40 focus:outline-none focus:border-brand-primary/50 transition-colors text-white placeholder:text-white/20"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-brand-primary text-black font-bold px-8 rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                <Search size={18} />
                Analyze
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-primary" />
                No Credit Card
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-primary" />
                Instant Results
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-primary" />
                100% Free
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
