"use client";
import AddTeacher from "@/components/school-admin/modal/add-teacher";
import TeachersTable from "@/components/school-admin/table/teachers-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api";
import {
  classOfDegreeOptions,
  qualificationOptions,
  userStatusOptions,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Teacher, TeachersResponse } from "@/types";
import {
  CaretDownIcon,
  CaretUpIcon,
  DotsThreeIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilLineIcon,
  PlusIcon,
  ProhibitIcon,
  TrashSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

function getTeacherColumns(
  onRequestDelete: (teacher: Teacher) => void,
  onRequestSuspendReactivate: (teacher: Teacher) => void,
): ColumnDef<Teacher>[] {
  return [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          {column.getIsSorted() === "asc" ? (
            <CaretUpIcon className="ml-1 size-3.5" />
          ) : (
            <CaretDownIcon className="ml-1 size-3.5" />
          )}
        </Button>
      ),
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
      header: "Staff ID",
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
      id: "qualification_course_of_study",
      header: "Qualification",
      cell: ({ row }) => (
        <div>
          {`${
            qualificationOptions.find(
              (option) =>
                option.value === row.original.teacher_profile.qualification,
            )?.label ?? "N/A"
          }${
            row.original.teacher_profile.course_of_study
              ? `, ${row.original.teacher_profile.course_of_study}`
              : ""
          }`}
        </div>
      ),
    },
    {
      accessorKey: "class_of_degree",
      header: "Class of Degree",
      cell: ({ row }) => (
        <div>
          {
            classOfDegreeOptions.find(
              (option) =>
                option.value === row.original.teacher_profile.class_of_degree,
            )?.label
          }
        </div>
      ),
    },
    {
      accessorKey: "graduation_year",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Graduation Year
          {column.getIsSorted() === "asc" ? (
            <CaretUpIcon className="ml-1 size-3.5" />
          ) : (
            <CaretDownIcon className="ml-1 size-3.5" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div>{row.original.teacher_profile.graduation_year}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const styles = {
          ACTIVE:
            "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
          INACTIVE:
            "bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
          SUSPENDED:
            "bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5",
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
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
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
                  <span>Edit Teacher</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRequestSuspendReactivate(row.original)}
                >
                  <ProhibitIcon className="size-4 " />
                  <span>
                    {row.original.status === "ACTIVE"
                      ? "Suspend Teacher"
                      : "Reactivate Teacher"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRequestDelete(row.original)}
                >
                  <TrashSimpleIcon className="size-4 " />
                  <span>Delete Teacher</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}

const fetchTeachers = async (params: {
  page: number;
  limit: number;
  gender?: string;
  qualification?: string;
  classOfDegree?: string;
  yearOfGraduation?: string;
  courseOfStudy?: string;
  status?: string;
  search?: string;
}): Promise<TeachersResponse> => {
  const response = await apiClient.get("/users/teachers", {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.gender && { gender: params.gender.toUpperCase() }),
      ...(params.status && { status: params.status.toUpperCase() }),
      ...(params.search && { search: params.search }),
      ...(params.qualification && { qualification: params.qualification }),
      ...(params.classOfDegree && { class_of_degree: params.classOfDegree }),
      ...(params.yearOfGraduation && {
        year_of_graduation: params.yearOfGraduation,
      }),
      ...(params.courseOfStudy && { course_of_study: params.courseOfStudy }),
    },
  });

  return response.data as TeachersResponse;
};

const deleteTeacher = async (teacherId: string) => {
  const response = await apiClient.delete(`/users/${teacherId}`);
  return response.data;
};

const updateTeacherStatus = async ({
  teacherId,
  type,
}: {
  teacherId: string;
  type: "suspend" | "reactivate";
}) => {
  const response = await apiClient.patch(`/users/${teacherId}/${type}`);
  return response.data;
};

export default function Teachers() {
  const queryClient = useQueryClient();
  const [isAddTeacherOpenModal, setIsAddTeacherOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterQualification, setFilterQualification] = useState("");
  const [filterClassOfDegree, setFilterClassOfDegree] = useState("");
  const [filterYearOfGraduation, setFilterYearOfGraduation] = useState("");
  const [filterCourseOfStudy, setFilterCourseOfStudy] = useState("");
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [teacherToSuspendReactivate, setTeacherToSuspendReactivate] =
    useState<Teacher | null>(null);

  const requestDeleteTeacher = useCallback((teacher: Teacher) => {
    setTeacherToDelete(teacher);
  }, []);

  const requestSuspendReactivateTeacher = useCallback((teacher: Teacher) => {
    setTeacherToSuspendReactivate(teacher);
  }, []);

  const columns = useMemo(
    () =>
      getTeacherColumns(requestDeleteTeacher, requestSuspendReactivateTeacher),
    [requestDeleteTeacher, requestSuspendReactivateTeacher],
  );

  const activeFilterCount = useMemo(
    () =>
      [
        filterStatus,
        filterQualification,
        filterClassOfDegree,
        filterYearOfGraduation,
        filterCourseOfStudy,
      ].filter(Boolean).length,
    [
      filterStatus,
      filterQualification,
      filterClassOfDegree,
      filterYearOfGraduation,
      filterCourseOfStudy,
    ],
  );

  const { mutate: removeTeacher, isPending: isDeletingTeacher } = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      toast.success("Teacher deleted");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setTeacherToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete teacher");
    },
  });

  const {
    mutate: toggleTeacherStatus,
    isPending: isSuspendingReactivatingTeacher,
  } = useMutation({
    mutationFn: updateTeacherStatus,
    onSuccess: () => {
      toast.success("Teacher status updated");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setTeacherToSuspendReactivate(null);
    },
    onError: () => {
      toast.error("Failed to suspend/reactivate teacher");
    },
  });

  const clearFilters = () => {
    setFilterStatus("");
    setFilterQualification("");
    setFilterClassOfDegree("");
    setFilterYearOfGraduation("");
    setFilterCourseOfStudy("");
    setFilterOpen(false);
    setPage(1);
  };

  const { data: teachers, isLoading: isTeachersLoading } = useQuery({
    queryKey: [
      "teachers",
      page,
      itemsPerPage,
      filterQualification,
      filterClassOfDegree,
      filterYearOfGraduation,
      filterCourseOfStudy,
      filterStatus,
      search,
    ],
    queryFn: () =>
      fetchTeachers({
        page,
        limit: itemsPerPage,
        qualification: filterQualification,
        classOfDegree: filterClassOfDegree,
        yearOfGraduation: filterYearOfGraduation,
        courseOfStudy: filterCourseOfStudy,
        status: filterStatus,
        search: search.trim() || undefined,
      }),
  });

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Teachers</h1>

        <Dialog
          open={isAddTeacherOpenModal}
          onOpenChange={setIsAddTeacherOpenModal}
        >
          <DialogTrigger
            render={
              <Button variant="primary" className="h-12 gap-2">
                <PlusIcon className="size-4" />
                Add Teacher
              </Button>
            }
          />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
            <AddTeacher onClose={() => setIsAddTeacherOpenModal(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Display Table with various filter by qualification, class of degree, year of graduation, course of study, and status */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* Search Input */}
          <InputGroup className="max-w-sm h-12">
            <InputGroupInput
              id="inline-start-input"
              placeholder="Search for teacher by name, matric number, qualification, class of degree, year of graduation, course of study, gender, status, etc."
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

          {/* Filter by Qualification, Class of Degree, Year of Graduation, Course of Study, and Status */}
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
                    Qualification
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {qualificationOptions.map((qualification) => (
                      <Button
                        key={qualification.value}
                        variant={
                          filterQualification === qualification.value
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        className={cn(
                          "h-7 text-xs",
                          filterQualification === qualification.value &&
                            "bg-primary-blue hover:bg-primary-blue/90 text-white",
                        )}
                        onClick={() => {
                          setFilterQualification(
                            filterQualification === qualification.value
                              ? ""
                              : qualification.value,
                          );
                          setPage(1);
                        }}
                      >
                        {qualification.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Class of Degree
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {classOfDegreeOptions.map((degreeClass) => (
                      <Button
                        key={degreeClass.value}
                        variant={
                          filterClassOfDegree === degreeClass.value
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        className={cn(
                          "h-7 text-xs",
                          filterClassOfDegree === degreeClass.value &&
                            "bg-primary-blue hover:bg-primary-blue/90 text-white",
                        )}
                        onClick={() => {
                          setFilterClassOfDegree(
                            filterClassOfDegree === degreeClass.value
                              ? ""
                              : degreeClass.value,
                          );
                          setPage(1);
                        }}
                      >
                        {degreeClass.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {userStatusOptions.map((status) => (
                      <Button
                        key={status}
                        variant={
                          filterStatus === status ? "primary" : "outline"
                        }
                        size="sm"
                        className={cn(
                          "h-7 text-xs",
                          filterStatus === status &&
                            "bg-primary-blue hover:bg-primary-blue/90 text-white",
                        )}
                        onClick={() => {
                          setFilterStatus(
                            filterStatus === status ? "" : status,
                          );
                          setPage(1);
                        }}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TeachersTable
          columns={columns}
          data={teachers?.data ?? []}
          isLoading={isTeachersLoading}
          itemsPerPage={itemsPerPage}
          meta={
            teachers?.meta ?? {
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
        open={teacherToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTeacherToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashSimpleIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {teacherToDelete
                  ? `${teacherToDelete.first_name} ${teacherToDelete.last_name}`
                  : ""}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTeacher}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingTeacher}
              onClick={() => {
                if (teacherToDelete) removeTeacher(teacherToDelete.id);
              }}
            >
              {isDeletingTeacher ? (
                <>
                  <Spinner className="size-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={teacherToSuspendReactivate !== null}
        onOpenChange={(open) => {
          if (!open) setTeacherToSuspendReactivate(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <ProhibitIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {teacherToSuspendReactivate?.status === "ACTIVE"
                ? "Suspend"
                : "Reactivate"}{" "}
              teacher?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will{" "}
              {teacherToSuspendReactivate?.status === "ACTIVE"
                ? "suspend"
                : "reactivate"}{" "}
              <span className="font-medium text-foreground">
                {teacherToSuspendReactivate
                  ? `${teacherToSuspendReactivate.first_name} ${teacherToSuspendReactivate.last_name}`
                  : ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspendingReactivatingTeacher}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isSuspendingReactivatingTeacher}
              onClick={() => {
                if (teacherToSuspendReactivate) {
                  toggleTeacherStatus({
                    teacherId: teacherToSuspendReactivate.id,
                    type:
                      teacherToSuspendReactivate.status === "ACTIVE"
                        ? "suspend"
                        : "reactivate",
                  });
                }
              }}
            >
              {isSuspendingReactivatingTeacher ? (
                <>
                  <Spinner className="size-4" />
                  {teacherToSuspendReactivate?.status === "ACTIVE"
                    ? "Suspending..."
                    : "Reactivating..."}
                </>
              ) : teacherToSuspendReactivate?.status === "ACTIVE" ? (
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
