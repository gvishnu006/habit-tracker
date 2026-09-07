/*  ── Streak core engine ──────────────────────────────────────────────
 *  Pure, timezone-aware streak math shared by every endpoint.
 *  A streak is "alive" when today OR yesterday has a check-in, so a
 *  streak is never lost at midnight until a full day is missed.
 * ------------------------------------------------------------------- */

export function dayNumber(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export function todayAt(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString().slice(0, 10);
}

export function calcStreaks(dateStrs, todayDateStr = todayUtc()) {
  const set = new Set(dateStrs.map(dayNumber));
  const today = dayNumber(todayDateStr);

  let current = 0;
  if (set.has(today)) {
    current = 1;
    let d = today - 1;
    while (set.has(d)) {
      current += 1;
      d -= 1;
    }
  } else if (set.has(today - 1)) {
    current = 1;
    let d = today - 2;
    while (set.has(d)) {
      current += 1;
      d -= 1;
    }
  }

  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of [...set].sort((a, b) => a - b)) {
    run = prev !== null && d === prev + 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }

  return {
    current,
    best,
    alive: current > 0,
    checkedToday: set.has(today),
  };
}

export const MILESTONES = [1, 7, 14, 21, 30, 60, 100, 150, 200, 300, 365];

export function milestoneHit(current, previous) {
  const crossed = MILESTONES.find((m) => current === m && previous < m);
  return crossed ? { milestone: crossed, message: messages(crossed) } : null;
}

export function closestMilestone(current) {
  return MILESTONES.find((m) => m > current); // next target or undefined
}

export function messages(m) {
  const map = {
    1: 'First step — the hardest one is done.',
    7: 'One full week. Momentum is real.',
    14: 'Two weeks — you are building a habit.',
    21: 'Three weeks! Loops are forming.',
    30: 'A whole month! The 30-day rule, conquered.',
    60: 'Two months of raw consistency.',
    100: 'The century mark. Legend status.',
    150: 'Halfway to a full year!',
    200: '200 days — a lifestyle now.',
    300: '300 days. Almost a year of you.',
    365: 'A PERFECT YEAR. Absolutely unreal.',
  };
  return map[m] || 'Milestone unlocked!';
}