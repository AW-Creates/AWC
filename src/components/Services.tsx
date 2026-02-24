import { motion } from 'motion/react';
import { Zap, Target, BarChart3 } from 'lucide-react';

const services = [
  {
    title: "AI-Powered Ads",
    description: "Dynamic creative optimization that learns and evolves with your audience in real-time.",
    icon: Zap,
    color: "text-brand-primary",
    bg: "bg-brand-primary/5"
  },
  {
    title: "Precision Targeting",
    description: "Hyper-local audience mapping using proprietary AI models to find your perfect customer.",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-400/5"
  },
  {
    title: "Growth Analytics",
    description: "Predictive modeling that forecasts ROI and scales your budget with mathematical certainty.",
    icon: BarChart3,
    color: "text-purple-400",
    bg: "bg-purple-400/5"
  }
];

export default function Services() {
  return (
    <section className="py-24 bg-white/[0.01]" id="services">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Streamlined for Success</h2>
          <p className="text-white/50 text-lg">We've cut the fluff. Our core services are engineered to deliver one thing: measurable growth for your local brand.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-10 rounded-[2.5rem] glass hover:bg-white/[0.08] hover:border-brand-primary/20 transition-all group border-white/5 shadow-2xl"
            >
              <div className={`w-20 h-20 rounded-3xl ${service.bg} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform border border-white/5`}>
                <service.icon className={service.color} size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-white/50 leading-relaxed mb-8">
                {service.description}
              </p>
              <div className="w-full h-[1px] bg-white/5 mb-8" />
              <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-brand-primary transition-colors">
                Learn More
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
