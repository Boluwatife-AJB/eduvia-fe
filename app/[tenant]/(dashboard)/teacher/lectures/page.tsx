"use client";

import UploadLectureModal from "@/components/teacher/modal/upload-lecture";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useTeacherAssignments } from "@/hooks/use-teacher-assignments";
import { apiClient } from "@/lib/api";
import { TeacherLecture } from "@/types";
import {
  BookOpen,
  DotsThreeVerticalIcon,
  FileAudioIcon,
  FilePdfIcon,
  FileTextIcon,
  FileVideoIcon,
  ImagesIcon,
  LinkIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
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

export default function Lectures() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tenant = params.tenant as string;

  const [isUploadLectureModalOpen, setIsUploadLectureModalOpen] =
    useState(false);

  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [filterSubjectId, setFilterSubjectId] = useState<string>("all");
  const [filterContentType, setFilterContentType] = useState<string>("all");

  const { classes, getSubjectsForClass } = useTeacherAssignments();
  const subjects =
    filterClassId !== "all" ? getSubjectsForClass(filterClassId) : [];

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

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/lectures/${id}/publish`),
    onSuccess: () => {
      toast.success("Lecture published successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => {
      toast.error("Failed to publish lecture");
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/lectures/${id}/unpublish`),
    onSuccess: () => {
      toast.success("Lecture unpublished successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => {
      toast.error("Failed to unpublish lecture");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/lectures/${id}/archive`),
    onSuccess: () => {
      toast.success("Lecture archived successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => {
      toast.error("Failed to archive lecture");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/lectures/${id}`),
    onSuccess: () => {
      toast.success("Lecture deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
    },
    onError: () => {
      toast.error("Failed to delete lecture");
    },
  });

  const handleUploadLecture = () => {
    setIsUploadLectureModalOpen(true);
  };

  const handleCardClick = (id: string) => {
    router.push(`/${tenant}/teacher/lectures/${id}`);
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
        <div className="flex items-center justify-center h-64">
          <Spinner className="text-primary w-8 h-8" />
        </div>
      ) : lectures && lectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lectures.map((lecture) => (
            <Card
              key={lecture.id}
              className="group overflow-hidden rounded-2xl border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col bg-white"
              onClick={() => handleCardClick(lecture.id)}
            >
              <div className="p-6 flex flex-col h-full relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors duration-300 flex items-center justify-center">
                    {getContentTypeIcon(lecture.content_type)}
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge
                      variant={
                        lecture.status === "PUBLISHED" ? "default" : "outline"
                      }
                      className="text-[10px] px-2 py-0.5 rounded-md border-0 uppercase tracking-wider font-semibold"
                    >
                      {lecture.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 -mr-2"
                          >
                            <DotsThreeVerticalIcon className="size-5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-xl border-slate-100 shadow-xl shadow-slate-200/50"
                      >
                        {lecture.status === "PUBLISHED" ? (
                          <DropdownMenuItem
                            onClick={() => unpublishMutation.mutate(lecture.id)}
                            className="text-slate-600 focus:text-slate-900 font-medium cursor-pointer py-2.5"
                          >
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => publishMutation.mutate(lecture.id)}
                            className="text-primary focus:text-primary focus:bg-primary/5 font-medium cursor-pointer py-2.5"
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => archiveMutation.mutate(lecture.id)}
                          className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 font-medium cursor-pointer py-2.5"
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(lecture.id)}
                          className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-medium cursor-pointer py-2.5"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {lecture.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {lecture.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100/80">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md max-w-full truncate">
                      {lecture.subject?.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md shrink-0 border border-slate-100">
                      {lecture.class?.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Added {format(new Date(lecture.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
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
