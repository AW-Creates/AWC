import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function ParallaxDivider({ variant = 'dots' }: { variant?: 'dots' | 'lines' | 'grid' }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const y2 = useTransform(scrollYProgress, [0, 1], [20, -60]);
    const y3 = useTransform(scrollYProgress, [0, 1], [60, -20]);
    const rotate1 = useTransform(scrollYProgress, [0, 1], [-5, 5]);
    const rotate2 = useTransform(scrollYProgress, [0, 1], [10, -10]);

    return (
        <div ref={ref} className="relative h-32 md:h-48 overflow-hidden pointer-events-none" aria-hidden="true">
            {variant === 'dots' && (
                <>
                    <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-4 left-[15%] w-3 h-3 rounded-full bg-brand-primary/10" />
                    <motion.div style={{ y: y2 }} className="absolute top-8 left-[35%] w-1.5 h-1.5 rounded-full bg-brand-primary/20" />
                    <motion.div style={{ y: y3 }} className="absolute top-12 right-[25%] w-2 h-2 rounded-full bg-white/5" />
                    <motion.div style={{ y: y1, rotate: rotate2 }} className="absolute top-6 right-[10%] w-4 h-4 rounded-full border border-brand-primary/10" />
                    <motion.div style={{ y: y2 }} className="absolute bottom-8 left-[50%] w-1 h-1 rounded-full bg-brand-primary/15" />
                    <motion.div style={{ y: y3 }} className="absolute bottom-4 left-[70%] w-2.5 h-2.5 rounded-full bg-white/3" />
                </>
            )}

            {variant === 'lines' && (
                <>
                    <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-8 left-[10%] w-20 h-px bg-gradient-to-r from-brand-primary/10 to-transparent" />
                    <motion.div style={{ y: y2, rotate: rotate2 }} className="absolute top-16 right-[20%] w-32 h-px bg-gradient-to-l from-white/5 to-transparent" />
                    <motion.div style={{ y: y3 }} className="absolute bottom-10 left-[40%] w-16 h-px bg-gradient-to-r from-brand-primary/5 to-transparent" />
                    <motion.div style={{ y: y1 }} className="absolute bottom-6 right-[15%] w-24 h-px bg-gradient-to-l from-brand-primary/10 to-transparent" />
                </>
            )}

            {variant === 'grid' && (
                <>
                    <motion.div style={{ y: y1, rotate: rotate1 }} className="absolute top-4 left-[20%] w-8 h-8 border border-brand-primary/5 rounded-lg" />
                    <motion.div style={{ y: y2, rotate: rotate2 }} className="absolute top-10 right-[30%] w-6 h-6 border border-white/5 rounded" />
                    <motion.div style={{ y: y3 }} className="absolute bottom-8 left-[55%] w-10 h-10 border border-brand-primary/5 rounded-xl" />
                    <motion.div style={{ y: y2 }} className="absolute top-6 right-[12%] w-4 h-4 bg-brand-primary/5 rounded" />
                    <motion.div style={{ y: y1 }} className="absolute bottom-12 left-[10%] w-5 h-5 border border-white/3 rounded-lg" />
                </>
            )}
        </div>
    );
}
