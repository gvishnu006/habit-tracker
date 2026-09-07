import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'store.json');

/* ─────────────────────────────────────────────────────────────────────
 *  PostgreSQL store — used whenever DATABASE_URL is present.
 *  ---------------------------------------------------------------- */
function makePgStore(connStr) {
  const pool = new pg.Pool({ connectionString: connStr, max: 10 });

  async function init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id          BIGSERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        color       TEXT NOT NULL DEFAULT '#8b5cf6',
        emoji       TEXT NOT NULL DEFAULT '✦',
        archived    BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS checkins (
        id          BIGSERIAL PRIMARY KEY,
        habit_id    BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        date        DATE NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (habit_id, date)
      );
      CREATE INDEX IF NOT EXISTS idx_checkins_habit ON checkins(habit_id);
      CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
    `);
  }

  async function healthy() {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async function listHabits() {
    const { rows } = await pool.query(
      'SELECT id, name, color, emoji, archived, created_at FROM habits WHERE archived = false ORDER BY created_at ASC'
    );
    const out = [];
    for (const h of rows) {
      const { rows: c } = await pool.query(
        'SELECT to_char(date, \'YYYY-MM-DD\') AS date FROM checkins WHERE habit_id = $1 ORDER BY date ASC',
        [h.id]
      );
      out.push({ ...h, id: Number(h.id), dates: c.map((r) => r.date) });
    }
    return out;
  }

  async function getHabit(id) {
    const { rows } = await pool.query('SELECT * FROM habits WHERE id = $1', [id]);
    if (!rows.length) return null;
    const h = rows[0];
    const { rows: c } = await pool.query(
      'SELECT to_char(date, \'YYYY-MM-DD\') AS date FROM checkins WHERE habit_id = $1 ORDER BY date ASC',
      [h.id]
    );
    return { ...h, id: Number(h.id), dates: c.map((r) => r.date) };
  }

  async function createHabit({ name, color, emoji }) {
    const { rows } = await pool.query(
      'INSERT INTO habits (name, color, emoji) VALUES ($1, $2, $3) RETURNING *',
      [name, color, emoji]
    );
    return { ...rows[0], id: Number(rows[0].id), dates: [] };
  }

  async function updateHabit(id, patch) {
    const current = await getHabit(id);
    if (!current) return null;
    const name = patch.name ?? current.name;
    const color = patch.color ?? current.color;
    const emoji = patch.emoji ?? current.emoji;
    await pool.query('UPDATE habits SET name = $1, color = $2, emoji = $3 WHERE id = $4', [
      name, color, emoji, id,
    ]);
    return getHabit(id);
  }

  async function deleteHabit(id) {
    await pool.query('DELETE FROM habits WHERE id = $1', [id]);
  }

  async function hasCheckin(habitId, date) {
    const { rows } = await pool.query(
      'SELECT 1 FROM checkins WHERE habit_id = $1 AND date = $2',
      [habitId, date]
    );
    return rows.length > 0;
  }

  async function addCheckin(habitId, date) {
    if (await hasCheckin(habitId, date)) return false;
    await pool.query('INSERT INTO checkins (habit_id, date) VALUES ($1, $2)', [habitId, date]);
    return true;
  }

  async function removeCheckin(habitId, date) {
    const { rowCount } = await pool.query('DELETE FROM checkins WHERE habit_id = $1 AND date = $2', [
      habitId, date,
    ]);
    return rowCount > 0;
  }

  async function heatmap(fromDate, toDate) {
    const { rows } = await pool.query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS date, COUNT(*) AS count
       FROM checkins
       WHERE date BETWEEN $1 AND $2
       GROUP BY date ORDER BY date ASC`,
      [fromDate, toDate]
    );
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async function close() {
    await pool.end();
  }

  return { init, healthy, listHabits, getHabit, createHabit, updateHabit, deleteHabit, hasCheckin, addCheckin, removeCheckin, heatmap, close };
}

/* ─────────────────────────────────────────────────────────────────────
 *  JSON file store — zero-setup fallback for local demos.
 *  ---------------------------------------------------------------- */
function makeFileStore() {
  let state = { habits: [], checkins: [], seq: 1 };

  function load() {
    try {
      state = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    } catch {
      persist();
    }
  }
  function persist() {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  }

  async function init() {
    load();
  }
  async function healthy() {
    return true;
  }
  async function listHabits() {
    return state.habits
      .filter((h) => !h.archived)
      .map((h) => ({ ...h, dates: datesFor(h.id) }));
  }
  async function getHabit(id) {
    const h = state.habits.find((x) => x.id === id);
    return h ? { ...h, dates: datesFor(h.id) } : null;
  }
  function datesFor(id) {
    return state.checkins
      .filter((c) => c.habit_id === id)
      .map((c) => c.date)
      .sort();
  }
  async function createHabit({ name, color, emoji }) {
    const now = new Date().toISOString();
    const h = { id: state.seq++, name, color, emoji, archived: false, created_at: now };
    state.habits.push(h);
    persist();
    return { ...h, dates: [] };
  }
  async function updateHabit(id, patch) {
    const h = state.habits.find((x) => x.id === id);
    if (!h) return null;
    if (patch.name !== undefined) h.name = patch.name;
    if (patch.color !== undefined) h.color = patch.color;
    if (patch.emoji !== undefined) h.emoji = patch.emoji;
    persist();
    return getHabit(id);
  }
  async function deleteHabit(id) {
    state.habits = state.habits.filter((h) => h.id !== id);
    state.checkins = state.checkins.filter((c) => c.habit_id !== id);
    persist();
  }
  async function hasCheckin(habitId, date) {
    return state.checkins.some((c) => c.habit_id === habitId && c.date === date);
  }
  async function addCheckin(habitId, date) {
    if (await hasCheckin(habitId, date)) return false;
    state.checkins.push({ habit_id: habitId, date, created_at: new Date().toISOString() });
    persist();
    return true;
  }
  async function removeCheckin(habitId, date) {
    const before = state.checkins.length;
    state.checkins = state.checkins.filter((c) => !(c.habit_id === habitId && c.date === date));
    persist();
    return state.checkins.length < before;
  }
  async function heatmap(fromDate, toDate) {
    const map = new Map();
    for (const c of state.checkins) {
      if (c.date >= fromDate && c.date <= toDate) {
        map.set(c.date, (map.get(c.date) || 0) + 1);
      }
    }
    return [...map.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }
  async function close() {}

  return { init, healthy, listHabits, getHabit, createHabit, updateHabit, deleteHabit, hasCheckin, addCheckin, removeCheckin, heatmap, close };
}

/* ─────────────────────────────────────────────────────────────────────
 *  Factory — prefers PostgreSQL, falls back to the JSON file store.
 *  ---------------------------------------------------------------- */
export async function createStore() {
  const url = process.env.DATABASE_URL;
  let store;

  if (!url) {
    console.log('[store] DATABASE_URL not set → using JSON file store (./data/store.json)');
    store = makeFileStore();
  } else {
    const candidate = makePgStore(url);
    if (await candidate.healthy()) {
      console.log('[store] Connected to PostgreSQL');
      store = candidate;
    } else {
      console.warn('[store] PostgreSQL unreachable → falling back to JSON file store');
      store = makeFileStore();
    }
  }

  await store.init();
  return store;
}