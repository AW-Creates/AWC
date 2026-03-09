import { motion, useInView } from 'motion/react';
import { Cpu, Clock, TrendingUp, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }: { target: number; suffix?: string; prefix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isInView, target, duration]);

    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

const differentiators = [
    {
        icon: Cpu,
        stat: 45,
        suffix: 'ms',
        label: 'Avg Load Time',
        description: 'Our sites are edge-optimized for sub-50ms response. Your competitors are still loading at 3 seconds.',
    },
    {
        icon: TrendingUp,
        stat: 4.2,
        suffix: 'x',
        label: 'Avg Conversion Lift',
        description: "AI-driven A/B testing runs 24/7. We don't guess what works — the data tells us.",
        isDecimal: true,
    },
    {
        icon: Clock,
        stat: 14,
        suffix: ' days',
        label: 'Avg Launch Time',
        description: "From first call to live site in two weeks. Enterprise agencies take months. We move fast.",
    },
    {
        icon: Shield,
        stat: 0,
        suffix: '%',
        prefix: '',
        label: 'Data Leakage',
        description: 'Every build is PCI-compliant with real-time fraud detection. Your customers\' data stays safe.',
    },
];

export default function WhyAWC() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden" id="why">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="archival-label mb-4 block"
                    >
                        The AWC Difference
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black leading-tight tracking-tighter uppercase"
                    >
                        Why Brands Choose<br />
                        <span className="text-brand-primary">Us Over Everyone.</span>
                    </motion.h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {differentiators.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative glass-morphism rounded-2xl p-8 hover:border-brand-primary/20 transition-all duration-300 cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/5 border border-white/5 flex items-center justify-center mb-6 group-hover:border-brand-primary/20 transition-colors">
                                <item.icon size={20} className="text-brand-primary" />
                            </div>

                            <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
                                {item.isDecimal ? (
                                    <span>{item.prefix}<AnimatedCounter target={42} suffix="" /><span className="text-brand-primary">.{0}</span>x</span>
                                ) : item.stat === 0 ? (
                                    <span className="text-brand-accent">{item.prefix}0{item.suffix}</span>
                                ) : (
                                    <AnimatedCounter target={item.stat} suffix={item.suffix} prefix={item.prefix || ''} />
                                )}
                            </div>
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 block mb-4">{item.label}</span>
                            <p className="text-white/40 text-sm leading-relaxed font-light">{item.description}</p>

                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
