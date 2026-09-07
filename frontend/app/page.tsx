"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Aurora from "../components/Aurora";
import Header from "../components/Header";
import StatsBar from "../components/StatsBar";
import Heatmap from "../components/Heatmap";
import HabitCard from "../components/HabitCard";
import AddHabitModal from "../components/AddHabitModal";
import MilestoneBanner from "../components/MilestoneBanner";
import EmptyState from "../components/EmptyState";
import ParticleBurst from "../components/ParticleBurst";
import { fireConfetti } from "../lib/confetti";
import * as api from "../lib/api";
import {
  ACCENTS,
  EMOJIS,
  localDateStr,
  localToday,
  localTzOffset,
  toDateStr,
} from "../lib/constants";
import type { Habit, HeatmapCell, Milestone, Stats } from "../lib/types";

const TZ = -localTzOffset();

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [milestone, setMilestone] = useState<{
    m: Milestone;
    emoji: string;
    color: string;
  } | null>(null);
  const [burst, setBurst] = useState<{
    emoji: string;
    color: string;
    id: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    const [h, hd, s] = await Promise.all([
      api.fetchHabits(TZ),
      api.fetchHeatmap(TZ),
      api.fetchStats(TZ),
    ]);
    setHabits(h);
    setCells(hd.cells);
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget fetch on mount
    refreshAll().catch(() => {
      setError("Could not reach the habit API. Is the backend running on port 4000?");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(
    async (habit: Habit) => {
      try {
        const res = await api.toggleCheckin(habit.id, localToday(), TZ);
        setHabits((prev) =>
          prev.map((h) => (h.id === habit.id ? res.habit : h))
        );
        const hd = await api.fetchHeatmap(TZ);
        setCells(hd.cells);
        setStats(await api.fetchStats(TZ));

        if (res.checkedIn) {
          setBurst({
            emoji: habit.emoji,
            color: habit.color,
            id: Date.now(),
          });
          if (res.milestone) {
            fireConfetti([habit.color, ACCENTS[0], "#fde047"], habit.emoji);
            setMilestone({ m: res.milestone, emoji: habit.emoji, color: habit.color });
          }
        }
      } catch (e) {
        setError((e as Error).message);
      }
    },
    []
  );

  const backfill = useCallback(async (habit: Habit) => {
    try {
      await api.toggleCheckin(habit.id, localDateStr(-1), TZ);
      await refreshAll();
    } catch (e) {
      setError((e as Error).message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = useCallback(
    async (habit: Habit) => {
      try {
        await api.deleteHabit(habit.id);
        await refreshAll();
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [refreshAll]
  );

  const create = useCallback(
    async (name: string, color: string, emoji: string) => {
      try {
        const habit = await api.createHabit({ name, color, emoji });
        setHabits((prev) => [...prev, habit]);
        setStats(await api.fetchStats(TZ));
        setBurst({ emoji, color, id: Date.now() });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    []
  );

  const seedDemo = useCallback(async () => {
    setSeeding(true);
    setError(null);
    try {
      const seeds = [
        { name: "Morning run", color: ACCENTS[3], emoji: EMOJIS[6] },
        { name: "Read 20 pages", color: ACCENTS[8], emoji: EMOJIS[3] },
        { name: "Meditate", color: ACCENTS[7], emoji: EMOJIS[2] },
        { name: "Drink 2L water", color: ACCENTS[5], emoji: EMOJIS[12] },
      ];

      const created: Habit[] = [];
      for (const s of seeds) {
        const h = await api.createHabit(s);
        created.push(h);
      }

      const today = new Date(localToday() + "T00:00:00");
      for (let i = 1; i <= 52; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = toDateStr(d);
        const skip = ((i * i) % 7) < 2 ? Math.random() : 0; // occasional miss
        if (skip) continue;
        const habit = created[i % created.length];
        await api.toggleCheckin(habit.id, dateStr, TZ);
      }

      await refreshAll();
      setBurst({ emoji: "🌈", color: ACCENTS[8], id: Date.now() });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSeeding(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Aurora />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Header onAdd={() => setModalOpen(true)} />
        </motion.div>

        <StatsBar stats={stats} loading={loading} />

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
        >
          <Heatmap cells={cells} />
        </motion.div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight text-white">
              Your habits
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60 tabular-nums">
                {habits.length}
              </span>
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="text-sm font-semibold text-fuchsia-300/80 transition hover:text-fuchsia-200"
            >
              + More
            </button>
          </div>

          {habits.length === 0 ? (
            <EmptyState
              onCreate={() => setModalOpen(true)}
              onSeed={seedDemo}
              seeding={seeding}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {habits.map((h, i) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  index={i}
                  busy={false}
                  onToggle={toggle}
                  onBackfill={backfill}
                  onDelete={remove}
                />
              ))}

              {/* ghost add card */}
              <button
                onClick={() => setModalOpen(true)}
                className="group flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-white/15 text-white/35 transition hover:border-fuchsia-400/50 hover:text-fuchsia-300"
              >
                <span className="flex items-center gap-2 font-display text-lg font-bold">
                  <span className="transition-transform group-hover:rotate-90 duration-300">+</span>
                  Add habit
                </span>
              </button>
            </div>
          )}
        </section>

        <footer className="pt-4 text-center text-[11px] text-white/30">
          Next.js · Express · PostgreSQL — streak math lives in the backend.
        </footer>
      </main>

      <AddHabitModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={create} />

      {milestone && (
        <MilestoneBanner
          milestone={milestone.m}
          emoji={milestone.emoji}
          color={milestone.color}
          onClose={() => setMilestone(null)}
        />
      )}

      <AnimatePresence>
        {burst && (
          <ParticleBurst
            key={burst.id}
            emoji={burst.emoji}
            color={burst.color}
            onDone={() => setBurst(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm text-rose-200 shadow-2xl backdrop-blur-xl"
            style={{ border: "1px solid rgba(244,63,94,0.35)" }}
          >
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-rose-300/70 transition hover:text-rose-100"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}