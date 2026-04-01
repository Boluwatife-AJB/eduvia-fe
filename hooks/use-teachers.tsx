"use client";

import { apiClient } from "@/lib/api";
import { SelectOption } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface TeacherResponse {
  id: string;
  first_name: string;
  last_name: string;
}

const fetchTeachers = async (): Promise<TeacherResponse[]> => {
  const response = await apiClient.get("/users/teachers", {
    params: { limit: 100 }, // get enough teachers for dropdown
  });
  return response.data.data;
};

export function useTeachers() {
  const {
    data: teachersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["teachers", "directory"],
    queryFn: fetchTeachers,
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const teachers: SelectOption[] =
    teachersData?.map((teacher) => ({
      value: teacher.id,
      label: `${teacher.first_name} ${teacher.last_name}`,
    })) ?? [];

  return {
    teachers,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
