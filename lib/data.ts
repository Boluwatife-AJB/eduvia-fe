import { NavLink, NavSection, SelectOption, Testimonial } from "@/types";
import {
  BankIcon,
  BookOpenTextIcon,
  BriefcaseMetalIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ChalkboardTeacherIcon,
  ChartLineIcon,
  ChatIcon,
  ClipboardTextIcon,
  ClockIcon,
  CoinsIcon,
  CreditCardIcon,
  FileTextIcon,
  FolderOpenIcon,
  FoldersIcon,
  GavelIcon,
  GearIcon,
  KeyIcon,
  ListMagnifyingGlassIcon,
  MegaphoneSimpleIcon,
  SquaresFour,
  SquaresFourIcon,
  StudentIcon,
  UserIcon,
  UsersThreeIcon,
  WalletIcon,
} from "@phosphor-icons/react";

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

export const schoolAdminDashboardLink: NavLink = {
  title: "Dashboard",
  href: "/",
  Icon: SquaresFourIcon,
};

export const schoolAdminNavSections: NavSection[] = [
  {
    label: "School Setup",
    items: [
      {
        title: "Academic Sessions",
        href: "/school-admin/school-setup/academic-sessions",
        Icon: CalendarBlankIcon,
      },
      {
        title: "Classes & Subjects",
        href: "/school-admin/school-setup/classes-subjects",
        Icon: BookOpenTextIcon,
      },
      {
        title: "Timetable",
        href: "/school-admin/school-setup/timetable",
        Icon: ClockIcon,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Students",
        href: "/school-admin/people/students",
        Icon: StudentIcon,
      },
      {
        title: "Teachers",
        href: "/school-admin/people/teachers",
        Icon: ChalkboardTeacherIcon,
      },
      {
        title: "Parents",
        href: "/school-admin/people/parents",
        Icon: UsersThreeIcon,
      },
      {
        title: "Staff",
        href: "/school-admin/people/staff",
        Icon: BriefcaseMetalIcon,
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        title: "Results Management",
        href: "/school-admin/academic/results",
        Icon: FileTextIcon,
      },
      {
        title: "Exam Scheduling",
        href: "/school-admin/academic/exams",
        Icon: ClipboardTextIcon,
      },
      {
        title: "Calendar",
        href: "/school-admin/academic/calendar",
        Icon: CalendarIcon,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Management",
        href: "/school-admin/finance/fees",
        Icon: CoinsIcon,
      },
      {
        title: "Payroll",
        href: "/school-admin/finance/payroll",
        Icon: WalletIcon,
      },
      {
        title: "Loans",
        href: "/school-admin/finance/loans",
        Icon: BankIcon,
      },
    ],
  },
  {
    label: "Repository",
    items: [
      {
        title: "School Documents",
        href: "/school-admin/repository/school-documents",
        Icon: FolderOpenIcon,
      },
      {
        title: "Department Files",
        href: "/school-admin/repository/department-files",
        Icon: FoldersIcon,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Disciplinary",
        href: "/school-admin/administration/disciplinary",
        Icon: GavelIcon,
      },
      {
        title: "Announcements",
        href: "/school-admin/administration/announcements",
        Icon: MegaphoneSimpleIcon,
      },
      {
        title: "Events",
        href: "/school-admin/administration/events",
        Icon: CalendarCheckIcon,
      },
      {
        title: "Audit Log",
        href: "/school-admin/administration/audit-log",
        Icon: ListMagnifyingGlassIcon,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "School Profile",
        href: "/school-admin/settings/profile",
        Icon: BuildingsIcon,
      },
      {
        title: "Permissions",
        href: "/school-admin/settings/permissions",
        Icon: KeyIcon,
      },
      {
        title: "Billing & Plan",
        href: "/school-admin/settings/billing",
        Icon: CreditCardIcon,
      },
    ],
  },
];

export const parentDashboardLink: NavLink = {
  title: "Overview",
  href: "/",
  Icon: SquaresFourIcon,
};

export const parentNavSections: NavSection[] = [
  {
    label: "My Ward(s)",
    items: [
      {
        title: "[ward-name] Academic Progress",
        href: "/parent/academic-progress",
        Icon: ChartLineIcon,
      },
      {
        title: "[ward-name] Attendance",
        href: "/parent/attendance",
        Icon: CalendarCheckIcon,
      },
      {
        title: "[ward-name] Results",
        href: "/parent/results",
        Icon: FileTextIcon,
      },
    ],
  },
  {
    label: "School",
    items: [
      {
        title: "PTA Meetings",
        href: "/parent/pta-meetings",
        Icon: UsersThreeIcon,
      },
      {
        title: "School Events",
        href: "/parent/school-events",
        Icon: CalendarCheckIcon,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Payment",
        href: "/parent/fee-payment",
        Icon: CoinsIcon,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Messages",
        href: "/parent/messages",
        Icon: ChatIcon,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "My Profile",
        href: "/parent/profile",
        Icon: UserIcon,
      },
      {
        title: "Settings",
        href: "/parent/settings",
        Icon: GearIcon,
      },
    ],
  },
];
