import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChalkboardTeacherIcon,
  UsersThreeIcon,
  BuildingIcon,
  BookBookmarkIcon,
} from "@phosphor-icons/react/dist/ssr";
import ClassesTabView from "@/components/school-admin/tabs/classes-tab-view";
import SubjectsTabView from "@/components/school-admin/tabs/subjects-tab-view";
import DepartmentsTabView from "@/components/school-admin/tabs/departments-tab-view";

export default function ClassesSubjects() {
  return (
    <div className="px-8 py-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-assistant font-bold">
            Classes & Subjects
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage academic structure, assignments, and class distributions.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs
          defaultValue="classes"
          className="h-[calc(100vh-140px)] flex flex-col"
        >
          <TabsList className="w-fit mb-4">
            <TabsTrigger
              value="classes"
              className="px-6 h-10 data-active:text-primary relative data-active:bg-background data-active:shadow-sm"
            >
              <UsersThreeIcon className="mr-2 size-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="px-6 h-10 data-active:text-primary relative data-active:bg-background data-active:shadow-sm"
            >
              <BookBookmarkIcon className="mr-2 size-4" />
              Subjects
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="px-6 h-10 data-active:text-primary relative data-active:bg-background data-active:shadow-sm"
            >
              <BuildingIcon className="mr-2 size-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="px-6 h-10 data-active:text-primary relative data-active:bg-background data-active:shadow-sm"
            >
              <ChalkboardTeacherIcon className="mr-2 size-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="classes"
            className="m-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar focus-visible:outline-none"
          >
            <ClassesTabView />
          </TabsContent>

          <TabsContent
            value="subjects"
            className="m-0 h-full overflow-y-auto overflow-x-hidden focus-visible:outline-none custom-scrollbar"
          >
            <SubjectsTabView />
          </TabsContent>

          <TabsContent
            value="departments"
            className="m-0 h-full overflow-hidden focus-visible:outline-none"
          >
            <DepartmentsTabView />
          </TabsContent>

          <TabsContent
            value="assignments"
            className="m-0 h-full overflow-hidden focus-visible:outline-none"
          >
            <div className="flex flex-col items-center justify-center h-full bg-card rounded-xl border border-border text-center p-8">
              <ChalkboardTeacherIcon className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">Teacher Assignments</h3>
              <p className="text-muted-foreground font-medium max-w-sm">
                Overview of subjects assigned to teachers across the
                institution.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
