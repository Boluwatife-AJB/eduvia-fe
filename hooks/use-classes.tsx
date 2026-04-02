"use client";

import { apiClient } from "@/lib/api";
import { ClassesResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

// Move all the hooks into the tenant context

const fetchClasses = async () => {
  const response = await apiClient.get("/school-setup/classes/names");
  return response.data.data;
};

export function useClasses() {
  const {
    data: classesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const classes = classesData?.map((cls: ClassesResponse) => ({
    value: cls.id,
    label: cls.name,
  }));

  return {
    classes: classes || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
