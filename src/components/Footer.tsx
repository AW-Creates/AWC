export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">A. WILCHER CREATIVES</span>
          </div>

          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>

          <p className="text-xs text-white/20">
            © 2026 A. Wilcher Creatives. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
