"use client";

import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  ChalkboardTeacherIcon,
  CheckCircleIcon,
  FileTextIcon,
  MegaphoneIcon,
  NotebookIcon,
  UsersIcon,
  WalletIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const teacherStats = [
  {
    title: "Classes Today",
    value: 4,
    change: "Next: JSS 1 in 20m",
    Icon: ChalkboardTeacherIcon,
    iconColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  {
    title: "Pending to Grade",
    value: 28,
    change: "Oldest: Oct 15",
    Icon: NotebookIcon,
    iconColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  {
    title: "Students Flagged",
    value: 2,
    change: "Action Required",
    Icon: WarningIcon,
    iconColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  {
    title: "Next Salary Date",
    value: "14 Days",
    change: "Nov 25",
    Icon: WalletIcon,
    iconColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
];

const teacherSchedule = [
  {
    id: 1,
    time: "08:00 AM",
    duration: "45m",
    subject: "Mathematics",
    class: "JSS 1A",
    type: "Lecture",
    status: "completed",
  },
  {
    id: 2,
    time: "09:30 AM",
    duration: "45m",
    subject: "Mathematics",
    class: "JSS 1B",
    type: "Lecture",
    status: "completed",
  },
  {
    id: 3,
    time: "11:15 AM",
    duration: "60m",
    subject: "Further Math",
    class: "SSS 2",
    type: "Practical",
    status: "current",
  },
  {
    id: 4,
    time: "01:00 PM",
    duration: "45m",
    subject: "Mathematics",
    class: "JSS 2A",
    type: "Lecture",
    status: "upcoming",
  },
];

const pendingGrades = [
  {
    id: 1,
    title: "Algebra Mid-Term",
    class: "JSS 1A",
    count: 32,
    dueDate: "Oct 24",
  },
  {
    id: 2,
    title: "Calculus Quiz",
    class: "SSS 2",
    count: 18,
    dueDate: "Oct 22",
  },
  {
    id: 3,
    title: "Basic Math Assignment",
    class: "JSS 1B",
    count: 28,
    dueDate: "Oct 20",
  },
];

const myClasses = [
  { id: 1, name: "JSS 1A", students: 35, subjects: "Mathematics" },
  { id: 2, name: "JSS 1B", students: 34, subjects: "Mathematics" },
  { id: 3, name: "JSS 2A", students: 40, subjects: "Mathematics" },
  { id: 4, name: "SSS 2", students: 25, subjects: "Further Math" },
];

const teacherActivityLog = [
  {
    id: 1,
    action: "Graded Algebra Mid-Term",
    class: "JSS 1A",
    time: "2 hours ago",
    icon: CheckCircleIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    id: 2,
    action: "Assignment Received: Basic Math",
    class: "JSS 1B",
    time: "4 hours ago",
    icon: FileTextIcon,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: 3,
    action: "Posted Announcement: Upcoming Quiz",
    class: "SSS 2",
    time: "Yesterday",
    icon: MegaphoneIcon,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

export default function TeacherOverview() {
  const { user } = useUser();

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-assistant font-bold">
        Welcome Back {user?.first_name} {user?.last_name}
      </h1>

      {/* ROW 1: 4 Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teacherStats.map((stat, idx) => (
          <div
            key={idx}
            className="cursor-pointer rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: stat.backgroundColor }}
              >
                <stat.Icon
                  className="size-6"
                  style={{ color: stat.iconColor }}
                  weight="bold"
                />
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                  stat.change.includes("Action Required") ||
                    stat.change.includes("amber") ||
                    stat.title === "Students Flagged"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                )}
              >
                {stat.change}
              </div>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {stat.title}
            </p>
            <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-50">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ROW 2: 2 Column */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Left (60% ≈ 6 cols): Today's Schedule */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Today&apos;s Schedule
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-blue hover:text-primary-blue/80 font-semibold text-xs h-8"
            >
              Full Timetable
            </Button>
          </div>
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 md:ml-4 space-y-8 pb-4">
            {teacherSchedule.map((item) => (
              <div key={item.id} className="relative pl-6 sm:pl-8 group">
                <div
                  className={cn(
                    "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900",
                    item.status === "completed"
                      ? "bg-slate-300 dark:bg-slate-600"
                      : item.status === "current"
                        ? "bg-primary-blue ring-4 ring-blue-100 dark:ring-blue-900/30"
                        : "bg-slate-200 dark:bg-slate-700",
                  )}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.time}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        ({item.duration})
                      </span>
                      {item.status === "current" && (
                        <span className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {item.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="size-3.5" /> {item.class}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpenIcon className="size-3.5" /> {item.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden sm:flex text-xs font-semibold h-8 w-fit shrink-0 border-slate-200 dark:border-slate-700"
                  >
                    {item.status === "upcoming"
                      ? "Prepare"
                      : item.status === "completed"
                        ? "View Notes"
                        : "Join Details"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (40% ≈ 4 cols): Grade Pending */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Grade Pending
            </h2>
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingGrades.length} Due
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {pendingGrades.map((grade) => (
              <div
                key={grade.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {grade.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {grade.class} • {grade.count} Submissions
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 px-2 py-1 rounded">
                    Due {grade.dueDate}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-8"
                >
                  Grade Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: 2 Column */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left (50%): My Classes */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              My Classes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-blue hover:text-primary-blue/80 font-semibold text-xs h-8"
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    <UsersIcon className="size-3" weight="bold" />{" "}
                    {cls.students}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span className="font-medium">Subject:</span> {cls.subjects}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold h-8 border-slate-200 dark:border-slate-700 hover:bg-primary-blue hover:border-primary-blue hover:text-white transition-colors"
                >
                  Open Gradebook
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Right (50%): Recent Activity */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Recent Activity
            </h2>
          </div>
          <div className="flex flex-col gap-5 flex-1 pr-4 max-h-[280px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            {teacherActivityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <div
                  className={`shrink-0 mt-0.5 p-2 rounded-full ${log.bg} ${log.color}`}
                >
                  <log.icon className="size-4" weight="bold" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {log.action}
                  </p>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <span className="font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase tracking-wide">
                      {log.class}
                    </span>
                    <span>•</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
