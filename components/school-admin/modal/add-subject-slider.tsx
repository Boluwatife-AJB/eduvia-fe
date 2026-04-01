"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useDepartments } from "@/hooks/use-department";
import { apiClient } from "@/lib/api";
import { subjectSchema } from "@/lib/schema";
import { SelectOption, SubjectFormValues } from "@/types";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CaretRightIcon,
  CheckCircleIcon,
  FloppyDiskIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddSubjectSliderProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editingSubject?: any;
}

const addSubject = async (data: SubjectFormValues) => {
  const payload = {
    name: data.name,
    code: data.code,
    title: data.title,
    department_id: data.departmentId,
    description: data.description,
  };
  const response = await apiClient.post("/school-setup/subjects", payload);
  return response.data;
};

export default function AddSubjectSlider({
  open,
  onClose,
  editingSubject,
}: AddSubjectSliderProps) {
  const isEdit = !!editingSubject;
  const queryClient = useQueryClient();
  const { departments, isLoading: isLoadingDepartments } = useDepartments();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    mode: "onChange",
    defaultValues: {
      name: editingSubject?.name || "",
      description: editingSubject?.description || "",
      code: editingSubject?.code || "",
      title: editingSubject?.title || "",
      departmentId: editingSubject?.departmentId || "",
    },
  });

  const { mutateAsync: addSubjectMutation, isPending: isAddingSubject } =
    useMutation({
      mutationFn: addSubject,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        toast.success("Subject created successfully", {
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
        toast.error("Failed to create subject", {
          icon: <XCircleIcon className="size-5 text-red-500" weight="fill" />,
        });
      },
    });

  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: SubjectFormValues) => {
    addSubjectMutation(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/20 backdrop-blur-sm z-40 transition-opacity" />
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md max-h-screen">
          <DialogPrimitive.Popup className="w-full h-full bg-background shadow-2xl border-l flex flex-col rounded-none animate-in slide-in-from-right-full duration-300 p-0 select-text outline-none data-closed:slide-out-to-right-full">
            {/* Header Area */}
            <div className="px-6 py-5 border-b bg-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClose}
                  className="rounded-full bg-muted/50 hover:bg-muted size-8 flex items-center justify-center shrink-0"
                >
                  <CaretRightIcon className="size-4" weight="bold" />
                </Button>
                <h2 className="text-xl font-assistant font-bold text-foreground leading-none">
                  {isEdit ? "Edit Subject" : "New Subject"}
                </h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-muted/5 custom-scrollbar">
              <form
                id="subject-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-5">
                    {/* Code */}
                    <Controller
                      control={control}
                      name="code"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>
                            Subject Code{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            className="h-11 shadow-sm font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans"
                            placeholder="e.g. MTH101"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {/* Name */}
                    <Controller
                      control={control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>
                            Subject Name{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            className="h-11 shadow-sm"
                            placeholder="e.g. Mathematics"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {/* Title */}
                    <Controller
                      control={control}
                      name="title"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>
                            Full Title{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            className="h-11 shadow-sm"
                            placeholder="e.g. General Mathematics"
                            {...field}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {/* Department */}
                    <Controller
                      control={control}
                      name="departmentId"
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>
                            Department{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            items={departments.map((department) => ({
                              label: department.label,
                              value: department.value,
                            }))}
                          >
                            <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              <SelectGroup>
                                <SelectLabel>Departments</SelectLabel>
                                {/* {departments.map((department: SelectOption) => (
                                  <SelectItem key={department.value} value={department.value}>
                                    {department.label}
                                  </SelectItem>
                                ))} */}
                                {isLoadingDepartments ? (
                                  <SelectItem value="loading">
                                    Loading...
                                  </SelectItem>
                                ) : (
                                  departments.map(
                                    (department: SelectOption) => (
                                      <SelectItem
                                        key={department.value}
                                        value={department.value}
                                      >
                                        {department.label}
                                      </SelectItem>
                                    ),
                                  )
                                )}
                                {/* {} */}
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
                            className="min-h-[100px] shadow-sm resize-none"
                            placeholder="Optional notes about this subject..."
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

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-card/50 backdrop-blur-sm flex justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                type="button"
                onClick={handleClose}
                className="h-11 w-full basis-1/3"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                form="subject-form"
                className="h-11 w-full basis-2/3 shadow-md gap-2"
                disabled={!isValid || isSubmitting}
              >
                <FloppyDiskIcon className="size-4" weight="fill" />
                {isEdit ? "Update Subject" : "Save Subject"}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
