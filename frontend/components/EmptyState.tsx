"use client";

import { motion } from "framer-motion";

const FLOATERS = ["✨", "🌟", "💫", "🌌", "🪐"];

export default function EmptyState({
  onCreate,
  onSeed,
  seeding,
}: {
  onCreate: () => void;
  onSeed: () => void;
  seeding: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass relative overflow-hidden rounded-3xl p-10 text-center"
    >
      {FLOATERS.map((f, i) => (
        <motion.span
          key={f}
          aria-hidden
          className="pointer-events-none absolute text-2xl opacity-40"
          style={{ left: `${12 + i * 19}%`, top: `${18 + (i % 3) * 24}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 ? 12 : -12, 0], opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {f}
        </motion.span>
      ))}

      <div className="relative">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto text-6xl"
          style={{ filter: "drop-shadow(0 0 30px rgba(168,85,247,0.6))" }}
        >
          🌱
        </motion.div>
        <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
          A blank universe.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
          Plant your first habit and start mining your own constellation of
          checked-in days.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onCreate}
            className="rounded-2xl bg-white/10 px-6 py-3 font-display text-sm font-bold text-white transition hover:bg-white/15 active:scale-95"
          >
            Create a habit
          </button>
          <button
            onClick={onSeed}
            disabled={seeding}
            className="rounded-2xl px-6 py-3 font-display text-sm font-bold text-black transition active:scale-95"
            style={{
              background: "linear-gradient(100deg,#22d3ee,#a855f7)",
              boxShadow: "0 8px 26px rgba(168,85,247,0.35)",
            }}
          >
            {seeding ? "Seeding…" : "✨ Seed with demo data"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}