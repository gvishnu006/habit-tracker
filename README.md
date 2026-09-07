# ✦ Habit Nebula — Streak Tracker

A vivid habit tracker with a **GitHub-style contribution heatmap**, **rolling slot-machine streak counters**, **confetti milestone explosions**, and streak math that lives in the backend.

```
Next.js   (frontend)      →    Node/Express + PostgreSQL   (backend)
```

![stack](https://img.shields.io/badge/Next.js-16-black) ![stack](https://img.shields.io/badge/Express-5-green) ![stack](https://img.shields.io/badge/PostgreSQL-pg-blue) ![stack](https://img.shields.io/badge/Framer%20Motion-animated-purple)

> **Repo layout** — this repository contains the brand-new version in [`frontend/`](./frontend) + [`backend/`](./backend) (actively deployed), plus a **legacy v1 monorepo** (`apps/`, `packages/`, `prisma/`, `tests/`) kept intact in `apps/*`.

---

## ✨ What makes it feel different

| Feature | Animation |
| --- | --- |
| **Streak counter** | Slot-machine digit wheels — the number physically *spins* through extra laps before settling |
| **Consistency grid** | Cells **bloom** into existence with staggered springs; live cells glow, hover cells stretch with a tetra tooltip |
| **Check-in** | Liquid-wave button + expanding **ripple ring**, then a **emoji particle burst** floats up and dissolves |
| **Milestones** (1/7/14/21/30/60/100/…) | Dual **side-cannon confetti + golden star burst**, plus a **tumbling milestone card** wrapped in a rotating conic-gradient ring |
| **Whole page** | **Aurora background** — drifting blurred blobs + twinkling starfield + breathing glows |
| **Buttons** | **Magnetic** hover (buttons lean toward your cursor) |
| **Add-habit modal** | Spring pop with staggered fields, shake-on-wrong, gradient aura picker |

## 🧠 Backend streak logic — `backend/src/streaks.js`

Pure, timezone-aware streak engine:

- `current` — consecutive days ending *today* **or** *yesterday* (a streak never dies at midnight, only after a full missed day)
- `best` — longest consecutive run ever
- `alive` / `checkedToday` flags for the UI
- `milestoneHit` — fires exactly once when a streak **crosses** a milestone (1, 7, 14, 21, 30, 60, 100, 150, 200, 300, 365)

## 🗄 Storage

- PostgreSQL is used automatically when `DATABASE_URL` is set (schema auto-created on boot).
- Otherwise it falls back to a **zero-setup JSON file store** (`backend/data/store.json`) so you can run it anywhere instantly.

## 🚀 Run locally

```bash
# 1. backend  →  http://localhost:4000
cd backend
npm install
npm run dev

# 2. frontend →  http://localhost:3000  (proxies /api → localhost:4000)
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — click **✨ Seed with demo data** in the empty state to instantly populate the grid, streaks and a juicy heatmap.

### Use real PostgreSQL (optional)

```bash
# backend/.env  (or set DATABASE_URL)
DATABASE_URL=postgresql://user:password@host:5432/habit_tracker
```

## ☁️ Deploy

| Piece | Where | How |
| --- | --- | --- |
| Frontend | **Vercel** | Repo → import → set `API_URL` to your deployed backend URL |
| Backend | **Railway / Render / Vercel functions** | Set `DATABASE_URL` (e.g. free **Neon** Postgres) |
| Database | **Neon / Supabase** (free Postgres) | Create a project, copy the URL |

The frontend rewrites `/api/*` to `API_URL` (see `frontend/next.config.ts`), so everything stays same-origin.

## 📁 Structure

```
habit-tracker
├── frontend            # NEW version — Next.js 16 (App Router) + Framer Motion + canvas-confetti
│   ├── app/            # page, layout, globals (all the keyframes)
│   ├── components/     # Aurora, Heatmap, RollingStreak, HabitCard, MilestoneBanner …
│   └── lib/            # api client, types, confetti, constants
├── backend             # NEW version — Express 5 API
│   ├── src/server.js   # REST routes
│   ├── src/streaks.js  # streak engine (the star math)
│   └── src/store.js    # Postgres ⇄ JSON fallback data layer
├── apps/               # LEGACY v1 monorepo (apps/web, apps/api) — preserved
├── packages/           # LEGACY shared package
├── prisma/             # LEGACY database schema
└── tests/              # LEGACY tests
```