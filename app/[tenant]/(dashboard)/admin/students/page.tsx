"use client";

import AddStudent from "@/components/school-admin/modal/add-student";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DownloadIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { PopoverContent } from "@/components/ui/popover";
import { XIcon } from "@phosphor-icons/react";
import { useClasses } from "@/hooks/use-classes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectOption } from "@/types";
import { genderOptions } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const fetchStudents = async (params: {
  page: number;
  limit: number;
  gender?: string;
  class_id?: string;
  search?: string;
}) => {
  const response = await apiClient.get("/users?role=STUDENT", {
    params: {
      page: 1,
      limit: 20,
      // ...(params.gender && { gender: params.gender.toUpperCase() }),
      ...(params.class_id && { class_id: params.class_id }),
      ...(params.search && { search: params.search }),
    },
  });
  return response.data;
};

export default function Students() {
  const { classes } = useClasses();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterGender, setFilterGender] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [search, setSearch] = useState("");

  const clearFilters = () => {
    setFilterGender("");
    setFilterClass("");
    setActiveFilterCount(0);
    setFilterOpen(false);
  };

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students", filterGender, filterClass, search],
    queryFn: () =>
      fetchStudents({
        page: 1,
        limit: 20,
        gender: filterGender,
        class_id: filterClass,
        search: search,
      }),
  });

  console.log(students);

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Students</h1>

        <Dialog>
          <DialogTrigger
            render={
              <Button variant="primary" className="h-12 gap-2">
                <PlusIcon className="size-4" />
                Add Student
              </Button>
            }
          />
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
            <AddStudent />
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                    onValueChange={(value) => setFilterClass(value || "")}
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
      </div>
    </div>
  );
}
