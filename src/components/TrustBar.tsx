import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export default function TrustBar() {
  const partners = [
    "GOOGLE PARTNER", "META ADS", "FORBES", "TECHCRUNCH", "CLUTCH"
  ];

  return (
    <div className="py-8 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Google Stars */}
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
                className="text-[10px] font-display font-bold tracking-[0.2em] text-white/10 hover:text-white/30 transition-colors cursor-default"
              >
                {partner}
              </span>
            ))}
          </div>

          {/* Client Count */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="text-xs font-bold tracking-widest text-white/60 uppercase">500+ Brands Scaled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
