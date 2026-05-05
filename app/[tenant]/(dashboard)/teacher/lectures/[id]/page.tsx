"use client";

import EditLectureModal from "@/components/teacher/modal/edit-lecture";
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
import { formatBytes, formatFolderDate } from "@/lib/utils";
import { TeacherLectureDetails } from "@/types";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  EyeIcon,
  FileAudioIcon,
  FilePdfIcon,
  FileTextIcon,
  FileVideoIcon,
  ImagesIcon,
  LinkIcon,
  PencilSimpleIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const fetchLectureDetails = async (
  id: string,
): Promise<TeacherLectureDetails> => {
  const response = await apiClient.get(`/lectures/my-lectures/${id}`);
  return response.data.data;
};

function getContentTypeIcon(type: string) {
  switch (type?.toUpperCase()) {
    case "VIDEO":
      return (
        <FileVideoIcon size={24} weight="duotone" className="text-blue-500" />
      );
    case "AUDIO":
      return (
        <FileAudioIcon size={24} weight="duotone" className="text-purple-500" />
      );
    case "PDF":
      return (
        <FilePdfIcon size={24} weight="duotone" className="text-red-500" />
      );
    case "SLIDES":
    case "IMAGE":
      return (
        <ImagesIcon size={24} weight="duotone" className="text-emerald-500" />
      );
    case "LINK":
      return <LinkIcon size={24} weight="duotone" className="text-cyan-500" />;
    case "TEXT":
    default:
      return (
        <FileTextIcon size={24} weight="duotone" className="text-gray-500" />
      );
  }
}

