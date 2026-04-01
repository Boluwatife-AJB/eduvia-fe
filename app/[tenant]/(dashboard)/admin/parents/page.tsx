"use client";

import AddParent from "@/components/school-admin/modal/add-parent";
import ParentsTable from "@/components/school-admin/table/parents-table";
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
import { relationshipOptions, userStatusOptions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Parent, ParentsResponse } from "@/types";
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

function getParentColumns(
  onRequestDelete: (parent: Parent) => void,
  onRequestSuspendReactivate: (parent: Parent) => void,
): ColumnDef<Parent>[] {
  return [
    {
      id: "full_name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
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
      header: "Identifier",
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
      id: "relationship",
      header: "Relationship",
      cell: ({ row }) => (
        <div>
          {`${
            relationshipOptions.find(
              (option) => option.value === row.original.relationship,
            )?.label ?? "N/A"
          }`}
        </div>
      ),
    },
    {
      accessorKey: "occupation",
      header: "Occupation",
      cell: ({ row }) => <div>{row.original.guardian_profile?.occupation}</div>,
    },
    {
      accessorKey: "wards",
      header: "Ward(s)",
      cell: ({ row }) => (
        <div className="max-w-40 text-wrap max-h-10 truncate">
          {(row.original.guardian_profile?.wards ?? [])
            .map((ward) => `${ward.first_name} ${ward.last_name}`)
            .join(", ") || "—"}
        </div>
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
                  <span>Edit Parent</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRequestSuspendReactivate(row.original)}
                >
                  <ProhibitIcon className="size-4 " />
                  <span>
                    {row.original.status === "ACTIVE"
                      ? "Suspend Parent"
                      : "Reactivate Parent"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onRequestDelete(row.original)}
                >
                  <TrashSimpleIcon className="size-4 " />
                  <span>Delete Parent</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}

const fetchParents = async (params: {
  page: number;
  limit: number;
  relationship?: string;
  status?: string;
  search?: string;
}): Promise<ParentsResponse> => {
  const response = await apiClient.get("/users/parents", {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.relationship && { relationship: params.relationship }),
      ...(params.status && { status: params.status.toUpperCase() }),
      ...(params.search && { search: params.search }),
    },
  });

  return response.data as ParentsResponse;
};

const deleteParent = async (parentId: string) => {
  const response = await apiClient.delete(`/users/${parentId}`);
  return response.data;
};

const updateParentStatus = async ({
  parentId,
  type,
}: {
  parentId: string;
  type: "suspend" | "reactivate";
}) => {
  const response = await apiClient.patch(`/users/${parentId}/${type}`);
  return response.data;
};

