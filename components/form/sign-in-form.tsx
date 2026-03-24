"use client";

import { signInSchema } from "@/lib/schema";
import { SignInFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationCardIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { setAuthToken } from "@/lib/auth";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface SignInFormProps {
  userType: string;
}

const signInUser = async (data: SignInFormValues) => {
  const payload = {
    identifier: data.identifier,
    password: data.password,
  };
  const response = await publicApi.post("/auth/login", payload);
  return response.data.data;
};

export default function SignInForm({ userType }: SignInFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const {
    formState: { isValid },
    control,
    handleSubmit,
  } = form;

  const { mutateAsync: signIn, isPending } = useMutation({
    mutationFn: signInUser,
    onSuccess: (data) => {
      console.log(data);
      setAuthToken(data.access_token, data.refresh_token);
      router.push("/");
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error.response?.data as { message: string })?.message ||
          "An error occurred",
      );
      console.log(error);
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    signIn(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          control={control}
          name="identifier"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                htmlFor="identifier"
                className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1"
              >
                Login ID
              </FieldLabel>
              <div className="relative">
                <IdentificationCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                <Input
                  id="identifier"
                  className="h-10 md:h-13 pl-11 placeholder:text-xs md:placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-green/20 focus-visible:border-primary-green placeholder:font-semibold"
                  placeholder={`Enter your ${userType === "student" ? "Matric Number" : userType === "teacher" ? "Staff ID" : userType === "parent" ? "Parent ID" : "Admin ID"}`}
                  type={
                    userType === "student"
                      ? "text"
                      : userType === "teacher"
                        ? "text"
                        : userType === "parent"
                          ? "text"
                          : "text"
                  }
                  autoComplete={
                    userType === "student"
                      ? "off"
                      : userType === "teacher"
                        ? "off"
                        : userType === "parent"
                          ? "off"
                          : "off"
                  }
                  {...field}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field>
              <div className="flex justify-between items-center px-1">
                <FieldLabel
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1"
                >
                  Password
                </FieldLabel>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary-green hover:underline underline-offset-4"
                  transitionTypes={["slide"]}
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                <Input
                  id="password"
                  className="h-10 md:h-13 pl-11 placeholder:text-xs md:placeholder:text-sm focus-visible:ring-2 focus-visible:ring-primary-green/20 focus-visible:border-primary-green placeholder:font-semibold"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  {...field}
                />
                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary hover:bg-transparent active:translate-y-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5 " />
                  )}
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          variant="default"
          size="lg"
          className="w-full h-13 bg-primary-green hover:bg-[#14522c] text-white font-bold rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
          type="submit"
          disabled={!isValid || isPending}
        >
          {isPending ? (
            <>
              <Spinner className="size-5 text-white" />
              <span className="text-white">Signing in...</span>
            </>
          ) : (
            <>
              Sign In to Portal
              <ArrowRightIcon className="size-5" />
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
