"use client";

import { SelectOption } from "@/types";

// Temporarily mock subjects until the API route is finalized
const MOCK_SUBJECTS: SelectOption[] = [
  { value: "mth", label: "Mathematics (MTH)" },
  { value: "eng", label: "English Language (ENG)" },
  { value: "phy", label: "Physics (PHY)" },
  { value: "che", label: "Chemistry (CHE)" },
  { value: "bio", label: "Biology (BIO)" },
];

export function useSubjects() {
  return {
    subjects: MOCK_SUBJECTS,
    isLoading: false,
    error: null,
  };
}
