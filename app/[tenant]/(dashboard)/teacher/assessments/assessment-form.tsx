"use client";

import { useEffect, useMemo } from "react";
import { assessmentTypes, questionTypes } from "@/lib/data";
import { buildAssessmentApiPayload } from "@/lib/assessment-payload";
import { createAssessmentSchema } from "@/lib/schema";
import { CreateAssessmentFormValues, SelectOption } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Path,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/contexts/user-context";
import { useTeacherAssignments } from "@/hooks/use-teacher-assignments";
import { useTerm } from "@/hooks/use-term";
import { apiClient } from "@/lib/api";
import { parseFormDate } from "@/lib/utils";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { differenceInMinutes, format, parse } from "date-fns";
import Editor from "react-simple-wysiwyg";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantStore } from "@/lib/stores/tenant.store";

/** Keeps spaces and blank lines while editing (one array entry per line). */
function acceptedAnswersTextToLines(raw: string): string[] {
  return raw.split(/\r?\n/);
}

function acceptedAnswersLinesToText(values: string[] | undefined): string {
  if (!Array.isArray(values) || values.length === 0) return "";
  return values.join("\n");
}

export type AssessmentFormMode = "create" | "edit";

export type AssessmentFormProps = {
  mode: AssessmentFormMode;
  assessmentId?: string;
  initialValues?: CreateAssessmentFormValues | null;
};

function getCreateDefaultValues(teacherId: string): CreateAssessmentFormValues {
  return {
    title: "",
    instructions: "",
    type: "TEST",
    classId: "",
    subjectId: "",
    teacherId: teacherId || "",
    termId: "",
    startDate: format(new Date(), "dd/MM/yyyy"),
    endDate: format(new Date(), "dd/MM/yyyy"),
    startTime: format(new Date(), "HH:mm"),
    endTime: "",
    durationMins: 60,
    passMark: 50,
    isExamComponent: false,
    caComponent: null,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    preventTabSwitch: true,
    questions: [
      {
        type: "MULTIPLE_CHOICE",
        questionText: "",
        marks: 1,
        questionImage: "",
        options: [
          { id: "A", text: "", isCorrect: true },
          { id: "B", text: "", isCorrect: false },
          { id: "C", text: "", isCorrect: false },
          { id: "D", text: "", isCorrect: false },
        ],
        correctAnswer: "A",
        acceptedAnswers: [],
        maxWordCount: 0,
      },
    ],
  };
}

