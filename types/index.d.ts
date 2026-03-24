import { signInSchema } from "@/lib/schema";
import { Icon } from "@phosphor-icons/react";
import { z } from "zod";

type SignInFormValues = z.infer<typeof signInSchema>;

type Role =
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "ADMIN"
  | "PRINCIPAL"
  | "STAFF"
  | "SUPER_ADMIN";

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
