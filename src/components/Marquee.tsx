import { motion } from 'motion/react';

const items = [
  "AI POWERED DESIGN",
  "CONVERSION OPTIMIZED",
  "SCIENTIFIC BRANDING",
  "FUTURE PROOF TECH",
  "DATA DRIVEN CREATIVITY",
  "AI POWERED DESIGN",
  "CONVERSION OPTIMIZED",
  "SCIENTIFIC BRANDING",
  "FUTURE PROOF TECH",
  "DATA DRIVEN CREATIVITY",
];

export default function Marquee() {
  return (
    <div className="py-12 bg-white/[0.02] border-y border-white/5 overflow-hidden flex whitespace-nowrap">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex gap-20 items-center"
      >
        {items.map((item, i) => (
          <span key={i} className="text-4xl md:text-6xl font-black text-white/5 tracking-tighter uppercase italic">
            {item}
          </span>
        ))}
      </motion.div>
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex gap-20 items-center"
      >
        {items.map((item, i) => (
          <span key={i} className="text-4xl md:text-6xl font-black text-white/5 tracking-tighter uppercase italic">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
