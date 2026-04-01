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
import { useTeachers } from "@/hooks/use-teachers";
import { apiClient } from "@/lib/api";
import { levels } from "@/lib/data";
import { classSchema } from "@/lib/schema";
import { ClassFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddClassModalProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editingClass?: any;
}

const addNewClass = async (data: ClassFormValues) => {
  const payload = {
    name: data.name,
    level: data.level,
    capacity: parseInt(data.capacity),
    department_id: data.departmentId ? data.departmentId : null,
    class_teacher_id: data.classTeacherId,
  };
  const response = await apiClient.post("/school-setup/classes", payload);
  return response.data.data;
};

export default function AddClassModal({
  open,
  onClose,
  editingClass,
}: AddClassModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!editingClass;
  const { teachers } = useTeachers();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    mode: "onChange",
    defaultValues: {
      name: editingClass?.name || "",
      level: editingClass?.level || undefined,
      capacity: editingClass?.capacity || "",
      departmentId: editingClass?.departmentId || "",
      classTeacherId: editingClass?.classTeacherId || "",
    },
  });

  const { mutateAsync: addNewClassMutation, isPending: isAddingClass } =
    useMutation({
      mutationFn: addNewClass,
      onSuccess: () => {
        toast.success("Class created successfully", {
          icon: (
            <CheckCircleIcon
              className="size-5 text-emerald-500"
              weight="fill"
            />
          ),
        });
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        reset();
        onClose();
      },
      onError: (error) => {
        toast.error("Failed to create class");
        console.log(error);
      },
    });

  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
    reset,
  } = form;

  const onSubmit = (data: ClassFormValues) => {
    addNewClassMutation(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-background">
        <div className="px-6 py-5 border-b bg-card shrink-0">
          <DialogTitle className="text-xl font-assistant font-bold text-foreground">
            {isEdit ? "Edit Class" : "Create New Class"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            Specify the class details, capacity and assign a form teacher.
          </DialogDescription>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form
            id="class-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <Controller
                    control={control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>
                          Class Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          className="h-11 shadow-sm"
                          placeholder="e.g. JSS 1A"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Level */}
                <Controller
                  control={control}
                  name="level"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        Academic Level{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={levels}
                      >
                        <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Levels</SelectLabel>
                            {levels.map((lvl) => (
                              <SelectItem key={lvl.value} value={lvl.value}>
                                {lvl.label}
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

                {/* Capacity */}
                <Controller
                  control={control}
                  name="capacity"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        Student Capacity{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        className="h-11 shadow-sm"
                        placeholder="e.g. 40"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Optional Department */}
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Department (Optional)</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={[{ label: "Sciences", value: "dept_1" }]}
                      >
                        <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Departments</SelectLabel>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="dept_1">Sciences</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* form Teacher */}
                <Controller
                  control={control}
                  name="classTeacherId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Form Teacher (Optional)</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={teachers}
                      >
                        <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                          <SelectValue placeholder="Assign Teacher" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>Teachers</SelectLabel>
                            {teachers.map((teacher) => (
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
            form="class-form"
            className="h-11 px-6 shadow-md gap-2"
            disabled={!isValid || isSubmitting}
          >
            <FloppyDiskIcon className="size-4" weight="fill" />
            {isEdit ? "Update Class" : "Create Class"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
