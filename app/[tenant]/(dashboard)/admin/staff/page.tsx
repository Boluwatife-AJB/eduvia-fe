"use client";

import AddStaff from "@/components/school-admin/modal/add-staff";
import StaffTable from "@/components/school-admin/table/staff-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  nonTeachingStaffRoles,
  qualificationOptions,
  userStatusOptions,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Staff, StaffResponse } from "@/types";
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

function getStaffColumns(
  onRequestDelete: (staff: Staff) => void,
  onRequestSuspendReactivate: (staff: Staff) => void,
): ColumnDef<Staff>[] {
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
      accessorKey: "staff_role",
      header: "Staff Role",
      cell: ({ row }) => (
        <div className="capitalize">
          {nonTeachingStaffRoles.find(
            (option) =>
              option.value ===
              row.original.staff_profile?.staff_role?.toLowerCase(),
          )?.label ?? "—"}
        </div>
      ),
    },
    {
      id: "qualification_course_of_study",
      header: "Qualification",
      cell: ({ row }) => {
        const qualification = row.original.staff_profile?.qualification;
        return (
          <div>
            {qualification
              ? qualification
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : "—"}
            {row.original.staff_profile?.course_of_study
              ? `, ${row.original.staff_profile?.course_of_study}`
              : ""}
          </div>
        );
      },
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
        <div>{row.original.staff_profile?.year_of_graduation}</div>
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
              className={cn(
                "border-none focus-visible:outline-none text-xs py-0.5 px-1.5",
                styles,
              )}
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
                  <span>Edit Staff</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRequestSuspendReactivate(row.original)}
                >
                  <ProhibitIcon className="size-4 " />
                  <span>
                    {row.original.status === "ACTIVE"
                      ? "Suspend Staff"
                      : "Reactivate Staff"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRequestDelete(row.original)}
                >
                  <TrashSimpleIcon className="size-4 " />
                  <span>Delete Staff</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}

const fetchStaff = async (params: {
  page: number;
  limit: number;
  gender?: string;
  qualification?: string;
  classOfDegree?: string;
  yearOfGraduation?: string;
  courseOfStudy?: string;
  status?: string;
  search?: string;
  role?: string;
}): Promise<StaffResponse> => {
  const response = await apiClient.get("/users/staff", {
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
      ...(params.role && { role: params.role }),
    },
  });

  return response.data as StaffResponse;
};

const deleteStaff = async (staffId: string) => {
  const response = await apiClient.delete(`/users/${staffId}`);
  return response.data;
};

const updateStaffStatus = async ({
  staffId,
  type,
}: {
  staffId: string;
  type: "suspend" | "reactivate";
}) => {
  const response = await apiClient.patch(`/users/${staffId}/${type}`);
  return response.data;
};

