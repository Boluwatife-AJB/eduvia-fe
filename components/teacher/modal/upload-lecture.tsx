"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTeacherAssignments } from "@/hooks/use-teacher-assignments";
import { apiClient } from "@/lib/api";
import { lectureContentTypes } from "@/lib/data";
import { uploadLectureSchema } from "@/lib/schema";
import { uploadFileToStorage } from "@/lib/services/file-upload";
import type { SelectOption, UploadLectureFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface UploadLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILE_CONTENT_TYPES = [
  "VIDEO",
  "AUDIO",
  "PDF",
  "SLIDES",
  "IMAGE",
] as const;

function isFileContentType(
  t: string,
): t is (typeof FILE_CONTENT_TYPES)[number] {
  return (FILE_CONTENT_TYPES as readonly string[]).includes(t);
}

function acceptForContentType(contentType: string): string {
  switch (contentType) {
    case "VIDEO":
      return "video/*";
    case "AUDIO":
      return "audio/*";
    case "PDF":
      return "application/pdf,.pdf";
    case "SLIDES":
      return ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "IMAGE":
      return "image/*";
    default:
      return "";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const defaultFormValues: UploadLectureFormValues = {
  title: "",
  description: "",
  classId: "",
  subjectId: "",
  contentType: lectureContentTypes[0]!.value,
  fileUrl: "",
  externalUrl: "",
  textContent: "",
  durationMinutes: 45,
  sortOrder: 1,
};

export default function UploadLectureModal({
  isOpen,
  onClose,
}: UploadLectureModalProps) {
  const queryClient = useQueryClient();
  const {
    classes,
    getSubjectsForClass,
    isLoading: assignmentsLoading,
  } = useTeacherAssignments();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    resolver: zodResolver(uploadLectureSchema),
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, control, reset, setValue } = form;
  const contentType = useWatch({ control, name: "contentType" });
  const classId = useWatch({ control, name: "classId" });

  const subjectOptions = useMemo(
    () => getSubjectsForClass(classId ?? ""),
    [getSubjectsForClass, classId],
  );

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      reset(defaultFormValues);
      setPendingFile(null);
      setFileError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, reset]);

  const { mutateAsync: uploadLecture, isPending } = useMutation({
    mutationFn: async ({
      form: data,
      file,
    }: {
      form: UploadLectureFormValues;
      file: File | null;
    }) => {
      let file_url: string | undefined;
      if (isFileContentType(data.contentType)) {
        if (!file) {
          throw new Error("Please select a file to upload.");
        }
        const uploaded = await uploadFileToStorage(file);
        file_url = uploaded.file_url;
      }

      const payload = {
        title: data.title,
        description: data.description,
        class_id: data.classId,
        subject_id: data.subjectId,
        content_type: data.contentType,
        file_url,
        external_url: data.externalUrl,
        text_content: data.textContent,
        duration_mins: data.durationMinutes,
        order: data.sortOrder,
      };

      const response = await apiClient.post("/lectures", payload);
      return response.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lectures"] });
      toast.success("Lecture uploaded");
      reset(defaultFormValues);
      setPendingFile(null);
      setFileError(null);
      onClose();
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Failed to upload lecture";
      toast.error(message);
    },
  });

  const onSubmit = (data: UploadLectureFormValues) => {
    if (isFileContentType(data.contentType) && !pendingFile) {
      setFileError("Please select a file to upload.");
      return;
    }
    setFileError(null);
    void uploadLecture({ form: data, file: pendingFile });
  };

  const isLinkContent = contentType === "LINK";
  const isTextContent = contentType === "TEXT";
  const needsFile = !isTextContent && !isLinkContent;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent className="flex max-h-[min(90vh,760px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-2xl pb-4">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="font-assistant text-xl font-bold text-foreground">
            Upload lecture
          </DialogTitle>
          <DialogDescription>
            Add lecture metadata and where the materials live — class, subject,
            format, and optional links or text.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller
                  control={control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="upload-lecture-title">
                        Title <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="upload-lecture-title"
                        className="h-12 placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                        placeholder="e.g. Introduction to polynomials"
                        autoComplete="off"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="contentType"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Content type <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          if (v === "TEXT" || v === "LINK") {
                            setPendingFile(null);
                            setFileError(null);
                          }
                        }}
                        items={lectureContentTypes.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                      >
                        <SelectTrigger className="h-12! w-full px-3">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Format</SelectLabel>
                            {lectureContentTypes.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="upload-lecture-description">
                      Description
                    </FieldLabel>

                    <Textarea
                      id="upload-lecture-description"
                      rows={3}
                      className="min-h-20 resize-y placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                      placeholder="Short overview of what this lecture covers…"
                      autoComplete="off"
                      {...field}
                    />
                    <FieldDescription>
                      Brief summary visible to students (optional).
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller
                  control={control}
                  name="classId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Class <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          setValue("subjectId", "");
                        }}
                        disabled={assignmentsLoading}
                        items={classes}
                      >
                        <SelectTrigger className="h-12! w-full px-3">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Classes</SelectLabel>
                            {classes?.map((c: SelectOption) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {!assignmentsLoading && classes.length === 0 ? (
                        <FieldDescription>
                          No classes assigned to you yet.
                        </FieldDescription>
                      ) : null}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="subjectId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Subject <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          assignmentsLoading ||
                          !classId ||
                          subjectOptions.length === 0
                        }
                        items={subjectOptions}
                      >
                        <SelectTrigger className="h-12! w-full px-3">
                          <SelectValue
                            placeholder={
                              classId
                                ? "Select subject"
                                : "Select a class first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Subjects</SelectLabel>
                            {subjectOptions.map((s: SelectOption) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller
                  control={control}
                  name="durationMinutes"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="upload-lecture-duration">
                        Duration (minutes){" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="upload-lecture-duration"
                        type="number"
                        min={1}
                        className="h-12 placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                        placeholder="45"
                        value={
                          typeof field.value === "number" &&
                          Number.isFinite(field.value)
                            ? field.value
                            : ""
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? NaN : Number(v));
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="sortOrder"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="upload-lecture-sort">
                        Sort order <span className="text-destructive">*</span>
                      </FieldLabel>

                      <Input
                        id="upload-lecture-sort"
                        type="number"
                        min={1}
                        className="h-12 placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                        value={
                          typeof field.value === "number" &&
                          Number.isFinite(field.value)
                            ? field.value
                            : ""
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? NaN : Number(v));
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                      />
                      <FieldDescription>
                        Lower numbers appear first within the topic.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {isTextContent && (
                <Controller
                  control={control}
                  name="textContent"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="upload-lecture-text">
                        Lesson text <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldDescription>
                        Paste or write the lecture content for students.
                      </FieldDescription>
                      <Textarea
                        id="upload-lecture-text"
                        rows={8}
                        className="min-h-48 resize-y font-mono text-sm placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                        placeholder="Write the lecture here…"
                        autoComplete="off"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              {isLinkContent && (
                <Controller
                  control={control}
                  name="externalUrl"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="upload-lecture-external-url">
                        External link{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldDescription>
                        URL students will open (e.g. Meet, YouTube, or reading
                        link).
                      </FieldDescription>
                      <Input
                        id="upload-lecture-external-url"
                        type="url"
                        className="h-12 placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                        placeholder="https://"
                        autoComplete="off"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              {needsFile && (
                <Field data-invalid={Boolean(fileError)}>
                  <FieldLabel htmlFor="upload-lecture-file-input">
                    Lecture file <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    Choose a file from your device. It will be uploaded when you
                    save.
                  </FieldDescription>
                  <input
                    id="upload-lecture-file-input"
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept={acceptForContentType(contentType)}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setPendingFile(file);
                      setFileError(null);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                    >
                      Choose file
                    </Button>
                    {pendingFile ? (
                      <span className="text-sm text-muted-foreground">
                        {pendingFile.name} ({formatFileSize(pendingFile.size)})
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No file selected
                      </span>
                    )}
                    {pendingFile ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0"
                        aria-label="Remove selected file"
                        onClick={() => {
                          setPendingFile(null);
                          setFileError(null);
                        }}
                        disabled={isPending}
                      >
                        <XIcon className="size-4" weight="bold" />
                      </Button>
                    ) : null}
                  </div>
                  {fileError ? (
                    <p className="text-sm text-destructive" role="alert">
                      {fileError}
                    </p>
                  ) : null}
                </Field>
              )}
            </FieldGroup>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              className="h-11"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isPending}
              className="gap-2 h-11"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Saving…
                </>
              ) : (
                <>
                  <UploadSimpleIcon className="size-4" weight="bold" />
                  Save lecture
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
