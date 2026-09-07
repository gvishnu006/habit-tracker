export const ACCENTS = [
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#818cf8",
  "#a855f7",
  "#d946ef",
  "#ec4899",
];

export const EMOJIS = [
  "💖",
  "💪",
  "🧘",
  "📚",
  "✍️",
  "🎨",
  "🏃",
  "🚴",
  "🏊",
  "🧠",
  "🌅",
  "🥗",
  "💧",
  "🛌",
  "🎸",
  "🎧",
  "🌱",
  "🐶",
  "💻",
  "📵",
  "🧹",
  "🪥",
  "🧊",
  "🌟",
];

export const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function localTzOffset() {
  return new Date().getTimezoneOffset();
}

export function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function localToday() {
  const off = localTzOffset();
  return new Date(Date.now() - off * 60000).toISOString().slice(0, 10);
}

export function localDateStr(offsetDays: number) {
  const off = localTzOffset();
  return new Date(Date.now() - off * 60000 + offsetDays * 86400000)
    .toISOString()
    .slice(0, 10);
}

export function prettyDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function prettyShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function heatLevelFor(count: number, max: number) {
  if (count <= 0) return 0;
  return Math.min(4, Math.ceil((4 * count) / Math.max(max, 1)));
}

export const HEAT_SCALE = [
  "#141426",
  "#312e81",
  "#6d28d9",
  "#d946ef",
  "#f97316",
];