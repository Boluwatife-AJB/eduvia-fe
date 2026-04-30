"use client";

import { TimetableGrid } from "@/components/school-admin/timetable-grid";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { days } from "@/lib/data";
import { apiClient } from "@/lib/api";
import { normalizeWallTime, paletteForId } from "@/lib/timetable-utils";
import {
  TeacherTimetableResponse,
  TeacherTimetableSlot,
  TimeTableSlot,
  DayOfWeek,
} from "@/types";
import {
  ClockIcon,
  MapPinIcon,
  NotebookIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const PLACEHOLDER_TERM: TimeTableSlot["academic_term"] = {
  id: "",
  name: "—",
  start_date: "",
  end_date: "",
  is_current: false,
  academicSession: {
    id: "",
    name: "—",
    start_date: "",
    end_date: "",
    is_current: false,
  },
};

function normalizeTeacherTimetable(
  raw: Partial<Record<DayOfWeek, TeacherTimetableSlot[]>> | undefined,
): TeacherTimetableResponse {
  const out = {} as TeacherTimetableResponse;
  for (const d of days) {
    const day = d.value as DayOfWeek;
    const slots = raw?.[day];
    out[day] = Array.isArray(slots) ? slots : [];
  }
  return out;
}

function teacherSlotToGridSlot(slot: TeacherTimetableSlot): TimeTableSlot {
  const code = slot.subject.code?.trim() || "·";
  return {
    id: slot.id,
    tenant_id: slot.tenant_id,
    day_of_week: slot.day_of_week,
    start_time: normalizeWallTime(slot.start_time),
    end_time: normalizeWallTime(slot.end_time),
    venue: slot.venue,
    is_active: slot.is_active,
    created_at: slot.created_at,
    updated_at: slot.updated_at,
    class: slot.class,
    subject: {
      id: slot.subject.id,
      name: slot.subject.name,
      code: slot.subject.code,
      title: slot.subject.title,
    },
    teacher: {
      id: slot.teacher_id,
      first_name: code.charAt(0) || "·",
      last_name: code.charAt(1) || "",
    },
    academic_term: PLACEHOLDER_TERM,
  };
}

const fetchTeacherTimetable = async (): Promise<TeacherTimetableResponse> => {
  const response = await apiClient.get<{
    data: Partial<Record<DayOfWeek, TeacherTimetableSlot[]>>;
  }>("/timetable/teacher/me");
  return normalizeTeacherTimetable(response.data.data);
};

export default function Timetable() {
  const [selectedGridSlot, setSelectedGridSlot] =
    useState<TimeTableSlot | null>(null);

  const {
    data: timetable,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teacher-timetable-me"],
    queryFn: fetchTeacherTimetable,
  });

  const gridSlots = useMemo(() => {
    if (!timetable) return [];
    return days.flatMap((d) =>
      (timetable[d.value as DayOfWeek] ?? []).map(teacherSlotToGridSlot),
    );
  }, [timetable]);

  const selectedTeacherSlot = useMemo(() => {
    if (!selectedGridSlot || !timetable) return null;
    const daySlots = timetable[selectedGridSlot.day_of_week] ?? [];
    return daySlots.find((s) => s.id === selectedGridSlot.id) ?? null;
  }, [selectedGridSlot, timetable]);

  const totalSessions = timetable
    ? days.reduce(
        (n, d) => n + (timetable[d.value as DayOfWeek]?.length ?? 0),
        0,
      )
    : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-8 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-assistant font-bold">Timetable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading your weekly schedule…"
              : isError
                ? "Could not load timetable. Try again later."
                : totalSessions === 0
                  ? "No sessions scheduled yet for this term."
                  : `${totalSessions} session${totalSessions === 1 ? "" : "s"} this week · select a slot for details`}
          </p>
        </div>
      </div>

      <div className="flex min-h-[min(70vh,640px)] flex-1 flex-col">
        <TimetableGrid
          slots={gridSlots}
          selectedSlot={selectedGridSlot}
          onSelectSlot={setSelectedGridSlot}
          isLoading={isLoading}
        />
      </div>

      <Sheet
        open={selectedTeacherSlot !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedGridSlot(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton
          className={cn(
            "flex h-full w-full max-w-[min(100vw,400px)] flex-col gap-0 p-0 sm:max-w-[400px]",
            "border-l",
          )}
        >
          {selectedTeacherSlot && (
            <>
              <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border bg-muted/20 p-5">
                <SheetTitle className="font-bold text-lg">Session</SheetTitle>
              </SheetHeader>

              <div className="flex flex-1 flex-col overflow-y-auto p-5 custom-scrollbar">
                <div className="mb-6 space-y-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      paletteForId(selectedTeacherSlot.subject.id),
                    )}
                  >
                    {selectedTeacherSlot.subject.code}
                  </Badge>
                  <h3 className="text-xl font-assistant font-bold text-foreground">
                    {selectedTeacherSlot.subject.name}
                  </h3>
                  {selectedTeacherSlot.subject.title ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <NotebookIcon className="size-4 shrink-0 opacity-70" />
                      {selectedTeacherSlot.subject.title}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <UsersIcon className="size-5" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        Class
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {selectedTeacherSlot.class.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedTeacherSlot.class.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <ClockIcon className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        Time
                      </span>
                      <span className="font-semibold text-foreground">
                        {days.find(
                          (de) => de.value === selectedTeacherSlot.day_of_week,
                        )?.label ?? "—"}
                        , {normalizeWallTime(selectedTeacherSlot.start_time)} –{" "}
                        {normalizeWallTime(selectedTeacherSlot.end_time)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <MapPinIcon className="size-5" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        Venue
                      </span>
                      <span className="font-semibold text-foreground wrap-break-word">
                        {selectedTeacherSlot.venue.trim() || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
