"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Magnetic from "./Magnetic";
import { prettyDate } from "../lib/constants";

export default function Header({ onAdd }: { onAdd: () => void }) {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate date only after mount to avoid SSR mismatch
    setDate(prettyDate(new Date()));
  }, []);

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* orbiting logo */}
        <div className="relative h-12 w-12">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 9, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-fuchsia-400/70"
            style={{ boxShadow: "0 0 18px rgba(217,70,239,0.35)" }}
          />
          <motion.span
            animate={{ rotate: -360 }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            className="absolute inset-[11px] rounded-full border border-cyan-300/60"
          />
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 to-fuchsia-500"
            style={{ boxShadow: "0 0 16px rgba(245,158,11,0.9)" }}
          />
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 9, ease: "linear", repeat: Infinity }}
            className="absolute -right-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 10px #22d3ee" }}
          />
        </div>

        <div>
          <h1 className="font-display text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
            <span className="gradient-text">Habit Nebula</span>
          </h1>
          <p className="mt-1.5 text-xs text-white/45">
            {date ?? "\u00A0"}
          </p>
        </div>
      </div>

      <Magnetic>
        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.9 }}
          className="relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 font-display text-sm font-bold tracking-wide text-black"
          style={{
            background: "linear-gradient(100deg,#fbbf24,#ec4899 55%,#a855f7)",
            boxShadow: "0 10px 32px rgba(236,72,153,0.4)",
          }}
        >
          <span
            className="liquid-wave absolute inset-y-0 left-0 w-1/3"
          />
          <span className="relative text-lg leading-none">+</span>
          <span className="relative">New habit</span>
        </motion.button>
      </Magnetic>
    </header>
  );
}