import {
  addParentSchema,
  addStaffSchema,
  addStudentSchema,
  addTeacherSchema,
  classSchema,
  createTimetableSlotSchema,
  departmentSchema,
  signInSchema,
  subjectSchema,
} from "@/lib/schema";
import { Icon } from "@phosphor-icons/react";
import { z } from "zod";

type SignInFormValues = z.infer<typeof signInSchema>;
type AddStudentFormValues = z.infer<typeof addStudentSchema>;
type AddTeacherFormValues = z.infer<typeof addTeacherSchema>;
type AddParentFormValues = z.infer<typeof addParentSchema>;
type AddStaffFormValues = z.infer<typeof addStaffSchema>;
type CreateTimetableSlotFormValues = z.infer<typeof createTimetableSlotSchema>;
type ClassFormValues = z.infer<typeof classSchema>;
type DepartmentFormValues = z.infer<typeof departmentSchema>;
type SubjectFormValues = z.infer<typeof subjectSchema>;

type Gender = "MALE" | "FEMALE";

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
  | "ASST_HEAD_TEACHER"
  | "SCHOOL_OWNER";

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

interface TeacherProfile {
  staff_id: string;
  qualification: string;
  class_of_degree: string | null;
  course_of_study: string | null;
  graduation_year: string | null;
}

interface StudentProfile {
  matric_number: string;
  class_id: string;
  class: {
    id: string;
    name: string;
    level: string;
    department_id: string | null;
  };
}

interface GuardianProfile {
  occupation: string | null;
  relationship: string;
  wards: Array<{
    id: string;
    last_name: string;
    first_name: string;
  }>;
}

interface StaffProfile {
  staff_id: string;
  staff_role: string;
  qualification: string;
  class_of_degree: string;
  course_of_study: string;
  year_of_graduation: string;
  gender: Gender;
  date_joined: string;
}

interface Student {
  id: string;
  tenant_id: string;
  role: "STUDENT";
  identifier: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  gender: Gender;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  student_profile: StudentProfile;
}

interface Teacher {
  id: string;
  tenant_id: string;
  role: "TEACHER";
  identifier: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  teacher_profile: TeacherProfile;
}

interface Parent {
  id: string;
  tenant_id: string;
  role: "PARENT";
  identifier: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  relationship: string | null;
  guardian_profile: GuardianProfile;
}

interface Staff {
  id: string;
  tenant_id: string;
  role: string;
  identifier: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  staff_profile: StaffProfile;
}
interface Meta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

interface StudentsResponse {
  data: Student[];
  meta: Meta;
}

interface TeachersResponse {
  data: Teacher[];
  meta: Meta;
}

interface ParentsResponse {
  data: Parent[];
  meta: Meta;
}

interface StaffResponse {
  data: Staff[];
  meta: Meta;
}

interface SubjectSlice {
  id: string;
  name: string;
  code: string;
}

interface ClassSubject {
  id: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  subject_type: string;
  subject: SubjectSlice;
}

interface StudentSlice {
  user_id: string;
  first_name: string;
  last_name: string;
  matric_number: string;
}

interface UserSlice {
  id: string;
  first_name: string;
  last_name: string;
}
interface ClassesResponse {
  id: string;
  tenant_id: string;
  name: string;
  level: string;
  capacity: number;
  department_id: string | null;
  class_teacher_id: string | null;
  subject_ids: string[];
  department: unknown | null;
  class_subjects: ClassSubject[];
  class_teacher: UserSlice | null;
  students: StudentSlice[] | [];
  students_count: number;
  subjects_count: number;
}

interface Department {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  hod: UserSlice | null;
  subjects: SubjectSlice[] | [];
}
