"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  delay: number;
  size: number;
  drift: number;
  rotate: number;
}

/** Deterministic PRNG (mulberry32) so render stays pure yet looks random. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ParticleBurst({
  emoji,
  count = 14,
  onDone,
  color = "#c084fc",
}: {
  emoji: string;
  count?: number;
  onDone?: () => void;
  color?: string;
}) {
  const rand = mulberry32(new Date().getTime() & 0xffffffff);
  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji,
    x: (rand() - 0.5) * 260,
    y: -(60 + rand() * 140),
    delay: rand() * 0.15,
    size: 18 + rand() * 22,
    drift: (rand() - 0.5) * 60,
    rotate: (rand() - 0.5) * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.x + p.drift,
              y: p.y,
              scale: [0.4, 1.15, 1],
              rotate: p.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.15, delay: p.delay, ease: "easeOut" }}
            onAnimationComplete={() => p.id === particles.length - 1 && onDone?.()}
            style={{
              fontSize: p.size,
              textShadow: `0 0 24px ${color}`,
              position: "absolute",
            }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}