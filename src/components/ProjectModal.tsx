import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';

export interface Project {
    title: string;
    category: string;
    metrics: string;
    description: string;
    image: string;
    color: string;
    challenge: string;
    solution: string;
    techStack: string[];
    screenshots: string[];
    stats: { label: string; value: string }[];
}

interface ProjectModalProps {
    project: Project | null;
    onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
    const [currentImage, setCurrentImage] = useState(0);

    if (!project) return null;

    const allImages = [project.image, ...project.screenshots];

    const nextImage = () => setCurrentImage((p) => (p + 1) % allImages.length);
    const prevImage = () => setCurrentImage((p) => (p - 1 + allImages.length) % allImages.length);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-morphism rounded-3xl border-white/10"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Close project details"
                    >
                        <X size={18} />
                    </button>

                    {/* Image carousel */}
                    <div className="relative h-64 md:h-96 overflow-hidden rounded-t-3xl">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentImage}
                                src={allImages[currentImage]}
                                alt={`${project.title} screenshot ${currentImage + 1}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${project.color} opacity-60`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent" />

                        {/* Navigation arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                                    aria-label="Previous screenshot"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                                    aria-label="Next screenshot"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}

                        {/* Image dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImage(i)}
                                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentImage ? 'bg-brand-primary w-6' : 'bg-white/30'
                                        }`}
                                    aria-label={`View screenshot ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                            <div>
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-primary/60 block mb-2">
                                    {project.category}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{project.title}</h2>
                            </div>
                            <div className="bg-brand-primary/10 border border-brand-primary/20 px-5 py-2 rounded-full flex-shrink-0">
                                <span className="font-mono text-xs font-bold text-brand-primary">{project.metrics}</span>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {project.stats.map((stat, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                                    <div className="text-xl font-black text-brand-primary">{stat.value}</div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Challenge & Solution */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">The Challenge</h3>
                                <p className="text-white/50 text-sm leading-relaxed font-light">{project.challenge}</p>
                            </div>
                            <div>
                                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Our Solution</h3>
                                <p className="text-white/50 text-sm leading-relaxed font-light">{project.solution}</p>
                            </div>
                        </div>

                        {/* Tech stack */}
                        <div className="mb-8">
                            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech) => (
                                    <span key={tech} className="font-mono text-[10px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-white/50">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <a
                            href="#process"
                            onClick={onClose}
                            className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                            Start a Similar Project
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
