import {
  AdminRoles,
  NavLink,
  NavSection,
  Role,
  SelectOption,
  Testimonial,
} from "@/types";
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
  SoccerBallIcon,
  SquaresFourIcon,
  StudentIcon,
  UserIcon,
  UsersThreeIcon,
  WalletIcon,
} from "@phosphor-icons/react";

export const adminRoles: AdminRoles[] = [
  "ADMIN",
  "PRINCIPAL",
  "VICE_PRINCIPAL",
  "SUPER_ADMIN",
  "HEAD_TEACHER",
  "ASST_HEAD_TEACHER",
  "SCHOOL_OWNER",
];

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

export const studentDashboardLink: NavLink = {
  title: "Overview",
  href: "/student/overview",
  Icon: SquaresFourIcon,
};

export const studentNavSections: NavSection[] = [
  {
    label: "Academic",
    items: [
      {
        title: "My Classes",
        href: "/student/my-classes",
        Icon: ChartLineIcon,
      },
      {
        title: "Timetable",
        href: "/student/timetable",
        Icon: ClockIcon,
      },
      {
        title: "Assignments",
        href: "/student/assignments",
        Icon: FileTextIcon,
      },
      {
        title: "Exams & Tests",
        href: "/student/exams-tests",
        Icon: ClipboardTextIcon,
      },
      {
        title: "My Results",
        href: "/student/my-results",
        Icon: FileTextIcon,
      },
    ],
  },
  {
    label: "Campus Life",
    items: [
      {
        title: "Study Groups",
        href: "/student/study-groups",
        Icon: UsersThreeIcon,
      },
      {
        title: "Events",
        href: "/student/events",
        Icon: CalendarCheckIcon,
      },
      {
        title: "Sport",
        href: "/student/sport",
        Icon: SoccerBallIcon,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Payment",
        href: "/student/fee-payment",
        Icon: CoinsIcon,
      },
      {
        title: "Payment History",
        href: "/student/payment-history",
        Icon: WalletIcon,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "My Profile",
        href: "/student/my-profile",
        Icon: UserIcon,
      },
      {
        title: "Settings",
        href: "/student/settings",
        Icon: GearIcon,
      },
    ],
  },
];

export const teacherDashboardLink: NavLink = {
  title: "Overview",
  href: "/teacher/overview",
  Icon: SquaresFourIcon,
};

