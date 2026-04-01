"use client";

import { apiClient } from "@/lib/api";
import { SelectOption } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface StudentResponse {
  id: string;
  first_name: string;
  last_name: string;
}

const fetchStudents = async (): Promise<StudentResponse[]> => {
  const response = await apiClient.get<{ data: StudentResponse[] }>(
    "/users/students",
  );
  return response.data.data;
};

export function useStudents() {
  const {
    data: studentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students", "directory"],
    queryFn: fetchStudents,
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const students: SelectOption[] =
    studentsData?.map((student) => ({
      value: student.id,
      label: `${student.first_name} ${student.last_name}`,
    })) ?? [];

  return {
    students,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
