"use client";

import AddSlotModal from "@/components/school-admin/modal/add-slot";
import { TimetableGrid } from "@/components/school-admin/timetable-grid";
import { TimetableSlotDetailsSheet } from "@/components/school-admin/timetable-slot-details-sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { SelectOption, TimeTableSlot } from "@/types";
import { FunnelSimpleIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

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
    <div className="px-8 pt-6 pb-4 h-full flex flex-col space-y-6 relative overflow-hidden">
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

      <TimetableGrid
        slots={slots}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        isLoading={isLoading}
      />

      <TimetableSlotDetailsSheet
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSlot(null);
        }}
        selectedSlot={selectedSlot}
        onEdit={handleEditClick}
        onDelete={handleDeleteSlot}
        side="right"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
          <AddSlotModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingSlotId(undefined);
              setSelectedSlot(null);
            }}
            defaultValues={editDefaultValues}
            editingId={editingSlotId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
