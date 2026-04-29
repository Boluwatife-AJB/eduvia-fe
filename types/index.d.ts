import {
  addParentSchema,
  addStaffSchema,
  addStudentSchema,
  addTeacherSchema,
  assignSubjectsToClassSchema,
  assignTeacherToSubjectSchema,
  classSchema,
  createAcademicSessionSchema,
  createTimetableSlotSchema,
  departmentSchema,
  createAcademicTermSchema,
  signInSchema,
  subjectSchema,
  createFolderSchema,
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
type AssignSubjectsToClassFormValues = z.infer<
  typeof assignSubjectsToClassSchema
>;
type AssignTeacherToSubjectFormValues = z.infer<
  typeof assignTeacherToSubjectSchema
>;
type AddAcademicSessionFormValues = z.infer<typeof createAcademicSessionSchema>;
type AddAcademicTermFormValues = z.infer<typeof createAcademicTermSchema>;
type CreateFolderFormValues = z.infer<typeof createFolderSchema>;
type UploadRepositoryFileFormValues = z.infer<
  typeof uploadRepositoryFileFormSchema
>;

type Gender = "MALE" | "FEMALE";

type ApiEnvelope<T> = {
  data: T;
};

type NullableString = string | null;

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

type SubjectType = "COMPULSORY" | "ELECTIVE" | "OPTIONAL";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

type SelectableFolder = Pick<
  RepositoryFolder,
  "id" | "scope" | "scope_id" | "name"
>;

type UploadTargetSelection = {
  scope: string;
  scopeId: string | null;
  folderId: string | null;
};

type FileRecord = {
  id: string;
  name: string;
  type: "pdf" | "video" | "audio" | "excel" | "word" | "image";
  size: string;
  version: number;
  uploadDate: string;
  uploader: string;
};

type SubfolderGridItem =
  | RepositoryFolder
  | FolderContent["sub_folders"][number];

type BreadcrumbSeg =
  | { type: "root" }
  | { type: "group"; label: string }
  | { type: "scope"; label: string }
  | { type: "folder"; id: string; name: string };

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
  title?: string;
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
  user_id?: string;
  matric_number?: string;
}

interface ClassSlice {
  id: string;
  name: string;
  level: string;
  class_id?: string;
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

interface DepartmentSlice {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  title: string;
  description: string | null;
  department_id: string;
  department: {
    id: string;
    name: string;
  };
  classes_assigned: ClassSlice[];
  teachers_assigned: UserSlice[];
}

interface ClassSubjectSlice {
  id: string;
  subject_id: string;
  subject_type: SubjectType;
  name: string;
  code: string;
  title: string;
  description: string | null;
  department: DepartmentSlice;
}

interface RegisteredSubjectSlice {
  id: string;
  name: string;
  code: string;
  title: string;
  department: DepartmentSlice;
}

interface ClassStudentSlice {
  user_id: string;
  gender: Gender;
  first_name: string;
  last_name: string;
  matric_number: string;
  avatar: string | null;
  email: string | null;
  registered_subjects: RegisteredSubjectSlice[];
}

interface ClassDetailsResponse {
  id: string;
  tenant_id: string;
  name: string;
  level: string;
  capacity: number;
  department: DepartmentSlice | null;
  class_teacher: UserSlice | null;
  class_subjects: ClassSubjectSlice[];
  students: ClassStudentSlice[];
  student_count: number;
  subject_count: number;
}

interface SubjectDetailsResponse {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  title: string;
  description: string | null;
  department: DepartmentSlice;
  classes_assigned: ClassSlice[];
  teachers_assigned: UserSlice[];
  student_offering: UserSlice[];
  classes_count: number;
  teachers_count: number;
  student_count: number;
}

interface TimeTableSlot {
  id: string;
  tenant_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  venue: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class: ClassSlice;
  subject: SubjectSlice;
  teacher: UserSlice;
  academic_term: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    academicSession: {
      id: string;
      name: string;
      start_date: string;
      end_date: string;
      is_current: boolean;
    };
  };
}

interface AcademicTerm {
  id: string;
  tenant_id: string;
  academic_session_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

interface AcademicSession {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
  terms: AcademicTerm[];
}

interface RepositoryFolder {
  id: string;
  tenant_id: string;
  name: string;
  scope: string;
  scope_id: string | null;
  parent_folder_id: string | null;
  depth: number;
  status: "ACTIVE" | "INACTIVE";
  created_by: string;
  created_at: string;
  updated_at: string;
  children: RepositoryFolder[] | [];
  _count: {
    files: number;
  };
}

interface CreateRepositoryFileInput {
  scope: string;
  scope_id: NullableString;
  folder_id: string;
  name: string;
  file_url: string;
  file_key: string;
  description?: NullableString;
  tags?: string[];
  expires_at?: NullableString;
  change_note?: NullableString;
  linked_record_type?: NullableString;
  linked_record_id?: NullableString;
}

interface RepositoryFileRecord {
  id: string;
  scope: string;
  scope_id: NullableString;
  folder_id: string;
  name: string;
  description: NullableString;
  tags: string[];
  file_url: string;
  file_key: string;
  expires_at: NullableString;
  change_note: NullableString;
  linked_record_type: NullableString;
  linked_record_id: NullableString;
}

interface Folder {
  id: string;
  tenant_id: string;
  name: string;
  scope: string;
  scope_id: string | null;
  parent_folder_id: string | null;
  depth: number;
  status: "ACTIVE" | "INACTIVE";
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UploadedBySlice {
  profile_img: string;
  first_name: string;
  last_name: string;
  uuid: string;
}

interface FileVersion {
  id: string;
  tenant_id: string;
  file_id: string;
  version_number: number;
  file_key: string;
  file_url: string;
  mime_type: string;
  file_size_bytes: string;
  uploaded_by: UploadedBySlice;
  change_note: string;
  created_at: string;
  updated_at: string;
}

interface RepositoryFile {
  id: string;
  tenant_id: string;
  folder_id: string;
  scope_id: string | null;
  scope: string;
  name: string;
  description: string | null;
  tags: string[];
  current_version_id: string;
  total_versions: number;
  status: "ACTIVE" | "INACTIVE";
  is_global_search: boolean;
  expires_at: string | null;
  link_record_type: string | null;
  link_record_id: string | null;
  created_at: string;
  updated_at: string;
  versions: FileVersion[];
}

interface FolderContent {
  folder: Folder;
  sub_folders: Folder[];
  files: RepositoryFile[];
}

interface StorageUsage {
  plan: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  used_bytes: string;
  quota_bytes: string;
  used_gb: number;
  quota_gb: number;
  used_percent: number;
  is_warning: boolean;
  is_critical: boolean;
}

interface StorageBreakdown {
  scope: string;
  used_bytes: string;
  used_mb: number;
}
