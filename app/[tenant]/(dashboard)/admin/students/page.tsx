"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AddStudent from "@/components/school-admin/modal/add-student";
import StudentsTable from "@/components/school-admin/table/students-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClasses } from "@/hooks/use-classes";
import { apiClient } from "@/lib/api";
import { genderOptions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SelectOption, Student, StudentsResponse } from "@/types";
import {
  DotsThreeIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashSimpleIcon,
  XIcon,
  PencilLineIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function getStudentColumns(
  onRequestDelete: (student: Student) => void,
  onRequestSuspendReactivate: (student: Student) => void,
): ColumnDef<Student>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 pl-4">
          <Avatar>
            <AvatarImage src={row.original.avatar ?? ""} />
            <AvatarFallback>
              {row.original.first_name.charAt(0).toUpperCase()}
              {row.original.last_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>
            {row.original.first_name} {row.original.last_name}
          </span>
        </div>
      ),
    },

    {
      accessorKey: "identifier",
      header: "Matric Number",
    },

    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <div>
          {row.original.gender?.charAt(0).toUpperCase() +
            row.original.gender?.slice(1).toLowerCase()}
        </div>
      ),
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => <div>{row.original.student_profile.class.name}</div>,
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => <div>{row.original.student_profile.class.level}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const styles = {
          ACTIVE:
            "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
          SUSPENDED:
            "bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
          PENDING:
            "bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5",
        }[row.original.status];

        return (
          <div>
            <Badge
              className={
                (cn(
                  "border-none focus-visible:outline-none text-xs py-0.5 px-1.5",
                ),
                styles)
              }
            >
              {row.original.status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors scale-95 duration-100 active:opacity-80 active:translate-y-0"
                >
                  <DotsThreeIcon weight="bold" className="size-4 " />
                </Button>
              }
            />
            <DropdownMenuContent className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 duration-400 w-48">
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem>
                  <PencilLineIcon className="size-4 " />
                  <span>Edit Student</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRequestSuspendReactivate(row.original)}
                >
                  <ProhibitIcon className="size-4 " />
                  <span>
                    {row.original.status === "ACTIVE"
                      ? "Suspend Student"
                      : "Reactivate Student"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRequestDelete(row.original)}
                >
                  <TrashSimpleIcon className="size-4 " />
                  <span>Delete Student</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}

const deleteStudent = async (studentId: string) => {
  const response = await apiClient.delete(`/users/${studentId}`);
  return response.data;
};

const updateStudentStatus = async ({
  studentId,
  type,
}: {
  studentId: string;
  type: "suspend" | "reactivate";
}) => {
  const response = await apiClient.patch(`/users/${studentId}/${type}`);
  return response.data;
};

const fetchStudents = async (params: {
  page: number;
  limit: number;
  gender?: string;
  class_id?: string;
  search?: string;
}): Promise<StudentsResponse> => {
  const response = await apiClient.get("/users?role=STUDENT", {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.gender && { gender: params.gender.toUpperCase() }),
      ...(params.class_id && { class_id: params.class_id }),
      ...(params.search && { search: params.search }),
    },
  });

  return response.data as StudentsResponse;
};

