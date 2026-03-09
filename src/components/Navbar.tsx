import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Phone, Zap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#audit", label: "Free Audit" },
    { href: "#services", label: "Services" },
    { href: "#work", label: "Work" },
    { href: "#process", label: "Process" },
  ];

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-brand-primary z-[60]"
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 m-4 rounded-2xl transition-all duration-500 ${isScrolled
            ? 'glass-morphism py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent py-5'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <a href="#" className="flex items-center gap-2 cursor-pointer" aria-label="A. Wilcher Creatives home">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black fill-black" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight hidden sm:inline">AWC</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition-colors duration-200 cursor-pointer">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a href="tel:+1234567890" className="hidden lg:flex items-center gap-2 font-mono text-xs text-white/40 hover:text-brand-primary transition-colors cursor-pointer" aria-label="Call us">
            <Phone size={14} />
            <span>(555) 123-4567</span>
          </a>
          <a href="#process" className="bg-brand-primary text-black text-xs font-bold px-5 py-2.5 rounded-full hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] transition-all cursor-pointer">
            Book Strategy →
          </a>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 mx-4 glass-morphism rounded-2xl p-6 md:hidden"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-white/60 hover:text-brand-primary transition-colors py-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
