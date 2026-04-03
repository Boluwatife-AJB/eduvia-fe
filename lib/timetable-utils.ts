import { times } from "@/lib/data";

export const TIME_SLOT_COUNT = times.length;

const SLOT_PALETTES = [
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
] as const;

export function paletteForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SLOT_PALETTES[h % SLOT_PALETTES.length];
}

/** Normalize API time (ISO or HH:mm:ss) to HH:mm labels used in `times`. */
export function normalizeWallTime(raw: string): string {
  const s = raw.trim();
  if (/^\d{1,2}:\d{2}/.test(s) && !s.includes("T")) {
    const [hh, mm] = s.split(":");
    return `${hh!.padStart(2, "0")}:${(mm ?? "00").slice(0, 2)}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const m = s.match(/(\d{2}):(\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;
  return times[0] ?? "08:00";
}

export function timeStartIndex(label: string): number {
  const idx = times.indexOf(label);
  if (idx >= 0) return idx;
  const gte = times.findIndex((t) => t >= label);
  return gte >= 0 ? gte : 0;
}

export function timeEndIndex(label: string): number {
  const idx = times.indexOf(label);
  if (idx >= 0) return idx;
  const gt = times.findIndex((t) => t > label);
  return gt >= 0 ? gt : times.length;
}
