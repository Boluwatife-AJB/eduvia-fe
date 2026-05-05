"use client";

import { apiClient } from "@/lib/api";
import type { AcademicSession, SelectOption } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchAcademicSessions = async (): Promise<AcademicSession[]> => {
  const response = await apiClient.get("/school-setup/academic-sessions");
  return response.data.data;
};

export function useTerm() {
  const {
    data: sessionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: fetchAcademicSessions,
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const terms: SelectOption[] =
    sessionsData?.flatMap((session) =>
      (session.terms ?? []).map((term) => ({
        value: term.id,
        label: `${term.name} (${session.name})`,
      })),
    ) ?? [];

  return {
    terms,
    sessions: sessionsData ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
