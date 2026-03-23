import { signInSchema } from "@/lib/schema";
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
