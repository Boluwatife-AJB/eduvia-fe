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
import { useClasses } from "@/hooks/use-classes";
import { useDepartments } from "@/hooks/use-department";
import { useSubjects } from "@/hooks/use-subjects";
import { apiClient } from "@/lib/api";
import { repositoryScopes } from "@/lib/data";
import { createFolderSchema } from "@/lib/schema";
import { CreateFolderFormValues, SelectOption } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  parentFolderId?: string | null;
}

const createFolder = async (data: CreateFolderFormValues) => {
  const payload = {
    name: data.name.trim(),
    scope: data.scope,
    scope_id: data.scopeId?.trim() || null,
    parent_folder_id: data.parentId?.trim() || null,
  };

  const response = await apiClient.post("/repository/folders", payload);
  return response.data.data;
};

export default function CreateFolderModal({
  open,
  onClose,
  parentFolderId = null,
}: CreateFolderModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      scope: undefined,
      scopeId: "",
      parentId: "",
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { isValid },
  } = form;

  const selectedScope = watch("scope");
  const isClassDocumentsScope = selectedScope === "CLASS_DOCUMENTS";
  const isSubjectDocumentsScope = selectedScope === "SUBJECT_DOCUMENTS";
  const isDepartmentDocumentsScope = selectedScope === "DEPARTMENT_DOCUMENTS";
  const { classes, isLoading: isClassesLoading } = useClasses();
  const { subjects, isLoading: isSubjectsLoading } = useSubjects();
  const { departments, isLoading: isDepartmentsLoading } = useDepartments();

  const { mutateAsync: createFolderMutation, isPending: isCreatingFolder } =
    useMutation({
      mutationFn: createFolder,
      onSuccess: () => {
        toast.success("Folder created successfully");
        queryClient.invalidateQueries({ queryKey: ["repository-folders"] });
        queryClient.invalidateQueries({ queryKey: ["repository"] });
        reset();
        onClose();
      },
      onError: () => {
        toast.error("Failed to create folder");
      },
    });

  const onSubmit = (data: CreateFolderFormValues) => {
    createFolderMutation({
      ...data,
      parentId: parentFolderId ?? "",
    });
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
            Create New Folder
          </DialogTitle>
          <DialogDescription className="mt-1">
            Organize repository content by scope.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Folder Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    className="h-12 shadow-sm"
                    placeholder="e.g. Week 1 Materials"
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
              name="scope"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Scope <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("scopeId", "", { shouldValidate: true });
                    }}
                    items={repositoryScopes}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="Select folder scope" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Repository Scopes</SelectLabel>
                        {repositoryScopes.map((scope) => (
                          <SelectItem key={scope.value} value={scope.value}>
                            {scope.label}
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
              name="scopeId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Scope Resource ID</FieldLabel>
                  {isClassDocumentsScope ? (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      items={classes}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue
                          placeholder={
                            isClassesLoading
                              ? "Loading classes..."
                              : "Select class"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Classes</SelectLabel>
                          {(classes as SelectOption[]).map((classOption) => (
                            <SelectItem
                              key={classOption.value}
                              value={classOption.value}
                            >
                              {classOption.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : isSubjectDocumentsScope ? (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      items={subjects}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue
                          placeholder={
                            isSubjectsLoading
                              ? "Loading subjects..."
                              : "Select subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Subjects</SelectLabel>
                          {(subjects as SelectOption[]).map((subjectOption) => (
                            <SelectItem
                              key={subjectOption.value}
                              value={subjectOption.value}
                            >
                              {subjectOption.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : isDepartmentDocumentsScope ? (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      items={departments}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue
                          placeholder={
                            isDepartmentsLoading
                              ? "Loading departments..."
                              : "Select department"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Departments</SelectLabel>
                          {(departments as SelectOption[]).map(
                            (departmentOption) => (
                              <SelectItem
                                key={departmentOption.value}
                                value={departmentOption.value}
                              >
                                {departmentOption.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="h-12 shadow-sm"
                      placeholder="e.g. clx1234abcd"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                  {/* <p className="text-xs text-muted-foreground leading-relaxed">
                    The ID of the resource this folder is scoped to. Required for:
                    CLASS_DOCUMENTS (classId), SUBJECT_DOCUMENTS (subjectId),
                    DEPARTMENT_DOCUMENTS (departmentId), STAFF_RECORDS (userId),
                    TUITION_PAYMENTS (studentUserId), STAFF_SALARY (staffUserId),
                    HEALTH_RECORDS (studentUserId), COUNSELING_RECORDS
                    (studentUserId), DISCIPLINARY_RECORDS (studentUserId). Leave
                    empty for school-wide scopes like PAST_QUESTIONS and
                    SCHOOL_DOCUMENTS.
                  </p> */}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="primary-outline"
                onClick={handleClose}
                className="h-12"
              >
                Discard Changes
              </Button>
              <Button
                className="h-12"
                variant="primary"
                type="submit"
                disabled={!isValid || isCreatingFolder}
              >
                {isCreatingFolder ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
