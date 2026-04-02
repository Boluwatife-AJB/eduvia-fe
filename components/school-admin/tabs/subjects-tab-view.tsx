"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DotsThreeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import AddSubjectSlider from "../modal/add-subject-slider";
import SubjectDetailsSheet from "../modal/subject-details-sheet";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Subject } from "@/types";

const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/school-setup/subjects");
  return response.data.data;
};

export default function SubjectsTabView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSliderOpen, setIsAddSliderOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return subjects ?? [];
    return (
      subjects?.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ?? []
    );
  }, [searchTerm, subjects]);

  return (
    <div className="pt-6 animate-in fade-in duration-300 flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-9 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          className="h-10 gap-2"
          onClick={() => setIsAddSliderOpen(true)}
        >
          <PlusIcon className="size-4" />
          Add Subject
        </Button>
      </div>

      <div className="border border-border/60 rounded-xl bg-card overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold px-6">Code</TableHead>
                <TableHead className="font-semibold">Subject Name</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold text-center">
                  Classes Assigned
                </TableHead>
                <TableHead className="font-semibold text-right px-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No subjects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    className="group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedSubjectId(subject.id)}
                  >
                    <TableCell className="font-medium px-6 text-foreground">
                      {subject.code}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subject.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-background text-xs font-medium"
                      >
                        {subject.department?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-md bg-muted text-foreground text-xs">
                        {subject.classes_assigned?.length ?? 0}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right px-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="transition-opacity data-open:opacity-100"
                            />
                          }
                        >
                          <DotsThreeIcon className="size-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>Edit Subject</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSelectedSubjectId(subject.id)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            Delete Subject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddSubjectSlider
        open={isAddSliderOpen}
        onClose={() => setIsAddSliderOpen(false)}
      />

      <SubjectDetailsSheet
        subjectId={selectedSubjectId}
        onClose={() => setSelectedSubjectId(null)}
      />
    </div>
  );
}
