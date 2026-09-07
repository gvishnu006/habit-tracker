"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { HeatmapCell } from "../lib/types";
import { DAY_LABELS, HEAT_SCALE, heatLevelFor, prettyShort } from "../lib/constants";

const CELL = 13;
const GAP = 4;

export default function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const [hover, setHover] = useState<HeatmapCell | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const { columns, max, counts } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cells) counts.set(c.date, c.count);
    const maxCount = Math.max(1, ...cells.map((c) => c.count));

    const today = new Date();
    const off = today.getTimezoneOffset();
    const todayStr = new Date(today.getTime() - off * 60000).toISOString().slice(0, 10);
    const end = new Date(todayStr + "T00:00:00");

    const weeks: { date: Date; day: number }[][] = [];
    let current: { date: Date; day: number }[] = [];
    const day = end.getDay();
    const startOfWeekOffset = day === 0 ? 6 : day - 1; // 0 = Monday
    const gridEnd = new Date(end);
    gridEnd.setDate(gridEnd.getDate() - startOfWeekOffset);

    for (let i = 370; i >= 0; i--) {
      const d = new Date(gridEnd);
      d.setDate(gridEnd.getDate() - i);
      const dow = (d.getDay() + 6) % 7;
      current.push({ date: d, day: dow });
      if (current.length === 7) {
        weeks.push(current);
        current = [];
      }
    }
    if (current.length) weeks.push(current);

    return { columns: weeks, max: maxCount, counts };
  }, [cells]);

  const total = cells.reduce((a, c) => a + c.count, 0);

  const monthLabels = useMemo(() => {
    const marks: { x: number; label: string }[] = [];
    let prev = -1;
    for (let w = 0; w < columns.length; w++) {
      const d = columns[w][0].date;
      const m = d.getMonth();
      if (m !== prev && w > 0) {
        marks.push({
          x: w * (CELL + GAP),
          label: d.toLocaleDateString("en-US", { month: "short" }),
        });
      }
      prev = m;
    }
    return marks;
  }, [columns]);

  return (
    <div className="glass rounded-3xl p-5 sm:p-7">
      {/* header row */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white/90 uppercase">
            Consistency Grid
          </h3>
          <p className="mt-1 text-xs text-white/45">
            Every check-in lights up a day — {columns.length} weeks of momentum
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/50">
          <span className="tabular-nums">{total} total checks</span>
        </div>
      </div>

      {/* the grid */}
      <div className="overflow-x-auto pb-2">
        <div
          className="relative inline-block"
          onMouseLeave={() => setHover(null)}
        >
          {/* month labels */}
          <div className="relative mb-2 h-4" style={{ width: columns.length * (CELL + GAP) }}>
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-[10px] font-medium text-white/40"
                style={{ left: m.x }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* weekday labels */}
            <div
              className="mr-2 mt-0 flex flex-col"
              style={{ gap: GAP, height: 7 * (CELL + GAP) - GAP }}
            >
              {DAY_LABELS.map((l, i) => (
                <span
                  key={i}
                  className="text-[10px] leading-none text-white/40"
                  style={{ height: CELL, lineHeight: `${CELL}px` }}
                >
                  {l}
                </span>
              ))}
            </div>

            {/* weeks */}
            <div className="flex" style={{ gap: GAP }}>
              {columns.map((week, w) => (
                <div key={w} className="flex" style={{ gap: GAP }}>
                  <div className="flex flex-col" style={{ gap: GAP }}>
                    {week.map(({ date }, wi) => {
                      const ds = date.toISOString().slice(0, 10);
                      const cnt = counts.get(ds) ?? 0;
                      const level = heatLevelFor(cnt, max);
                      const color = HEAT_SCALE[level];
                      const isFuture = date.getTime() > Date.now();
                      const idx = w * 7 + wi;
                      return (
                        <motion.button
                          key={ds}
                          type="button"
                          initial={{
                            opacity: 0,
                            scale: 0.2,
                            rotate: wi % 2 ? 4 : -4,
                            backgroundColor: HEAT_SCALE[0],
                          }}
                          animate={{
                            opacity: isFuture ? 0.25 : 1,
                            scale: 1,
                            rotate: 0,
                            backgroundColor: color,
                          }}
                          transition={{
                            delay: 0.12 + idx * 0.004,
                            type: "spring",
                            stiffness: 320,
                            damping: 22,
                          }}
                          whileHover={{ scale: 1.55, zIndex: 10 }}
                          onMouseEnter={(e) => {
                            setHover({ date: ds, count: cnt });
                            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setHoverPos({ x: r.left + r.width / 2, y: r.top });
                          }}
                          className="relative rounded-[4px] outline-none"
                          style={{
                            width: CELL,
                            height: CELL,
                            boxShadow:
                              level > 0
                                ? `0 0 8px ${color}66`
                                : "none",
                          }}
                          aria-label={`${prettyShort(ds)} · ${cnt} check${cnt === 1 ? "" : "s"}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* tooltip */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            className="glass-strong pointer-events-none fixed z-50 -translate-x-1/2 rounded-xl px-3 py-2 shadow-2xl"
            style={{
              left: hoverPos.x,
              top: hoverPos.y - 10,
            }}
          >
            <p className="whitespace-nowrap text-xs font-semibold text-white">
              {prettyShort(hover.date)}
            </p>
            <p className="text-[11px] text-white/55">
              {hover.count} check{hover.count === 1 ? "" : "s"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* legend */}
      <div className="mt-5 flex items-center gap-2 text-[11px] text-white/45">
        <span>Less</span>
        {HEAT_SCALE.map((c, i) => (
          <span
            key={c}
            className="rounded-[3px]"
            style={{ width: 12, height: 12, backgroundColor: c, boxShadow: i > 1 ? `0 0 6px ${c}55` : "none" }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}