export const teacherNavSections: NavSection[] = [
  {
    label: "Teaching",
    items: [
      {
        title: "My Classes",
        href: "/teacher/my-classes",
        Icon: ChartLineIcon,
      },
      {
        title: "Timetable",
        href: "/teacher/timetable",
        Icon: ClockIcon,
      },
      {
        title: "Upload Lectures",
        href: "/teacher/upload-lectures",
        Icon: FileTextIcon,
      },
      {
        title: "Assignments",
        href: "/teacher/assignments",
        Icon: FileTextIcon,
      },
      {
        title: "Assessments",
        href: "/teacher/assessments",
        Icon: ClipboardTextIcon,
      },
      {
        title: "Grade Book",
        href: "/teacher/grade-book",
        Icon: FileTextIcon,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Messages",
        href: "/teacher/messages",
        Icon: ChatIcon,
      },
      {
        title: "Announcements",
        href: "/teacher/announcements",
        Icon: MegaphoneSimpleIcon,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Tutorial Classes",
        href: "/teacher/tutorial-classes",
        Icon: BookOpenTextIcon,
      },
      {
        title: "Disciplinary",
        href: "/teacher/disciplinary",
        Icon: GavelIcon,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "My Payslips",
        href: "/teacher/my-payslips",
        Icon: WalletIcon,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "My Profile",
        href: "/teacher/my-profile",
        Icon: UserIcon,
      },
      {
        title: "Settings",
        href: "/teacher/settings",
        Icon: GearIcon,
      },
    ],
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
        href: "/admin/academic-sessions",
        Icon: CalendarBlankIcon,
      },
      {
        title: "Classes & Subjects",
        href: "/admin/classes-subjects",
        Icon: BookOpenTextIcon,
      },
      {
        title: "Timetable",
        href: "/admin/timetable",
        Icon: ClockIcon,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        title: "Students",
        href: "/admin/students",
        Icon: StudentIcon,
      },
      {
        title: "Teachers",
        href: "/admin/teachers",
        Icon: ChalkboardTeacherIcon,
      },
      {
        title: "Parents",
        href: "/admin/parents",
        Icon: UsersThreeIcon,
      },
      {
        title: "Staff",
        href: "/admin/staff",
        Icon: BriefcaseMetalIcon,
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        title: "Results Management",
        href: "/admin/results",
        Icon: FileTextIcon,
      },
      {
        title: "Exam Scheduling",
        href: "/admin/exams",
        Icon: ClipboardTextIcon,
      },
      {
        title: "Calendar",
        href: "/admin/calendar",
        Icon: CalendarIcon,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Fee Management",
        href: "/admin/fees",
        Icon: CoinsIcon,
      },
      {
        title: "Payroll",
        href: "/admin/payroll",
        Icon: WalletIcon,
      },
      {
        title: "Loans",
        href: "/admin/loans",
        Icon: BankIcon,
      },
    ],
  },
  {
    label: "Repository",
    items: [
      {
        title: "School Documents",
        href: "/admin/school-documents",
        Icon: FolderOpenIcon,
      },
      {
        title: "Department Files",
        href: "/admin/department-files",
        Icon: FoldersIcon,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Disciplinary",
        href: "/admin/disciplinary",
        Icon: GavelIcon,
      },
      {
        title: "Announcements",
        href: "/admin/announcements",
        Icon: MegaphoneSimpleIcon,
      },
      {
        title: "Events",
        href: "/admin/events",
        Icon: CalendarCheckIcon,
      },
      {
        title: "Audit Log",
        href: "/admin/audit-log",
        Icon: ListMagnifyingGlassIcon,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "School Profile",
        href: "/admin/profile",
        Icon: BuildingsIcon,
      },
      {
        title: "Permissions",
        href: "/admin/permissions",
        Icon: KeyIcon,
      },
      {
        title: "Billing & Plan",
        href: "/admin/billing",
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

export function getNavConfigForRole(role: Role | undefined): {
  dashboard: NavLink;
  sections: NavSection[];
} {
  switch (role) {
    case "STUDENT":
      return {
        dashboard: studentDashboardLink,
        sections: studentNavSections,
      };
    case "TEACHER":
      return {
        dashboard: teacherDashboardLink,
        sections: teacherNavSections,
      };
    case "PARENT":
      return {
        dashboard: parentDashboardLink,
        sections: parentNavSections,
      };
    case "ADMIN":
      return {
        dashboard: schoolAdminDashboardLink,
        sections: schoolAdminNavSections,
      };
    case "PRINCIPAL":
      return {
        dashboard: schoolAdminDashboardLink,
        sections: schoolAdminNavSections,
      };
    case "STAFF":
      return {
        dashboard: schoolAdminDashboardLink,
        sections: schoolAdminNavSections,
      };
    case "SUPER_ADMIN":
      return {
        dashboard: schoolAdminDashboardLink,
        sections: schoolAdminNavSections,
      };
    default:
      return {
        dashboard: studentDashboardLink,
        sections: [],
      };
  }
}

/** backgroundColor is a light tint of the same hue as iconColor. */
export const adminStatsCards = [
  {
    title: "Total Students",
    value: 1000,
    change: "+14.2%",
    Icon: StudentIcon,
    iconColor: "#1D4ED8",
    backgroundColor: "#DBEAFE",
  },
  {
    title: "Teachers",
    value: 100,
    change: "-3.8%",
    Icon: ChalkboardTeacherIcon,
    iconColor: "#7C3AED",
    backgroundColor: "#EDE9FE",
  },
  {
    title: "Active Classes",
    value: 28,
    change: "+1.2%",
    Icon: ChartLineIcon,
    iconColor: "#1E40AF",
    backgroundColor: "#E0E7FF",
  },
  {
    title: "Support Staff",
    value: 30,
    change: "+6.1%",
    Icon: BriefcaseMetalIcon,
    iconColor: "#C2410C",
    backgroundColor: "#FFEDD5",
  },
  {
    title: "Fee Collected",
    value: "$100,000",
    change: "-1.4%",
    Icon: CoinsIcon,
    iconColor: "#047857",
    backgroundColor: "#D1FAE5",
  },
];

export const genderOptions: SelectOption[] = [
  {
    value: "male",
    label: "Male",
  },
  {
    value: "female",
    label: "Female",
  },
];

export const qualificationOptions: SelectOption[] = [
  {
    value: "wassce",
    label: "Wassce",
  },
  {
    value: "hnd",
    label: "HND",
  },
  {
    value: "nd",
    label: "ND",
  },
  {
    value: "bsc",
    label: "BSc",
  },
  {
    value: "beng",
    label: "BEng",
  },
  {
    value: "ba",
    label: "BA",
  },
  {
    value: "ma",
    label: "MA",
  },
  {
    value: "meng",
    label: "MEng",
  },
  {
    value: "msc",
    label: "MSc",
  },
  {
    value: "phd",
    label: "PhD",
  },
];

export const classOfDegreeOptions = [
  {
    value: "first-class",
    label: "First Class",
  },
  {
    value: "second-class-upper",
    label: "Second Class Upper",
  },
  {
    value: "second-class-lower",
    label: "Second Class Lower",
  },
  {
    value: "third-class",
    label: "Third Class",
  },
  {
    value: "pass",
    label: "Pass",
  },
  {
    value: "distinction",
    label: "Distinction",
  },
  {
    value: "merit",
    label: "Merit",
  },
  {
    value: "credit",
    label: "Credit",
  },
];
