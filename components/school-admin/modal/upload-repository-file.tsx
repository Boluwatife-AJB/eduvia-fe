"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { repositoryScopes } from "@/lib/data";
import { uploadRepositoryFileFormSchema } from "@/lib/schema";
import { parseFormDate } from "@/lib/utils";
import type { UploadTargetSelection } from "@/components/school-admin/tabs/repository-view";
import { UploadRepositoryFileFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDownIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface UploadRepositoryFileModalProps {
  open: boolean;
  onClose: () => void;
  file: File | null;
  isSubmitting: boolean;
  onSubmit: (values: UploadRepositoryFileFormValues) => Promise<void>;
  /** Selected folder + repository scope (must match the folder’s scope on the server). */
  uploadContext: UploadTargetSelection;
  /** Left-nav scope when the folder payload omits `scope` (same source as the upload API fallback). */
  activeScopeFallback: string;
}

export default function UploadRepositoryFileModal({
  open,
  onClose,
  file,
  isSubmitting,
  onSubmit,
  uploadContext,
  activeScopeFallback,
}: UploadRepositoryFileModalProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm<UploadRepositoryFileFormValues>({
    resolver: zodResolver(uploadRepositoryFileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      tags: "",
      expires_at: {
        date: "",
        time: "",
      },
      change_note: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  useEffect(() => {
    if (open && file) {
      reset({
        name: file.name,
        description: "",
        tags: "",
        expires_at: {
          date: "",
          time: "",
        },
        change_note: "",
      });
    }
  }, [open, file, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const internalSubmit = async (data: UploadRepositoryFileFormValues) => {
    await onSubmit(data);
  };

  const resolvedScopeValue =
    uploadContext.scope?.trim() || activeScopeFallback.trim();
  const scopeLabel =
    repositoryScopes.find((s) => s.value === resolvedScopeValue)?.label ??
    resolvedScopeValue;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-xl sm:max-w-xl p-0 overflow-hidden bg-background">
        <div className="px-6 py-5 border-b bg-card shrink-0">
          <DialogTitle className="text-xl font-assistant font-bold text-foreground">
            Upload file
          </DialogTitle>
          <DialogDescription className="mt-1">
            {file ? (
              <>
                Selected:{" "}
                <span className="font-medium text-foreground">{file.name}</span>
                {uploadContext.folderId ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Repository scope:{" "}
                    <span className="font-medium text-foreground/90">
                      {scopeLabel}
                    </span>
                  </span>
                ) : null}
              </>
            ) : (
              "Choose a file, then add details before uploading."
            )}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(internalSubmit)} className="px-6 pb-6">
          <FieldGroup>
            <ScrollArea className="h-[55vh]">
              <div className="space-y-5 px-2">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        File name <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        className="h-10 md:h-13 placeholder:text-xs md:placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue  rounded-md"
                        placeholder="e.g. Mathematics Past Question 2023"
                        disabled={!file || isSubmitting}
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
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        className="min-h-[88px] placeholder:text-xs md:placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue resize-none  rounded-md"
                        placeholder="Optional description "
                        disabled={!file || isSubmitting}
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
                  name="tags"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Tags</FieldLabel>
                      <Input
                        className="h-10 md:h-13 placeholder:text-xs md:placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue rounded-md"
                        placeholder="mathematics, wassce, 2023"
                        disabled={!file || isSubmitting}
                        {...field}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Comma-separated tags.
                      </p>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* <Controller
                  control={control}
                  name="expires_at"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Expires at</FieldLabel>
                      <Input
                        type="datetime-local"
                        className="h-12 shadow-sm"
                        disabled={!file || isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}

                <div className="grid grid-col-1 md:grid-cols-2 gap-5">
                  <Controller
                    control={control}
                    name="expires_at.date"
                    render={({ field }) => {
                      const selected = parseFormDate(field.value);

                      return (
                        <Field>
                          <FieldLabel>Expires on</FieldLabel>
                          <Popover
                            open={datePickerOpen}
                            onOpenChange={setDatePickerOpen}
                          >
                            <PopoverTrigger
                              render={
                                <Button
                                  variant="outline"
                                  id="date-picker-optional"
                                  className="w-32 h-12  justify-between font-normal"
                                  disabled={!file || isSubmitting}
                                >
                                  {selected ? (
                                    format(selected, "dd/MM/yyyy")
                                  ) : (
                                    <span className="text-muted-foreground">
                                      Select a date
                                    </span>
                                  )}
                                  <CaretDownIcon data-icon="inline-end" />
                                </Button>
                              }
                            />
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={selected}
                                captionLayout="dropdown"
                                // defaultMonth={date}
                                onSelect={(date) =>
                                  field.onChange(
                                    date ? format(date, "yyyy-MM-dd") : "",
                                  )
                                }
                                defaultMonth={selected}
                              />
                            </PopoverContent>
                          </Popover>
                        </Field>
                      );
                    }}
                  />
                  <Controller
                    control={control}
                    name="expires_at.time"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Expires at</FieldLabel>
                        <Input
                          type="time"
                          id="time-picker-optional"
                          step="60"
                          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none h-12 placeholder:text-xs md:placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                          placeholder="Select time"
                          disabled={!file || isSubmitting}
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="change_note"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Change note</FieldLabel>
                      <Input
                        className="h-12 rounded-md focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                        placeholder="e.g. Original document"
                        disabled={!file || isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 shrink-0 pt-2">
              <Button
                type="button"
                variant="primary-outline"
                onClick={handleClose}
                className="h-12 px-8"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="h-12 gap-2 px-8"
                variant="primary"
                type="submit"
                // disabled={!file || !formState.isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
