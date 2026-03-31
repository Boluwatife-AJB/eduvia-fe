import { isValid, parse } from "date-fns";
import { z } from "zod";
import { classOfDegreeOptions, genderOptions } from "./data";

export const DATE_OF_BIRTH_INPUT_FORMAT = "dd/MM/yyyy";

function isValidDateOfBirthString(value: string): boolean {
  const d = parse(value.trim(), DATE_OF_BIRTH_INPUT_FORMAT, new Date());
  return isValid(d);
}

export const signInSchema = z.object({
  // userType: z
  //   .enum(userRoles.map((role) => role.value))
  //   .default(userRoles[0].value)
  //   .describe("The type of user you are"),
  identifier: z
    .string()
    .min(1, { message: "Identifier is required" })
    .describe("The identifier you use to sign in"),
  password: z
    .string()
    .min(8, { message: "Password is required" })
    .describe("The password you use to sign in"),
});

// {
//   "role": "STUDENT",
//   "first_name": "Adetayo",
//   "last_name": "Adelabu",
//   "identifier": "GFA/2026/0001",
//   "email": "adetayoadelabu@greenfieldacademy.edu.ng",
//   "phone": "+2348061234567",
//   "date_of_birth": "2007-02-21",
//   "password": "Password123",
//   "matric_number": "GFA/2026/0001",
//   "admission_date": "2026-09-04",
//   "class_id": "string",
//   "employee_id": "string",
//   "qualification": "B.Sc Computer Science",
//   "subject_ids": [
//     "subject-id-1",
//     "subject-id-2"
//   ],
//   "staff_type": "nurse",
//   "guardian_id": "string",
//   "relationship": "string",
//   "ward_ids": [
//     "string"
//   ],
//   "occupation": "string"
// }

export const addStudentSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    gender: z.enum(genderOptions.map((option) => option.value)),
    matricNumber: z
      .string()
      .regex(/^[A-Z]{3}\/\d{4}\/\d{4}$/, {
        message: "Matric number must be in the format XXX/YYYY/NNNN",
      })
      .optional(),
    class: z.string().min(1, { message: "Class is required" }),
    dateOfBirth: z
      .string()
      .min(1, { message: "Date of birth is required" })
      .refine(isValidDateOfBirthString, {
        message: "Enter a valid date as dd/MM/yyyy",
      }),
    admissionDate: z.string().min(1, { message: "Admission date is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
    enforceChangePassword: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addTeacherSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    gender: z.enum(genderOptions.map((option) => option.value)),
    identifier: z.string().min(1, { message: "Identifier is required" }),
    qualification: z.string().min(1, { message: "Qualification is required" }),
    classOfDegree: z.enum(classOfDegreeOptions.map((option) => option.value)),
    yearOfGraduation: z
      .string()
      .min(1, { message: "Year of graduation is required" }),
    courseOfStudy: z
      .string()
      .min(1, { message: "Course of study is required" }),
    email: z.email({ message: "Invalid email address" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
    enforceChangePassword: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addStaffSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    gender: z.enum(genderOptions.map((option) => option.value)),
    identifier: z.string().min(1, { message: "Identifier is required" }),
    qualification: z.string().min(1, { message: "Qualification is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
    enforceChangePassword: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addParentSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  gender: z.enum(genderOptions.map((option) => option.value)),
  identifier: z.string().min(1, { message: "Identifier is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirm password is required" }),
  enforceChangePassword: z.boolean().default(false),
});
