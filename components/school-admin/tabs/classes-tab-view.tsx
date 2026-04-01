"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import ClassDetailsDrawer from "@/components/school-admin/modal/class-details-drawer";
import AddClassModal from "@/components/school-admin/modal/add-class";

// Mock Data
export const mockClasses = [
  {
    id: "1",
    name: "JSS 1A",
    level: "JSS",
    studentCount: 45,
    subjectCount: 12,
    formTeacher: { name: "Sarah Johnson", initials: "SJ", avatar: "" },
    students: [
      { id: "s1", initials: "JD" },
      { id: "s2", initials: "MK" },
      { id: "s3", initials: "AO" },
      { id: "s4", initials: "EB" },
      { id: "s5", initials: "FO" },
      { id: "s6", initials: "OO" },
    ],
  },
  {
    id: "2",
    name: "SSS 3 Science",
    level: "SSS",
    studentCount: 38,
    subjectCount: 9,
    formTeacher: { name: "Dr. Albert Ndolo", initials: "AN", avatar: "" },
    students: [
      { id: "s7", initials: "RT" },
      { id: "s8", initials: "LO" },
      { id: "s9", initials: "WU" },
    ],
  },
  {
    id: "3",
    name: "Primary 4 Blue",
    level: "Primary",
    studentCount: 22,
    subjectCount: 8,
    formTeacher: { name: "Miss Grace", initials: "MG", avatar: "" },
    students: [
      { id: "s10", initials: "AA" },
      { id: "s11", initials: "BB" },
      { id: "s12", initials: "CC" },
      { id: "s13", initials: "DD" },
      { id: "s14", initials: "EE" },
      { id: "s15", initials: "FF" },
    ],
  },
];

export default function ClassesTabView() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = mockClasses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "JSS":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "SSS":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "Primary":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="pt-6 animate-in fade-in duration-300 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-9 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          className="h-10 gap-2"
          onClick={() => setIsAddClassOpen(true)}
        >
          <PlusIcon className="size-4" />
          Add Class
        </Button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No classes found matching &quot;{searchTerm}&quot;
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <Card
                key={cls.id}
                className="group p-5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md bg-card/60 hover:bg-card border-border/50"
                onClick={() => setSelectedClassId(cls.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-assistant font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {cls.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`font-semibold text-xs ${getLevelColor(cls.level)}`}
                    >
                      {cls.level}
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
                        <DropdownMenuItem>Edit Class</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedClassId(cls.id)}
                        >
                          View Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>Assign Subjects</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <Avatar className="size-9 bg-primary/10 text-primary border border-primary/20">
                    <AvatarFallback className="font-semibold text-xs">
                      {cls.formTeacher.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Form Teacher
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {cls.formTeacher.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {cls.subjectCount}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Subjects
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex -space-x-2 mb-1">
                      {cls.students.slice(0, 5).map((student) => (
                        <Avatar
                          key={student.id}
                          className="size-6 border-2 border-background bg-muted text-muted-foreground"
                        >
                          <AvatarFallback className="text-[9px] font-semibold">
                            {student.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {cls.students.length > 5 && (
                        <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground z-10 transition-transform">
                          +{cls.students.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {cls.studentCount} Students
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <ClassDetailsDrawer
        classId={selectedClassId}
        onClose={() => setSelectedClassId(null)}
        classData={mockClasses.find((c) => c.id === selectedClassId)}
      />

      <AddClassModal
        open={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
      />
    </div>
  );
}
