import { SelectOption, Testimonial } from "@/types";

export const userRoles: SelectOption[] = [
  {
    value: "student",
    label: "Student",
  },
  {
    value: "teacher",
    label: "Teacher",
  },
  {
    value: "parent",
    label: "Parent",
  },
  {
    value: "admin",
    label: "Admin",
  },
  // {
  //   value: "staff",
  //   label: "Staff",
  // },
  // {
  //   value: "super-admin",
  //   label: "Super Admin",
  // },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      '"The Scholarly Grove has transformed how we manage academic records. It\'s precise, beautiful, and intuitive."',
    author: "Dr. Sarah Mensah",
    title: "Principal, Green Valley Academy",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=sarah",
  },
  {
    quote:
      '"Eduvia cut my grading and attendance workflow in half. Parents finally see the same data we do, without a dozen spreadsheets."',
    author: "Marcus Chen",
    title: "Mathematics Teacher, Riverside High School",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=marcus",
  },
  {
    quote:
      '"I used to wait for report cards to know how my kids were doing. Now I get a clear picture of assignments and feedback the same week."',
    author: "Elena Okonkwo",
    title: "Parent of two, St. Jude's Catholic School",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=elena",
  },
];
