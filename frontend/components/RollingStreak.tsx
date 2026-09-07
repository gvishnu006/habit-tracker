"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

/**
 * Slot-machine digit wheel. On value change the whole wheel spins hard
 * through several extra laps, then settles on the new digit.
 */
function Digit({ digit, height }: { digit: string; height: number }) {
  const y = useMotionValue(0);
  const initialized = useRef(false);
  const prev = useRef<number>(-1);

  const target = digit === "-" ? 0 : Number(digit);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      y.set(-target * height);
      prev.current = target;
      return;
    }
    if (prev.current === target) return;
    const laps = 2 + Math.floor(Math.random() * 2); // spin drama
    const from = -(prev.current + laps * 10) * height;
    y.set(from);
    const controls = animate(y, -target * height, {
      duration: 0.9,
      ease: [0.18, 0.89, 0.32, 1.02],
    });
    prev.current = target;
    return () => controls.stop();
  }, [digit, height, target, y]);

  return (
    <span
      className="inline-block overflow-hidden font-display"
      style={{ height, lineHeight: `${height}px`, fontSize: height * 0.82 }}
    >
      <motion.span className="block" style={{ y }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block text-center tabular-nums">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

const HEIGHT = 34;

export default function RollingStreak({
  value,
  className = "",
  compact = false,
}: {
  value: number;
  className?: string;
  compact?: boolean;
}) {
  const digits = String(Math.max(0, value)).padStart(compact ? 1 : 2, "0");
  return (
    <span
      className={`inline-flex items-start -space-x-0.5 ${className}`}
      aria-label={`${value} day streak`}
    >
      {digits.split("").map((d, i) => (
        <Digit key={`${i}`} digit={d} height={HEIGHT} />
      ))}
    </span>
  );
}