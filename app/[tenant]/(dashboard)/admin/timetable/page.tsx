/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddSlotModal from "@/components/school-admin/modal/add-slot";
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
import { cn } from "@/lib/utils";
import {
  ClockIcon,
  FunnelSimpleIcon,
  MapPinIcon,
  PlusIcon,
  UserCircleIcon,
  UsersIcon,
  XIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useClasses } from "@/hooks/use-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { useSubjects } from "@/hooks/use-subjects";
import { days } from "@/lib/data";

// Shared Constants
const times = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const daysGridLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const daysValues = ["monday", "tuesday", "wednesday", "thursday", "friday"];

type Slot = {
  id: string;
  day: number;
  startIdx: number;
  duration: number;
  subject: string;
  subjectName: string;
  classAbr: string;
  classId: string;
  teacherInitials: string;
  teacherName: string;
  teacherId: string;
  room: string;
  color: string;
  isConflict: boolean;
};

const INITIAL_SLOTS: Slot[] = [
  {
    id: "1",
    day: 0,
    startIdx: 2,
    duration: 3,
    subject: "MTH",
    subjectName: "Mathematics",
    classAbr: "SSS 3A",
    classId: "3", // typically 3 implies SSS3/etc
    teacherInitials: "JB",
    teacherName: "John B.",
    teacherId: "jb",
    room: "Block A - 101",
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    isConflict: false,
  },
  {
    id: "3", // Conflict Example
    day: 2,
    startIdx: 4,
    duration: 2,
    subject: "CHE",
    subjectName: "Chemistry",
    classAbr: "SSS 2B",
    classId: "2",
    teacherInitials: "WW",
    teacherName: "Walter W.",
    teacherId: "ww",
    room: "Science Lab 2",
    color:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    isConflict: true,
  },
  {
    id: "4", // Overlap Conflict Example
    day: 2,
    startIdx: 4,
    duration: 2,
    subject: "BIO",
    subjectName: "Biology",
    classAbr: "SSS 2B",
    classId: "2",
    teacherInitials: "CF",
    teacherName: "Charles F.",
    teacherId: "cf",
    room: "Science Lab 3",
    color:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    isConflict: true,
  },
];

