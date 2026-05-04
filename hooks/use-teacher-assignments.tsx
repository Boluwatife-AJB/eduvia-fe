"use client";

import { apiClient } from "@/lib/api";
import { days } from "@/lib/data";
import type {
  DayOfWeek,
  SelectOption,
  TeacherTimetableResponse,
  TeacherTimetableSlot,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

/** Timetable classes may have blank `name`; keep them selectable with a visible label. */
function classDisplayLabel(cls: TeacherTimetableSlot["class"]): string {
  const name = cls.name?.trim() ?? "";
  if (name) return name;
  const level = cls.level?.trim() ?? "";
  if (level) return level;
  const id = cls.id?.trim() ?? "";
  if (id.length >= 8) return `Class (${id.slice(0, 8)}…)`;
  return id ? `Class (${id})` : "Unnamed class";
}

function subjectDisplayLabel(slot: TeacherTimetableSlot): string {
  const name = slot.subject.name?.trim() ?? "";
  const code = slot.subject.code?.trim() ?? "";
  if (name && code) return `${name} (${code})`;
  if (name) return name;
  if (code) return code;
  const id = slot.subject.id?.trim() ?? "";
  if (id.length >= 8) return `Subject (${id.slice(0, 8)}…)`;
  return id ? `Subject (${id})` : "Unnamed subject";
}

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

const fetchTeacherTimetable = async (): Promise<TeacherTimetableResponse> => {
  const response = await apiClient.get<{
    data: Partial<Record<DayOfWeek, TeacherTimetableSlot[]>>;
  }>("/timetable/teacher/me");
  return normalizeTeacherTimetable(response.data.data);
};

export function useTeacherAssignments() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teacher-timetable-me"],
    queryFn: fetchTeacherTimetable,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { classes, subjectsByClass } = useMemo(() => {
    if (!data) {
      return {
        classes: [] as SelectOption[],
        subjectsByClass: {} as Record<string, SelectOption[]>,
      };
    }

    const classMap = new Map<string, SelectOption>();
    const subjectsByClassInner: Record<string, Map<string, SelectOption>> = {};

    for (const d of days) {
      const slots = data[d.value as DayOfWeek] ?? [];
      for (const slot of slots) {
        const cid = slot.class.id;
        if (!classMap.has(cid)) {
          classMap.set(cid, {
            value: cid,
            label: classDisplayLabel(slot.class),
          });
        }
        if (!subjectsByClassInner[cid]) {
          subjectsByClassInner[cid] = new Map();
        }
        const sid = slot.subject.id;
        if (!subjectsByClassInner[cid]!.has(sid)) {
          subjectsByClassInner[cid]!.set(sid, {
            value: sid,
            label: subjectDisplayLabel(slot),
          });
        }
      }
    }

    const classesArr = Array.from(classMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );

    const subjectsByClassOut: Record<string, SelectOption[]> = {};
    for (const [cid, smap] of Object.entries(subjectsByClassInner)) {
      subjectsByClassOut[cid] = Array.from(smap.values()).sort((a, b) =>
        a.label.localeCompare(b.label),
      );
    }

    return { classes: classesArr, subjectsByClass: subjectsByClassOut };
  }, [data]);

  const getSubjectsForClass = useCallback(
    (classId: string): SelectOption[] => {
      if (!classId) return [];
      return subjectsByClass[classId] ?? [];
    },
    [subjectsByClass],
  );

  return {
    classes,
    subjectsByClass,
    getSubjectsForClass,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