export default function Students() {
  const queryClient = useQueryClient();
  const { classes } = useClasses();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterGender, setFilterGender] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isAddStudentOpenModal, setIsAddStudentOpenModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToSuspendReactivate, setStudentToSuspendReactivate] =
    useState<Student | null>(null);

  const requestDeleteStudent = useCallback((student: Student) => {
    setStudentToDelete(student);
  }, []);

  const requestSuspendReactivateStudent = useCallback((student: Student) => {
    setStudentToSuspendReactivate(student);
  }, []);

  const columns = useMemo(
    () =>
      getStudentColumns(requestDeleteStudent, requestSuspendReactivateStudent),
    [requestDeleteStudent, requestSuspendReactivateStudent],
  );

  const { mutate: removeStudent, isPending: isDeletingStudent } = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      toast.success("Student deleted");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setStudentToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete student");
    },
  });

  const {
    mutate: toggleStudentStatus,
    isPending: isSuspendingReactivatingStudent,
  } = useMutation({
    mutationFn: updateStudentStatus,
    onSuccess: () => {
      toast.success("Student status updated");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setStudentToSuspendReactivate(null);
    },
    onError: () => {
      toast.error("Failed to suspend/reactivate student");
    },
  });

  const activeFilterCount = useMemo(
    () => [filterGender, filterClass].filter(Boolean).length,
    [filterGender, filterClass],
  );

  const clearFilters = () => {
    setFilterGender("");
    setFilterClass("");
    setFilterOpen(false);
    setPage(1);
  };

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: [
      "students",
      page,
      itemsPerPage,
      filterGender,
      filterClass,
      search,
    ],
    queryFn: () =>
      fetchStudents({
        page,
        limit: itemsPerPage,
        gender: filterGender,
        class_id: filterClass,
        search: search.trim() || undefined,
      }),
  });

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Students</h1>

        <Dialog
          open={isAddStudentOpenModal}
          onOpenChange={setIsAddStudentOpenModal}
        >
          <DialogTrigger
            render={
              <Button variant="primary" className="h-12 gap-2">
                <PlusIcon className="size-4" />
                Add Student
              </Button>
            }
          />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
            <AddStudent onClose={() => setIsAddStudentOpenModal(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Display Table with various filter by class, gender, level */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* Search Input */}
          <InputGroup className="max-w-sm h-12">
            <InputGroupInput
              id="inline-start-input"
              placeholder="Search for student by name, matric number, class, gender, level, etc."
              className="placeholder:text-muted-foreground placeholder:text-xs placeholder:text-truncate"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <InputGroupAddon align="inline-start">
              <MagnifyingGlassIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>

          {/* Filter by Class, Gender, Level */}
          <div className="flex items-center gap-2">
            {/* TODO: Move to a separate component */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl shrink-0 relative"
                  >
                    <FunnelSimpleIcon className="size-4!" />
                    Filter by
                    {activeFilterCount > 0 && (
                      <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-primary-blue text-[10px] text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                }
              />
              <PopoverContent align="end" className="w-80 space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Filters</p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs text-muted-foreground"
                      onClick={clearFilters}
                    >
                      <XIcon className="size-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Gender
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {genderOptions.map((gender) => (
                      <Button
                        key={gender.value}
                        variant={
                          filterGender === gender.value ? "primary" : "outline"
                        }
                        size="sm"
                        className={cn(
                          "h-7 text-xs capitalize",
                          filterGender === gender.value &&
                            "bg-primary-blue hover:bg-primary-blue/90 text-white",
                        )}
                        onClick={() => {
                          setFilterGender(
                            filterGender === gender.value ? "" : gender.value,
                          );
                          setPage(1);
                        }}
                      >
                        {gender.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Class
                  </label>
                  <Select
                    value={filterClass}
                    onValueChange={(value) => {
                      setFilterClass(value || "");
                      setPage(1);
                    }}
                    items={classes}
                  >
                    <SelectTrigger className=" w-full px-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        <SelectLabel>Class</SelectLabel>
                        {classes?.map((cls: SelectOption) => (
                          <SelectItem key={cls.value} value={cls.value}>
                            {cls.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <StudentsTable
          columns={columns}
          data={students?.data ?? []}
          isLoading={isStudentsLoading}
          itemsPerPage={itemsPerPage}
          meta={
            students?.meta ?? {
              total: 0,
              page: 1,
              limit: itemsPerPage,
              total_pages: 1,
              has_next_page: false,
              has_previous_page: false,
            }
          }
          onPageChange={setPage}
          onItemsPerPageChange={(next) => {
            setItemsPerPage(next);
            setPage(1);
          }}
        />
      </div>

      <AlertDialog
        open={studentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setStudentToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashSimpleIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {studentToDelete
                  ? `${studentToDelete.first_name} ${studentToDelete.last_name}`
                  : ""}
              </span>
              {studentToDelete?.student_profile.matric_number ? (
                <> ({studentToDelete.student_profile.matric_number})</>
              ) : null}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStudent}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingStudent}
              onClick={() => {
                if (studentToDelete) removeStudent(studentToDelete.id);
              }}
            >
              {isDeletingStudent ? (
                <>
                  <Spinner className="size-4" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={studentToSuspendReactivate !== null}
        onOpenChange={(open) => {
          if (!open) setStudentToSuspendReactivate(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia
              className={cn(
                "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
                studentToSuspendReactivate?.status === "ACTIVE"
                  ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
                  : "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
              )}
            >
              <ProhibitIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {studentToSuspendReactivate?.status === "ACTIVE"
                ? "Suspend"
                : "Reactivate"}{" "}
              student?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will{" "}
              {studentToSuspendReactivate?.status === "ACTIVE"
                ? "suspend"
                : "reactivate"}{" "}
              the student{" "}
              <span className="font-medium text-foreground">
                {studentToSuspendReactivate
                  ? `${studentToSuspendReactivate.first_name} ${studentToSuspendReactivate.last_name}`
                  : ""}
              </span>
              {studentToSuspendReactivate?.student_profile.matric_number ? (
                <>
                  {" "}
                  ({studentToSuspendReactivate.student_profile.matric_number})
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspendingReactivatingStudent}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant={
                studentToSuspendReactivate?.status === "ACTIVE"
                  ? "destructive"
                  : "primary"
              }
              disabled={isSuspendingReactivatingStudent}
              onClick={() => {
                if (studentToSuspendReactivate) {
                  toggleStudentStatus({
                    studentId: studentToSuspendReactivate.id,
                    type:
                      studentToSuspendReactivate.status === "ACTIVE"
                        ? "suspend"
                        : "reactivate",
                  });
                }
              }}
            >
              {isSuspendingReactivatingStudent ? (
                <>
                  <Spinner className="size-4" />
                  {studentToSuspendReactivate?.status === "ACTIVE"
                    ? "Suspending"
                    : "Reactivating"}
                  …
                </>
              ) : studentToSuspendReactivate?.status === "ACTIVE" ? (
                "Suspend"
              ) : (
                "Reactivate"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
