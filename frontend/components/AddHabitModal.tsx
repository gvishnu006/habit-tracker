"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCENTS, EMOJIS } from "../lib/constants";

export default function AddHabitModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string, emoji: string) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(ACCENTS[6]);
  const [shake, setShake] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form every time the modal opens
      setName("");
      setEmoji(EMOJIS[0]);
      setColor(ACCENTS[6]);
    }
  }, [open]);

  const submit = async () => {
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setSaving(true);
    await onAdd(name.trim(), color, emoji);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 40, rotateX: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{ perspective: 1000 }}
            className="glass-strong relative w-full max-w-sm rounded-3xl p-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xl font-bold tracking-tight"
            >
              Forge a new habit
            </motion.h2>
            <p className="mt-1 text-xs text-white/45">
              Small daily rituals. Big constellation.
            </p>

            {/* name */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-5"
            >
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
                Habit name
              </label>
              <motion.input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                transition={{ duration: 0.45 }}
                placeholder="Read 20 minutes…"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:bg-white/[0.08]"
                style={{ boxShadow: shake ? "0 0 0 3px rgba(244,63,94,0.35)" : undefined }}
              />
            </motion.div>

            {/* emoji */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-4"
            >
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
                Icon
              </label>
              <div className="mt-2 grid grid-cols-8 gap-1">
                {EMOJIS.map((e) => (
                  <motion.button
                    key={e}
                    type="button"
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setEmoji(e)}
                    className="relative flex aspect-square items-center justify-center rounded-lg text-lg transition"
                    style={{
                      backgroundColor: e === emoji ? `${color}26` : "rgba(255,255,255,0.05)",
                      outline: e === emoji ? `1.5px solid ${color}` : "1px solid transparent",
                    }}
                  >
                    {e}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* color */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-4"
            >
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
                Aura
              </label>
              <div className="mt-2 flex gap-2">
                {ACCENTS.map((c) => (
                  <motion.button
                    key={c}
                    type="button"
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setColor(c)}
                    className="h-8 w-8 rounded-full"
                    style={{
                      backgroundColor: c,
                      outline: c === color ? `2px solid #fff` : "none",
                      outlineOffset: 2,
                      boxShadow: `0 0 14px ${c}88`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* actions */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-6 flex items-center justify-between"
            >
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm text-white/55 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="rounded-xl px-7 py-2.5 font-display text-sm font-bold text-black transition active:scale-95"
                style={{
                  background: `linear-gradient(100deg, ${color}, ${color}aa)`,
                  boxShadow: `0 8px 26px ${color}55`,
                }}
              >
                {saving ? "Forging…" : "Create"}
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}