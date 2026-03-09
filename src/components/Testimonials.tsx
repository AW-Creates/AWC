import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "AWC didn't just build us a website — they built a lead-generation engine. Our inbound inquiries tripled in the first month. The AI audit alone was worth more than what most agencies charge for a full project.",
        name: "Sarah Chen",
        role: "CEO, Nexus Analytics",
        metric: "+312% Leads",
    },
    {
        quote: "We went from a 1.2% conversion rate to 5.1% after AWC optimized our funnel. They found revenue leaks we didn't even know existed. The data-driven approach is leagues ahead of anyone else in PA.",
        name: "Marcus Rivera",
        role: "Founder, Ember Kitchen",
        metric: "4.2x Conversions",
    },
    {
        quote: "What impressed me most was the speed. From strategy call to live site in 12 days. The result? Our best performing quarter since launch. These guys are the real deal.",
        name: "Emily Ward",
        role: "CMO, Luxe Market",
        metric: "+85% Revenue",
    },
];

export default function Testimonials() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(1);
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const navigate = (dir: number) => {
        setDirection(dir);
        setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
    };

    const t = testimonials[current];

    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="archival-label mb-4 block"
                    >
                        Client Stories
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase"
                    >
                        Don't Take Our<br />
                        <span className="text-white/30">Word For It.</span>
                    </motion.h2>
                </div>

                <div className="max-w-3xl mx-auto relative">
                    <div className="glass-morphism rounded-[2rem] p-8 md:p-14 relative overflow-hidden min-h-[280px]">
                        {/* Decorative quote */}
                        <Quote size={60} className="absolute top-6 right-8 text-brand-primary/5" />

                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={current}
                                custom={direction}
                                initial={{ opacity: 0, x: direction * 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction * -30 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="relative z-10"
                            >
                                <p className="text-base md:text-lg text-white/70 leading-relaxed font-light mb-8 italic">
                                    "{t.quote}"
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar placeholder */}
                                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                                            <span className="font-bold text-brand-primary text-sm">{t.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{t.name}</p>
                                            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{t.role}</p>
                                        </div>
                                    </div>
                                    <div className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5 rounded-full">
                                        <span className="font-mono text-[10px] font-bold text-brand-primary tracking-wider">{t.metric}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-brand-primary/30 transition-colors cursor-pointer"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft size={16} className="text-white/40" />
                        </button>

                        <div className="flex gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === current ? 'bg-brand-primary w-6' : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(1)}
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-brand-primary/30 transition-colors cursor-pointer"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight size={16} className="text-white/40" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
