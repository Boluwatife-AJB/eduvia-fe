"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api";
import { createAcademicTermSchema } from "@/lib/schema";
import { parseFormDate } from "@/lib/utils";
import { AddAcademicTermFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddTermProps {
  isOpen: boolean;
  onClose: () => void;
  academicSessionId: string;
}

const createTerm = async (data: AddAcademicTermFormValues) => {
  const payload = {
    name: data.name,
    start_date: data.startDate,
    end_date: data.endDate,
    academic_session_id: data.academicSessionId,
    is_current: data.isCurrent,
  };

  const response = await apiClient.post("/school-setup/terms", payload);
  return response.data;
};

export default function AddTerm({
  isOpen,
  onClose,
  academicSessionId,
}: AddTermProps) {
  const queryClient = useQueryClient();
  const form = useForm<AddAcademicTermFormValues>({
    resolver: zodResolver(createAcademicTermSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      academicSessionId: academicSessionId,
      isCurrent: false,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset,
  } = form;

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: "",
      startDate: "",
      endDate: "",
      academicSessionId,
      isCurrent: false,
    });
  }, [isOpen, academicSessionId, reset]);

  const { mutateAsync: createTermMutation, isPending: isCreatingTerm } =
    useMutation({
      mutationFn: createTerm,
      onSuccess: () => {
        toast.success("Academic term created successfully");
        queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
        queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
        reset();
        onClose();
      },
      onError: (error) => {
        toast.error("Failed to create academic term");
        console.log(error);
      },
    });

  const onSubmit = (data: AddAcademicTermFormValues) => {
    createTermMutation(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-background">
        <div className="px-6 pt-5 bg-card shrink-0">
          <DialogTitle className="text-xl font-assistant font-bold text-foreground">
            Add Academic Term
          </DialogTitle>
          <DialogDescription className="mt-1">
            Add a new academic term to the selected academic session.
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
                    Academic Term Name{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    className="h-12 placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-blue/20 focus-visible:border-primary-blue"
                    placeholder="e.g. First Term"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => {
                  const selected = parseFormDate(field.value);
                  return (
                    <Field>
                      <FieldLabel>
                        Start Date <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              id="academic-session-start-date"
                              className="w-full justify-start font-normal h-12"
                            >
                              {selected ? (
                                format(selected, "dd/MM/yyyy")
                              ) : (
                                <span className="text-muted-foreground">
                                  Select a date
                                </span>
                              )}
                            </Button>
                          }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={selected}
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : "",
                              )
                            }
                            defaultMonth={selected}
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => {
                  const selected = parseFormDate(field.value);
                  return (
                    <Field>
                      <FieldLabel>
                        End Date <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              id="academic-session-end-date"
                              className="w-full justify-start font-normal h-12"
                            >
                              {selected ? (
                                format(selected, "dd/MM/yyyy")
                              ) : (
                                <span className="text-muted-foreground">
                                  Select a date
                                </span>
                              )}
                            </Button>
                          }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={selected}
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : "",
                              )
                            }
                            defaultMonth={selected}
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />
            </div>

            <Controller
              control={control}
              name="isCurrent"
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" className="flex ">
                  <FieldLabel htmlFor="isCurrent">
                    Is Current <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Switch
                    id="isCurrent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-checked:bg-primary-blue data-checked:text-white"
                  />
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
                onClick={onClose}
                className="h-12"
              >
                Discard Changes
              </Button>
              <Button
                className="h-12"
                variant="primary"
                type="submit"
                disabled={!isValid || isCreatingTerm}
              >
                {isCreatingTerm ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
