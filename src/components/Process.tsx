import { motion } from 'motion/react';

const steps = [
  {
    no: "01",
    title: "Audit & Strategy",
    description: "We deep-dive into your current funnel to identify leaks and opportunities for AI integration."
  },
  {
    no: "02",
    title: "Design & Build",
    description: "Our engineers craft a high-converting visual identity and technical infrastructure."
  },
  {
    no: "03",
    title: "Optimize & Scale",
    description: "Continuous AI-driven testing and optimization to ensure maximum ROI and growth."
  }
];

export default function Process() {
  return (
    <section className="py-24 bg-black/20" id="process">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-brand-primary text-xs font-bold tracking-widest uppercase mb-4 block"
            >
              Our Method
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-bold leading-tight tracking-tighter uppercase"
            >
              The AWC <br />
              <span className="opacity-40">Growth Engine.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-sm text-lg font-light"
          >
            A scientific approach to digital dominance. We don't guess; we engineer results through data-driven creativity.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative p-12 bg-brand-dark hover:bg-white/[0.02] transition-colors overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              <span className="text-7xl font-black text-white/5 group-hover:text-brand-primary/10 transition-colors duration-500 mb-8 block">
                {step.no}
              </span>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                {step.description}
              </p>
              
              {/* Decorative corner accent */}
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
