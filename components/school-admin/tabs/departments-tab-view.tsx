"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BuildingIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import AddDepartmentModal from "../modal/add-department";

export default function DepartmentsTabView() {
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

  return (
    <div className="pt-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-9 h-10 w-full"
          />
        </div>

        <Button
          variant="primary"
          className="h-10 gap-2"
          onClick={() => setIsAddDeptOpen(true)}
        >
          <PlusIcon className="size-4" />
          Add Department
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 bg-card rounded-xl border border-border text-center p-8 shadow-sm">
        <BuildingIcon className="size-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-bold mb-2">Departments Hub</h3>
        <p className="text-muted-foreground font-medium max-w-sm">
          Manage educational departments, heads of department, and structural
          hierarchy.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setIsAddDeptOpen(true)}
        >
          Create First Department
        </Button>
      </div>

      <AddDepartmentModal
        open={isAddDeptOpen}
        onClose={() => setIsAddDeptOpen(false)}
      />
    </div>
  );
}
