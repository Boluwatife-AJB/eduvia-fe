"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import AddTeacher from "@/components/school-admin/modal/add-teacher";
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
import { genderOptions, userStatusOptions } from "@/lib/data";
import { cn } from "@/lib/utils";

// const fetchStudents = async (params: {
//   page: number;
//   limit: number;
//   gender?: string;
//   class_id?: string;
//   status?: string;
//   search?: string;
// }): Promise<StudentsResponse> => {
//   const response = await apiClient.get("/users?role=STUDENT", {
//     params: {
//       page: params.page,
//       limit: params.limit,
//       ...(params.gender && { gender: params.gender.toUpperCase() }),
//       ...(params.class_id && { class_id: params.class_id }),
//       ...(params.status && { status: params.status.toUpperCase() }),
//       ...(params.search && { search: params.search }),
//     },
//   });

//   return response.data as StudentsResponse;
// };

export default function Teachers() {
  const [isAddTeacherOpenModal, setIsAddTeacherOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const clearFilters = () => {
    setFilterGender("");
    setFilterStatus("");
    setPage(1);
  };

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

        {/* <StudentsTable
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
        /> */}
      </div>
    </div>
  );
}
