import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowRight, ChevronDown } from 'lucide-react';

const steps = [
    {
        no: "01",
        title: "Audit & Strategy",
        description: "We deep-dive into your current funnel to identify leaks, missed opportunities, and areas where AI can multiply results.",
    },
    {
        no: "02",
        title: "Design & Build",
        description: "Our engineers craft a high-converting visual identity and technical infrastructure — tested at every step.",
    },
    {
        no: "03",
        title: "Optimize & Scale",
        description: "Continuous AI-driven testing and optimization ensures maximum ROI as we scale your growth engine.",
    },
];

const faqs = [
    {
        q: "How long does a typical project take?",
        a: "Most projects go from strategy call to live in 10-14 business days. Complex builds with custom integrations may take 3-4 weeks. We move fast without cutting corners.",
    },
    {
        q: "What's included in the free AI audit?",
        a: "A comprehensive analysis of your site's SEO health, page speed, conversion bottlenecks, mobile experience, and competitive positioning. You'll get a prioritized list of revenue opportunities — no strings attached.",
    },
    {
        q: "Do you work with businesses outside of PA?",
        a: "Absolutely. While our roots are in Pennsylvania and we're the #1 AI agency here, we work with clients nationwide. All collaboration happens remotely with zero loss in quality.",
    },
    {
        q: "What makes you different from other agencies?",
        a: "Data, not opinions. Every design decision is backed by AI-driven behavioral analytics. We don't build 'pretty' — we build measurable growth engines. And we guarantee results with transparent reporting.",
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 last:border-b-0">
            <button
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors pr-4">{q}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                >
                    <ChevronDown size={16} className="text-white/30" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="text-white/40 text-sm leading-relaxed font-light pb-4">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ConversionSection() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden" id="process">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="archival-label mb-4 block"
                    >
                        Our Process
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black leading-tight tracking-tighter uppercase"
                    >
                        How We Get You<br />
                        <span className="text-brand-primary">Results.</span>
                    </motion.h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
                    {/* Left — Process Steps (vertical timeline) */}
                    <div>
                        <div className="space-y-0 mb-12">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="group relative pl-12 pb-12 border-l border-white/5 last:pb-0 cursor-pointer"
                                >
                                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-dark border-2 border-white/10 group-hover:border-brand-primary transition-colors" />
                                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-primary/40 block mb-2">{step.no}</span>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-primary transition-colors tracking-tight">{step.title}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed font-light">{step.description}</p>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.45 }}
                                className="relative pl-12 pt-0 border-l border-brand-primary/20"
                            >
                                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-primary shadow-[0_0_15px_rgba(197,160,89,0.5)]" />
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-primary block mb-2">04</span>
                                <h3 className="text-xl font-bold text-brand-primary tracking-tight flex items-center gap-2">
                                    Start Now <ArrowRight size={18} className="hidden lg:inline" />
                                </h3>
                            </motion.div>
                        </div>

                        {/* FAQ Accordion */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-4">Frequently Asked</h4>
                            <div className="glass-morphism rounded-2xl p-6">
                                {faqs.map((faq, i) => (
                                    <FAQItem key={i} q={faq.q} a={faq.a} />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right — Lead Capture Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:sticky lg:top-28"
                    >
                        <div className="glass-morphism rounded-[2rem] p-8 md:p-10 border-white/5">
                            <h3 className="text-2xl font-bold mb-2 tracking-tight">Claim Your Free Strategy Audit</h3>
                            <p className="text-white/40 text-sm mb-8 font-light">
                                30 minutes. Zero obligation. We'll show you exactly where AI can unlock hidden revenue.
                            </p>

                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="conv-name" className="font-mono text-[10px] uppercase tracking-widest font-semibold text-white/30 ml-1">Full Name</label>
                                        <input
                                            id="conv-name"
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-brand-primary/40 transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="conv-email" className="font-mono text-[10px] uppercase tracking-widest font-semibold text-white/30 ml-1">Email</label>
                                        <input
                                            id="conv-email"
                                            type="email"
                                            placeholder="john@company.com"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-brand-primary/40 transition-colors text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="conv-website" className="font-mono text-[10px] uppercase tracking-widest font-semibold text-white/30 ml-1">Website URL</label>
                                    <input
                                        id="conv-website"
                                        type="url"
                                        placeholder="https://yourbrand.com"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-brand-primary/40 transition-colors text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="conv-budget" className="font-mono text-[10px] uppercase tracking-widest font-semibold text-white/30 ml-1">Monthly Budget</label>
                                    <select
                                        id="conv-budget"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-brand-primary/40 transition-colors text-sm appearance-none text-white/60 cursor-pointer"
                                        aria-label="Select your monthly budget"
                                    >
                                        <option>$2,500 – $5,000</option>
                                        <option>$5,000 – $10,000</option>
                                        <option>$10,000+</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full btn-primary mt-2 flex items-center justify-center gap-2 text-sm">
                                    Claim My Free Audit
                                    <Send size={16} />
                                </button>
                                <p className="text-center font-mono text-[9px] text-white/20 uppercase tracking-widest mt-3">
                                    By submitting, you agree to our Privacy Policy
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
