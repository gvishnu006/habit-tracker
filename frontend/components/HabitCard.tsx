"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Habit } from "../lib/types";
import RollingStreak from "./RollingStreak";

export default function HabitCard({
  habit,
  busy,
  onToggle,
  onBackfill,
  onDelete,
  index,
}: {
  habit: Habit;
  busy: boolean;
  onToggle: (habit: Habit) => void;
  onBackfill: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  index: number;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ripple, setRipple] = useState(0);

  const pct = Math.min(100, Math.round((habit.streak / habit.nextMilestone) * 100));

  const handleClick = () => {
    if (busy) return;
    setRipple((r) => r + 1);
    onToggle(habit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.06 * index,
        type: "spring",
        stiffness: 220,
        damping: 20,
      }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl p-[1.5px]"
      style={{
        background: `linear-gradient(140deg, ${habit.color}55, rgba(255,255,255,0.08) 45%, ${habit.color}33)`,
      }}
    >
      <div className="glass relative overflow-hidden rounded-[calc(1.5rem-1.5px)] p-5">
        {/* rolling glow by accent */}
        <div
          className="pointer-events-none absolute -inset-20 opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: `radial-gradient(60% 60% at 20% 0%, ${habit.color}66, transparent)` }}
        />

        <div className="relative flex items-start justify-between gap-3">
          {/* icon + name */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.08 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{
                background: `linear-gradient(140deg, ${habit.color}33, ${habit.color}11)`,
                border: `1px solid ${habit.color}55`,
                boxShadow: `0 4px 18px ${habit.color}44`,
              }}
            >
              {habit.emoji}
            </motion.div>

            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-white">
                {habit.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/45">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: habit.alive ? "#34d399" : "#f87171",
                    boxShadow: habit.alive ? "0 0 8px #34d399" : "none",
                  }}
                />
                {habit.checkedToday
                  ? "checked in today"
                  : habit.alive
                    ? "streak alive"
                    : "streak cold"}
              </p>
            </div>
          </div>

          {/* streak slot machine */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              <span>Streak</span>
              <RollingStreak value={habit.streak} compact />
            </div>
            <span className="text-[10px] text-white/35">best {habit.bestStreak}</span>
          </div>
        </div>

        {/* progress to next milestone */}
        <div className="relative mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] text-white/40">
            <span>Next milestone {habit.nextMilestone ? `· ${habit.nextMilestone} days` : "∞"}</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${habit.color}, #f59e0b)`,
                boxShadow: `0 0 10px ${habit.color}`,
              }}
            />
          </div>
        </div>

        {/* actions */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClick}
              disabled={busy}
              aria-pressed={habit.checkedToday}
              className="relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-2.5 font-display text-sm font-bold tracking-wide transition active:scale-95"
              style={(() => {
                const c = habit.color;
                return habit.checkedToday
                  ? {
                      background: `linear-gradient(135deg, ${c}, ${c}cc)`,
                      color: "#0a0a12",
                      boxShadow: `0 6px 22px ${c}66`,
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      border: `1px solid ${c}66`,
                    };
              })()}
            >
              {/* ripple */}
              <AnimatePresence>
                {ripple > 0 && (
                  <motion.span
                    key={ripple}
                    initial={{ scale: 0, opacity: 0.7 }}
                    animate={{ scale: 2.6, opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ background: `radial-gradient(circle, ${habit.color}77, transparent 60%)` }}
                  />
                )}
              </AnimatePresence>

              <motion.span
                key={habit.checkedToday ? "done" : "todo"}
                initial={{ scale: 0.4, rotate: -40, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className="text-base"
              >
                {habit.checkedToday ? "✓" : habit.emoji}
              </motion.span>
              {habit.checkedToday ? "Done today" : "Check in"}
            </button>

            <button
              onClick={() => onBackfill(habit)}
              disabled={busy}
              title="Backfill yesterday"
              className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/45 transition hover:border-white/25 hover:text-white active:scale-90"
            >
              +yesterday
            </button>
          </div>

          {/* delete */}
          <div className="h-8 w-8">
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.button
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => onDelete(habit)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/90 text-xs font-bold text-white active:scale-90"
                  title="Confirm delete"
                >
                  ✓
                </motion.button>
              ) : (
                <motion.button
                  key="trash"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => {
                    setConfirmDelete(true);
                    setTimeout(() => setConfirmDelete(false), 3000);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/35 transition hover:bg-rose-500/15 hover:text-rose-300 active:scale-90"
                  title="Delete habit"
                >
                  🗑
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}