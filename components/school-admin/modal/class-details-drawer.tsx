"use client";

import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import {
  XIcon,
  UsersIcon,
  ChalkboardTeacherIcon,
  GearIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ClassDetailsDrawerProps {
  classId: string | null;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classData?: any;
}

export default function ClassDetailsDrawer({
  classId,
  onClose,
  classData,
}: ClassDetailsDrawerProps) {
  if (!classId || !classData) return null;

  return (
    <Dialog open={!!classId} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/20 backdrop-blur-sm z-40 transition-opacity" />
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl max-h-screen">
          <DialogPrimitive.Popup className="w-full h-full bg-background shadow-2xl border-l flex flex-col rounded-none animate-in slide-in-from-right-full duration-300 p-0 select-text outline-none data-closed:slide-out-to-right-full">
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
                      {classData.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="font-semibold text-xs py-0.5"
                    >
                      {classData.level}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-2">
                    Form Teacher:{" "}
                    <span className="text-foreground tracking-tight">
                      {classData.formTeacher.name}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-9 px-4 hidden sm:flex">
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
                    className="w-full justify-start gap-6 border-none pb-0 h-10"
                  >
                    <TabsTrigger
                      value="students"
                      className="px-1 font-semibold text-sm pb-3 h-auto data-active:text-primary data-active:after:bg-primary"
                    >
                      <UsersIcon className="mr-2 size-4" />
                      Students ({classData.studentCount})
                    </TabsTrigger>
                    <TabsTrigger
                      value="subjects"
                      className="px-1 font-semibold text-sm pb-3 h-auto data-active:text-primary data-active:after:bg-primary"
                    >
                      <ChalkboardTeacherIcon className="mr-2 size-4" />
                      Subjects ({classData.subjectCount})
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
                      {/* Placeholder for Students Table Component */}
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-lg font-bold">Enrolled Students</h3>
                      </div>
                      <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm flex items-center justify-center p-8 text-center flex-col">
                        <UsersIcon className="size-12 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground font-medium">
                          Students table implementation goes here...
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="subjects"
                    className="h-full mt-0 focus-visible:outline-none"
                  >
                    <div className="h-full flex flex-col">
                      {/* Placeholder for Subjects Table Component */}
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-lg font-bold">Assigned Subjects</h3>
                      </div>
                      <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm flex items-center justify-center p-8 text-center flex-col">
                        <ChalkboardTeacherIcon className="size-12 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground font-medium">
                          Subjects assigned table goes here...
                        </p>
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
                      <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm flex items-center justify-center p-8 text-center flex-col">
                        <p className="text-muted-foreground font-medium">
                          Teachers content...
                        </p>
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
                      <div className="flex-1 bg-card rounded-xl border border-border/50 shadow-sm p-8">
                        <p className="text-muted-foreground font-medium text-sm">
                          Update capacity, location, and department linking
                          here.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </DialogPrimitive.Popup>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