function LectureDetailSkeleton() {
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
          <Skeleton className="h-10 w-20" />
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

      <Card className="p-6 border border-border/50 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full mt-4 rounded-lg" />
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
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

export default function LectureDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tenant } = useTenantStore();
  const { id } = useParams<{ id: string }>();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: lecture,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["lecture-details", id],
    queryFn: () => fetchLectureDetails(id),
    enabled: Boolean(id),
  });

  const stats = useMemo(() => {
    const rows = lecture?.views ?? [];
    const totalViews = rows.length;
    const uniqueStudents = new Set(rows.map((v) => v.student_id)).size;
    const avgProgress =
      rows.length > 0
        ? Math.round(
            rows.reduce((s, v) => s + (v.progress_percentage ?? 0), 0) /
              rows.length,
          )
        : null;
    return { totalViews, uniqueStudents, avgProgress, viewRows: rows };
  }, [lecture]);

  const invalidateLectureQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["lecture-details", id] });
    void queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
  };

  const publishMutation = useMutation({
    mutationFn: () => apiClient.patch(`/lectures/${id}/publish`),
    onSuccess: () => {
      toast.success("Lecture published");
      invalidateLectureQueries();
    },
    onError: () => toast.error("Failed to publish lecture"),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => apiClient.patch(`/lectures/${id}/unpublish`),
    onSuccess: () => {
      toast.success("Lecture unpublished");
      invalidateLectureQueries();
    },
    onError: () => toast.error("Failed to unpublish lecture"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.patch(`/lectures/${id}/archive`),
    onSuccess: () => {
      toast.success("Lecture archived");
      invalidateLectureQueries();
    },
    onError: () => toast.error("Failed to archive lecture"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/lectures/${id}`),
    onSuccess: () => {
      toast.success("Lecture deleted");
      void queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
      setDeleteOpen(false);
      router.push(`/${tenant?.slug}/teacher/lectures`);
    },
    onError: () => toast.error("Failed to delete lecture"),
  });

  const actionBusy =
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) {
    return <LectureDetailSkeleton />;
  }

  if (isError || !lecture) {
    return (
      <div className="px-8 py-6">
        <Button
          variant="ghost"
          className="gap-2 mb-6"
          onClick={() => router.push(`/${tenant?.slug}/teacher/lectures`)}
        >
          <ArrowLeftIcon className="size-4" weight="bold" />
          Back to lectures
        </Button>
        <Card className="max-w-lg mx-auto p-8 text-center border border-border/50">
          <h1 className="text-xl font-assistant font-bold text-foreground mb-2">
            Could not load lecture
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Lecture not found."}
          </p>
          <Button
            variant="primary"
            onClick={() => router.push(`/${tenant?.slug}/teacher/lectures`)}
          >
            Return to list
          </Button>
        </Card>
      </div>
    );
  }

  const durationLabel =
    lecture.duration_mins != null ? String(lecture.duration_mins) : "—";
  const avgProgressLabel =
    stats.avgProgress != null ? `${stats.avgProgress}%` : "—";

  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            className="gap-2 -ml-2 h-9 px-2"
            onClick={() => router.push(`/${tenant?.slug}/teacher/lectures`)}
          >
            <ArrowLeftIcon className="size-4" weight="bold" />
            Lectures
          </Button>

          <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
              {getContentTypeIcon(lecture.content_type)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-assistant font-bold text-foreground leading-tight">
                {lecture.title}
              </h1>
              {lecture.description?.trim() ? (
                <p className="text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                  {lecture.description}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge
                  variant={
                    lecture.status === "PUBLISHED" ? "default" : "outline"
                  }
                  className="text-[10px] uppercase tracking-wider font-semibold"
                >
                  {lecture.status}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {lecture.content_type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {lecture.subject?.name}
                  {lecture.subject?.code ? ` (${lecture.subject.code})` : ""}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {lecture.class?.name}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {lecture.term?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={() => setEditOpen(true)}
            disabled={actionBusy}
          >
            <PencilSimpleIcon className="size-4" weight="bold" />
            Edit
          </Button>
          {lecture.status === "PUBLISHED" ? (
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
          <Button
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
          </Button>
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
          label="Total views"
          value={String(stats.totalViews)}
          icon={<EyeIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Students reached"
          value={String(stats.uniqueStudents)}
          icon={<UsersThreeIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Avg. progress"
          value={avgProgressLabel}
          icon={<EyeIcon className="size-4" weight="duotone" />}
        />
        <StatCard
          label="Duration (min)"
          value={durationLabel}
          icon={<FileTextIcon className="size-4" weight="duotone" />}
        />
      </div>

      <Card className="p-6 border border-border/50 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Details
          </h2>
          <Separator className="my-4" />
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Sort order</dt>
              <dd className="font-medium text-foreground">{lecture.order}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium text-foreground">
                {formatFolderDate(lecture.created_at)}
              </dd>
            </div>
            {lecture.published_at ? (
              <div>
                <dt className="text-muted-foreground">Published</dt>
                <dd className="font-medium text-foreground">
                  {formatFolderDate(lecture.published_at)}
                </dd>
              </div>
            ) : null}
            {lecture.file_size != null ? (
              <div>
                <dt className="text-muted-foreground">File size</dt>
                <dd className="font-medium text-foreground">
                  {formatBytes(lecture.file_size)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {lecture.external_url ? (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              External link
            </h3>
            <a
              href={lecture.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline-offset-4 hover:underline break-all"
            >
              {lecture.external_url}
            </a>
          </div>
        ) : null}

        {lecture.file_url ? (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">File</h3>
            <a
              href={lecture.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline-offset-4 hover:underline break-all"
            >
              Open file
            </a>
          </div>
        ) : null}

        {lecture.text_content?.trim() ? (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Lesson text
            </h3>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar">
              {lecture.text_content}
            </div>
          </div>
        ) : null}

        {stats.viewRows.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Recent student views
            </h3>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Progress</th>
                    <th className="px-3 py-2 font-medium">Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.viewRows.slice(0, 8).map((v) => (
                    <tr
                      key={v.id}
                      className="border-t border-border/50 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 tabular-nums">
                        {v.progress_percentage ?? 0}%
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatFolderDate(v.viewed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Card>

      <EditLectureModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        lecture={lecture}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lecture?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {lecture.title}
              </span>{" "}
              for students. This action cannot be undone.
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
                "Delete lecture"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
