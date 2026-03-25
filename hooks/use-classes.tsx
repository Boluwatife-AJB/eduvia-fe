"use client";

import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface ClassResponse {
  id: string;
  name: string;
}

const fetchClasses = async () => {
  const response = await apiClient.get("/school-setup/classes/names");
  return response.data;
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

  const classes = classesData?.map((cls: ClassResponse) => ({
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
