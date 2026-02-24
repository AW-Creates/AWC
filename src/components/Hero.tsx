import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Home, Video, Camera, Share2, Heart } from 'lucide-react';
import { useState } from 'react';

interface FloatingButtonProps {
  icon: any;
  label: string;
  activeColor?: string;
  hoverColor?: string;
  delay?: number;
}

function FloatingButton({ icon: Icon, label, activeColor, hoverColor, delay = 0 }: FloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Map of hover colors to their hex values for Framer Motion
  const colorMap: Record<string, string> = {
    'bg-amber-500': '#f59e0b',
    'bg-blue-500': '#3b82f6',
    'bg-blue-600': '#2563eb',
    'bg-emerald-500': '#10b981',
    'bg-indigo-500': '#6366f1',
    'bg-rose-500': '#f43f5e',
  };

  const shadowMap: Record<string, string> = {
    'bg-amber-500': 'rgba(245, 158, 11, 0.6)',
    'bg-blue-500': 'rgba(59, 130, 246, 0.6)',
    'bg-blue-600': 'rgba(37, 99, 235, 0.6)',
    'bg-emerald-500': 'rgba(16, 185, 129, 0.6)',
    'bg-indigo-500': 'rgba(99, 102, 241, 0.6)',
    'bg-rose-500': 'rgba(244, 63, 94, 0.6)',
  };

  const baseBg = activeColor ? colorMap[activeColor] || '#3b82f6' : 'rgba(255, 255, 255, 0.05)';
  const hoverBg = hoverColor ? colorMap[hoverColor] || '#ffffff' : 'rgba(255, 255, 255, 0.2)';

  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        backgroundColor: isHovered ? hoverBg : baseBg,
        boxShadow: isHovered ? `0 10px 30px -5px ${shadowMap[hoverColor || ''] || 'rgba(255,255,255,0.2)'}` : '0 0 0 rgba(0,0,0,0)'
      }}
      transition={{ 
        duration: 0.4, 
        delay: isHovered ? 0 : 1 + delay,
        backgroundColor: { duration: 0.2 },
        boxShadow: { duration: 0.2 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        relative h-12 flex items-center justify-center rounded-full
        ${isHovered ? 'px-6' : 'w-12'}
        border border-white/10 text-white overflow-hidden backdrop-blur-lg
      `}
    >
      <div className="flex items-center gap-2 relative z-10">
        <Icon size={18} className={`transition-colors duration-300 ${activeColor || isHovered ? 'text-white' : 'text-white/60'}`} />
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      {/* Shine Effect on Hover */}
      {isHovered && (
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
        />
      )}
    </motion.button>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">
      {/* Background with Stardust */}
      <div className="absolute inset-0 z-0 stardust opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-transparent to-brand-dark" />
      
      {/* Animated Glows */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 blur-[150px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 text-[10px] font-bold tracking-widest uppercase text-brand-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            Performance Optimized
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-[14vw] md:text-[10vw] font-black leading-[0.8] tracking-tighter uppercase mb-4">
            <span className="block text-gradient">We Build</span>
            <span className="block text-gradient opacity-60">Gorgeous</span>
            <span className="block text-brand-primary drop-shadow-[0_0_30px_rgba(197,160,89,0.3)]">Websites.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Elevating digital presence through scientific design. We don't just build sites; we engineer visual identities that convert.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
        >
          <button className="btn-primary flex items-center gap-3 group text-lg px-10">
            Start Project
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-10 py-4 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all">
            View Our Work
          </button>
        </motion.div>

        {/* Floating Controls */}
        <div className="flex items-center justify-center gap-3">
          <FloatingButton icon={Home} label="Home" hoverColor="bg-amber-500" delay={0} />
          <FloatingButton icon={Video} label="Video" activeColor="bg-blue-500" hoverColor="bg-blue-600" delay={0.1} />
          <FloatingButton icon={Camera} label="Camera" hoverColor="bg-emerald-500" delay={0.2} />
          <FloatingButton icon={Share2} label="Share" hoverColor="bg-indigo-500" delay={0.3} />
          <FloatingButton icon={Heart} label="Like" hoverColor="bg-rose-500" delay={0.4} />
        </div>
      </div>
    </section>
  );
}
