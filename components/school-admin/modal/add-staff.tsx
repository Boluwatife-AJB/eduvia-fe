"use client";

import {
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { addStaffSchema } from "@/lib/schema";
import { AddStaffFormValues } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  Field,
  FieldContent,
  FieldDescription,
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
import { Input } from "@/components/ui/input";
import {
  classOfDegreeOptions,
  genderOptions,
  nonTeachingStaffRoles,
  qualificationOptions,
} from "@/lib/data";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface AddStaffProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: "Personal Information",
    description: "Tell us basic details about the staff.",
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

const STEP_FIELDS: Array<Array<keyof AddStaffFormValues>> = [
  ["firstName", "lastName", "gender", "email", "phone"],
  [
    "role",
    "qualification",
    "classOfDegree",
    "yearOfGraduation",
    "courseOfStudy",
  ],
  ["password", "confirmPassword", "identifier"],
];

const addNewStaff = async (data: AddStaffFormValues) => {
  const payload = {
    role: data.role.toUpperCase(),
    staff_type: data.role.toLowerCase(),
    first_name: data.firstName,
    last_name: data.lastName,
    identifier: data.identifier,
    gender: data.gender.toUpperCase(),
    qualification: data.qualification,
    class_of_degree: data.classOfDegree,
    year_of_graduation: data.yearOfGraduation,
    course_of_study: data.courseOfStudy,
    password: data.password,
    email: data.email,
    phone: data.phone,
  };
  const response = await apiClient.post("/users", payload);
  return response.data.data;
};

export default function AddStaff({ onClose }: AddStaffProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(addStaffSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      identifier: "",
      qualification: "",
      classOfDegree: "",
      yearOfGraduation: "",
      courseOfStudy: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      enforceChangePassword: false,
    },
  });

  const { mutateAsync: addStaff, isPending: isAddingStaff } = useMutation({
    mutationFn: addNewStaff,
    onSuccess: () => {
      toast.success("Staff added successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to add staff");
      console.log(error);
    },
  });

  const {
    handleSubmit,
    control,
    trigger,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = (data: AddStaffFormValues) => {
    addStaff(data);
    // console.log(data);
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
          Add New Staff
        </DialogTitle>
        <DialogDescription>
          Complete all steps to create the staff profile.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex items-center gap-2 flex-1">
            <div
              className={`size-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                index < currentStep
                  ? "bg-blue-800 text-white"
                  : index === currentStep
                    ? "bg-blue-800 text-white ring-4 ring-blue-200"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {index < currentStep ? (
                <CheckIcon className="size-5 text-white" />
              ) : (
                index + 1
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-full ${
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                      <SelectContent alignItemWithTrigger={false}>
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

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Email <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="email"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter email"
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
                name="phone"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Phone Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="phone"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter phone number"
                      type="text"
                      autoComplete="off"
                      // pattern="\+234\d{10}"
                      // title="Enter a valid Nigerian phone number"
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

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Role <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={nonTeachingStaffRoles}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Role</SelectLabel>
                          {nonTeachingStaffRoles.map((option) => (
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
                name="qualification"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Qualification <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={qualificationOptions}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Qualification</SelectLabel>
                          {qualificationOptions.map((option) => (
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
                name="classOfDegree"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Class of Degree{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={classOfDegreeOptions}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue placeholder="Select class of degree" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Class of Degree</SelectLabel>
                          {classOfDegreeOptions.map((option) => (
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
                name="yearOfGraduation"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Year of Graduation{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="yearOfGraduation"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter year of graduation"
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
                name="courseOfStudy"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Course of Study{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="courseOfStudy"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter course of study"
                      type="text"
                      autoComplete="off"
                      {...field}
                    />
                  </Field>
                )}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="identifier"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Staff ID <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="identifier"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter staff ID"
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

              <Controller
                control={control}
                name="enforceChangePassword"
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" className="col-span-2">
                    <Checkbox
                      id="enforceChangePassword"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="size-4.5 shadow-none border-primary-blue data-checked:bg-primary-blue data-checked:text-white"
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="enforceChangePassword">
                        Change Password on Next Login
                      </FieldLabel>
                      <FieldDescription>
                        The student will be required to change their password on
                        their next login.
                      </FieldDescription>
                    </FieldContent>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-5 pt-2">
            <Button
              variant="outline"
              size="lg"
              type="button"
              className="h-12 px-4 flex-1"
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
                className="h-12 px-4 flex-1"
                onClick={goToNextStep}
              >
                Proceed
                <ArrowRightIcon className="size-5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="h-12 px-4 flex-1"
                type="submit"
                disabled={isSubmitting || !isValid || isAddingStaff}
              >
                {isAddingStaff ? (
                  <>
                    <Spinner className="size-5 text-white" />
                    <span>Adding staff...</span>
                  </>
                ) : (
                  "Add Staff"
                )}
              </Button>
            )}
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