export function AssessmentForm({
  mode,
  assessmentId,
  initialValues,
}: AssessmentFormProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const router = useRouter();
  const { tenant } = useTenantStore();

  const createDefaults = useMemo(
    () => getCreateDefaultValues(user?.id || ""),
    [user?.id],
  );

  const form = useForm<CreateAssessmentFormValues>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: createDefaults,
  });

  const { control, handleSubmit, getValues, setValue, setError, reset } = form;

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset(initialValues);
    }
  }, [mode, initialValues, reset]);
  const { classes, getSubjectsForClass } = useTeacherAssignments();
  const { terms, isLoading: termsLoading } = useTerm();
  const selectedClassId = useWatch({ control, name: "classId" });
  const watchedStartTime = useWatch({ control, name: "startTime" });
  const watchedEndTime = useWatch({ control, name: "endTime" });
  const watchedQuestions = useWatch({ control, name: "questions" });
  const subjectOptions = selectedClassId
    ? getSubjectsForClass(selectedClassId)
    : [];

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CreateAssessmentFormValues) => {
      const payload = buildAssessmentApiPayload(data);
      if (mode === "create") {
        const response = await apiClient.post("/assessments", payload);
        return response.data.data;
      }
      if (!assessmentId) {
        throw new Error("Missing assessment id");
      }
      const response = await apiClient.put(
        `/assessments/${assessmentId}`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success(
        mode === "create"
          ? "Assessment created successfully"
          : "Assessment updated successfully",
        {
          icon: (
            <CheckCircleIcon
              className="size-5 text-emerald-500"
              weight="fill"
            />
          ),
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["assessments"] });
      if (assessmentId) {
        void queryClient.invalidateQueries({
          queryKey: ["assessment", assessmentId],
        });
      }
      if (mode === "create") {
        router.push(`/${tenant?.slug}/teacher/assessments`);
        reset();
      } else if (assessmentId) {
        router.push(`/${tenant?.slug}/teacher/assessments/${assessmentId}`);
      }
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error.response?.data as { message: string })?.message ||
          (mode === "create"
            ? "Failed to create assessment"
            : "Failed to update assessment"),
        {
          icon: <XCircleIcon className="size-5 text-red-500" weight="fill" />,
        },
      );
    },
  });

  const onSubmit = (data: CreateAssessmentFormValues) => {
    if (data.classId) {
      const assignedSubjectsForClass = getSubjectsForClass(data.classId);
      const isAssignedSubject = assignedSubjectsForClass.some(
        (subject) => subject.value === data.subjectId,
      );
      if (!isAssignedSubject) {
        setError("subjectId", {
          type: "manual",
          message:
            "You can only manage assessments for subjects assigned to you in this class.",
        });
        return;
      }
    }

    void saveMutation.mutateAsync(data);
  };

  return (
    <div className="px-8 py-8 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-assistant font-bold">
            {mode === "create" ? "Create Assessment" : "Edit Assessment"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === "create"
              ? "Configure and build a new assessment for your students."
              : "Update assessment details and questions."}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="h-11 px-4 shadow-md text-base"
          variant="primary"
          disabled={saveMutation.isPending}
        >
          {mode === "create" ? "Publish Assessment" : "Save changes"}
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (error) => {
          console.log(error);
          // toast.error(error.message, {
          //   icon: <XCircleIcon className="size-5 text-red-500" weight="fill" />,
          // });
        })}
        className="space-y-12 max-w-5xl mx-auto"
      >
        {/* General Settings */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 text-foreground ">
            General Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    className="h-11 shadow-sm"
                    placeholder="e.g. Mid-term Mathematics Test"
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
              name="type"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Assessment Type <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={assessmentTypes}
                  >
                    <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Assessment Types</SelectLabel>
                        {assessmentTypes.map((type) => (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              control={control}
              name="classId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Class <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("subjectId", "");
                    }}
                    items={classes}
                  >
                    <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Classes</SelectLabel>
                        {classes.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
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
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Subject <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedClassId || subjectOptions.length === 0}
                    items={subjectOptions}
                  >
                    <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                      <SelectValue
                        placeholder={
                          selectedClassId
                            ? "Select subject"
                            : "Select class first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Assigned Subjects</SelectLabel>
                        {subjectOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
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
              name="termId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Term <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={termsLoading || terms.length === 0}
                    items={terms}
                  >
                    <SelectTrigger className="h-11! w-full px-3 shadow-sm">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Terms</SelectLabel>
                        {terms.map((item: SelectOption) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
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

          <Controller
            control={control}
            name="instructions"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Instructions <span className="text-destructive">*</span>
                </FieldLabel>
                <div className="rounded-lg overflow-hidden border border-input shadow-sm">
                  <Editor
                    value={field.value}
                    onChange={field.onChange}
                    containerProps={{ style: { minHeight: "150px" } }}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </section>
        {/* Configuration */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 text-foreground">
            Configuration & Timing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Start Date <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          id="date-picker-optional"
                          className="w-32 h-11 justify-between font-normal"
                        >
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Select date"}
                          <CalendarIcon data-icon="inline-end" />
                        </Button>
                      }
                    />
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseFormDate(field.value) : undefined
                        }
                        captionLayout="dropdown"
                        defaultMonth={
                          field.value ? parseFormDate(field.value) : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(
                            date ? format(date, "yyyy-MM-dd") : "",
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    End Date <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          id="date-picker-optional"
                          className="w-32 h-11 justify-between font-normal"
                        >
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Select date"}
                          <CalendarIcon data-icon="inline-end" />
                        </Button>
                      }
                    />
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseFormDate(field.value) : undefined
                        }
                        captionLayout="dropdown"
                        defaultMonth={
                          field.value ? parseFormDate(field.value) : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(
                            date ? format(date, "yyyy-MM-dd") : "",
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              control={control}
              name="startTime"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Start Time <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup className="h-11">
                    <InputGroupInput
                      id="start-time"
                      type="time"
                      step="60"
                      value={field.value}
                      onChange={field.onChange}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    <InputGroupAddon align="inline-end">
                      <ClockIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="endTime"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    End Time <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup className="h-11">
                    <InputGroupInput
                      id="start-time"
                      type="time"
                      step="60"
                      value={field.value}
                      onChange={field.onChange}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    <InputGroupAddon align="inline-end">
                      <ClockIcon className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="durationMins"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Duration (Mins) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    className="h-11 shadow-sm"
                    {...field}
                    // Difference between end time and start time should be at least the duration
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      const endTime = parse(
                        watchedEndTime,
                        "HH:mm",
                        new Date(),
                      );
                      const startTime = parse(
                        watchedStartTime,
                        "HH:mm",
                        new Date(),
                      );
                      const difference = differenceInMinutes(
                        endTime,
                        startTime,
                      );
                      if (difference < duration) {
                        field.onChange(duration);
                      }
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              control={control}
              name="passMark"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Pass Mark (%) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    className="h-11 shadow-sm"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="maxAttempts"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Max Attempts <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    className="h-11 shadow-sm"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="isExamComponent"
              render={({ field, fieldState }) => (
                <Field className="flex flex-row items-center justify-between p-4 border rounded-lg h-full shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FieldLabel>Is Exam Component</FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      Count towards final grade
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              control={control}
              name="shuffleQuestions"
              render={({ field, fieldState }) => (
                <Field className="flex flex-row items-center justify-between p-4 border rounded-lg h-16 shadow-sm bg-muted/20">
                  <FieldLabel>Shuffle Questions</FieldLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="shuffleOptions"
              render={({ field, fieldState }) => (
                <Field className="flex flex-row items-center justify-between p-4 border rounded-lg h-16 shadow-sm bg-muted/20">
                  <FieldLabel>Shuffle Options</FieldLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="preventTabSwitch"
              render={({ field, fieldState }) => (
                <Field className="flex flex-row items-center justify-between p-4 border rounded-lg h-16 shadow-sm bg-muted/20">
                  <FieldLabel>Prevent Tab Switch</FieldLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold text-foreground">
              Questions List
            </h2>
          </div>

          <div className="space-y-8">
            {questionFields.map((question, index) => {
              const currentType = watchedQuestions?.[index]?.type;
              const questionOptions = watchedQuestions?.[index]?.options ?? [];

              return (
                <div
                  key={question.id}
                  className="p-6 border rounded-xl bg-background shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <h3 className="font-semibold text-lg">
                      Question {index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        if (questionFields.length > 1) {
                          removeQuestion(index);
                        }
                      }}
                      className="size-8"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Controller
                      control={control}
                      name={`questions.${index}.type`}
                      render={({ field, fieldState }) => (
                        <Field className="md:col-span-3">
                          <FieldLabel>
                            Question Type{" "}
                            <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Select
                            value={field.value}
                            items={questionTypes}
                            onValueChange={(val) => {
                              field.onChange(val);
                              const q = (
                                name: keyof Pick<
                                  CreateAssessmentFormValues["questions"][number],
                                  | "options"
                                  | "correctAnswer"
                                  | "acceptedAnswers"
                                  | "maxWordCount"
                                  | "markingGuide"
                                >,
                              ) =>
                                `questions.${index}.${String(name)}` as Path<CreateAssessmentFormValues>;

                              if (val === "TRUE_FALSE") {
                                setValue(q("options"), [
                                  { id: "true", text: "True", isCorrect: true },
                                  {
                                    id: "false",
                                    text: "False",
                                    isCorrect: false,
                                  },
                                ]);
                                setValue(q("correctAnswer"), "true");
                                setValue(q("acceptedAnswers"), []);
                                setValue(q("maxWordCount"), 0);
                                setValue(q("markingGuide"), "");
                              } else if (val === "MULTIPLE_CHOICE") {
                                setValue(q("options"), [
                                  { id: "A", text: "", isCorrect: true },
                                  { id: "B", text: "", isCorrect: false },
                                ]);
                                setValue(q("correctAnswer"), "A");
                                setValue(q("acceptedAnswers"), []);
                                setValue(q("maxWordCount"), 0);
                                setValue(q("markingGuide"), "");
                              } else if (
                                val === "SHORT_ANSWER" ||
                                val === "FILL_IN_THE_BLANK"
                              ) {
                                setValue(q("options"), []);
                                setValue(q("correctAnswer"), "");
                                setValue(q("acceptedAnswers"), []);
                                setValue(q("maxWordCount"), 100);
                                setValue(q("markingGuide"), "");
                              } else if (val === "ESSAY") {
                                setValue(q("options"), []);
                                setValue(q("correctAnswer"), "");
                                setValue(q("acceptedAnswers"), []);
                                setValue(q("maxWordCount"), 500);
                                setValue(q("markingGuide"), "");
                              }
                            }}
                          >
                            <SelectTrigger className="h-11! w-full px-3 shadow-sm bg-muted/30">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              <SelectGroup>
                                <SelectLabel>Question Types</SelectLabel>
                                {questionTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
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

                    <Controller
                      control={control}
                      name={`questions.${index}.marks`}
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>
                            Marks <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            type="number"
                            min={1}
                            className="h-11 shadow-sm"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
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
                    name={`questions.${index}.questionText`}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>
                          Question Text{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <div className="rounded-lg overflow-hidden border border-input shadow-sm">
                          <Editor
                            value={field.value}
                            onChange={field.onChange}
                            containerProps={{ style: { minHeight: "120px" } }}
                          />
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Multiple Choice specific fields */}
                  {currentType === "MULTIPLE_CHOICE" && (
                    <div className="p-5 border border-dashed rounded-lg bg-muted/10 space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <FieldLabel className="mb-0">Options</FieldLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => {
                            const currentOptions =
                              getValues(`questions.${index}.options`) || [];
                            const nextId = String.fromCharCode(
                              65 + currentOptions.length,
                            ); // A, B, C...
                            setValue(`questions.${index}.options`, [
                              ...currentOptions,
                              { id: nextId, text: "", isCorrect: false },
                            ]);
                          }}
                        >
                          <PlusIcon className="size-3" /> Add Option
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        {questionOptions?.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-3">
                            <span className="font-semibold text-sm w-6 text-center">
                              {option.id}
                            </span>
                            <Controller
                              control={control}
                              name={`questions.${index}.options.${optIdx}.text`}
                              render={({ field }) => (
                                <Input
                                  className="h-11 flex-1 shadow-sm"
                                  placeholder={`Option ${option.id}`}
                                  {...field}
                                />
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                const currentOptions = [
                                  ...(getValues(`questions.${index}.options`) ||
                                    []),
                                ];
                                currentOptions.splice(optIdx, 1);
                                setValue(
                                  `questions.${index}.options`,
                                  currentOptions,
                                );
                              }}
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 mt-4 border-t">
                        <Controller
                          control={control}
                          name={`questions.${index}.correctAnswer`}
                          render={({ field, fieldState }) => (
                            <Field className="max-w-xs">
                              <FieldLabel>Correct Answer</FieldLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="h-11! px-3 shadow-sm">
                                  <SelectValue placeholder="Select correct option" />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                  <SelectGroup>
                                    {questionOptions?.map((opt) => (
                                      <SelectItem key={opt.id} value={opt.id}>
                                        Option {opt.id}
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
                    </div>
                  )}

                  {/* True/False specific fields */}
                  {currentType === "TRUE_FALSE" && (
                    <div className="p-5 border border-dashed rounded-lg bg-muted/10 mt-4">
                      <Controller
                        control={control}
                        name={`questions.${index}.correctAnswer`}
                        render={({ field, fieldState }) => (
                          <Field className="max-w-xs">
                            <FieldLabel>Correct Answer</FieldLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-11! px-3 shadow-sm">
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent alignItemWithTrigger={false}>
                                <SelectGroup>
                                  <SelectItem value="true">True</SelectItem>
                                  <SelectItem value="false">False</SelectItem>
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
                  )}

                  {/* Short Answer / Fill in the blank specific fields */}
                  {(currentType === "SHORT_ANSWER" ||
                    currentType === "FILL_IN_THE_BLANK") && (
                    <div className="p-5 border border-dashed rounded-lg bg-muted/10 mt-4 space-y-4">
                      <Controller
                        control={control}
                        name={`questions.${index}.acceptedAnswers`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <FieldLabel>
                              Accepted answers (one per line)
                            </FieldLabel>
                            <p className="text-xs text-muted-foreground -mt-1 mb-1">
                              Each line is one acceptable answer (use Enter for
                              another variant). Spaces are allowed. Extra spaces
                              and empty lines are cleaned up when you save.
                            </p>
                            <Textarea
                              className="min-h-[100px] shadow-sm"
                              placeholder={
                                currentType === "FILL_IN_THE_BLANK"
                                  ? "e.g. photosynthesis"
                                  : "e.g. x = 5"
                              }
                              value={acceptedAnswersLinesToText(field.value)}
                              onChange={(e) =>
                                field.onChange(
                                  acceptedAnswersTextToLines(e.target.value),
                                )
                              }
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  )}

                  {/* Essay specific fields */}
                  {currentType === "ESSAY" && (
                    <div className="p-5 border border-dashed rounded-lg bg-muted/10 mt-4 space-y-4">
                      <Controller
                        control={control}
                        name={`questions.${index}.maxWordCount`}
                        render={({ field, fieldState }) => (
                          <Field className="max-w-xs">
                            <FieldLabel>Max Word Count</FieldLabel>
                            <Input
                              type="number"
                              min={1}
                              className="h-11 shadow-sm"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`questions.${index}.markingGuide`}
                        render={({ field, fieldState }) => (
                          <Field>
                            <FieldLabel>Marking Guide (Optional)</FieldLabel>
                            <div className="rounded-lg overflow-hidden border border-input shadow-sm bg-background">
                              <Editor
                                value={field.value || ""}
                                onChange={field.onChange}
                                containerProps={{
                                  style: { minHeight: "120px" },
                                }}
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full border-dashed border-2 hover:bg-muted/50 text-base gap-2"
              onClick={() =>
                appendQuestion({
                  type: "MULTIPLE_CHOICE",
                  questionText: "",
                  marks: 1,
                  questionImage: "",
                  options: [
                    { id: "A", text: "", isCorrect: true },
                    { id: "B", text: "", isCorrect: false },
                    { id: "C", text: "", isCorrect: false },
                    { id: "D", text: "", isCorrect: false },
                  ],
                  correctAnswer: "A",
                  acceptedAnswers: [],
                  maxWordCount: 0,
                })
              }
            >
              <PlusIcon className="size-5" /> Add New Question
            </Button>
          </div>
        </section>
        <div className="pt-6 border-t flex justify-end">
          <Button
            type="submit"
            className="h-12 px-10 shadow-lg"
            variant="primary"
            disabled={saveMutation.isPending}
          >
            {mode === "create" ? "Save Assessment" : "Update assessment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
