"use client";

import { apiClient } from "@/lib/api";
import { SelectOption, Subject } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/school-setup/subjects");
  return response.data.data;
};

export function useSubjects() {
  const {
    data: subjectsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  // console.log("subjectsData", subjectsData);

  const subjects: SelectOption[] =
    subjectsData?.map((subject: Subject) => ({
      value: subject.id,
      label: `${subject.name} (${subject.code})`,
    })) ?? [];

  return {
    subjects,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
