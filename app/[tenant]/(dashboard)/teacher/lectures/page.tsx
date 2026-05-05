"use client";

import UploadLectureModal from "@/components/teacher/modal/upload-lecture";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { TeacherLecture } from "@/types";
import {
  BookOpen,
  DotsThreeIcon,
  FileAudioIcon,
  FilePdfIcon,
  FileTextIcon,
  FileVideoIcon,
  ImagesIcon,
  LinkIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ApiParams {
  subject_id?: string;
  class_id?: string;
  content_type?: string;
}

const fetchLectures = async (params: ApiParams): Promise<TeacherLecture[]> => {
  const response = await apiClient.get("/lectures/my-lectures", {
    params,
  });
  return response.data.data;
};

const toggleLecturePublication = async (id: string, isPublished: boolean) => {
  const action = isPublished ? "unpublish" : "publish";
  const response = await apiClient.patch(`/lectures/${id}/${action}`);
  return response.data.data;
};

const archiveLecture = async (id: string) => {
  const response = await apiClient.patch(`/lectures/${id}/archive`);
  return response.data.data;
};

const deleteLecture = async (id: string) => {
  const response = await apiClient.delete(`/lectures/${id}`);
  return response.data.data;
};

const CONTENT_TYPES = [
  "VIDEO",
  "AUDIO",
  "PDF",
  "SLIDES",
  "IMAGE",
  "TEXT",
  "LINK",
];

const getContentTypeIcon = (type: string) => {
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
};

function LectureCardSkeleton() {
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
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  );
}

export default function Lectures() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tenant } = useTenantStore();

  const [isUploadLectureModalOpen, setIsUploadLectureModalOpen] =
    useState(false);

  const [filterClassId, setFilterClassId] = useState<string | null>(null);
  const [filterSubjectId, setFilterSubjectId] = useState<string | null>(null);
  const [filterContentType, setFilterContentType] = useState<string | null>(
    null,
  );

  const { classes, getSubjectsForClass } = useTeacherAssignments();
  const subjects = filterClassId ? getSubjectsForClass(filterClassId) : [];

  const { data: lectures, isLoading } = useQuery({
    queryKey: [
      "teacher-lectures",
      filterClassId,
      filterSubjectId,
      filterContentType,
    ],
    queryFn: () => {
      const apiParams: ApiParams = {};
      if (filterClassId && filterClassId !== "all")
        apiParams.class_id = filterClassId;
      if (filterSubjectId && filterSubjectId !== "all")
        apiParams.subject_id = filterSubjectId;
      if (filterContentType && filterContentType !== "all")
        apiParams.content_type = filterContentType;
      return fetchLectures(apiParams);
    },
  });

  const { mutateAsync: toggleLecturePublicationMutation } = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      toggleLecturePublication(id, isPublished),
    onSuccess: (value) => {
      toast.success(
        value.isPublished
          ? "Lecture published successfully"
          : "Lecture unpublished successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => toast.error("Failed to toggle lecture publication"),
  });

  const { mutateAsync: archiveLectureMutation } = useMutation({
    mutationFn: (id: string) => archiveLecture(id),
    onSuccess: () => {
      toast.success("Lecture archived successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => toast.error("Failed to archive lecture"),
  });

  const { mutateAsync: deleteLectureMutation } = useMutation({
    mutationFn: (id: string) => deleteLecture(id),
    onSuccess: () => {
      toast.success("Lecture deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => toast.error("Failed to delete lecture"),
  });

  const handleUploadLecture = () => {
    setIsUploadLectureModalOpen(true);
  };

  const handleCardClick = (id: string) => {
    router.push(`/${tenant?.slug}/teacher/lectures/${id}`);
  };

  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold text-slate-800">
          Lectures
        </h1>

        <Button
          variant="primary"
          className="h-11 gap-2"
          onClick={handleUploadLecture}
        >
          <PlusIcon weight="bold" />
          Upload Lecture
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 w-full relative">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">
            Class
          </label>
          <Select
            value={filterClassId}
            onValueChange={(val) => {
              setFilterClassId(val ?? "all");
              setFilterSubjectId("all");
            }}
            items={classes.map((cls) => ({
              value: cls.value,
              label: cls.label,
            }))}
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
            value={filterSubjectId}
            onValueChange={(val) => setFilterSubjectId(val ?? "all")}
            disabled={filterClassId === "all"}
            items={subjects.map((sub) => ({
              value: sub.value,
              label: sub.label,
            }))}
          >
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
              <SelectValue
                placeholder={
                  filterClassId === "all"
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
            Content Type
          </label>
          <Select
            value={filterContentType}
            onValueChange={(val) => setFilterContentType(val ?? "all")}
          >
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <LectureCardSkeleton key={index} />
          ))}
        </div>
      ) : lectures && lectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lectures.map((lecture, index) => {
            const palette = folderCardPalette[index % folderCardPalette.length];

            return (
              <Card
                key={lecture.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 border border-border/50"
                onClick={() => handleCardClick(lecture.id)}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "p-3 rounded-xl flex items-center justify-center shrink-0",
                      palette.bg,
                    )}
                  >
                    {getContentTypeIcon(lecture.content_type)}
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
                      {lecture.status === "PUBLISHED" ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLecturePublicationMutation({
                              id: lecture.id,
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
                            toggleLecturePublicationMutation({
                              id: lecture.id,
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
                          archiveLectureMutation(lecture.id);
                        }}
                      >
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLectureMutation(lecture.id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                    {lecture.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                    <Badge
                      className={cn(
                        lecture.status === "PUBLISHED"
                          ? "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40"
                          : lecture.status === "ARCHIVED"
                            ? "bg-gray-600/10 text-gray-600 focus-visible:ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:focus-visible:ring-gray-400/40"
                            : "bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40",
                        "border-none focus-visible:outline-none text-xs py-0.5 px-1.5 capitalize",
                      )}
                    >
                      {lecture.status.toLowerCase()}
                    </Badge>
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="line-clamp-1 max-w-[40%]">
                      {lecture.subject?.name ?? "—"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="line-clamp-1 max-w-[40%]">
                      {lecture.class?.name ?? "—"}
                    </span>
                  </p>
                  {lecture.description?.trim() ? (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {lecture.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">
                      {lecture.title.charAt(0).toUpperCase() || "L"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    Created {formatFolderDate(lecture.created_at)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-dashed border-2 border-slate-200 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <BookOpen weight="duotone" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No lectures found
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            There are no lectures matching your criteria. Try adjusting the
            filters or add a new lecture.
          </p>
          <Button
            variant="outline"
            className="h-11 px-6 font-semibold border-slate-200 hover:bg-slate-50"
            onClick={handleUploadLecture}
          >
            Upload your first lecture
          </Button>
        </div>
      )}

      <UploadLectureModal
        isOpen={isUploadLectureModalOpen}
        onClose={() => setIsUploadLectureModalOpen(false)}
      />
    </div>
  );
}
