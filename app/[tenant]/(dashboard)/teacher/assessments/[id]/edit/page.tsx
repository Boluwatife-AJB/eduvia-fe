"use client";

import { useMemo } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { assessmentDetailsToFormValues } from "@/lib/map-assessment-details-to-form";
import { useTenantStore } from "@/lib/stores/tenant.store";
import type { AssessmentDetails } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { AssessmentForm } from "../../assessment-form";

const getAssessment = async (id: string): Promise<AssessmentDetails> => {
  const response = await apiClient.get(`/assessments/${id}`);
  return response.data.data;
};

export default function EditAssessment() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tenant } = useTenantStore();

  const {
    data: assessment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessment(id as string),
    enabled: Boolean(id),
  });

  const formValues = useMemo(
    () => (assessment ? assessmentDetailsToFormValues(assessment) : null),
    [assessment],
  );

  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            className="gap-2 -ml-2 h-9 px-2"
            onClick={() =>
              router.push(`/${tenant?.slug}/teacher/assessments/${id}`)
            }
          >
            <ArrowLeftIcon className="size-4" weight="bold" />
            Back to assessment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isError || !assessment ? (
        <p className="text-sm text-destructive max-w-5xl mx-auto">
          Could not load this assessment. It may have been removed or you may
          not have access.
        </p>
      ) : (
        <AssessmentForm
          key={assessment.id}
          mode="edit"
          assessmentId={id as string}
          initialValues={formValues}
        />
      )}
    </div>
  );
}
