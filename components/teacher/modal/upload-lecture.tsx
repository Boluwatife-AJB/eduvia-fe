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
import { useClasses } from "@/hooks/use-classes";
import { useSubjects } from "@/hooks/use-subjects";
import { apiClient } from "@/lib/api";
import { lectureContentTypes } from "@/lib/data";
import { uploadLectureSchema } from "@/lib/schema";
import type { SelectOption, UploadLectureFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

// Bug and improvement: Ensure teacher is assigned to the subject in the class. And then there should be an input that allows the teacher to select a file from their computer. Then upon submitting the form, the file should be uploaded to the server and the file URL should be stored in the database. The file url should be added to the payload when submitting the form. Finally, the external link field should not be missing in the form.

interface UploadLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const submitLecture = async (data: UploadLectureFormValues) => {
  const payload = {
    title: data.title,
    description: data.description,
    class_id: data.classId,
    subject_id: data.subjectId,
    content_type: data.contentType,
    // file_url: data.fileUrl,
    external_url: data.externalUrl,
    text_content: data.textContent,
    duration_mins: data.durationMinutes,
    order: data.sortOrder,
  };
  const response = await apiClient.post("/lectures", payload);
  return response.data.data;
};

export default function UploadLectureModal({
  isOpen,
  onClose,
}: UploadLectureModalProps) {
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects();

  const form = useForm({
    resolver: zodResolver(uploadLectureSchema),
    mode: "onChange",
    defaultValues: {
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
    },
  });

  const { handleSubmit, control, reset, formState } = form;
  const contentType = useWatch({ control, name: "contentType" });

  const onSubmit = (data: UploadLectureFormValues) => {
    // TODO: wire POST when lecture API exists
    toast.success("Lecture details saved locally — connect upload API.");
    console.info("upload lecture:", data);
    reset();
    onClose();
  };

  const isLinkContent = contentType === "LINK";
  const isTextContent = contentType === "TEXT";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                        onValueChange={field.onChange}
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
                        onValueChange={field.onChange}
                        disabled={classesLoading}
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
                        disabled={subjectsLoading}
                      >
                        <SelectTrigger className="h-12! w-full px-3">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Subjects</SelectLabel>
                            {subjects.map((s: SelectOption) => (
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
                        Lesson text
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
                        External link
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

              {!isTextContent && !isLinkContent && (
                <Controller
                  control={control}
                  name="fileUrl"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="upload-lecture-file-url">
                        File URL
                      </FieldLabel>
                      <FieldDescription>
                        After uploading to storage, paste the file URL here.
                      </FieldDescription>
                      <Input
                        id="upload-lecture-file-url"
                        type="url"
                        className="h-12 placeholder:text-sm focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20"
                        placeholder="https://…"
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
            </FieldGroup>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={formState.isSubmitting}
              className="gap-2 h-11"
            >
              {formState.isSubmitting ? (
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
