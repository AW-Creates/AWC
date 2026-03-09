import { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import ProjectModal, { type Project } from './ProjectModal';

const projects: Project[] = [
  {
    title: "Nexus Analytics",
    category: "SaaS Dashboard",
    metrics: "+142% Retention",
    description: "A lightning-fast analytics dashboard for a B2B data firm.",
    image: "/images/case-saas.png",
    color: "from-blue-500/20 to-transparent",
    challenge: "The client's existing dashboard had a 68% user drop-off within the first week. Slow load times, confusing navigation, and zero onboarding flow meant power users stayed — but new users bounced immediately.",
    solution: "We rebuilt the entire platform on edge-optimized infrastructure with sub-50ms response times. AI-driven onboarding walks new users through key features, and a redesigned data hierarchy reduced clicks-to-insight by 74%.",
    techStack: ["Next.js", "TypeScript", "D3.js", "PostgreSQL", "Vercel Edge"],
    screenshots: ["/images/case-saas-2.png"],
    stats: [
      { label: "Load Time", value: "42ms" },
      { label: "Retention", value: "+142%" },
      { label: "NPS Score", value: "87" },
    ],
  },
  {
    title: "Ember Kitchen",
    category: "Local Restaurant",
    metrics: "3.2x Bookings",
    description: "Complete brand identity and website for a PA-based restaurant.",
    image: "/images/case-restaurant.png",
    color: "from-amber-500/20 to-transparent",
    challenge: "A beloved local restaurant with zero digital presence. Walk-in traffic was declining post-pandemic, and competitors with online ordering were stealing market share. No brand system, no website, no way to capture reservations.",
    solution: "We built a full brand identity and conversion-optimized website with integrated reservation system. AI-powered email campaigns re-engaged lapsed customers, and Google Business optimization pushed them to the #1 local search result.",
    techStack: ["React", "Tailwind CSS", "Supabase", "OpenTable API", "Cloudflare"],
    screenshots: ["/images/case-restaurant-2.png"],
    stats: [
      { label: "Online Bookings", value: "3.2x" },
      { label: "Google Rank", value: "#1" },
      { label: "Revenue", value: "+47%" },
    ],
  },
  {
    title: "Luxe Market",
    category: "E-Commerce",
    metrics: "+85% Revenue",
    description: "Conversion-focused e-commerce redesign with AI recommendations.",
    image: "/images/case-ecommerce.png",
    color: "from-emerald-500/20 to-transparent",
    challenge: "A premium fashion brand with beautiful products but a checkout flow that leaked revenue at every step. Cart abandonment was 82%, mobile conversion was near zero, and product discovery relied entirely on manual browsing.",
    solution: "We redesigned the entire purchase journey with AI-powered product recommendations, a one-tap checkout flow, and predictive search. Mobile-first design with gesture navigation tripled mobile conversion overnight.",
    techStack: ["Next.js", "Shopify Headless", "Algolia", "Stripe", "TensorFlow.js"],
    screenshots: ["/images/case-ecommerce-2.png"],
    stats: [
      { label: "Cart Recovery", value: "64%" },
      { label: "Mobile Conv.", value: "3.1x" },
      { label: "AOV", value: "+28%" },
    ],
  },
  {
    title: "Vitality Health",
    category: "Medical Practice",
    metrics: "+210% Patients",
    description: "Full digital transformation for a multi-location medical practice.",
    image: "/images/case-medical.png",
    color: "from-teal-500/20 to-transparent",
    challenge: "A 3-location medical practice still using phone-only scheduling. Patients were frustrated with hold times, no-show rates were 35%, and the only web presence was an outdated directory listing with incorrect hours.",
    solution: "We launched a HIPAA-compliant patient portal with real-time scheduling, automated SMS reminders, and a patient intake form that cut reception time by 60%. SEO optimization captured high-intent local searches for every specialty.",
    techStack: ["React", "Node.js", "PostgreSQL", "Twilio", "AWS HIPAA"],
    screenshots: ["/images/case-medical-2.png"],
    stats: [
      { label: "New Patients", value: "+210%" },
      { label: "No-Shows", value: "-71%" },
      { label: "Wait Time", value: "-60%" },
    ],
  },
  {
    title: "PulseTrack",
    category: "Fitness SaaS",
    metrics: "12k Users",
    description: "AI-powered fitness platform from zero to 12,000 active users.",
    image: "/images/case-fitness.png",
    color: "from-lime-500/20 to-transparent",
    challenge: "A first-time founder with a killer workout algorithm but no product. The MVP needed to launch in 6 weeks to secure seed funding, with a polished enough UX to convince investors this wasn't just a side project.",
    solution: "We designed and shipped a full-featured fitness SaaS in 14 days — workout tracking, progress visualization, AI coaching, and social features. The launch generated 2,000 signups in the first 48 hours and secured $1.2M in funding.",
    techStack: ["React Native", "Next.js", "Supabase", "OpenAI API", "Vercel"],
    screenshots: ["/images/case-fitness.png"],
    stats: [
      { label: "Launch Time", value: "14 days" },
      { label: "Active Users", value: "12k" },
      { label: "Funding", value: "$1.2M" },
    ],
  },
];

export default function CaseStudies() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const featured = projects[0];
  const secondary = projects.slice(1, 3);
  const tertiary = projects.slice(3);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" id="work">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <motion.span initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="archival-label mb-4 block">
              Selected Work
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black leading-tight tracking-tighter uppercase">
              Proof, Not<br /><span className="text-white/30">Promises.</span>
            </motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/40 max-w-sm text-base font-light leading-relaxed">
            Click any project to explore the full case study — screenshots, metrics, and the strategy behind the results.
          </motion.p>
        </div>

        {/* Row 1: Featured (3/5) + 2 stacked (2/5) */}
        <div className="grid lg:grid-cols-5 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => setSelectedProject(featured)}
            className="lg:col-span-3 group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/20 transition-all duration-500 cursor-pointer"
          >
            <div className="relative h-72 md:h-96 overflow-hidden">
              <img src={featured.image} alt={`${featured.title} — ${featured.category}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0" loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t ${featured.color}`} />
              <div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                <TrendingUp size={14} className="text-brand-accent" />
                <span className="font-mono text-[10px] font-semibold text-white">{featured.metrics}</span>
              </div>
              <div className="absolute bottom-5 left-5 bg-brand-primary text-black px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{featured.category}</div>
              {/* Click hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-2">
                  <ExternalLink size={14} />
                  <span className="font-mono text-xs font-semibold">View Case Study</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold tracking-tight group-hover:text-brand-primary transition-colors">{featured.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed font-light mt-2">{featured.description}</p>
            </div>
          </motion.div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            {secondary.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/20 transition-all duration-500 cursor-pointer flex-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={project.image} alt={`${project.title} — ${project.category}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0" loading="lazy" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${project.color}`} />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-brand-accent" />
                    <span className="font-mono text-[9px] font-semibold text-white">{project.metrics}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                      <ExternalLink size={12} />
                      <span className="font-mono text-[10px] font-semibold">View Details</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-brand-primary/60 block mb-2">{project.category}</span>
                  <h3 className="text-lg font-bold tracking-tight group-hover:text-brand-primary transition-colors">{project.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2: Two equal cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {tertiary.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/20 transition-all duration-500 cursor-pointer"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={project.image} alt={`${project.title} — ${project.category}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0" loading="lazy" />
                <div className={`absolute inset-0 bg-gradient-to-t ${project.color}`} />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-brand-accent" />
                  <span className="font-mono text-[9px] font-semibold text-white">{project.metrics}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                    <ExternalLink size={12} />
                    <span className="font-mono text-[10px] font-semibold">View Details</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-brand-primary/60 block mb-2">{project.category}</span>
                <h3 className="text-lg font-bold tracking-tight group-hover:text-brand-primary transition-colors">{project.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed mt-2 font-light">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
}
