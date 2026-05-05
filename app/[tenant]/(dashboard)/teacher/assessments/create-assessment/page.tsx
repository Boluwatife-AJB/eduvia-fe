"use client";

import { assessmentTypes, questionTypes } from "@/lib/data";
import { createAssessmentSchema } from "@/lib/schema";
import { CreateAssessmentFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { parseFormDate } from "@/lib/utils";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import Editor from "react-simple-wysiwyg";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function CreateAssessment() {
  const form = useForm<CreateAssessmentFormValues>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: {
      title: "",
      instructions: "",
      type: "TEST",
      classId: "",
      subjectId: "",
      teacherId: "", // this would typically come from context
      termId: "",
      startDate: format(new Date(), "dd/MM/yyyy"),
      endDate: format(new Date(), "dd/MM/yyyy"),
      startTime: "",
      endTime: "",
      durationMins: 60,
      passMark: 50,
      isExamComponent: false,
      caComponent: "",
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      preventTabSwitch: true,
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "",
          marks: 1,
          options: [
            { id: "A", text: "", isCorrect: true },
            { id: "B", text: "", isCorrect: false },
            { id: "C", text: "", isCorrect: false },
            { id: "D", text: "", isCorrect: false },
          ],
          correctAnswer: "A",
          acceptedAnswers: [""],
          maxWordCount: 100,
        },
      ],
    },
  });

  const { control, handleSubmit, watch, setValue } = form;

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = (data: CreateAssessmentFormValues) => {
    console.log("Form data:", data);
    // TODO: Send data to API
  };

  return (
    <div className="px-8 py-8 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-assistant font-bold">
            Create Assessment
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure and build a new assessment for your students.
          </p>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          className="h-11 px-4 shadow-md text-base"
          variant="primary"
        >
          Publish Assessment
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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

        {/* Questions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold text-foreground">
              Questions List
            </h2>
          </div>

          <div className="space-y-8">
            {questions.map((question, index) => {
              const currentType = watch(`questions.${index}.type`);

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
                        if (questions.length > 1) {
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
                              // Reset options based on type
                              if (val === "TRUE_FALSE") {
                                setValue(`questions.${index}.options`, [
                                  { id: "true", text: "True", isCorrect: true },
                                  {
                                    id: "false",
                                    text: "False",
                                    isCorrect: false,
                                  },
                                ]);
                                setValue(
                                  `questions.${index}.correctAnswer`,
                                  "true",
                                );
                              } else if (val === "MULTIPLE_CHOICE") {
                                setValue(`questions.${index}.options`, [
                                  { id: "A", text: "", isCorrect: true },
                                  { id: "B", text: "", isCorrect: false },
                                ]);
                                setValue(
                                  `questions.${index}.correctAnswer`,
                                  "A",
                                );
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
                              watch(`questions.${index}.options`) || [];
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
                        {watch(`questions.${index}.options`)?.map(
                          (option, optIdx) => (
                            <div
                              key={optIdx}
                              className="flex items-center gap-3"
                            >
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
                                    ...(watch(`questions.${index}.options`) ||
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
                          ),
                        )}
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
                                    {watch(`questions.${index}.options`)?.map(
                                      (opt) => (
                                        <SelectItem key={opt.id} value={opt.id}>
                                          Option {opt.id}
                                        </SelectItem>
                                      ),
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
                              Accepted Answers (comma separated)
                            </FieldLabel>
                            <Input
                              className="h-11 shadow-sm"
                              placeholder="e.g. Abuja, abuja, ABUJA"
                              value={
                                Array.isArray(field.value)
                                  ? field.value.join(", ")
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
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
                  options: [
                    { id: "A", text: "", isCorrect: true },
                    { id: "B", text: "", isCorrect: false },
                    { id: "C", text: "", isCorrect: false },
                    { id: "D", text: "", isCorrect: false },
                  ],
                  correctAnswer: "A",
                  acceptedAnswers: [""],
                  maxWordCount: 100,
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
          >
            Save Assessment
          </Button>
        </div>
      </form>
    </div>
  );
}
