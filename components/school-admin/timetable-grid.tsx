"use client";

import { cn } from "@/lib/utils";
import { days, times } from "@/lib/data";
import { TimeTableSlot } from "@/types";
import { WarningCircleIcon } from "@phosphor-icons/react";
import {
  paletteForId,
  TIME_SLOT_COUNT,
  timeEndIndex,
  timeStartIndex,
} from "@/lib/timetable-utils";

export type TimetableGridProps = {
  slots: TimeTableSlot[];
  selectedSlot: TimeTableSlot | null;
  onSelectSlot: (slot: TimeTableSlot | null) => void;
  isLoading?: boolean;
};

export function TimetableGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: TimetableGridProps) {
  return (
    <div className="flex flex-1 gap-6 min-h-0 overflow-hidden relative">
      <div className="relative overflow-auto border border-border bg-card rounded-xl custom-scrollbar">
        {isLoading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]">
            <p className="text-sm font-medium text-muted-foreground">
              Loading timetable…
            </p>
          </div>
        )}
        <div
          className="grid select-none"
          style={{
            minWidth: `${100 + TIME_SLOT_COUNT * 72}px`,
            gridTemplateColumns: `100px repeat(${TIME_SLOT_COUNT}, minmax(72px, 1fr))`,
            gridAutoRows: "minmax(100px, auto)",
          }}
        >
          <div className="sticky left-0 top-0 z-30 bg-muted/60 backdrop-blur-md border-r border-b border-border p-3 flex items-center justify-center">
            <span className="text-xs font-semibold text-foreground -rotate-45">
              Day/Time
            </span>
          </div>
          {times.map((time, idx) => (
            <div
              key={`time-${idx}`}
              className="sticky top-0 z-20 border-b border-r border-border p-2 text-center text-xs font-semibold text-muted-foreground bg-muted/60 backdrop-blur-md flex items-center justify-center"
              style={{ gridColumn: idx + 2, gridRow: 1 }}
            >
              {time}
            </div>
          ))}

          {days.map((day, dIdx) => (
            <div key={day.value} className="contents relative">
              <div
                className="sticky left-0 z-20 bg-card border-r border-b border-border p-3 flex flex-col justify-center items-center font-semibold text-sm shadow-[1px_0_0_0_var(--color-border)] opacity-90"
                style={{ gridColumn: 1, gridRow: dIdx + 2 }}
              >
                <span className="-rotate-90 tracking-widest whitespace-nowrap opacity-50 text-[10px] uppercase font-bold mb-2 hidden md:block">
                  {day.label}
                </span>
              </div>

              {times.map((_, tIdx) => (
                <div
                  key={`${dIdx}-${tIdx}`}
                  onClick={() => onSelectSlot(null)}
                  className="border-b border-r border-border bg-background/50 cover-parent hover:bg-muted/30 transition-colors cursor-pointer"
                  style={{ gridColumn: tIdx + 2, gridRow: dIdx + 2 }}
                />
              ))}
            </div>
          ))}

          {slots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id;
            const validDuration = Math.min(
              timeEndIndex(slot.end_time) - timeStartIndex(slot.start_time),
              TIME_SLOT_COUNT - timeStartIndex(slot.start_time),
            );
            if (validDuration <= 0) return null;

            return (
              <div
                key={slot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlot(slot);
                }}
                className={cn(
                  "m-1.5 rounded-lg border p-2.5 shadow-sm relative overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
                  isSelected
                    ? "z-30 ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "z-10",
                  paletteForId(slot.subject.id),
                )}
                style={{
                  gridRow:
                    days.findIndex((d) => d.value === slot.day_of_week) + 2,
                  gridColumn: `${timeStartIndex(slot.start_time) + 2} / span ${validDuration}`,
                }}
              >
                {!slot.is_active && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgb(220, 38, 38) 10px, rgb(220, 38, 38) 20px)`,
                    }}
                  />
                )}

                <div className="font-bold text-sm tracking-tight relative z-10 truncate pr-4">
                  {slot.subject.name}
                </div>
                {!slot.is_active && (
                  <WarningCircleIcon
                    weight="fill"
                    className="absolute top-2.5 right-2 size-4 text-destructive z-10"
                  />
                )}
                <div className="text-xs font-semibold opacity-90 title-font relative z-10 mt-1">
                  {slot.class.name}
                </div>
                <div className="text-[10px] uppercase font-bold mt-auto truncate relative z-10 opacity-80 pt-2 flex items-center justify-between">
                  <span>
                    {slot.teacher.first_name?.[0] ?? ""}
                    {slot.teacher.last_name?.[0] ?? ""}
                  </span>
                  <span className="opacity-70 px-1 bg-black/5 dark:bg-white/10 rounded">
                    {slot.venue?.trim() ? slot.venue?.split(" ")[0] : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
