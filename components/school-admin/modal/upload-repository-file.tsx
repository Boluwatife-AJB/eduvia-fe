"use client";

import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";

const uploadRepositoryFileFormSchema = z.object({
  name: z.string().min(1, { message: "File name is required" }),
  description: z.string(),
  tags: z.string(),
  expires_at: z.string(),
  change_note: z.string(),
});

export type UploadRepositoryFileFormValues = z.infer<
  typeof uploadRepositoryFileFormSchema
>;

interface UploadRepositoryFileModalProps {
  open: boolean;
  onClose: () => void;
  file: File | null;
  isSubmitting: boolean;
  onSubmit: (values: UploadRepositoryFileFormValues) => Promise<void>;
}

export default function UploadRepositoryFileModal({
  open,
  onClose,
  file,
  isSubmitting,
  onSubmit,
}: UploadRepositoryFileModalProps) {
  const form = useForm<UploadRepositoryFileFormValues>({
    resolver: zodResolver(uploadRepositoryFileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      tags: "",
      expires_at: "",
      change_note: "",
    },
  });

  const { handleSubmit, control, reset, formState } = form;

  useEffect(() => {
    if (open && file) {
      reset({
        name: file.name,
        description: "",
        tags: "",
        expires_at: "",
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
    reset();
    onClose();
  };

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
              </>
            ) : (
              "Choose a file, then add details before uploading."
            )}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(internalSubmit)} className="px-6 pb-6">
          <FieldGroup>
            <ScrollArea className="h-[55vh]">
              <div className="space-y-5 pr-2">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        File name <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        className="h-12 shadow-sm"
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
                        className="min-h-[88px] shadow-sm resize-none"
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
                        className="h-12 shadow-sm"
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

                <Controller
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
                />

                <Controller
                  control={control}
                  name="change_note"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Change note</FieldLabel>
                      <Input
                        className="h-12 shadow-sm"
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
                disabled={!file || !formState.isValid || isSubmitting}
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
