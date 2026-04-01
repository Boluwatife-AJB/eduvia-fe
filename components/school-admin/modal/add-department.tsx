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
import { useTeachers } from "@/hooks/use-teachers";
import { apiClient } from "@/lib/api";
import { departmentSchema } from "@/lib/schema";
import { Department, DepartmentFormValues, SelectOption } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  editingDepartment?: Department;
}

const addDepartment = async (data: DepartmentFormValues) => {
  const payload = {
    name: data.name,
    description: data.description,
    hod_id: data.hodId || null,
  };
  const response = await apiClient.post("/school-setup/departments", payload);
  return response.data.data;
};

const updateDepartment = async (data: DepartmentFormValues, deptId: string) => {
  const payload = {
    name: data.name,
    description: data.description,
    hod_id: data.hodId || null,
  };
  const response = await apiClient.patch(
    `/school-setup/departments/${deptId}`,
    payload,
  );
  return response.data.data;
};

export default function AddDepartmentModal({
  open,
  onClose,
  editingDepartment,
}: AddDepartmentModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!editingDepartment;
  const { teachers, isLoading: isLoadingTeachers } = useTeachers();

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    mode: "onChange",
    defaultValues: {
      name: editingDepartment?.name || "",
      description: editingDepartment?.description || "",
      hodId: editingDepartment?.hod?.id || "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
    reset,
  } = form;

  const { mutateAsync: addDepartmentMutation, isPending: isAddingDepartment } =
    useMutation({
      mutationFn: addDepartment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        toast.success("Department created successfully", {
          icon: (
            <CheckCircleIcon
              className="size-5 text-emerald-500"
              weight="fill"
            />
          ),
        });
        reset();
        onClose();
      },
      onError: () => {
        toast.error("Failed to create department", {
          icon: <XCircleIcon className="size-5 text-red-500" weight="fill" />,
        });
      },
    });

  const {
    mutateAsync: updateDepartmentMutation,
    isPending: isUpdatingDepartment,
  } = useMutation({
    mutationFn: ({
      data,
      deptId,
    }: {
      data: DepartmentFormValues;
      deptId: string;
    }) => updateDepartment(data, deptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully", {
        icon: (
          <CheckCircleIcon className="size-5 text-emerald-500" weight="fill" />
        ),
      });
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update department", {
        icon: <XCircleIcon className="size-5 text-red-500" weight="fill" />,
      });
    },
  });

  const onSubmit = (data: DepartmentFormValues) => {
    if (isEdit && editingDepartment?.id) {
      updateDepartmentMutation({ data, deptId: editingDepartment?.id });
    } else {
      addDepartmentMutation(data);
    }
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

                <Controller
                  control={control}
                  name="hodId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        Assign HOD <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={teachers.map((teacher) => ({
                          label: teacher.label,
                          value: teacher.value,
                        }))}
                      >
                        <SelectTrigger className="h-12! w-full px-3">
                          <SelectValue placeholder="Select HOD" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Teachers</SelectLabel>
                            {teachers.map((teacher: SelectOption) => (
                              <SelectItem
                                key={teacher.value}
                                value={teacher.value}
                              >
                                {teacher.label}
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

                {/* Description */}
                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Description / Notes</FieldLabel>
                      <Textarea
                        className="max-h-[100px] shadow-sm resize-none"
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
            disabled={
              !isValid ||
              isSubmitting ||
              isAddingDepartment ||
              isUpdatingDepartment
            }
          >
            <FloppyDiskIcon className="size-4" weight="fill" />
            {isEdit ? (
              isUpdatingDepartment ? (
                <Spinner className="size-4" />
              ) : (
                "Update Department"
              )
            ) : isAddingDepartment ? (
              <Spinner className="size-4" />
            ) : (
              "Create Department"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
