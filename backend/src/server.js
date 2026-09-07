import express from 'express';
import cors from 'cors';
import { createStore } from './store.js';
import { calcStreaks, closestMilestone, MILESTONES, todayAt, milestoneHit } from './streaks.js';

const app = express();
app.use(cors());
app.use(express.json());

const store = await createStore();

const tzOf = (req) => Number(req.query.tz) || 0;
const todayOf = (req) => todayAt(tzOf(req));

function serializeHabit(habit, today) {
  const streaks = calcStreaks(habit.dates, today);
  return {
    id: habit.id,
    name: habit.name,
    color: habit.color,
    emoji: habit.emoji,
    createdAt: habit.created_at,
    streak: streaks.current,
    bestStreak: streaks.best,
    alive: streaks.alive,
    checkedToday: streaks.checkedToday,
    nextMilestone: closestMilestone(streaks.current),
    dates: habit.dates,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* ── Habits ─────────────────────────────────────────────────────────── */
app.get('/api/habits', async (req, res, next) => {
  try {
    const habits = await store.listHabits();
    res.json(habits.map((h) => serializeHabit(h, todayOf(req))));
  } catch (e) {
    next(e);
  }
});

app.post('/api/habits', async (req, res, next) => {
  try {
    const { name, color = '#8b5cf6', emoji = '✦' } = req.body ?? {};
    const clean = String(name ?? '').trim().slice(0, 60);
    if (!clean) return res.status(400).json({ error: 'Habit name is required' });
    const habit = await store.createHabit({ name: clean, color, emoji });
    res.status(201).json(serializeHabit(habit, todayOf(req)));
  } catch (e) {
    next(e);
  }
});

app.patch('/api/habits/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const habit = await store.updateHabit(id, req.body ?? {});
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json(serializeHabit(habit, todayOf(req)));
  } catch (e) {
    next(e);
  }
});

app.delete('/api/habits/:id', async (req, res, next) => {
  try {
    await store.deleteHabit(Number(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/* ── Check-ins  (toggle) ────────────────────────────────────────────── */
app.post('/api/habits/:id/checkin', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const date = String(req.body?.date || todayOf(req)).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD)' });
    }
    const habit = await store.getHabit(id);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const existed = await store.hasCheckin(id, date);
    let milestone = null;
    if (existed) {
      await store.removeCheckin(id, date);
    } else {
      const previous = calcStreaks(habit.dates, todayOf(req));
      await store.addCheckin(id, date);
      const fresh = await store.getHabit(id);
      milestone = milestoneHit(calcStreaks(fresh.dates, todayOf(req)).current, previous.current);
    }

    const refreshed = await store.getHabit(id);
    res.json({ habit: serializeHabit(refreshed, todayOf(req)), checkedIn: !existed, milestone });
  } catch (e) {
    next(e);
  }
});

app.delete('/api/habits/:id/checkin/:date', async (req, res, next) => {
  try {
    await store.removeCheckin(Number(req.params.id), req.params.date);
    const habit = await store.getHabit(Number(req.params.id));
    res.json({ habit: habit ? serializeHabit(habit, todayOf(req)) : null });
  } catch (e) {
    next(e);
  }
});

/* ── Heatmap  (GitHub-style contribution grid) ──────────────────────── */
app.get('/api/heatmap', async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 371, 400);
    const to = todayOf(req);
    const fromDate = new Date(Date.now() + tzOf(req) * 60000 - days * 86400000).toISOString().slice(0, 10);
    const cells = await store.heatmap(fromDate, to);
    res.json({ from: fromDate, to, cells });
  } catch (e) {
    next(e);
  }
});

app.get('/api/stats', async (req, res, next) => {
  try {
    const habits = await store.listHabits();
    const all = habits.flatMap((h) => h.dates);
    const streaks = calcStreaks(all, todayOf(req));
    res.json({
      habits: habits.length,
      totalChecks: all.length,
      streak: streaks.current,
      bestStreak: streaks.best,
      alive: streaks.alive,
      checkedToday: streaks.checkedToday,
      milestones: MILESTONES,
    });
  } catch (e) {
    next(e);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`\n  ⚡ Habit Tracker API  →  http://localhost:${PORT}`);
  console.log(`  📦 ${process.env.DATABASE_URL ? 'PostgreSQL connected' : 'JSON file store (./data/store.json)'}\n`);
});