import { motion } from 'motion/react';
import { ExternalLink, TrendingUp, Zap, Target } from 'lucide-react';

const projects = [
  {
    title: "Luxe Real Estate",
    category: "Luxury Property",
    metrics: "+142% Leads",
    description: "Re-engineered a stagnant property portal into a high-velocity lead generation machine using AI-driven behavioral tracking.",
    image: "https://picsum.photos/seed/luxe/800/600",
    color: "from-amber-500/20 to-transparent"
  },
  {
    title: "Quantum SaaS",
    category: "B2B Technology",
    metrics: "45ms Latency",
    description: "Built a lightning-fast dashboard for a data analytics firm, reducing churn by 30% through superior UX and edge optimization.",
    image: "https://picsum.photos/seed/saas/800/600",
    color: "from-blue-500/20 to-transparent"
  },
  {
    title: "Eco-Flow Ecom",
    category: "Sustainable Retail",
    metrics: "3.2x ROI",
    description: "A complete brand overhaul and custom Shopify build that tripled conversion rates within the first 90 days of launch.",
    image: "https://picsum.photos/seed/eco/800/600",
    color: "from-emerald-500/20 to-transparent"
  },
  {
    title: "Aura Wellness",
    category: "Health & Fitness",
    metrics: "+85% Retention",
    description: "Developed a personalized user journey that leverages machine learning to deliver custom content, boosting daily active users.",
    image: "https://picsum.photos/seed/aura/800/600",
    color: "from-rose-500/20 to-transparent"
  }
];

export default function CaseStudies() {
  return (
    <section className="py-32 bg-brand-dark relative overflow-hidden" id="work">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-brand-primary text-xs font-bold tracking-widest uppercase mb-4 block"
            >
              Proven Results
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase"
            >
              Case <br />
              <span className="text-gradient opacity-40">Studies.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-sm text-lg font-light leading-relaxed"
          >
            We don't just build websites; we build business assets. Explore how we've transformed digital presence into measurable growth.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${project.color}`} />
                
                {/* Metric Badge */}
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                  <TrendingUp size={14} className="text-brand-accent" />
                  <span className="text-xs font-bold tracking-tight text-white">{project.metrics}</span>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-6 left-6 bg-brand-primary text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {project.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl font-bold tracking-tight group-hover:text-brand-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-black transition-all duration-500">
                    <ExternalLink size={20} />
                  </div>
                </div>
                <p className="text-white/50 leading-relaxed font-light group-hover:text-white/70 transition-colors">
                  {project.description}
                </p>
                
                {/* Tech Tags */}
                <div className="mt-8 flex gap-4 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Zap size={12} /> Performance
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Target size={12} /> Conversion
                  </div>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <button className="btn-secondary group">
            <span className="flex items-center gap-2">
              View All Projects <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
