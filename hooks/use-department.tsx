"use client";

import { apiClient } from "@/lib/api";
import { SelectOption } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  hod_id: string;
}

const fetchDepartments = async (): Promise<DepartmentResponse[]> => {
  const response = await apiClient.get("/school-setup/departments", {});
  return response.data.data;
};

export function useDepartments() {
  const {
    data: departmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const departments: SelectOption[] =
    departmentsData?.map((department) => ({
      value: department.id,
      label: department.name,
    })) ?? [];

  return {
    departments,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
