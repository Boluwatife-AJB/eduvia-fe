import { addStudentSchema, signInSchema } from "@/lib/schema";
import { Icon } from "@phosphor-icons/react";
import { z } from "zod";

type SignInFormValues = z.infer<typeof signInSchema>;
type AddStudentFormValues = z.infer<typeof addStudentSchema>;

type Role =
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "ADMIN"
  | "PRINCIPAL"
  | "STAFF"
  | "SUPER_ADMIN";

type AdminRoles =
  | "ADMIN"
  | "PRINCIPAL"
  | "VICE_PRINCIPAL"
  | "SUPER_ADMIN"
  | "HEAD_TEACHER"
  | "ASST_HEAD_TEACHER";

interface SelectOption {
  value: string;
  label: string;
}

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  avatarUrl: string;
}

type NavLink = {
  title: string;
  href: string;
  Icon: Icon;
};

type NavSection = {
  label: string;
  items: NavLink[];
};

interface TenantSlice {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

interface AdminStatsCard {
  title: string;
  value: string | number;
  change: string;
  Icon: Icon;
  iconColor: string;
  backgroundColor: string;
}

interface StatsResponse {
  total_students: number;
  total_teachers: number;
  total_parents: number;
  total_staff: number;
  total_classes: number;
}
