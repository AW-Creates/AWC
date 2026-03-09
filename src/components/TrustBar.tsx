import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export default function TrustBar() {
  const partners = ["GOOGLE PARTNER", "META ADS", "CLUTCH TOP 10", "HUBSPOT"];

  return (
    <div className="py-10 border-y border-white/5 bg-white/[0.01]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#C5A059" className="text-brand-primary" />
              ))}
            </div>
            <p className="text-xs font-medium text-white/40">
              <span className="text-white font-bold">4.9/5</span> Google Rating
            </p>
          </div>

          {/* Partner Logos */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {partners.map((partner) => (
              <span
                key={partner}
                className="font-mono text-[9px] font-semibold tracking-[0.2em] text-white/10 hover:text-white/25 transition-colors cursor-default"
              >
                {partner}
              </span>
            ))}
          </div>

          {/* PA Qualifier */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <p className="font-mono text-[10px] font-semibold tracking-widest text-white/40 uppercase">
              PA's #1 AI Agency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
