"use client";

import { useClasses } from "@/hooks/use-classes";
import { assignSubjectsToClassSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { subjectTypes } from "@/lib/data";
import { AssignSubjectsToClassFormValues, SelectOption } from "@/types";

interface AssignSubjectClassFormProps {
  subjectId: string;
  subjectName: string;
  onClose: () => void;
}

const assignSubjectToClass = async (data: AssignSubjectsToClassFormValues) => {
  const response = await apiClient.post(
    `/school-setup/classes/${data.classId}/subjects`,
    {
      subject_type: data.subjectType,
      subject_id: data.subjectId,
    },
  );
  return response.data.data;
};

export default function AssignSubjectClassForm({
  subjectId,
  subjectName,
  onClose,
}: AssignSubjectClassFormProps) {
  const { classes, isLoading: classesLoading } = useClasses();
  const queryClient = useQueryClient();

  const form = useForm<AssignSubjectsToClassFormValues>({
    resolver: zodResolver(assignSubjectsToClassSchema),
    defaultValues: {
      subjectId: subjectId,
      subjectType: "COMPULSORY",
      classId: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const { mutateAsync: assignSubjectToClassMutation } = useMutation({
    mutationFn: async (data: AssignSubjectsToClassFormValues) => {
      return await assignSubjectToClass(data);
    },
    onSuccess: () => {
      toast.success("Subject assigned to class successfully", {
        icon: (
          <CheckCircleIcon className="size-5 text-emerald-500" weight="fill" />
        ),
      });
      queryClient.invalidateQueries({
        queryKey: ["subject-details", subjectId],
      });
      onClose();
    },
    onError: () => {
      toast.error("Failed to assign subject to class");
    },
  });

  const onSubmit = (data: AssignSubjectsToClassFormValues) => {
    assignSubjectToClassMutation(data);
    form.reset();
  };

  // const { mutateAsync } = useMutation({
  //   mutationFn: async (data: AssignSubjectsToClassFormValues) => {
  //     return await assignSubjectToClass(data);
  //   },
  //   onSuccess: () => {
  //     toast.success("Subject assigned to class successfully", {
  //       icon: <CheckCircleIcon className="size-5 text-emerald-500" weight="fill" />,
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["subject-details", subjectId] });
  //     onClose();
  //   },
  //   onError: () => {
  //     toast.error("Failed to assign subject to class");
  //   },
  // });

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-6 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <h4 className="font-semibold text-foreground">
          Assign {subjectName} to Class
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
                  onValueChange={field.onChange}
                  items={classes.map((cls: SelectOption) => ({
                    value: cls.value,
                    label: cls.label,
                  }))}
                >
                  <SelectTrigger className="h-11! shadow-xs">
                    <SelectValue placeholder="Select Class" />
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
            name="subjectType"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Subject Type <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={subjectTypes}
                >
                  <SelectTrigger className="h-11! shadow-xs">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Types</SelectLabel>
                      {subjectTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
            Assign Class
          </Button>
        </div>
      </form>
    </div>
  );
}
