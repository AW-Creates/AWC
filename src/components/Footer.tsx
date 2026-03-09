import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center">
              <Zap size={14} className="text-black fill-black" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight block">A. WILCHER CREATIVES</span>
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">PA's #1 AI Marketing Agency</span>
            </div>
          </div>

          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <a key={link} href="#" className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-white transition-colors cursor-pointer">
                {link}
              </a>
            ))}
          </div>

          <p className="font-mono text-[10px] text-white/15 tracking-wider">
            © 2026 A. Wilcher Creatives
          </p>
        </div>
      </div>
    </footer>
  );
}
