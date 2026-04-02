"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClasses } from "@/hooks/use-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { apiClient } from "@/lib/api";
import { assignTeacherToSubjectSchema } from "@/lib/schema";
import {
  AssignTeacherToSubjectFormValues,
  ClassDetailsResponse,
  SelectOption,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface AssignTeacherSubjectFormProps {
  subjectId: string;
  subjectName: string;
  onClose: () => void;
}

const fetchClassDetails = async (
  classId: string,
): Promise<ClassDetailsResponse> => {
  const response = await apiClient.get(`/school-setup/classes/${classId}`);
  return response.data.data;
};

const assignTeacherToSubject = async (
  data: AssignTeacherToSubjectFormValues,
) => {
  const response = await apiClient.post(
    `/school-setup/classes/${data.classId}/subjects/${data.subjectId}/teachers/bulk`,
    {
      teacher_ids: data.teacherIds,
    },
  );
  return response.data.data;
};

export default function AssignTeacherSubjectForm({
  subjectId,
  subjectName,
  onClose,
}: AssignTeacherSubjectFormProps) {
  const { classes, isLoading: classesLoading } = useClasses();
  const { teachers, isLoading: teachersLoading } = useTeachers();
  const queryClient = useQueryClient();

  const form = useForm<AssignTeacherToSubjectFormValues>({
    resolver: zodResolver(assignTeacherToSubjectSchema),
    defaultValues: {
      classId: "",
      subjectId: "",
      teacherIds: [],
    },
  });

  const { control, handleSubmit, setValue, getValues, formState } = form;
  const { isValid, isSubmitting } = formState;
  const watchedClassId = useWatch({ control, name: "classId" }) ?? "";

  const { data: classData, isLoading: classDetailsLoading } = useQuery({
    queryKey: ["class-details", watchedClassId],
    queryFn: () => fetchClassDetails(watchedClassId!),
    enabled: !!watchedClassId,
  });

  const classSubjects = classData?.class_subjects ?? [];
  const subjectSelectDisabled =
    !watchedClassId || classDetailsLoading || classSubjects.length === 0;

  useEffect(() => {
    if (!classData?.class_subjects?.length) return;
    const current = getValues("subjectId");
    if (current) return;
    const inClass = classData.class_subjects.some(
      (cs) => cs.subject_id === subjectId,
    );
    if (inClass) {
      setValue("subjectId", subjectId, { shouldValidate: true });
    }
  }, [classData, subjectId, getValues, setValue]);

  const { mutateAsync: assignTeacherToSubjectMutation } = useMutation({
    mutationFn: (data: AssignTeacherToSubjectFormValues) =>
      assignTeacherToSubject(data),
    onSuccess: (_data, variables) => {
      toast.success("Teachers assigned to subject successfully", {
        icon: (
          <CheckCircleIcon className="size-5 text-emerald-500" weight="fill" />
        ),
      });
      queryClient.invalidateQueries({
        queryKey: ["subject-details", subjectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["class-details", variables.classId],
      });
      onClose();
    },
    onError: () => {
      toast.error("Failed to assign teachers to subject");
    },
  });

  const onSubmit = async (data: AssignTeacherToSubjectFormValues) => {
    await assignTeacherToSubjectMutation(data);
    form.reset();
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-6 animate-in slide-in-from-top-4 duration-300 overflow-visible">
      <div className="flex items-center gap-3 mb-4">
        <h4 className="font-semibold text-foreground">
          Assign Teachers to {subjectName}
        </h4>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="classId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Class <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("subjectId", "", { shouldValidate: true });
                  }}
                  items={classes.map((cls: SelectOption) => ({
                    value: cls.value,
                    label: cls.label,
                  }))}
                >
                  <SelectTrigger className="h-11! w-full shadow-xs">
                    <SelectValue
                      placeholder={
                        classesLoading ? "Loading classes..." : "Select class"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Classes</SelectLabel>
                      {classes.map((cls: SelectOption) => (
                        <SelectItem key={cls.value} value={cls.value}>
                          {cls.label}
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
              <Field>
                <FieldLabel>
                  Subject in class <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={subjectSelectDisabled}
                  items={classSubjects.map((cs) => ({
                    value: cs.subject_id,
                    label: `${cs.name} (${cs.code})`,
                  }))}
                >
                  <SelectTrigger className="h-11! w-full shadow-xs">
                    <SelectValue
                      placeholder={
                        !watchedClassId
                          ? "Select a class first"
                          : classDetailsLoading
                            ? "Loading subjects..."
                            : classSubjects.length === 0
                              ? "No subjects in this class"
                              : "Select subject"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Subjects in class</SelectLabel>
                      {classSubjects.map((cs) => (
                        <SelectItem key={cs.id} value={cs.subject_id}>
                          {cs.name} ({cs.code})
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
        </FieldGroup>

        <FieldGroup>
          <Controller
            control={control}
            name="teacherIds"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Teachers <span className="text-destructive">*</span>
                </FieldLabel>
                <Combobox
                  multiple
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <div className="relative group">
                    <ComboboxChips className="min-h-11 pb-1 pt-1 pr-8">
                      {field.value.map((val) => {
                        const teacher = teachers.find(
                          (t: SelectOption) => t.value === val,
                        );
                        return (
                          <ComboboxChip key={val} showRemove={true}>
                            {teacher?.label || val}
                          </ComboboxChip>
                        );
                      })}
                      <ComboboxChipsInput
                        placeholder={
                          teachersLoading ? "Loading..." : "Select teachers..."
                        }
                      />
                    </ComboboxChips>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <ComboboxTrigger className="px-2" />
                    </div>
                  </div>
                  <ComboboxContent>
                    <ComboboxList>
                      {teachers.map((t: SelectOption) => (
                        <ComboboxItem key={t.value} value={t.value}>
                          {t.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <p className="text-xs text-muted-foreground mt-1.5">
                  You can select multiple teachers for this subject in the
                  selected class.
                </p>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="h-11 px-5"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || isSubmitting}
            className="h-11 px-5 shadow-md"
          >
            <FloppyDiskIcon className="size-4 mr-2" />
            Save Assignments
          </Button>
        </div>
      </form>
    </div>
  );
}
