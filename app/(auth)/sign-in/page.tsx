"use client";

import { Badge } from "@/components/ui/badge";
import { userRoles } from "@/lib/data";
import {
  BriefcaseIcon,
  ChalkboardTeacherIcon,
  ShieldStarIcon,
} from "@phosphor-icons/react";
import { GraduationCapIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import SignInForm from "@/components/form/sign-in-form";

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState<string>(userRoles[0].value);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-eduvia-accent-foreground">
            Welcome Back
          </h1>
          <Badge
            variant="outline"
            className=" py-1 bg-[#F9FAFB] text-xs font-semibold text-[#4B5563] rounded-full flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
            OS-992-GROVE SCHOOL
          </Badge>
        </div>
        <p className="text-[#4B5563]">
          Please enter your credentials to access your portal.
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
          {userRoles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`flex flex-col items-center justify-center py-4 rounded-lg transition-all hover:bg-gray-100 hover:text-white ${
                selectedRole === role.value
                  ? "bg-primary-green text-white hover:bg-primary-green/80"
                  : ""
              }`}
            >
              <span
                className={`text-2xl mb-1.5 ${
                  selectedRole === role.value
                    ? "text-primary-green"
                    : "text-[#4B5563]"
                }`}
              >
                {role.value === "admin" && (
                  <ShieldStarIcon
                    className={cn(
                      "size-6",
                      selectedRole === role.value
                        ? "text-white"
                        : "text-[#4B5563]",
                    )}
                  />
                )}
                {role.value === "student" && (
                  <GraduationCapIcon
                    className={cn(
                      "size-6",
                      selectedRole === role.value
                        ? "text-white"
                        : "text-[#4B5563]",
                    )}
                  />
                )}
                {role.value === "teacher" && (
                  <ChalkboardTeacherIcon
                    className={cn(
                      "size-6",
                      selectedRole === role.value
                        ? "text-white"
                        : "text-[#4B5563]",
                    )}
                  />
                )}
                {role.value === "parent" && (
                  <UsersIcon
                    className={cn(
                      "size-6",
                      selectedRole === role.value
                        ? "text-white"
                        : "text-[#4B5563]",
                    )}
                  />
                )}
                {role.value === "staff" && (
                  <BriefcaseIcon
                    className={cn(
                      "size-6",
                      selectedRole === role.value
                        ? "text-white"
                        : "text-[#4B5563]",
                    )}
                  />
                )}
                {/* {role.value === "super-admin" && <ShieldStarIcon size={32} />} */}
              </span>
              <span
                className={`text-xs uppercase tracking-wider ${
                  selectedRole === role.value
                    ? "text-white font-semibold"
                    : "text-[#4B5563] font-medium"
                }`}
              >
                {role.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <SignInForm userType={selectedRole} />
    </div>
  );
}
