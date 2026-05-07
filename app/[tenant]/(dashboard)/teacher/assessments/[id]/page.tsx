"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { cn } from "@/lib/utils";
import type { AssessmentDetails } from "@/types";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ClipboardTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ListNumbersIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const getAssessment = async (id: string): Promise<AssessmentDetails> => {
  const response = await apiClient.get(`/assessments/${id}`);
  return response.data.data;
};

function AssessmentDetailSkeleton() {
  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 min-w-0 flex-1">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 border border-border/50">
            <Skeleton className="h-3 w-28 mb-3" />
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-border/50 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
          <Card className="p-6 border border-border/50 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-32 w-full mt-4 rounded-lg" />
            <Skeleton className="h-32 w-full mt-4 rounded-lg" />
          </Card>
        </div>
        <div>
          <Card className="p-6 border border-border/50 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full mt-4" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <Card className="p-4 border border-border/50 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="shrink-0 opacity-80">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-assistant font-bold text-foreground tabular-nums">
        {value}
      </p>
    </Card>
  );
}

export default function AssessmentDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tenant } = useTenantStore();
  const { id } = useParams<{ id: string }>();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: assessment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessment(id as string),
    enabled: Boolean(id),
  });

  const invalidateQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["assessment", id] });
    void queryClient.invalidateQueries({ queryKey: ["assessments"] });
  };

  const publishMutation = useMutation({
    mutationFn: () => apiClient.patch(`/assessments/${id}/publish`),
    onSuccess: () => {
      toast.success("Assessment published");
      invalidateQueries();
    },
    onError: () => toast.error("Failed to publish assessment"),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => apiClient.patch(`/assessments/${id}/unpublish`),
    onSuccess: () => {
      toast.success("Assessment unpublished");
      invalidateQueries();
    },
    onError: () => toast.error("Failed to unpublish assessment"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.patch(`/assessments/${id}/archive`),
    onSuccess: () => {
      toast.success("Assessment archived");
      invalidateQueries();
    },
    onError: () => toast.error("Failed to archive assessment"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/assessments/${id}`),
    onSuccess: () => {
      toast.success("Assessment deleted");
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      setDeleteOpen(false);
      router.push(`/${tenant?.slug}/teacher/assessments`);
    },
    onError: () => toast.error("Failed to delete assessment"),
  });

  const actionBusy =
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) {
    return <AssessmentDetailSkeleton />;
  }

  if (isError || !assessment) {
    return (
      <div className="px-8 py-6">
        <Button
          variant="ghost"
          className="gap-2 mb-6"
          onClick={() => router.push(`/${tenant?.slug}/teacher/assessments`)}
        >
          <ArrowLeftIcon className="size-4" weight="bold" />
          Back to assessments
        </Button>
        <Card className="max-w-lg mx-auto p-8 text-center border border-border/50">
          <h1 className="text-xl font-assistant font-bold text-foreground mb-2">
            Could not load assessment
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Assessment not found."}
          </p>
          <Button
            variant="primary"
            onClick={() => router.push(`/${tenant?.slug}/teacher/assessments`)}
          >
            Return to list
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            className="gap-2 -ml-2 h-9 px-2"
            onClick={() => router.push(`/${tenant?.slug}/teacher/assessments`)}
          >
            <ArrowLeftIcon className="size-4" weight="bold" />
            Assessments
          </Button>

          <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-blue-500/10 text-blue-500">
              <ClipboardTextIcon size={24} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-assistant font-bold text-foreground leading-tight">
                {assessment.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge
                  variant={
                    assessment.status === "PUBLISHED" ? "default" : "outline"
                  }
                  className="text-[10px] uppercase tracking-wider font-semibold"
                >
                  {assessment.status}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {assessment.type.replace(/_/g, " ")}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {assessment.subject?.name}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {assessment.class?.name}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {assessment.term?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={() =>
              router.push(`/${tenant?.slug}/teacher/assessments/${id}/edit`)
            }
            disabled={actionBusy}
          >
            <PencilSimpleIcon className="size-4" weight="bold" />
            Edit
          </Button>
          {assessment.status === "PUBLISHED" ? (
            <Button
              variant="outline"
              className="h-10"
              onClick={() => unpublishMutation.mutate()}
              disabled={actionBusy}
            >
              {unpublishMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                "Unpublish"
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              className="h-10"
              onClick={() => publishMutation.mutate()}
              disabled={actionBusy}
            >
              {publishMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                "Publish"
              )}
            </Button>
          )}
          {/* <Button
            variant="outline"
            className="h-10 gap-2 text-amber-700 border-amber-200 hover:bg-amber-50"
            onClick={() => archiveMutation.mutate()}
            disabled={actionBusy}
          >
            <ArchiveIcon className="size-4" weight="bold" />
            {archiveMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              "Archive"
            )}
          </Button> */}
          <Button
            variant="outline"
            className="h-10 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setDeleteOpen(true)}
            disabled={actionBusy}
          >
            <TrashIcon className="size-4" weight="bold" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Marks"
          value={assessment.total_marks || 0}
          icon={<CheckCircleIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Pass Mark"
          value={`${assessment.pass_mark || 0}%`}
          icon={<CheckCircleIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Questions"
          value={assessment.assessmentQuestions?.length || 0}
          icon={<ListNumbersIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Duration"
          value={`${assessment.duration_mins} min`}
          icon={<ClockIcon className="size-4" weight="duotone" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-border/50 space-y-4">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">
              Instructions
            </h2>
            {assessment.instructions?.trim() ? (
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: assessment.instructions }}
              />
            ) : (
              <p className="text-muted-foreground text-sm italic">
                No instructions provided.
              </p>
            )}
          </Card>

          <Card className="p-6 border border-border/50 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-foreground">
                Questions
              </h2>
              <Badge variant="secondary">
                {assessment.assessmentQuestions?.length || 0} Questions
              </Badge>
            </div>

            {assessment.assessmentQuestions &&
            assessment.assessmentQuestions.length > 0 ? (
              <div className="space-y-6 mt-4">
                {assessment.assessmentQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border border-border/50 bg-muted/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Question {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {q.type.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {q.marks} Marks
                        </Badge>
                      </div>
                    </div>

                    <div
                      className="text-sm text-foreground prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: q.question_text }}
                    />

                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Options
                        </p>
                        <ul className="space-y-1">
                          {q.options.map((opt) => (
                            <li
                              key={opt.id}
                              className={cn(
                                "text-sm p-2 rounded-md border",
                                opt.is_correct
                                  ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900"
                                  : "border-border/50 bg-background",
                              )}
                            >
                              {opt.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {q.accepted_answers && q.accepted_answers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Accepted Answers
                        </p>
                        <ul className="space-y-1">
                          {q.accepted_answers.map((ans) => (
                            <li
                              key={ans}
                              className="text-sm p-2 rounded-md border"
                            >
                              {ans}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic py-4">
                No questions have been added to this assessment.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border border-border/50 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b pb-2">
                Timing
              </h2>
              <dl className="space-y-4 mt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase mb-1">
                    Start Time
                  </dt>
                  <dd className="font-medium text-foreground">
                    {assessment.start_time
                      ? format(new Date(assessment.start_time), "PPP 'at' p")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase mb-1">
                    End Time
                  </dt>
                  <dd className="font-medium text-foreground">
                    {assessment.end_time
                      ? format(new Date(assessment.end_time), "PPP 'at' p")
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b pb-2">
                Settings
              </h2>
              <dl className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase mb-1">
                    Max Attempts
                  </dt>
                  <dd className="font-medium text-foreground">
                    {assessment.max_attempts}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase mb-1">
                    Shuffle Questions
                  </dt>
                  <dd className="font-medium text-foreground">
                    {assessment.shuffle_questions ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase mb-1">
                    Exam Component
                  </dt>
                  <dd className="font-medium text-foreground">
                    {assessment.is_exam_component ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase mb-1">
                    CA Component
                  </dt>
                  <dd className="font-medium text-foreground">
                    {assessment.ca_component || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {assessment.title}
              </span>{" "}
              and all its associated questions and submissions. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
            >
              {deleteMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="size-4" />
                  Deleting…
                </span>
              ) : (
                "Delete assessment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