export default function Parents() {
  const queryClient = useQueryClient();
  const [isAddParentOpenModal, setIsAddParentOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRelationship, setFilterRelationship] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [parentToSuspendReactivate, setParentToSuspendReactivate] =
    useState<Parent | null>(null);

  const requestDeleteParent = useCallback((parent: Parent) => {
    setParentToDelete(parent);
  }, []);

  const requestSuspendReactivateParent = useCallback((parent: Parent) => {
    setParentToSuspendReactivate(parent);
  }, []);

  const columns = useMemo(
    () => getParentColumns(requestDeleteParent, requestSuspendReactivateParent),
    [requestDeleteParent, requestSuspendReactivateParent],
  );

  const activeFilterCount = useMemo(
    () => [filterRelationship, filterStatus].filter(Boolean).length,
    [filterRelationship, filterStatus],
  );

  const clearFilters = () => {
    setFilterRelationship("");
    setFilterStatus("");
    setFilterOpen(false);
    setPage(1);
  };

  const { mutate: removeParent, isPending: isDeletingParent } = useMutation({
    mutationFn: deleteParent,
    onSuccess: () => {
      toast.success("Parent deleted");
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      setParentToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete parent");
    },
  });

  const {
    mutate: toggleParentStatus,
    isPending: isSuspendingReactivatingParent,
  } = useMutation({
    mutationFn: updateParentStatus,
    onSuccess: () => {
      toast.success("Parent status updated");
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      setParentToSuspendReactivate(null);
    },
    onError: () => {
      toast.error("Failed to suspend/reactivate parent");
    },
  });

  const { data: parents, isLoading: isParentsLoading } = useQuery({
    queryKey: [
      "parents",
      page,
      itemsPerPage,
      filterRelationship,
      filterStatus,
      search,
    ],
    queryFn: () =>
      fetchParents({
        page,
        limit: itemsPerPage,
        relationship: filterRelationship || undefined,
        status: filterStatus || undefined,
        search: search.trim() || undefined,
      }),
  });

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Parents</h1>

        <Dialog
          open={isAddParentOpenModal}
          onOpenChange={setIsAddParentOpenModal}
        >
          <DialogTrigger
            render={
              <Button variant="primary" className="h-12 gap-2">
                <PlusIcon className="size-4" />
                Add Parent
              </Button>
            }
          />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
            <AddParent onClose={() => setIsAddParentOpenModal(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* Search Input */}
          <InputGroup className="max-w-sm h-12">
            <InputGroupInput
              id="inline-start-input"
              placeholder="Search by name, identifier, relationship, status, etc."
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

          {/* Filter by Relationship and Status */}
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
                    Relationship
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {relationshipOptions.map((relationship) => (
                      <Button
                        key={relationship.value}
                        variant={
                          filterRelationship === relationship.value
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        className={cn(
                          "h-7 text-xs",
                          filterRelationship === relationship.value &&
                            "bg-primary-blue hover:bg-primary-blue/90 text-white",
                        )}
                        onClick={() => {
                          setFilterRelationship(
                            filterRelationship === relationship.value
                              ? ""
                              : relationship.value,
                          );
                          setPage(1);
                        }}
                      >
                        {relationship.label}
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

        <ParentsTable
          columns={columns}
          data={parents?.data ?? []}
          isLoading={isParentsLoading}
          itemsPerPage={itemsPerPage}
          meta={
            parents?.meta ?? {
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
        open={parentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setParentToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashSimpleIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete parent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {parentToDelete
                  ? `${parentToDelete.first_name} ${parentToDelete.last_name}`
                  : ""}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingParent}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingParent}
              onClick={() => {
                if (parentToDelete) removeParent(parentToDelete.id);
              }}
            >
              {isDeletingParent ? (
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
        open={parentToSuspendReactivate !== null}
        onOpenChange={(open) => {
          if (!open) setParentToSuspendReactivate(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <ProhibitIcon weight="bold" className="size-4 " />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {parentToSuspendReactivate?.status === "ACTIVE"
                ? "Suspend"
                : "Reactivate"}{" "}
              parent?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will{" "}
              {parentToSuspendReactivate?.status === "ACTIVE"
                ? "suspend"
                : "reactivate"}{" "}
              <span className="font-medium text-foreground">
                {parentToSuspendReactivate
                  ? `${parentToSuspendReactivate.first_name} ${parentToSuspendReactivate.last_name}`
                  : ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspendingReactivatingParent}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isSuspendingReactivatingParent}
              onClick={() => {
                if (parentToSuspendReactivate) {
                  toggleParentStatus({
                    parentId: parentToSuspendReactivate.id,
                    type:
                      parentToSuspendReactivate.status === "ACTIVE"
                        ? "suspend"
                        : "reactivate",
                  });
                }
              }}
            >
              {isSuspendingReactivatingParent ? (
                <>
                  <Spinner className="size-4" />
                  {parentToSuspendReactivate?.status === "ACTIVE"
                    ? "Suspending..."
                    : "Reactivating..."}
                </>
              ) : parentToSuspendReactivate?.status === "ACTIVE" ? (
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
