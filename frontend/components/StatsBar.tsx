"use client";

import { motion } from "framer-motion";
import RollingStreak from "./RollingStreak";
import type { Stats } from "../lib/types";

/** Solitaire-style tumbling card stack for the check button stat tiles. */
function Tiles({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  const tiles = [
    {
      label: "Total checks",
      value: String(stats.totalChecks).padStart(3, "0"),
      icon: "✦",
      tint: "#22d3ee",
    },
    {
      label: "Current streak",
      value: String(stats.streak).padStart(3, "0"),
      icon: "🔥",
      tint: "#fb923c",
    },
    {
      label: "Best streak",
      value: String(stats.bestStreak).padStart(3, "0"),
      icon: "🏆",
      tint: "#fde047",
    },
    {
      label: "Active habits",
      value: String(stats.habits).padStart(3, "0"),
      icon: "🧬",
      tint: "#a855f7",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 24, rotate: i % 2 ? 3 : -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 240, damping: 18 }}
          whileHover={{ y: -5 }}
          className="glass group relative overflow-hidden rounded-2xl p-4"
        >
          <div
            className="glow-breathe pointer-events-none absolute -inset-10 opacity-25"
            style={{ background: `radial-gradient(70% 70% at 30% 0%, ${t.tint}, transparent)` }}
          />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {t.label}
            </span>
            <span
              className="text-sm"
              style={{ filter: `drop-shadow(0 0 8px ${t.tint})` }}
            >
              {t.icon}
            </span>
          </div>
          <div className="relative mt-2 flex items-baseline gap-1.5">
            <RollingStreak value={Number(t.value)} compact />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function StatsBar({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  return (
    <section>
      {loading && !stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass animate-pulse h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <Tiles stats={stats} />
      )}
    </section>
  );
}