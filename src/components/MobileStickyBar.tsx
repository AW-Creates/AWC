import { ArrowRight } from 'lucide-react';

export default function MobileStickyBar() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-morphism border-t border-white/5 px-4 py-3 safe-bottom">
            <a
                href="#process"
                className="flex items-center justify-center gap-2 w-full bg-brand-primary text-black font-bold py-3 rounded-full text-sm cursor-pointer shadow-[0_-4px_20px_rgba(197,160,89,0.3)]"
            >
                Book Strategy Call
                <ArrowRight size={16} />
            </a>
        </div>
    );
}
