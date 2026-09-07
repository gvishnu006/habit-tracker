"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Milestone } from "../lib/types";
import RollingStreak from "./RollingStreak";

export default function MilestoneBanner({
  milestone,
  emoji,
  color,
  onClose,
}: {
  milestone: Milestone;
  emoji: string;
  color: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* dim + sparkling backdrop */}
      <motion.button
        aria-label="Close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ rotateX: 95, scale: 0.6, opacity: 0, y: 40 }}
            animate={{ rotateX: 0, scale: 1, opacity: 1, y: 0 }}
            exit={{ rotateX: 90, scale: 0.7, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 150, damping: 16 }}
            className="relative w-full max-w-md"
            style={{ perspective: 1000 }}
          >
            {/* rotating conic frame */}
            <div className="conic-frame rounded-[2rem] p-[2px]">
              <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-[#0b0a1d]/95 px-8 py-10 text-center">
                {/* glow inside */}
                <div
                  className="glow-breathe absolute -inset-16 -z-0"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${color}55, transparent 60%)`,
                  }}
                />

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.18, type: "spring", stiffness: 200, damping: 12 }}
                  className="relative z-10 text-7xl"
                  style={{ filter: `drop-shadow(0 0 22px ${color})` }}
                >
                  {emoji}
                </motion.div>

                <p className="relative z-10 mt-4 font-display text-[11px] font-bold uppercase tracking-[0.35em] text-white/50">
                  Milestone unlocked
                </p>

                <div className="relative z-10 mt-2 flex items-center justify-center gap-1">
                  <span className="font-display text-6xl font-bold">
                    <RollingStreak value={milestone.milestone} className="text-5xl" />
                  </span>
                  <span className="mt-3 text-2xl font-semibold text-white/60">days</span>
                </div>

                <p className="relative z-10 mx-auto mt-3 max-w-[26ch] text-sm text-white/70">
                  {milestone.message}
                </p>

                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.92 }}
                  className="relative z-10 mt-7 rounded-xl px-7 py-2.5 font-display text-sm font-semibold tracking-wide text-black"
                  style={{
                    background: "linear-gradient(100deg,#fde047,#f59e0b)",
                    boxShadow: "0 8px 30px rgba(245,158,11,0.45)",
                  }}
                >
                  KEEP GOING
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}