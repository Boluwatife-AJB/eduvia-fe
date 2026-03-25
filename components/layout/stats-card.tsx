import { cn } from "@/lib/utils";
import type { AdminStatsCard } from "@/types";
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";

export default function StatsCard({
  title,
  value,
  change,
  Icon,
  iconColor,
  backgroundColor,
}: AdminStatsCard) {
  const trimmed = change.trim();
  const isPositive = trimmed.startsWith("+");
  const isNegative = trimmed.startsWith("-");

  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className="cursor-pointer rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900">
      {/* Top row: icon (left) + change badge (right) */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor }}
          aria-hidden
        >
          <Icon className="size-6" style={{ color: iconColor }} weight="bold" />
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1 text-xs font-bold",
            isNegative &&
              "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
            !isPositive &&
              !isNegative &&
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
          )}
          style={isPositive ? { backgroundColor, color: iconColor } : undefined}
        >
          {isPositive ? (
            <TrendUpIcon className="size-3.5 shrink-0" weight="bold" />
          ) : isNegative ? (
            <TrendDownIcon className="size-3.5 shrink-0" weight="bold" />
          ) : null}
          {trimmed}
        </div>
      </div>

      {/* Label + main stat */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-50">
        {displayValue}
      </p>
    </div>
  );
}
