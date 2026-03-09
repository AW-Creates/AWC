import { useEffect, useRef } from 'react';

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Pulse ring storage
    const pulses: { x: number; y: number; radius: number; opacity: number; speed: number }[] = [];
    let lastPulseTime = 0;

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Animated gradient mesh — 3 slowly orbiting radial gradients
      const cx = canvas.width * 0.65;
      const cy = canvas.height * 0.45;

      const blobs = [
        {
          x: cx + Math.sin(time * 0.0003) * 120,
          y: cy + Math.cos(time * 0.0004) * 80,
          r: 350,
          color: 'rgba(197, 160, 89, 0.04)',
        },
        {
          x: cx + Math.cos(time * 0.0002) * 150,
          y: cy + Math.sin(time * 0.00035) * 100,
          r: 280,
          color: 'rgba(197, 160, 89, 0.03)',
        },
        {
          x: cx + Math.sin(time * 0.00045 + 2) * 100,
          y: cy + Math.cos(time * 0.0003 + 1) * 120,
          r: 220,
          color: 'rgba(191, 255, 7, 0.015)',
        },
      ];

      for (const blob of blobs) {
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Grid dots (subtle)
      const spacing = 80;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const pulse = prefersReducedMotion
            ? 0.08
            : 0.05 + 0.04 * Math.sin(time * 0.001 + dist * 0.005);

          ctx.fillStyle = `rgba(197, 160, 89, ${pulse})`;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Pulse rings emanating from the scan card center
      if (!prefersReducedMotion) {
        // Spawn a new pulse every 2 seconds
        if (time - lastPulseTime > 2000) {
          pulses.push({ x: cx, y: cy, radius: 20, opacity: 0.15, speed: 0.8 });
          lastPulseTime = time;
        }

        for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i];
          p.radius += p.speed;
          p.opacity -= 0.0005;

          if (p.opacity <= 0) {
            pulses.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(197, 160, 89, ${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Scanning line
        const scanY = (time * 0.025) % canvas.height;
        const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        scanGrad.addColorStop(0, 'rgba(197, 160, 89, 0)');
        scanGrad.addColorStop(0.5, 'rgba(197, 160, 89, 0.02)');
        scanGrad.addColorStop(1, 'rgba(197, 160, 89, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 40, canvas.width, 80);
      }
    };

    const animate = (time: number) => {
      drawFrame(time);
      animationFrameId = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      animate(0);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
