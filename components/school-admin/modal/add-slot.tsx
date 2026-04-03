import { Button } from "@/components/ui/button";
import {
  DialogDescription,
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
import { useSubjects } from "@/hooks/use-subjects";
import { useTeachers } from "@/hooks/use-teachers";
import { apiClient } from "@/lib/api";
import { days, times } from "@/lib/data";
import { createTimetableSlotSchema } from "@/lib/schema";
import {
  CreateTimetableSlotFormValues,
  SelectOption,
  TimeTableSlot,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const colorOptions = [
  {
    label: "Blue",
    value:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  {
    label: "Emerald",
    value:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    label: "Purple",
    value:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  {
    label: "Amber",
    value:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
  {
    label: "Indigo",
    value:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
];

interface AddSlotProps {
  onClose: () => void;
  defaultValues?: TimeTableSlot;
  editingId?: string;
}

const createTimetableSlot = async (data: CreateTimetableSlotFormValues) => {
  const payload = {
    class_id: data.classId,
    subject_id: data.subjectId,
    teacher_id: data.teacherId,
    day_of_week: data.day,
    start_time: data.startTime,
    end_time: data.endTime,
    venue: data.venue,
  };

  const response = await apiClient.post("/timetable/slots", payload);
  return response.data.data;
};

const updateTimetableSlot = async (
  data: CreateTimetableSlotFormValues,
  id: string,
) => {
  const payload = {
    // class_id: data.classId,
    // subject_id: data.subjectId,
    teacher_id: data.teacherId,
    day_of_week: data.day,
    start_time: data.startTime,
    end_time: data.endTime,
    venue: data.venue,
  };

  const response = await apiClient.put(`/timetable/slots/${id}`, payload);
  return response.data.data;
};

export default function AddSlotModal({
  onClose,
  defaultValues,
  editingId,
}: AddSlotProps) {
  const { classes } = useClasses();
  const { teachers } = useTeachers();
  const { subjects, isLoading } = useSubjects();
  const queryClient = useQueryClient();

  const isEdit = !!editingId;

  const form = useForm<CreateTimetableSlotFormValues>({
    resolver: zodResolver(createTimetableSlotSchema),
    mode: "onChange",
    defaultValues: {
      classId: defaultValues?.class.id || "",
      teacherId: defaultValues?.teacher.user_id || "",
      subjectId: defaultValues?.subject.id || "",
      startTime: defaultValues?.start_time || "",
      endTime: defaultValues?.end_time || "",
      day: defaultValues?.day_of_week || "",
      venue: defaultValues?.venue || "",
      // color: defaultValues?.subject.id ? SLOT_PALETTES[hashString(defaultValues?.subject.id)] : colorOptions[0].value,
    },
  });

  const {
    mutateAsync: createNewTimetableSlot,
    isPending: isCreatingTimetableSlot,
  } = useMutation({
    mutationFn: createTimetableSlot,
    onSuccess: () => {
      toast.success("Timetable slot created successfully");
      queryClient.invalidateQueries({ queryKey: ["timetable-slots"] });
      form.reset();
      onClose();
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error.response?.data as { message: string })?.message ||
          "Failed to create timetable slot",
      );
      console.log(error);
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = form;

  const onSubmit = (data: CreateTimetableSlotFormValues) => {
    createNewTimetableSlot(data);
  };

  // console.log(teachers);

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-900">
          {isEdit ? "Edit Slot" : "Create New Slot"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the specifics of this timetable slot."
            : "Schedule a new class session on the timetable."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Subject */}
            <Controller
              control={control}
              name="subjectId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Subject <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={subjects.map((subject) => ({
                      value: subject.value,
                      label: subject.label,
                    }))}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Subject</SelectLabel>
                        {isLoading ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          subjects?.map((opt: SelectOption) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Class */}
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
                    items={classes}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Class</SelectLabel>
                        {classes.map((opt: SelectOption) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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

            {/* Teacher */}
            <Controller
              control={control}
              name="teacherId"
              render={({ field, fieldState }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>
                    Teacher <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={teachers}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="Select assigned teacher" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Teacher</SelectLabel>
                        {teachers.map((opt: SelectOption) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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

            {/* Day */}
            <Controller
              control={control}
              name="day"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Day <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={days}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Day</SelectLabel>
                        {days.map((opt: SelectOption) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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

            {/* Venue */}
            <Controller
              control={control}
              name="venue"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Venue / Room <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                    placeholder="e.g. Rm 101, Sci Lab"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Start Time */}
            <Controller
              control={control}
              name="startTime"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Start Time <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={times.map((t) => ({ label: t, value: t }))}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="08:00" />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="max-h-[300px]"
                    >
                      <SelectGroup>
                        {times.map((opt: string) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
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

            {/* End Time */}
            <Controller
              control={control}
              name="endTime"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    End Time <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={times.map((t) => ({ label: t, value: t }))}
                  >
                    <SelectTrigger className="h-12! w-full px-3">
                      <SelectValue placeholder="09:00" />
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      className="max-h-[300px]"
                    >
                      <SelectGroup>
                        {times.map((opt: string) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
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

            {/* Color Selection */}
            <Controller
              control={control}
              name="color"
              render={({ field, fieldState }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Color Theme</FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => field.onChange(opt.value)}
                        className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all ${
                          opt.value.includes("blue")
                            ? "bg-blue-500"
                            : opt.value.includes("emerald")
                              ? "bg-emerald-500"
                              : opt.value.includes("purple")
                                ? "bg-purple-500"
                                : opt.value.includes("amber")
                                  ? "bg-amber-500"
                                  : "bg-indigo-500"
                        } ${
                          field.value === opt.value
                            ? "ring-2 ring-slate-900 border-white ring-offset-1 scale-110"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        {field.value === opt.value && (
                          <CheckIcon className="text-white size-4 font-bold" />
                        )}
                      </div>
                    ))}
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <Button
              variant="outline"
              type="button"
              className="h-10 px-4"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="h-10 px-6"
              type="submit"
              disabled={!isValid || isCreatingTimetableSlot}
            >
              {isCreatingTimetableSlot ? (
                <>
                  <Spinner className="size-4" />
                  <span>
                    {isEdit ? "Updating slot..." : "Creating slot..."}
                  </span>
                </>
              ) : isEdit ? (
                "Update Slot"
              ) : (
                "Create Slot"
              )}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
