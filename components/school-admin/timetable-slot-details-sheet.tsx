"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { days } from "@/lib/data";
import { cn } from "@/lib/utils";
import { TimeTableSlot } from "@/types";
import { normalizeWallTime, paletteForId } from "@/lib/timetable-utils";
import {
  ClockIcon,
  MapPinIcon,
  UserCircleIcon,
  UsersIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export type TimetableSlotDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: TimeTableSlot | null;
  onEdit: () => void;
  onDelete: () => void;
  side?: "left" | "right";
};

export function TimetableSlotDetailsSheet({
  open,
  onOpenChange,
  selectedSlot,
  onEdit,
  onDelete,
  side = "right",
}: TimetableSlotDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton
        className={cn(
          "flex h-full w-full max-w-[min(100vw,400px)] flex-col gap-0 p-0 sm:max-w-[400px]",
          side === "right" ? "border-l" : "border-r",
        )}
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
                onClick={onEdit}
              >
                Edit Details
              </Button>
              <Button
                variant="destructive"
                className="w-full h-11 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent"
                onClick={onDelete}
              >
                Delete Slot
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
