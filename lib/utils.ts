import { clsx, type ClassValue } from "clsx";
import { isValid, parse } from "date-fns";
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