export default function Timetable() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");

  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | undefined>();

  // Use Dynamic Data via our custom hooks
  const { classes: classOptions } = useClasses();
  const { teachers: teacherOptions } = useTeachers();
  const { subjects: subjectOptions } = useSubjects();

  const activeFilterCount = useMemo(
    () => [filterClass, filterTeacher].filter(Boolean).length,
    [filterClass, filterTeacher],
  );

  const clearFilters = () => {
    setFilterClass("");
    setFilterTeacher("");
    setFilterOpen(false);
  };

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      let match = true;
      if (filterClass && slot.classId !== filterClass) match = false;
      if (filterTeacher && slot.teacherId !== filterTeacher) match = false;
      return match;
    });
  }, [filterClass, filterTeacher, slots]);

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
    setSlots(slots.filter((s) => s.id !== selectedSlot.id));
    setSelectedSlot(null);
  };

  const onModalSubmit = (data: any, id?: string) => {
    // Generate derived state from selected options
    const subjectRec = subjectOptions.find(
      (s: any) => s.value === data.subjectId,
    );
    const teacherRec = teacherOptions.find(
      (s: any) => s.value === data.teacherId,
    );
    const classRec = classOptions.find((s: any) => s.value === data.classId);

    const startIdx = times.indexOf(data.startTime);
    const endIdx = times.indexOf(data.endTime);
    // If end time is before start time, fallback to 1 duration block defensively
    const duration = Math.max(endIdx - startIdx, 1);
    const dayIdx = daysValues.indexOf(data.day);

    const newSlot: Slot = {
      id: id || Date.now().toString(),
      day: dayIdx >= 0 ? dayIdx : 0,
      startIdx,
      duration,
      subject:
        subjectRec?.label?.split(" ")[0].toUpperCase().substring(0, 3) ||
        data.subjectId.toUpperCase(),
      subjectName: subjectRec?.label || data.subjectId,
      classAbr: classRec?.label || data.classId,
      classId: data.classId,
      teacherInitials:
        teacherRec?.label
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2) || "T",
      teacherName: teacherRec?.label || "",
      teacherId: data.teacherId,
      room: data.venue,
      color: data.color,
      isConflict: false, // In a real app, dynamically recalculate conflicts here
    };

    if (id) {
      setSlots(slots.map((s) => (s.id === id ? newSlot : s)));
      setSelectedSlot(newSlot);
    } else {
      setSlots([...slots, newSlot]);
    }
  };

  // Build default values from selected slot properly mapping back strictly to schema matching values
  const editDefaultValues = useMemo(() => {
    if (!editingSlotId || !selectedSlot) return undefined;
    return {
      classId: selectedSlot.classId,
      teacherId: selectedSlot.teacherId,
      subjectId:
        subjectOptions.find((s: any) => s.label === selectedSlot.subjectName)
          ?.value || selectedSlot.subject.toLowerCase(),
      startTime: times[selectedSlot.startIdx],
      endTime: times[selectedSlot.startIdx + selectedSlot.duration] || "17:00",
      day: daysValues[selectedSlot.day],
      venue: selectedSlot.room,
      color: selectedSlot.color,
    };
  }, [editingSlotId, selectedSlot, subjectOptions]);

  return (
    <div className="px-8 py-6 h-full flex flex-col space-y-6 relative overflow-hidden">
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
                    {classOptions?.map((opt: any) => (
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
                    {teacherOptions?.map((opt: any) => (
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
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden relative">
        {/* Grid Container */}
        <div className="flex-1 overflow-auto border border-border bg-card rounded-xl custom-scrollbar relative shadow-sm">
          <div
            className="min-w-[1400px] grid select-none"
            style={{
              gridTemplateColumns: "100px repeat(20, minmax(64px, 1fr))",
              gridAutoRows: "minmax(100px, auto)",
            }}
          >
            {/* Headers Row */}
            <div className="sticky left-0 top-0 z-30 bg-muted/60 backdrop-blur-md border-r border-b border-border p-3 flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground -rotate-45">
                Day/Time
              </span>
            </div>
            {times.slice(0, 20).map((time, idx) => (
              <div
                key={`time-${idx}`}
                className="sticky top-0 z-20 border-b border-r border-border p-2 text-center text-xs font-semibold text-muted-foreground bg-muted/60 backdrop-blur-md flex items-center justify-center"
                style={{ gridColumn: idx + 2, gridRow: 1 }}
              >
                {time}
              </div>
            ))}

            {/* Grid Cells and Rows */}
            {/* {daysGridLabels.map((day, dIdx) => ( */}
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
                  {/* {day} */}
                </div>

                {/* Empty Grid Cells */}
                {times.slice(0, 20).map((_, tIdx) => (
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
            {filteredSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              // Guard duration spanning max bound (20 indices total)
              const validDuration = Math.min(slot.duration, 20 - slot.startIdx);
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
                    slot.color,
                  )}
                  style={{
                    gridRow: slot.day + 2,
                    gridColumn: `${slot.startIdx + 2} / span ${validDuration}`,
                  }}
                >
                  {/* Conflict Striped Background */}
                  {slot.isConflict && (
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgb(220, 38, 38) 10px, rgb(220, 38, 38) 20px)`,
                      }}
                    />
                  )}

                  <div className="font-bold text-sm tracking-tight relative z-10 truncate pr-4">
                    {slot.subject}
                  </div>
                  {slot.isConflict && (
                    <WarningCircleIcon
                      weight="fill"
                      className="absolute top-2.5 right-2 size-4 text-destructive z-10"
                    />
                  )}
                  <div className="text-xs font-semibold opacity-90 title-font relative z-10 mt-1">
                    {slot.classAbr}
                  </div>
                  <div className="text-[10px] uppercase font-bold mt-auto truncate relative z-10 opacity-80 pt-2 flex items-center justify-between">
                    <span>{slot.teacherInitials}</span>
                    <span className="opacity-70 px-1 bg-black/5 dark:bg-white/10 rounded">
                      {slot.room.split(" ")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditional Right Sidebar Details */}
        {selectedSlot && (
          <div className="w-[300px] shrink-0 border border-border rounded-xl bg-card flex flex-col shadow-sm overflow-hidden animate-in slide-in-from-right-10 fade-in duration-300">
            <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center">
              <span className="font-bold text-lg">Slot Details</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 rounded-full opacity-60 hover:opacity-100"
                onClick={() => setSelectedSlot(null)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="p-5 flex flex-col flex-1 overflow-auto custom-scrollbar">
              <div className="mb-6">
                <Badge className={cn("text-xs mb-2", selectedSlot.color)}>
                  {selectedSlot.subject}
                </Badge>
                <h3 className="text-xl font-assistant font-bold text-foreground">
                  {selectedSlot.subjectName}
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
                      {selectedSlot.teacherName} ({selectedSlot.teacherInitials}
                      )
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
                      {selectedSlot.classAbr}
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
                      {daysGridLabels[selectedSlot.day]},{" "}
                      {times[selectedSlot.startIdx]} -{" "}
                      {times[selectedSlot.startIdx + selectedSlot.duration] ||
                        "17:00"}
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
                      {selectedSlot.room}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSlot.isConflict && (
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

              <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
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
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
          <AddSlotModal
            onClose={() => setIsModalOpen(false)}
            onSubmitSlot={onModalSubmit}
            defaultValues={editDefaultValues}
            editingId={editingSlotId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
