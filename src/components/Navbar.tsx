import { motion } from 'motion/react';
import { Phone, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 glass border-b-0 m-4 rounded-2xl"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-black fill-black" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">A. WILCHER CREATIVES</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <a href="#services" className="hover:text-brand-primary transition-colors">Expertise</a>
        <a href="#process" className="hover:text-brand-primary transition-colors">Process</a>
        <a href="#work" className="hover:text-brand-primary transition-colors">Work</a>
        <a href="#critique" className="hover:text-brand-primary transition-colors">Audit</a>
        <a href="#contact" className="hover:text-brand-primary transition-colors">Login</a>
      </div>

      <div className="flex items-center gap-6">
        <a href="tel:+1234567890" className="hidden sm:flex items-center gap-2 font-display font-bold text-brand-primary hover:scale-105 transition-transform">
          <Phone size={16} />
          <span>(555) 123-4567</span>
        </a>
        <button className="bg-brand-primary text-black text-xs md:text-sm font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(197,160,89,0.3)]">
          Book Strategy
        </button>
      </div>
    </motion.nav>
  );
}
