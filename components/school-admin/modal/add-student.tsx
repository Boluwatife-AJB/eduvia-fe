import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addStudentSchema, DATE_OF_BIRTH_INPUT_FORMAT } from "@/lib/schema";
import { AddStudentFormValues, SelectOption } from "@/types";
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
import { useState } from "react";
import { genderOptions } from "@/lib/data";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { useClasses } from "@/hooks/use-classes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid, parse } from "date-fns";
import { apiClient } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const STEPS = [
  {
    title: "Personal Information",
    description: "Tell us basic details about the student.",
  },
  {
    title: "Academic Information",
    description: "Provide admission and class details.",
  },
  {
    title: "Account Setup",
    description: "Set a secure password for the student portal.",
  },
];

const STEP_FIELDS: Array<Array<keyof AddStudentFormValues>> = [
  ["firstName", "lastName", "dateOfBirth", "gender"],
  ["matricNumber", "class", "admissionDate"],
  ["password", "confirmPassword"],
];

function formatDobField(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, DATE_OF_BIRTH_INPUT_FORMAT);
}

function parseDobField(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const d = parse(trimmed, DATE_OF_BIRTH_INPUT_FORMAT, new Date());
  return isValid(d) ? d : undefined;
}

const addNewStudent = async (data: AddStudentFormValues) => {
  const payload = {
    role: "STUDENT",
    first_name: data.firstName,
    last_name: data.lastName,
    class_id: data.class,
    matric_number: data.matricNumber,
    password: data.password,
    gender: data.gender.toUpperCase(),
    date_of_birth: format(
      parse(data.dateOfBirth, DATE_OF_BIRTH_INPUT_FORMAT, new Date()),
      "yyyy-MM-dd",
    ),
    admission_date: data.admissionDate,
  };
  const response = await apiClient.post("/users", payload);
  return response.data.data;
};

export default function AddStudent() {
  const { classes, isLoading: isClassesLoading } = useClasses();
  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);
  const [dobCalendarMonth, setDobCalendarMonth] = useState(() => new Date());
  const [adDate, setAdDate] = useState<Date | undefined>(undefined);

  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      matricNumber: "",
      class: "",
      dateOfBirth: "",
      admissionDate: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    control,
    trigger,
    formState: { isSubmitting, isValid },
  } = form;

  const { mutateAsync: addStudent, isPending: isAddingStudent } = useMutation({
    mutationFn: addNewStudent,
    onSuccess: () => {
      toast.success("Student added successfully");
      form.reset();
      setAdDate(undefined);
      setDobCalendarMonth(new Date());
      setDobPopoverOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add student");
      console.log(error);
    },
  });

  const onSubmit = (data: AddStudentFormValues) => {
    addStudent(data);
  };

  const goToNextStep = async () => {
    const isStepValid = await trigger(STEP_FIELDS[currentStep]);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-900">
          Add New Student
        </DialogTitle>
        <DialogDescription>
          Complete all steps to create the student profile.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                index < currentStep
                  ? "bg-blue-800 text-white"
                  : index === currentStep
                    ? "bg-blue-800 text-white ring-4 ring-blue-200"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  index < currentStep ? "bg-blue-800" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          {STEPS[currentStep].title}
        </p>
        <p className="text-sm text-slate-500">
          {STEPS[currentStep].description}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          {currentStep === 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      First Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="firstName"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter first name"
                      type="text"
                      autoComplete="off"
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
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Last Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="lastName"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter last name"
                      type="text"
                      autoComplete="off"
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
                name="dateOfBirth"
                render={({ field, fieldState }) => {
                  const selectedDob = parseDobField(field.value);
                  return (
                    <Field>
                      <FieldLabel>
                        Date of Birth{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <InputGroup className="h-12!">
                        <InputGroupInput
                          id="date-required"
                          placeholder={DATE_OF_BIRTH_INPUT_FORMAT}
                          autoComplete="bday"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setDobPopoverOpen(true);
                            }
                          }}
                        />
                        <InputGroupAddon align="inline-end">
                          <Popover
                            open={dobPopoverOpen}
                            onOpenChange={(next) => {
                              setDobPopoverOpen(next);
                              if (next) {
                                const p = parseDobField(field.value);
                                setDobCalendarMonth(p ?? new Date());
                              }
                            }}
                          >
                            <PopoverTrigger
                              render={
                                <InputGroupButton
                                  type="button"
                                  id="date-picker"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Select date"
                                >
                                  <CalendarIcon />
                                  <span className="sr-only">Select date</span>
                                </InputGroupButton>
                              }
                            />
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="end"
                              alignOffset={-8}
                              sideOffset={10}
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDob}
                                month={dobCalendarMonth}
                                onMonthChange={setDobCalendarMonth}
                                onSelect={(d) => {
                                  if (!d) return;
                                  field.onChange(formatDobField(d));
                                  setDobCalendarMonth(d);
                                  setDobPopoverOpen(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                control={control}
                name="gender"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Gender <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={genderOptions}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Gender</SelectLabel>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="matricNumber"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Matric Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="matricNumber"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter matric number"
                      type="text"
                      autoComplete="off"
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
                name="class"
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
                          {classes.map((option: SelectOption) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                name="admissionDate"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Admission Date <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            id="date-picker-simple"
                            className="justify-start font-normal h-12"
                          >
                            {adDate ? (
                              format(adDate, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        }
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={adDate}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            }
                            setAdDate(date);
                          }}
                          defaultMonth={adDate}
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
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-4">
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Password <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="password"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter password"
                      type="password"
                      autoComplete="off"
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
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Confirm Password{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Confirm password"
                      type="password"
                      autoComplete="off"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              type="button"
              className="h-12 px-4"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeftIcon className="size-5" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="lg"
                type="button"
                className="h-12 px-4"
                onClick={goToNextStep}
              >
                Next
                <ArrowRightIcon className="size-5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="h-12 px-4"
                type="submit"
                disabled={isSubmitting || !isValid}
              >
                Add Student
              </Button>
            )}
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
