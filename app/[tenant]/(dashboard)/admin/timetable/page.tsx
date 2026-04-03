"use client";

import AddSlotModal from "@/components/school-admin/modal/add-slot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClasses } from "@/hooks/use-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { apiClient } from "@/lib/api";
import { days, times } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SelectOption, TimeTableSlot } from "@/types";
import {
  ClockIcon,
  FunnelSimpleIcon,
  MapPinIcon,
  PlusIcon,
  UserCircleIcon,
  UsersIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

/** Must match `times` in lib/data — grid columns are repeat(TIME_SLOT_COUNT, …). */
const TIME_SLOT_COUNT = times.length;

const SLOT_PALETTES = [
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
] as const;

function paletteForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SLOT_PALETTES[h % SLOT_PALETTES.length];
}

/** Normalize API time (ISO or HH:mm:ss) to HH:mm labels used in `times`. */
function normalizeWallTime(raw: string): string {
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

function timeStartIndex(label: string): number {
  const idx = times.indexOf(label);
  if (idx >= 0) return idx;
  const gte = times.findIndex((t) => t >= label);
  return gte >= 0 ? gte : 0;
}

function timeEndIndex(label: string): number {
  const idx = times.indexOf(label);
  if (idx >= 0) return idx;
  const gt = times.findIndex((t) => t > label);
  return gt >= 0 ? gt : times.length;
}

// function mapTimeTableSlotToGrid(api: TimeTableSlot): Slot | null {
//   const day = days.findIndex((d) => d.value === api.day_of_week);
//   if (day < 0) return null;

//   const startLabel = normalizeWallTime(api.start_time);
//   const endLabel = normalizeWallTime(api.end_time);
//   const startIdx = timeStartIndex(startLabel);
//   const endIdx = timeEndIndex(endLabel);
//   const duration = Math.max(endIdx - startIdx, 1);

//   const subjectName =
//     api.subject?.name ?? api.subject?.title ?? api.subject?.code ?? "Subject";
//   const subject =
//     api.subject?.code?.slice(0, 3).toUpperCase() ||
//     subjectName.split(" ")[0]?.toUpperCase().slice(0, 3) ||
//     "SUB";

//   const t = api.teacher;
//   const teacherName = t
//     ? `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim()
//     : "";
//   const teacherInitials = t
//     ? `${t.first_name?.[0] ?? ""}${t.last_name?.[0] ?? ""}`
//         .toUpperCase()
//         .slice(0, 2) || "T"
//     : "T";

//   return {
//     id: api.id,
//     day,
//     startIdx,
//     duration,
//     subject,
//     subjectName,
//     classAbr: api.class?.name ?? "",
//     classId: api.class?.id ?? "",
//     teacherInitials,
//     teacherName,
//     teacherId: api.teacher?.id ?? "",
//     room: api.venue ?? "",
//     color: paletteForId(api.subject?.id ?? api.id),
//     isConflict: false,
//   };
// }

/** True if two slots share any 30-min grid cell on the same day ([start, start + duration)). */
function timeRangesOverlap(a: TimeTableSlot, b: TimeTableSlot): boolean {
  if (a.day_of_week !== b.day_of_week) return false;
  return (
    a.start_time < b.start_time + b.end_time &&
    b.start_time < a.start_time + a.end_time
  );
}

/**
 * Conflict rules (same day, overlapping time):
 * - Class: same class is scheduled in two slots that overlap (e.g. Maths 8–10 + English 9:30–11).
 * - Teacher: same teacher is scheduled in two overlapping slots (possibly different classes).
 * Empty classId/teacherId must not match — otherwise every overlapping pair falsely conflicts.
 */
function markSlotConflicts(gridSlots: TimeTableSlot[]): TimeTableSlot[] {
  return gridSlots.map((s) => ({
    ...s,
    isConflict: gridSlots.some((o) => {
      if (o.id === s.id) return false;
      if (!timeRangesOverlap(s, o)) return false;

      const sameClass = Boolean(
        s.class.id && o.class.id && s.class.id === o.class.id,
      );
      const sameTeacher = Boolean(
        s.teacher.id && o.teacher.id && s.teacher.id === o.teacher.id,
      );

      return sameClass || sameTeacher;
    }),
  }));
}

const fetchTimeTableSlots = async (params: {
  class_id?: string;
  teacher_id?: string;
  day_of_week?: string;
}): Promise<TimeTableSlot[]> => {
  const response = await apiClient.get("/timetable/school", {
    params: {
      ...(params.class_id ? { class_id: params.class_id } : {}),
      ...(params.teacher_id ? { teacher_id: params.teacher_id } : {}),
      ...(params.day_of_week ? { day_of_week: params.day_of_week } : {}),
    },
  });
  return response.data.data;
};

export default function Timetable() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [deletedSlotIds, setDeletedSlotIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeTableSlot | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | undefined>();

  // Use Dynamic Data via our custom hooks
  const { classes: classOptions } = useClasses();
  const { teachers: teacherOptions } = useTeachers();

  const { data: fetchedSlots, isLoading } = useQuery({
    queryKey: ["timetable-slots", filterClass, filterTeacher],
    queryFn: () =>
      fetchTimeTableSlots({
        class_id: filterClass || undefined,
        teacher_id: filterTeacher || undefined,
      }),
  });

  const slots = useMemo(() => {
    const byId = new Map<string, TimeTableSlot>();
    for (const s of fetchedSlots ?? []) {
      if (!deletedSlotIds.has(s.id)) byId.set(s.id, s);
    }
    return markSlotConflicts([...byId.values()]);
  }, [fetchedSlots, deletedSlotIds]);

  const activeFilterCount = useMemo(
    () => [filterClass, filterTeacher].filter(Boolean).length,
    [filterClass, filterTeacher],
  );

  const clearFilters = () => {
    setFilterClass("");
    setFilterTeacher("");
    setFilterOpen(false);
  };

  // Class/teacher filters are applied server-side via query params. Do not filter
  // again here — slot.classId / slot.teacherId may not match option values (e.g.
  // nested user id vs directory id), which would hide every row despite a correct API response.

  const handleCreateNewClick = () => {
    setEditingSlotId(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    if (!selectedSlot) return;
    setEditingSlotId(selectedSlot.id);
    setIsModalOpen(true);
  };

  const handleDeleteSlot = () => {
    if (!selectedSlot) return;
    setDeletedSlotIds((prev) => new Set(prev).add(selectedSlot.id));
    setSelectedSlot(null);
  };

  // Build default values from selected slot properly mapping back strictly to schema matching values
  const editDefaultValues = useMemo(() => {
    if (!editingSlotId || !selectedSlot) return undefined;
    // console.log(selectedSlot);
    return selectedSlot;
  }, [editingSlotId, selectedSlot]);

  return (
    <div className="px-8 py-6 h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-3xl font-assistant font-bold">Timetable Builder</h1>

        <Button
          variant="primary"
          className="h-12 gap-2"
          onClick={handleCreateNewClick}
        >
          <PlusIcon className="size-4" />
          Create Slot
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="h-10 rounded-xl shrink-0 relative"
              >
                <FunnelSimpleIcon className="size-4!" />
                Filter by
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-primary-blue text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-80 space-y-4 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Filters</p>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-muted-foreground"
                  onClick={clearFilters}
                >
                  <XIcon className="size-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Class
              </label>
              <Select
                value={filterClass}
                onValueChange={(value) => setFilterClass(value || "")}
                items={classOptions}
              >
                <SelectTrigger className="w-full px-3">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {classOptions?.map((opt: SelectOption) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Teacher
              </label>
              <Select
                value={filterTeacher}
                onValueChange={(value) => setFilterTeacher(value || "")}
                items={teacherOptions}
              >
                <SelectTrigger className="w-full px-3">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    <SelectLabel>Teachers</SelectLabel>
                    {teacherOptions?.map((opt: SelectOption) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0">
        {/* Grid Container */}
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
            {/* Headers Row */}
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

            {/* Grid Cells and Rows */}
            {days.map((day, dIdx) => (
              <div key={day.value} className="contents relative">
                {/* Row Label (Sticky) */}
                <div
                  className="sticky left-0 z-20 bg-card border-r border-b border-border p-3 flex flex-col justify-center items-center font-semibold text-sm shadow-[1px_0_0_0_var(--color-border)] opacity-90"
                  style={{ gridColumn: 1, gridRow: dIdx + 2 }}
                >
                  <span className="-rotate-90 tracking-widest whitespace-nowrap opacity-50 text-[10px] uppercase font-bold mb-2 hidden md:block">
                    {day.label}
                  </span>
                </div>

                {/* Empty Grid Cells */}
                {times.map((_, tIdx) => (
                  <div
                    key={`${dIdx}-${tIdx}`}
                    onClick={() => setSelectedSlot(null)}
                    className="border-b border-r border-border bg-background/50 cover-parent hover:bg-muted/30 transition-colors cursor-pointer"
                    style={{ gridColumn: tIdx + 2, gridRow: dIdx + 2 }}
                  />
                ))}
              </div>
            ))}

            {/* Timetable Overlaid Blocks */}
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              // Guard duration within visible time columns
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
                    setSelectedSlot(slot);
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
                  {/* Conflict Striped Background */}
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

      <Sheet
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSlot(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton
          className="flex h-full w-full max-w-[min(100vw,400px)] flex-col gap-0 border-r p-0 sm:max-w-[400px]"
        >
          {selectedSlot && (
            <>
              <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border bg-muted/20 p-5">
                <SheetTitle className="font-bold text-lg">
                  Slot Details
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-1 flex-col overflow-y-auto p-5 custom-scrollbar">
                <div className="mb-6">
                  <Badge
                    className={cn(
                      "text-xs mb-2",
                      paletteForId(selectedSlot.subject.id),
                    )}
                  >
                    {selectedSlot.subject.name}
                  </Badge>
                  <h3 className="text-xl font-assistant font-bold text-foreground">
                    {selectedSlot.subject.name}
                  </h3>
                </div>

                <div className="space-y-4 text-sm bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserCircleIcon className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium">
                        Teacher
                      </span>
                      <span className="text-foreground font-semibold">
                        {selectedSlot.teacher.first_name}{" "}
                        {selectedSlot.teacher.last_name} (
                        {selectedSlot.teacher.first_name?.[0] ?? ""}
                        {selectedSlot.teacher.last_name?.[0] ?? ""})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <UsersIcon className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium">
                        Class
                      </span>
                      <span className="text-foreground font-semibold">
                        {selectedSlot.class.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <ClockIcon className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium">
                        Time
                      </span>
                      <span className="text-foreground font-semibold">
                        {days.find((d) => d.value === selectedSlot.day_of_week)
                          ?.label ?? "—"}
                        , {normalizeWallTime(selectedSlot.start_time)} –{" "}
                        {normalizeWallTime(selectedSlot.end_time)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <MapPinIcon className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium">
                        Room
                      </span>
                      <span className="text-foreground font-semibold">
                        {selectedSlot.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {!selectedSlot.is_active && (
                  <div className="mt-6 p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center shadow-sm">
                    <WarningCircleIcon
                      weight="bold"
                      className="size-6 mx-auto mb-2 text-destructive"
                    />
                    <div className="font-bold mb-1 text-base">
                      Conflict Detected
                    </div>
                    <div className="opacity-90">
                      This slot overlaps with another scheduled class or teacher
                      assignment.
                    </div>
                  </div>
                )}
              </div>

              <SheetFooter className="border-t border-border p-5 sm:flex-col">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleEditClick}
                >
                  Edit Details
                </Button>
                <Button
                  variant="destructive"
                  className="w-full h-11 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent"
                  onClick={handleDeleteSlot}
                >
                  Delete Slot
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
          <AddSlotModal
            onClose={() => setIsModalOpen(false)}
            defaultValues={editDefaultValues}
            editingId={editingSlotId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
