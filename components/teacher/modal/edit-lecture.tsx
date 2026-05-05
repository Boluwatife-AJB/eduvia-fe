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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { editLectureSchema } from "@/lib/schema";
import type { TeacherLecture } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type EditLectureFormValues = z.infer<typeof editLectureSchema>;

interface EditLectureModalProps {
  open: boolean;
  onClose: () => void;
  lecture: TeacherLecture;
}

async function updateLecture(
  id: string,
  payload: {
    title: string;
    description?: string;
    duration_mins: number;
    order: number;
  },
) {
  const response = await apiClient.patch(`/lectures/${id}`, payload);
  return response.data.data;
}

export default function EditLectureModal({
  open,
  onClose,
  lecture,
}: EditLectureModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditLectureFormValues>({
    resolver: zodResolver(editLectureSchema),
    mode: "onChange",
    defaultValues: {
      title: lecture.title,
      description: lecture.description ?? "",
      durationMinutes: lecture.duration_mins ?? 45,
      sortOrder: lecture.order,
    },
  });

  const { handleSubmit, control, reset } = form;

  useEffect(() => {
    if (!open) return;
    reset({
      title: lecture.title,
      description: lecture.description ?? "",
      durationMinutes: lecture.duration_mins ?? 45,
      sortOrder: lecture.order,
    });
  }, [open, lecture, reset]);

  const { mutateAsync: saveLecture, isPending } = useMutation({
    mutationFn: (data: EditLectureFormValues) =>
      updateLecture(lecture.id, {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        duration_mins: data.durationMinutes,
        order: data.sortOrder,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["lecture-details", lecture.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["teacher-lectures"] });
      toast.success("Lecture updated");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update lecture");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !isPending && onClose()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-assistant text-xl font-bold">
            Edit lecture
          </DialogTitle>
          <DialogDescription>
            Update title, description, duration, and sort order. Content type
            and attachments are unchanged here.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => void saveLecture(data))}
          className="space-y-4"
        >
          <FieldGroup className="gap-4">
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-lecture-title">
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="edit-lecture-title"
                    className="h-11"
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
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-lecture-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="edit-lecture-description"
                    rows={3}
                    className="min-h-20 resize-y"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="durationMinutes"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-lecture-duration">
                      Duration (minutes){" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="edit-lecture-duration"
                      type="number"
                      min={1}
                      className="h-11"
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
                    <FieldLabel htmlFor="edit-lecture-order">
                      Sort order <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="edit-lecture-order"
                      type="number"
                      min={1}
                      className="h-11"
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
            </div>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Saving…
                </>
              ) : (
                <>
                  <FloppyDiskIcon className="size-4" weight="bold" />
                  Save changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
