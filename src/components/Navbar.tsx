import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { Phone, Zap, Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const reducedMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [light, setLight] = useState(() => {
    try { return localStorage.getItem('awc-theme') === 'light'; } catch { return false; }
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('theme-light', light); try { localStorage.setItem('awc-theme', light ? 'light' : 'dark'); } catch {} }, [light]);

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
        style={reducedMotion ? { transformOrigin: '0%' } : { scaleX, transformOrigin: '0%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-brand-primary z-[60]"
      />

      <motion.nav
        initial={reducedMotion ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-50">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink transition-colors duration-200 cursor-pointer">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setLight((value) => !value)} className="flex items-center justify-center w-9 h-9 rounded-lg bg-ink/5 border border-ink/10 text-ink-muted" aria-label={`Switch to ${light ? 'dark' : 'light'} theme`}>{light ? <Moon size={16} /> : <Sun size={16} />}</button>
          <a href="tel:+1234567890" className="hidden lg:flex items-center gap-2 font-mono text-xs text-muted-40 hover:text-brand-ink transition-colors cursor-pointer" aria-label="Call us">
            <Phone size={14} />
            <span>(555) 123-4567</span>
          </a>
          <a href="#process" className="hidden sm:inline-flex bg-brand-primary text-black text-xs font-bold px-5 py-2.5 rounded-full hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] transition-all cursor-pointer">
            Book Strategy →
          </a>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-ink/5 border border-ink/10 cursor-pointer"
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
              initial={reducedMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 mx-4 glass-morphism rounded-2xl p-6 md:hidden"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-60 hover:text-brand-ink transition-colors py-2 cursor-pointer"
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
