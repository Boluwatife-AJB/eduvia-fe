import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

const STEPS = [
  {
    title: "Personal Information",
    description: "Tell us basic details about the teacher.",
  },
  {
    title: "Academic Information",
    description: "Provide qualification and subject details.",
  },
  {
    title: "Account Setup",
    description: "Set a secure password for the teacher portal.",
  },
];

// const STEP_FIELDS: Array<Array<keyof AddStudentFormValues>> = [
//   ["firstName", "lastName", "dateOfBirth", "gender"],
//   ["matricNumber", "class", "admissionDate"],
//   ["password", "confirmPassword"],
// ];

export default function AddTeacher({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-slate-900">
          Add New Teacher
        </DialogTitle>
        <DialogDescription>
          Complete all steps to create the teacher profile.
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
    </div>
  );
}
