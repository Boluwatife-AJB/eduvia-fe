"use client";

import AddDepartmentModal from "@/components/school-admin/modal/add-department";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { Department, SubjectSlice } from "@/types";
import {
  BuildingIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const fetchDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get("/school-setup/departments");
  return response.data.data;
};

function DepartmentCardSkeleton() {
  return (
    <Card className="p-5 border-border/50 bg-card/60 pointer-events-none">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-6 w-3/4 max-w-[200px] rounded-md bg-muted animate-pulse" />
          <div className="h-5 w-16 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-8 w-8 shrink-0 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/40 border border-border/50">
        <div className="size-9 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="flex justify-between border-t border-border/50 pt-4">
        <div className="space-y-2">
          <div className="h-5 w-8 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-14 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="size-6 rounded-full bg-muted animate-pulse border-2 border-background"
              />
            ))}
          </div>
          <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

export default function DepartmentsTabView() {
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const filteredDepartments = useMemo(() => {
    if (!departments?.length) return departments ?? [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false),
    );
  }, [departments, searchTerm]);

  const openCreate = () => {
    setDepartmentToEdit(null);
    setIsAddDeptOpen(true);
  };

  const openEdit = (dept: Department) => {
    setDepartmentToEdit(dept);
    setIsAddDeptOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddDeptOpen(false);
    setDepartmentToEdit(null);
  };

  const list = filteredDepartments ?? [];
  const hasAnyDepartments = (departments?.length ?? 0) > 0;
  const showEmptyHub =
    !isLoadingDepartments && !hasAnyDepartments && !searchTerm.trim();

  return (
    <div className="pt-6 animate-in fade-in duration-300 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-9 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          className="h-10 gap-2"
          onClick={() => openCreate()}
        >
          <PlusIcon className="size-4" />
          Add Department
        </Button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pb-6 pt-2 px-3">
        {showEmptyHub ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] bg-card rounded-xl border border-border text-center p-8 shadow-sm">
            <BuildingIcon className="size-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-assistant font-bold mb-2">
              Departments Hub
            </h3>
            <p className="text-muted-foreground font-medium max-w-sm">
              Manage educational departments, heads of department, and
              structural hierarchy.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => openCreate()}
            >
              Create First Department
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingDepartments
              ? Array.from({ length: 6 }).map((_, i) => (
                  <DepartmentCardSkeleton key={i} />
                ))
              : null}

            {!isLoadingDepartments && list.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No departments found matching &quot;{searchTerm}&quot;
              </div>
            ) : null}

            {!isLoadingDepartments &&
              list.map((dept: Department) => {
                const subjects = dept.subjects ?? [];
                const subjectCount = subjects.length;
                return (
                  <Card
                    key={dept.id}
                    className="group p-5 hover:border-primary/50 transition-all border-border/50 hover:shadow-md bg-card/60 hover:bg-card"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 pr-2">
                        <h2 className="text-xl font-assistant font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                          {dept.name}
                        </h2>
                        <Badge
                          variant="outline"
                          className="font-semibold uppercase text-xs bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800"
                        >
                          {subjectCount}{" "}
                          {subjectCount === 1 ? "subject" : "subjects"}
                        </Badge>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8"
                              />
                            }
                          >
                            <DotsThreeIcon className="size-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEdit(dept)}>
                              Edit Department
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                              Delete Department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {dept.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {dept.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/70 italic mb-4">
                        No description
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <Avatar className="size-9 bg-primary/10 text-primary border border-primary/20">
                        <AvatarFallback className="font-semibold text-xs">
                          {dept.hod ? "HOD" : "—"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Head of department
                        </span>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {dept.hod
                            ? `${dept.hod.first_name} ${dept.hod.last_name}`
                            : "Not assigned"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {subjectCount}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          Subjects
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex -space-x-2 mb-1">
                          {subjects.slice(0, 5).map((subject: SubjectSlice) => (
                            <Avatar
                              key={subject.id}
                              className="size-6 border-2 border-background bg-muted text-muted-foreground"
                              title={subject.name}
                            >
                              <AvatarFallback className="text-[9px] font-semibold">
                                {(subject.code || subject.name)
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {subjectCount > 5 && (
                            <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground z-10">
                              +{subjectCount - 5}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          Linked subjects
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      <AddDepartmentModal
        key={departmentToEdit?.id ?? "create"}
        open={isAddDeptOpen}
        onClose={handleCloseModal}
        editingDepartment={departmentToEdit ?? undefined}
      />
    </div>
  );
}
