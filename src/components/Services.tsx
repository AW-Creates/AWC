import { useRef, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Target, BarChart3 } from 'lucide-react';

const services = [
  {
    no: "01",
    title: "AI-Powered Web Design",
    description: "High-converting websites engineered with AI-driven behavioral analytics. Every element is tested, measured, and optimized for revenue.",
    icon: Zap,
    color: "text-brand-primary",
  },
  {
    no: "02",
    title: "Precision Ad Campaigns",
    description: "Hyper-local audience targeting using proprietary AI models. We find your perfect customer before your competitors even know they exist.",
    icon: Target,
    color: "text-blue-400",
  },
  {
    no: "03",
    title: "Growth Analytics & CRO",
    description: "Predictive modeling that forecasts ROI and continuously optimizes your funnel — turning guesswork into mathematical certainty.",
    icon: BarChart3,
    color: "text-brand-accent",
  }
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -3, y: dx * 3 });
  }, []);

  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        perspective: 600,
      }}
    >
      <div
        className="h-full transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section className="py-24 md:py-32" id="services">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <motion.span initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="archival-label mb-4 block">
              What We Do
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black leading-tight tracking-tighter uppercase">
              Three Services.<br /><span className="text-white/30">Zero Fluff.</span>
            </motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/40 max-w-sm text-base font-light leading-relaxed">
            We cut everything that doesn't move the needle. Every service is engineered for one outcome: measurable growth.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {services.map((service, index) => (
            <TiltCard key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-full p-10 md:p-12 bg-brand-dark hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-px bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />

                <span className="archival-index block mb-6 group-hover:text-brand-primary/10 transition-colors duration-500">
                  {service.no}
                </span>

                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:border-brand-primary/20 transition-colors">
                  <service.icon className={service.color} size={22} />
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-brand-primary transition-colors tracking-tight">{service.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors">{service.description}</p>

                <div className="absolute bottom-0 right-0 w-10 h-10 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-2xl" />
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