export default function NonTeachingStaff() {
  const queryClient = useQueryClient();
  const [isAddStaffOpenModal, setIsAddStaffOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterQualification, setFilterQualification] = useState("");
  const [filterClassOfDegree, setFilterClassOfDegree] = useState("");
  const [filterYearOfGraduation, setFilterYearOfGraduation] = useState("");
  const [filterCourseOfStudy, setFilterCourseOfStudy] = useState("");
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [staffToSuspendReactivate, setStaffToSuspendReactivate] =
    useState<Staff | null>(null);

  const requestDeleteStaff = useCallback((staff: Staff) => {
    setStaffToDelete(staff);
  }, []);

  const requestSuspendReactivateStaff = useCallback((staff: Staff) => {
    setStaffToSuspendReactivate(staff);
  }, []);

  const columns = useMemo(
    () => getStaffColumns(requestDeleteStaff, requestSuspendReactivateStaff),
    [requestDeleteStaff, requestSuspendReactivateStaff],
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

  const clearFilters = () => {
    setFilterStatus("");
    setFilterQualification("");
    setFilterClassOfDegree("");
    setFilterYearOfGraduation("");
    setFilterCourseOfStudy("");
    setFilterOpen(false);
    setPage(1);
  };

  const { data: staff, isLoading: isStaffLoading } = useQuery({
    queryKey: [
      "staff",
      page,
      itemsPerPage,
      filterStatus,
      filterQualification,
      filterClassOfDegree,
      filterYearOfGraduation,
      filterCourseOfStudy,
      search,
    ],
    queryFn: () =>
      fetchStaff({
        page,
        limit: itemsPerPage,
        status: filterStatus,
        qualification: filterQualification,
        classOfDegree: filterClassOfDegree,
        yearOfGraduation: filterYearOfGraduation,
        courseOfStudy: filterCourseOfStudy,
        search: search.trim() || undefined,
      }),
  });

  const { mutate: removeStaff, isPending: isDeletingStaff } = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success("Staff member deleted");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setStaffToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete staff member");
    },
  });

  const {
    mutate: toggleStaffStatus,
    isPending: isSuspendingReactivatingStaff,
  } = useMutation({
    mutationFn: updateStaffStatus,
    onSuccess: () => {
      toast.success("Staff status updated");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setStaffToSuspendReactivate(null);
    },
    onError: () => {
      toast.error("Failed to suspend/reactivate staff member");
    },
  });

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">
          Non-Teaching Staff
        </h1>

        <Dialog
          open={isAddStaffOpenModal}
          onOpenChange={setIsAddStaffOpenModal}
        >
          <DialogTrigger
            render={
              <Button variant="primary" className="h-12 gap-2">
                <PlusIcon className="size-4" />
                Add Staff
              </Button>
            }
          />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
            <AddStaff onClose={() => setIsAddStaffOpenModal(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Display Table with various filter by role, qualification, class of degree, year of graduation, course of study, and status */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* Search Input */}
          <InputGroup className="max-w-sm h-12">
            <InputGroupInput
              id="inline-start-input"
              placeholder="Search by name, staff ID, qualification, status, etc."
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

        <StaffTable
          columns={columns}
          data={staff?.data ?? []}
          isLoading={isStaffLoading}
          itemsPerPage={itemsPerPage}
          meta={
            staff?.meta ?? {
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
        open={staffToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setStaffToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashSimpleIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {staffToDelete
                  ? `${staffToDelete.first_name} ${staffToDelete.last_name}`
                  : ""}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStaff}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingStaff}
              onClick={() => {
                if (staffToDelete) removeStaff(staffToDelete.id);
              }}
            >
              {isDeletingStaff ? (
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
        open={staffToSuspendReactivate !== null}
        onOpenChange={(open) => {
          if (!open) setStaffToSuspendReactivate(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <ProhibitIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {staffToSuspendReactivate?.status === "ACTIVE"
                ? "Suspend"
                : "Reactivate"}{" "}
              staff member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will{" "}
              {staffToSuspendReactivate?.status === "ACTIVE"
                ? "suspend"
                : "reactivate"}{" "}
              <span className="font-medium text-foreground">
                {staffToSuspendReactivate
                  ? `${staffToSuspendReactivate.first_name} ${staffToSuspendReactivate.last_name}`
                  : ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspendingReactivatingStaff}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isSuspendingReactivatingStaff}
              onClick={() => {
                if (staffToSuspendReactivate) {
                  toggleStaffStatus({
                    staffId: staffToSuspendReactivate.id,
                    type:
                      staffToSuspendReactivate.status === "ACTIVE"
                        ? "suspend"
                        : "reactivate",
                  });
                }
              }}
            >
              {isSuspendingReactivatingStaff ? (
                <>
                  <Spinner className="size-4" />
                  {staffToSuspendReactivate?.status === "ACTIVE"
                    ? "Suspending..."
                    : "Reactivating..."}
                </>
              ) : staffToSuspendReactivate?.status === "ACTIVE" ? (
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
