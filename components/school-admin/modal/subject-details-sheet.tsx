"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CaretLeftIcon,
  XIcon,
  UsersIcon,
  ChalkboardTeacherIcon,
  BuildingsIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api";
import { SubjectDetailsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import AssignSubjectClassForm from "./assign-subject-class-form";
import AssignTeacherSubjectForm from "./assign-teacher-subject-form";

interface SubjectDetailsSheetProps {
  subjectId: string | null;
  onClose: () => void;
}

const fetchSubjectDetails = async (
  subjectId: string,
): Promise<SubjectDetailsResponse> => {
  const response = await apiClient.get(`/school-setup/subjects/${subjectId}`);
  return response.data.data;
};

export default function SubjectDetailsSheet({
  subjectId,
  onClose,
}: SubjectDetailsSheetProps) {
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ["subject-details", subjectId],
    queryFn: () => fetchSubjectDetails(subjectId!),
    enabled: !!subjectId,
  });

  if (!subjectId) return null;

  return (
    <Sheet open={!!subjectId} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-full max-h-screen w-full max-w-4xl flex flex-col gap-0 rounded-none border-l bg-background p-0 shadow-2xl sm:min-w-4xl"
      >
        {/* Header Area */}
        <div className="px-8 py-6 border-b bg-card/50 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-muted/50 hover:bg-muted size-10 flex items-center justify-center shrink-0"
            >
              <CaretLeftIcon className="size-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-assistant font-bold text-foreground leading-none">
                  {isLoading ? "Loading..." : subjectData?.name}
                </h2>
                {subjectData?.code && (
                  <Badge
                    variant="outline"
                    className="font-semibold uppercase text-xs py-0.5"
                  >
                    {subjectData.code}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-2">
                Department:{" "}
                <span className="text-foreground tracking-tight">
                  {subjectData?.department?.name || "-"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted size-10"
            >
              <XIcon className="size-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Content Area with Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="classes" className="h-full flex flex-col">
            <div className="px-8 pt-4 border-b bg-background shrink-0">
              <TabsList
                variant="line"
                className="w-full justify-start gap-6 border-none pb-0 h-10!"
              >
                <TabsTrigger
                  value="classes"
                  className="px-1 font-semibold text-sm pb-3 h-auto data-[state=active]:text-primary data-[state=active]:after:bg-primary"
                >
                  <BuildingsIcon className="mr-2 size-4" />
                  Assigned Classes ({subjectData?.classes_count || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="teachers"
                  className="px-1 font-semibold text-sm pb-3 h-auto data-[state=active]:text-primary data-[state=active]:after:bg-primary"
                >
                  <ChalkboardTeacherIcon className="mr-2 size-4" />
                  Assigned Teachers ({subjectData?.teachers_count || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="px-1 font-semibold text-sm pb-3 h-auto data-[state=active]:text-primary data-[state=active]:after:bg-primary"
                >
                  <UsersIcon className="mr-2 size-4" />
                  Students ({subjectData?.student_count || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-muted/10 p-8 custom-scrollbar relative">
              <TabsContent
                value="classes"
                className="h-full mt-0 focus-visible:outline-none"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-bold">Assigned Classes</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsClassFormOpen(true)}
                    >
                      <PlusIcon className="mr-2 size-4" />
                      Assign to Class
                    </Button>
                  </div>
                  {isClassFormOpen && (
                    <AssignSubjectClassForm
                      subjectId={subjectId}
                      onClose={() => setIsClassFormOpen(false)}
                      subjectName={subjectData?.name || ""}
                    />
                  )}
                  <div className="flex-1 overflow-auto bg-card rounded-xl border border-border/50 shadow-sm relative mt-2">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead className="text-right">Students</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectData?.classes_assigned?.length ? (
                          subjectData.classes_assigned.map((cls) => (
                            <TableRow key={cls.class_id}>
                              <TableCell className="font-semibold text-foreground">
                                {cls.name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs uppercase"
                                >
                                  {cls.level}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {/* {cls.student_count || 0} */}0
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-32 text-center text-muted-foreground"
                            >
                              Not assigned to any class yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="teachers"
                className="h-full mt-0 focus-visible:outline-none"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-bold">Assigned Teachers</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTeacherFormOpen(true)}
                    >
                      <PlusIcon className="mr-2 size-4" />
                      Assign Teachers
                    </Button>
                  </div>
                  {isTeacherFormOpen && (
                    <AssignTeacherSubjectForm
                      subjectId={subjectId}
                      onClose={() => setIsTeacherFormOpen(false)}
                      subjectName={subjectData?.name || ""}
                    />
                  )}
                  <div className="flex-1 overflow-auto bg-card rounded-xl border border-border/50 shadow-sm relative mt-2">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectData?.teachers_assigned?.length ? (
                          subjectData.teachers_assigned.map((teacher) => (
                            <TableRow key={teacher.user_id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8">
                                    <AvatarImage
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.first_name}`}
                                    />
                                    <AvatarFallback className="font-semibold text-xs">
                                      {teacher.first_name[0]}
                                      {teacher.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {teacher.first_name} {teacher.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      subjectteacher@eduvia.com
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                09090909090
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="h-32 text-center text-muted-foreground"
                            >
                              No teachers assigned yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="students"
                className="h-full mt-0 focus-visible:outline-none"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-bold">
                      Students Offering Subject
                    </h3>
                  </div>
                  <div className="flex-1 overflow-auto bg-card rounded-xl border border-border/50 shadow-sm relative">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Matric No.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectData?.student_offering?.length ? (
                          subjectData.student_offering.map((student) => (
                            <TableRow key={student.user_id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8">
                                    <AvatarImage
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.first_name}`}
                                    />
                                    <AvatarFallback className="font-semibold text-xs">
                                      {student.first_name[0]}
                                      {student.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {student.first_name} {student.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      student@eduvia.com
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-muted-foreground">
                                {student.matric_number}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="h-32 text-center text-muted-foreground"
                            >
                              No students found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
