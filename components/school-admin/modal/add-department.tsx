"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema } from "@/lib/schema";
import { z } from "zod";
import { FloppyDiskIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

interface AddDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editingDepartment?: any;
}

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function AddDepartmentModal({
  open,
  onClose,
  editingDepartment,
}: AddDepartmentModalProps) {
  const isEdit = !!editingDepartment;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    mode: "onChange",
    defaultValues: {
      name: editingDepartment?.name || "",
      description: editingDepartment?.description || "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
    reset,
  } = form;

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(
      isEdit
        ? "Department updated successfully"
        : "Department created successfully",
      {
        icon: (
          <CheckCircleIcon className="size-5 text-emerald-500" weight="fill" />
        ),
      },
    );
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background">
        <div className="px-6 py-5 border-b bg-card shrink-0">
          <DialogTitle className="text-xl font-assistant font-bold text-foreground">
            {isEdit ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            Manage academic departments and faculties.
          </DialogDescription>
        </div>

        <div className="p-6">
          <form
            id="department-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <div className="space-y-5">
                {/* Name */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        Department Name{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        className="h-11 shadow-sm"
                        placeholder="e.g. Faculty of Sciences"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Description */}
                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Description / Notes</FieldLabel>
                      <Textarea
                        className="min-h-[100px] shadow-sm resize-none"
                        placeholder="Optional outline of the department..."
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-3 rounded-b-xl shrink-0">
          <Button
            variant="outline"
            type="button"
            onClick={handleClose}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="department-form"
            className="h-11 px-6 shadow-md gap-2"
            disabled={!isValid || isSubmitting}
          >
            <FloppyDiskIcon className="size-4" weight="fill" />
            {isEdit ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
