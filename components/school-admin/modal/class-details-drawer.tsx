"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  XIcon,
  UsersIcon,
  ChalkboardTeacherIcon,
  GearIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddClassModal from "./add-class";
import { apiClient } from "@/lib/api";
import { ClassDetailsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ClassDetailsDrawerProps {
  classId: string | null;
  onClose: () => void;
}

const fetchClassDetails = async (
  classId: string,
): Promise<ClassDetailsResponse> => {
  const response = await apiClient.get(`/school-setup/classes/${classId}`);
  return response.data.data;
};

export default function ClassDetailsDrawer({
  classId,
  onClose,
  // classData,
}: ClassDetailsDrawerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: classData } = useQuery({
    queryKey: ["class-details", classId],
    queryFn: () => fetchClassDetails(classId!),
    enabled: !!classId,
  });

  if (!classId) return null;

  return (
    <>
      <Sheet open={!!classId} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
                    {classData?.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="font-semibold uppercase text-xs py-0.5"
                  >
                    {classData?.level}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-2">
                  Form Teacher:{" "}
                  <span className="text-foreground tracking-tight">
                    {classData?.class_teacher?.first_name}{" "}
                    {classData?.class_teacher?.last_name}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-9 px-4 hidden sm:flex"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Class
              </Button>
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
            <Tabs defaultValue="students" className="h-full flex flex-col">
              <div className="px-8 pt-4 border-b bg-background shrink-0">
                <TabsList
                  variant="line"
                  className="w-full justify-start gap-6 border-none pb-0 h-10!"
                >
                  <TabsTrigger
                    value="students"
                    className="px-1 font-semibold text-sm pb-3 h-auto data-active:text-primary data-active:after:bg-primary"
                  >
                    <UsersIcon className="mr-2 size-4" />
                    Students ({classData?.student_count})
                  </TabsTrigger>
                  <TabsTrigger
                    value="subjects"
                    className="px-1 font-semibold text-sm pb-3 h-auto data-active:text-primary data-active:after:bg-primary"
                  >
                    <ChalkboardTeacherIcon className="mr-2 size-4" />
                    Subjects ({classData?.subject_count})
                  </TabsTrigger>
                  <TabsTrigger
                    value="teachers"
                    className="px-1 font-semibold text-sm pb-3 h-auto data-active:text-primary data-active:after:bg-primary"
                  >
                    Teachers
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="px-1 font-semibold text-sm pb-3 h-auto data-active:text-primary data-active:after:bg-primary"
                  >
                    <GearIcon className="mr-2 size-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto bg-muted/10 p-8 custom-scrollbar relative">
                <TabsContent
                  value="students"
                  className="h-full mt-0 focus-visible:outline-none"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-lg font-bold">Enrolled Students</h3>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar bg-card rounded-xl border border-border/50 shadow-sm relative">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Matric No.</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead className="text-right">
                              Subjects
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classData?.students?.length ? (
                            classData.students.map((student) => (
                              <TableRow key={student.user_id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="size-8">
                                      <AvatarImage
                                        src={student.avatar || undefined}
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
                                        {student.email || "No email"}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-muted-foreground">
                                  {student.matric_number}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-xs font-normal"
                                  >
                                    {student.gender.toLowerCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {student.registered_subjects?.length || 0}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-32 text-center text-muted-foreground"
                              >
                                No students enrolled.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="subjects"
                  className="h-full mt-0 focus-visible:outline-none"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-lg font-bold">Assigned Subjects</h3>
                    </div>
                    <div className="flex-1 overflow-auto bg-card rounded-xl border border-border/50 shadow-sm relative">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classData?.class_subjects?.length ? (
                            classData.class_subjects.map((subject) => (
                              <TableRow key={subject.id}>
                                <TableCell>
                                  <p className="font-medium text-foreground">
                                    {subject.name}
                                  </p>
                                  {subject.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                      {subject.description}
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium text-muted-foreground">
                                  {subject.code}
                                </TableCell>
                                <TableCell>
                                  {subject.department ? (
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      {subject.department.name}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-xs font-normal"
                                  >
                                    {subject.subject_type.toLowerCase()}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-32 text-center text-muted-foreground"
                              >
                                No subjects assigned.
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
                      <h3 className="text-lg font-bold">Class Teachers</h3>
                    </div>
                    <div className="flex-1">
                      {classData?.class_teacher ? (
                        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-8 flex flex-col sm:flex-row items-center gap-8 max-w-2xl">
                          <Avatar className="size-24">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${classData.class_teacher.first_name}`}
                            />
                            <AvatarFallback className="text-3xl font-semibold">
                              {classData.class_teacher.first_name[0]}
                              {classData.class_teacher.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center sm:text-left">
                            <h4 className="text-xl font-bold text-foreground">
                              {classData.class_teacher.first_name}{" "}
                              {classData.class_teacher.last_name}
                            </h4>
                            <p className="text-primary font-medium mb-4">
                              Form Teacher
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground w-12">
                                  Email:
                                </span>
                                {/* <span className="text-muted-foreground">{classData.class_teacher.email}</span> */}
                                <span className="text-muted-foreground">
                                  classteacher@eduvia.com
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground w-12">
                                  Phone:
                                </span>
                                {/* <span className="text-muted-foreground">{classData.class_teacher.phone_number || "N/A"}</span> */}
                                <span className="text-muted-foreground">
                                  09090909090
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card rounded-xl border border-border/50 shadow-sm flex items-center justify-center p-8 text-center flex-col h-64">
                          <ChalkboardTeacherIcon className="size-12 text-muted-foreground/30 mb-3" />
                          <p className="text-muted-foreground font-medium">
                            No form teacher assigned yet.
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            Assign Teacher
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="settings"
                  className="h-full mt-0 focus-visible:outline-none"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-lg font-bold">
                        Class Settings & Preferences
                      </h3>
                    </div>
                    <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm p-8 max-w-2xl">
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8 pb-8 border-b border-border/10">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Class Level
                            </p>
                            <p className="text-xl font-bold bg-muted/50 w-fit px-4 py-1.5 rounded-md">
                              {classData?.level || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Student Capacity
                            </p>
                            <p className="text-xl font-bold bg-muted/50 w-fit px-4 py-1.5 rounded-md">
                              {classData?.capacity || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Department
                            </p>
                            <p className="text-xl font-bold">
                              {classData?.department ? (
                                <Badge
                                  variant="outline"
                                  className="text-sm font-medium py-1"
                                >
                                  {classData.department.name}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm font-normal">
                                  No Department
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Total Enrolled
                            </p>
                            <p className="text-xl font-bold">
                              {classData?.student_count || 0}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 flex">
                          <Button
                            variant="primary-outline"
                            className="h-12"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            <GearIcon className="mr-2 size-4" />
                            Edit Class Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {classData && (
        <AddClassModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editingClass={{
            id: classData.id,
            name: classData.name,
            level: classData.level,
            capacity: classData.capacity.toString(),
            departmentId: classData.department?.id || "",
            classTeacherId: classData.class_teacher?.id || "",
          }}
        />
      )}
    </>
  );
}
