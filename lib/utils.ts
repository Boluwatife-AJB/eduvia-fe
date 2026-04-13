import { clsx, type ClassValue } from "clsx";
import { format, isValid, parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function parseFormDate(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const ymd = parse(value, "yyyy-MM-dd", new Date());
  if (isValid(ymd)) return ymd;
  const fromIso = new Date(value);
  return isValid(fromIso) ? fromIso : undefined;
}

/** Normalizes calendar / `<input type="date">` values to `yyyy-MM-dd` for school-setup APIs. */
export function toApiDateString(value: string): string {
  const d = parseFormDate(value);
  if (!d) return value.trim();
  return format(d, "yyyy-MM-dd");
}
