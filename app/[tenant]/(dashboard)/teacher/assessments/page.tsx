"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherAssignments } from "@/hooks/use-teacher-assignments";
import { apiClient } from "@/lib/api";
import { folderCardPalette } from "@/lib/data";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { cn, formatFolderDate } from "@/lib/utils";
import { Assessment } from "@/types";
import {
  ClipboardTextIcon,
  ClockIcon,
  DotsThreeIcon,
  FileTextIcon,
  PlusIcon,
  QuestionIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

interface ApiParams {
  subject_id?: string;
  class_id?: string;
  status?: string;
}

const fetchAssessments = async (params: ApiParams): Promise<Assessment[]> => {
  const response = await apiClient.get("/assessments", { params });
  return response.data.data;
};

const toggleAssessmentPublication = async (
  id: string,
  isPublished: boolean,
) => {
  const action = isPublished ? "unpublish" : "publish";
  const response = await apiClient.patch(`/assessments/${id}/${action}`);
  return response.data.data;
};

const archiveAssessment = async (id: string) => {
  const response = await apiClient.patch(`/assessments/${id}/archive`);
  return response.data.data;
};

const deleteAssessment = async (id: string) => {
  const response = await apiClient.delete(`/assessments/${id}`);
  return response.data.data;
};

const STATUS_OPTIONS = [
  "DRAFT",
  "PUBLISHED",
  "ONGOING",
  "COMPLETED",
  "ARCHIVED",
];

function AssessmentCardSkeleton() {
  return (
    <Card className="p-4 flex flex-col gap-4 border border-border/50">
      <div className="flex justify-between items-start">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-1 w-1 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}

export default function Assessments() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tenant } = useTenantStore();

  const [filterClassId, setFilterClassId] = useState<string | null>(null);
  const [filterSubjectId, setFilterSubjectId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const { classes, getSubjectsForClass } = useTeacherAssignments();
  const subjects = filterClassId ? getSubjectsForClass(filterClassId) : [];

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["assessments", filterClassId, filterSubjectId, filterStatus],
    queryFn: () => {
      const apiParams: ApiParams = {};
      if (filterClassId && filterClassId !== "all")
        apiParams.class_id = filterClassId;
      if (filterSubjectId && filterSubjectId !== "all")
        apiParams.subject_id = filterSubjectId;
      if (filterStatus && filterStatus !== "all")
        apiParams.status = filterStatus;
      return fetchAssessments(apiParams);
    },
  });

  const { mutateAsync: togglePublicationMutation } = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      toggleAssessmentPublication(id, isPublished),
    onSuccess: (value) => {
      toast.success(
        value?.status === "PUBLISHED"
          ? "Assessment published successfully"
          : "Assessment unpublished successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: () => toast.error("Failed to toggle assessment publication"),
  });

  const { mutateAsync: archiveMutation } = useMutation({
    mutationFn: (id: string) => archiveAssessment(id),
    onSuccess: () => {
      toast.success("Assessment archived successfully");
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: () => toast.error("Failed to archive assessment"),
  });

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: () => {
      toast.success("Assessment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: () => toast.error("Failed to delete assessment"),
  });

  const handleCardClick = (id: string) => {
    router.push(`/${tenant?.slug}/teacher/assessments/${id}`);
  };

  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold text-slate-800">
          Assessments
        </h1>

        <Link
          href={`/${tenant?.slug}/teacher/assessments/create-assessment`}
          className={buttonVariants({
            variant: "primary",
            size: "default",
            className: "h-11 gap-2",
          })}
        >
          <PlusIcon className="size-4" weight="bold" />
          Create Assessment
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 w-full relative">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">
            Class
          </label>
          <Select
            value={filterClassId || undefined}
            onValueChange={(val) => {
              setFilterClassId(val ?? "all");
              setFilterSubjectId("all");
            }}
          >
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                  {cls.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 w-full relative">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">
            Subject
          </label>
          <Select
            value={filterSubjectId || undefined}
            onValueChange={(val) => setFilterSubjectId(val ?? "all")}
            disabled={!filterClassId || filterClassId === "all"}
          >
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
              <SelectValue
                placeholder={
                  !filterClassId || filterClassId === "all"
                    ? "Select a class first"
                    : "All Subjects"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 w-full relative">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">
            Status
          </label>
          <Select
            value={filterStatus || undefined}
            onValueChange={(val) => setFilterStatus(val ?? "all")}
          >
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <AssessmentCardSkeleton key={index} />
          ))}
        </div>
      ) : assessments && assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment, index) => {
            const palette = folderCardPalette[index % folderCardPalette.length];
            const isPublished = assessment.status === "PUBLISHED";

            return (
              <Card
                key={assessment.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 border border-border/50"
                onClick={() => handleCardClick(assessment.id)}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "p-3 rounded-xl flex items-center justify-center shrink-0",
                      palette.bg,
                    )}
                  >
                    <ClipboardTextIcon
                      size={24}
                      weight="duotone"
                      className={palette.color}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <DotsThreeIcon weight="bold" className="size-5" />
                        </Button>
                      }
                    />

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/${tenant?.slug}/teacher/assessments/${assessment.id}/edit`,
                          );
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      {isPublished ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublicationMutation({
                              id: assessment.id,
                              isPublished: false,
                            });
                          }}
                        >
                          Unpublish
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublicationMutation({
                              id: assessment.id,
                              isPublished: true,
                            });
                          }}
                        >
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveMutation(assessment.id);
                        }}
                      >
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation(assessment.id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                    <Badge
                      className={cn(
                        isPublished
                          ? "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20"
                          : assessment.status === "ARCHIVED"
                            ? "bg-gray-600/10 text-gray-600 focus-visible:ring-gray-600/20"
                            : assessment.status === "ONGOING"
                              ? "bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20"
                              : assessment.status === "COMPLETED"
                                ? "bg-indigo-600/10 text-indigo-600 focus-visible:ring-indigo-600/20"
                                : "bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20",
                        "border-none focus-visible:outline-none text-xs py-0.5 px-1.5 capitalize",
                      )}
                    >
                      {assessment.status.toLowerCase()}
                    </Badge>
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="line-clamp-1 max-w-[40%] text-xs font-medium bg-muted px-1.5 py-0.5 rounded-sm">
                      {assessment.type}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="line-clamp-1 max-w-[40%]">
                      {assessment.subject?.name ?? "—"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="line-clamp-1 max-w-[40%]">
                      {assessment.class?.name ?? "—"}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                    <ClockIcon className="size-3.5" />
                    <span>{assessment.duration_mins} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                    <FileTextIcon className="size-3.5" />
                    <span>{assessment.total_marks ?? 0} marks</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Start Time
                    </span>
                    <span className="text-xs font-medium">
                      {assessment.start_time
                        ? format(
                            new Date(assessment.start_time),
                            "MMM d, h:mm a",
                          )
                        : "—"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      End Time
                    </span>
                    <span className="text-xs font-medium">
                      {assessment.end_time
                        ? format(new Date(assessment.end_time), "MMM d, h:mm a")
                        : "—"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-dashed border-2 border-slate-200 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <ClipboardTextIcon weight="duotone" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No assessments found
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            There are no assessments matching your criteria. Try adjusting the
            filters or create a new assessment.
          </p>
          <Link
            href={`/${tenant?.slug}/teacher/assessments/create-assessment`}
            className={buttonVariants({
              variant: "outline",
              className:
                "h-11 px-6 font-semibold border-slate-200 hover:bg-slate-50",
            })}
          >
            Create your first assessment
          </Link>
        </div>
      )}
    </div>
  );
}
