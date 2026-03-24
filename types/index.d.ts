import { signInSchema } from "@/lib/schema";
import { Icon } from "@phosphor-icons/react";
import { z } from "zod";

export type SignInFormValues = z.infer<typeof signInSchema>;

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

export type NavLink = {
  title: string;
  href: string;
  Icon: Icon;
};

export type NavSection = {
  label: string;
  items: NavLink[];
};
