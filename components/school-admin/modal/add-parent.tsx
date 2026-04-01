"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { addParentSchema } from "@/lib/schema";
import { AddParentFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useId, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
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
import { genderOptions, relationshipOptions } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useStudents } from "@/hooks/use-students";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";

interface AddParentProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: "Personal Information",
    description: "Tell us basic details about the parent.",
  },
  {
    title: "Wards",
    description: "Provide the wards of the parent.",
  },
  {
    title: "Account Setup",
    description: "Set a secure password for the parent portal.",
  },
];

const STEP_FIELDS: Array<Array<keyof AddParentFormValues>> = [
  ["firstName", "lastName", "gender", "email", "phone"],
  ["wards", "relationship"],
  ["identifier", "password", "confirmPassword"],
];

const addNewParent = async (data: AddParentFormValues) => {
  const payload = {
    role: "PARENT",
    first_name: data.firstName,
    last_name: data.lastName,
    password: data.password,
    gender: data.gender.toUpperCase(),
    email: data.email,
    phone: data.phone,
    ward_ids: data.wards,
    relationship: data.relationship,
    occupation: data.occupation,
    identifier: data.identifier,
  };
  const response = await apiClient.post("/users", payload);
  return response.data.data;
};

export default function AddParent({ onClose }: AddParentProps) {
  const queryClient = useQueryClient();
  const wardsComboboxAnchorRef = useComboboxAnchor();
  const wardsInputId = useId();
  const { students: studentOptions, isLoading: isStudentsLoading } =
    useStudents();
  const studentIds = useMemo(
    () => studentOptions.map((s) => s.value),
    [studentOptions],
  );
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    resolver: zodResolver(addParentSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      wards: [],
      relationship: "",
      email: "",
      phone: "",
      identifier: "",
      password: "",
      confirmPassword: "",
      enforceChangePassword: false,
    },
  });

  const { mutateAsync: addParent, isPending: isAddingParent } = useMutation({
    mutationFn: addNewParent,
    onSuccess: () => {
      toast.success("Parent added successfully");
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      form.reset();
      onClose();
    },
    onError: (error: AxiosError) => {
      toast.error((error.response?.data as { message: string })?.message);
      console.error(error);
    },
  });

  const {
    handleSubmit,
    control,
    trigger,
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = (data: AddParentFormValues) => {
    addParent(data);
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
          Add New Parent
        </DialogTitle>
        <DialogDescription>
          Complete all steps to create the parent profile.
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

              <Controller
                control={control}
                name="occupation"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Occupation</FieldLabel>
                    <Input
                      id="occupation"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter occupation"
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
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="wards"
                render={({ field, fieldState }) => {
                  const selectedIds = field.value ?? [];
                  const labelForId = (id: string) =>
                    studentOptions.find((s) => s.value === id)?.label ?? id;

                  return (
                    <Field>
                      <FieldLabel htmlFor={wardsInputId}>
                        Wards <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Combobox
                        multiple
                        items={studentIds}
                        value={selectedIds}
                        onValueChange={(next) => {
                          field.onChange(next ?? []);
                        }}
                        disabled={isStudentsLoading}
                      >
                        <ComboboxChips
                          ref={wardsComboboxAnchorRef}
                          className={cn(
                            "w-full min-h-12 rounded-lg px-2 py-1.5 text-sm",
                            fieldState.invalid &&
                              "border-destructive has-aria-invalid:border-destructive",
                          )}
                          aria-invalid={fieldState.invalid}
                          onBlur={(e) => {
                            const next = e.relatedTarget as Node | null;
                            if (!next || !e.currentTarget.contains(next)) {
                              field.onBlur();
                            }
                          }}
                        >
                          <ComboboxValue>
                            {(value: string[] | undefined) => (
                              <>
                                {(value ?? []).map((id) => (
                                  <ComboboxChip key={id}>
                                    {labelForId(id)}
                                  </ComboboxChip>
                                ))}
                                <ComboboxChipsInput
                                  id={wardsInputId}
                                  placeholder={
                                    (value?.length ?? 0) > 0
                                      ? ""
                                      : "Search and select students..."
                                  }
                                  className="min-h-8 placeholder:text-muted-foreground"
                                />
                              </>
                            )}
                          </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent
                          anchor={wardsComboboxAnchorRef}
                          side="bottom"
                          align="start"
                          className="min-w-(--anchor-width)"
                        >
                          <ComboboxList>
                            {(id: string) => (
                              <ComboboxItem key={id} value={id}>
                                {labelForId(id)}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                          <ComboboxEmpty>
                            {isStudentsLoading
                              ? "Loading students..."
                              : "No students found."}
                          </ComboboxEmpty>
                        </ComboboxContent>
                      </Combobox>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                control={control}
                name="relationship"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Relationship <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={relationshipOptions}
                    >
                      <SelectTrigger className="h-12! w-full px-3">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectLabel>Relationship</SelectLabel>
                          {relationshipOptions.map((option) => (
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

          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-4">
              <Controller
                control={control}
                name="identifier"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Parent ID <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="identifier"
                      className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                      placeholder="Enter parent ID"
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
                  <Field orientation="horizontal">
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
                        The parent will be required to change their password on
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
                disabled={isSubmitting || !isValid || isAddingParent}
              >
                {isAddingParent ? (
                  <>
                    <Spinner className="size-5 text-white" />
                    <span>Adding parent...</span>
                  </>
                ) : (
                  "Add Parent"
                )}
              </Button>
            )}
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
