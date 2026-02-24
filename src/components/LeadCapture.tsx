import { motion } from 'motion/react';
import { Send } from 'lucide-react';

export default function LeadCapture() {
  return (
    <section className="py-24 relative overflow-hidden" id="contact">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-primary/20 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto glass rounded-[3.5rem] p-8 md:p-20 border-white/10 shadow-[0_0_100px_rgba(197,160,89,0.05)]">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-[0.9] tracking-tighter">Ready to dominate your local market?</h2>
              <p className="text-white/50 text-xl mb-12 font-light leading-relaxed">
                Secure your free 30-minute strategy audit. We'll analyze your current presence and show you exactly where AI can unlock hidden revenue.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 border border-white/5 flex items-center justify-center group-hover:border-brand-primary/20 transition-colors">
                    <div className="w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(197,160,89,1)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest">Free Competitor Analysis</p>
                    <p className="text-xs text-white/40 mt-1">See exactly what your rivals are doing.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 border border-white/5 flex items-center justify-center group-hover:border-brand-primary/20 transition-colors">
                    <div className="w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(197,160,89,1)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest">Custom AI Growth Roadmap</p>
                    <p className="text-xs text-white/40 mt-1">A step-by-step plan for dominance.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 border border-white/5 flex items-center justify-center group-hover:border-brand-primary/20 transition-colors">
                    <div className="w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(197,160,89,1)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest">No-Obligation Strategy Call</p>
                    <p className="text-xs text-white/40 mt-1">Talk directly with our AI engineers.</p>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-6 bg-white/[0.02] p-8 md:p-12 rounded-[2.5rem] border border-white/5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Company Website</label>
                <input 
                  type="url" 
                  placeholder="https://yourbrand.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Monthly Budget</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none text-white/60">
                  <option>$2,500 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000+</option>
                </select>
              </div>
              <button type="submit" className="w-full btn-primary mt-4 flex items-center justify-center gap-2">
                Claim My Free Audit
                <Send size={18} />
              </button>
              <p className="text-[10px] text-center text-white/30 mt-4">
                By submitting, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
