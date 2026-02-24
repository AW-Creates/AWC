import { motion } from 'motion/react';
import { Play } from 'lucide-react';

export default function FounderVideo() {
  return (
    <section className="py-24 container mx-auto px-6" id="about">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-brand-primary text-xs font-bold tracking-widest uppercase mb-4 block">Meet the Visionary</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Why AI is the unfair advantage your brand needs in 2026.
          </h2>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            "We didn't start A. Wilcher Creatives to just be another agency. We started it because the old ways of marketing are dying. Our AI-driven approach allows us to predict trends, automate engagement, and deliver results that were impossible just 24 months ago."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-brand-primary rounded-full" />
            </div>
            <div>
              <p className="font-bold">Marcus Thorne</p>
              <p className="text-xs text-white/40 uppercase tracking-widest">Founder & CEO</p>
            </div>
          </div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative aspect-video rounded-3xl overflow-hidden glass group cursor-pointer"
        >
          <img 
            src="https://picsum.photos/seed/founder/1280/720" 
            alt="Founder Video Thumbnail" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_0_50px_rgba(197,160,89,0.3)] group-hover:scale-110 transition-transform">
              <Play size={32} fill="black" className="ml-1" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold bg-black/50 backdrop-blur px-3 py-1 rounded-full">60 Seconds</span>
            <div className="text-right">
              <p className="text-xs font-bold">Watch the Strategy</p>
              <p className="text-[10px] text-white/60">Founder Introduction</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
