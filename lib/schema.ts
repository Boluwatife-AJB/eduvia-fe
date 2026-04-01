import { isValid, parse } from "date-fns";
import { z } from "zod";
import {
  classOfDegreeOptions,
  days,
  genderOptions,
  levels,
  nonTeachingStaffRoles,
  relationshipOptions,
} from "./data";

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

export const addStaffSchema = addTeacherSchema.extend({
  role: z.enum(
    nonTeachingStaffRoles.map((option) => option.value),
    {
      message: "Role is required",
    },
  ),
});

export const addParentSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  gender: z.enum(genderOptions.map((option) => option.value)),
  wards: z.array(z.string()).min(1, { message: "Wards are required" }),
  relationship: z.enum(
    relationshipOptions.map((option) => option.value),
    {
      message: "Relationship is required",
    },
  ),
  occupation: z.string().optional(),
  email: z.email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  identifier: z.string().min(1, { message: "Identifier is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirm password is required" }),
  enforceChangePassword: z.boolean().default(false),
});

export const createTimetableSlotSchema = z
  .object({
    classId: z.string().min(1, { message: "Class is required" }),
    teacherId: z.string().min(1, { message: "Teacher is required" }),
    subjectId: z.string().min(1, { message: "Subject is required" }),
    startTime: z.string().min(1, { message: "Start time is required" }),
    endTime: z.string().min(1, { message: "End time is required" }),
    day: z.enum(
      days.map((option) => option.value),
      {
        message: "Day is required",
      },
    ),
    venue: z.string().min(1, { message: "Venue is required" }),
    color: z.string().min(1, { message: "Color is required" }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["startTime", "endTime"],
  });

export const departmentSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  hodId: z.string().optional(),
});

export const subjectSchema = departmentSchema.extend({
  code: z.string().min(1, { message: "Code is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  departmentId: z.string().min(1, { message: "Department is required" }),
});

export const classSchema = z.object({
  name: z.string().min(1, { message: "Class Name is required" }),
  level: z.enum(
    levels.map((level) => level.value),
    {
      message: "Level is required",
    },
  ),
  capacity: z.string().min(1, { message: "Class capacity is required" }),
  departmentId: z.string().optional(),
  classTeacherId: z.string().optional(),
});
