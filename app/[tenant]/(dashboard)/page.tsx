"use client";

import { Button } from "@/components/ui/button";
import StatsCard from "@/components/layout/stats-card";
import { useUser } from "@/contexts/user-context";
import { apiClient } from "@/lib/api";
import { adminRoles, adminStatsCards } from "@/lib/data";
import { AdminRoles, StatsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChalkboardTeacherIcon,
  CheckCircleIcon,
  MegaphoneIcon,
  MoneyIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddStudent from "@/components/school-admin/modal/add-student";
import AddTeacher from "@/components/school-admin/modal/add-teacher";

const fetchStats = async (): Promise<StatsResponse> => {
  const response = await apiClient.get("/users/stats");
  return response.data.data;
};

const enrollmentData = [
  { name: "Primary", value: 450 },
  { name: "JSS", value: 300 },
  { name: "SSS", value: 250 },
];
const ENROLLMENT_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

const feeCollectionData = [
  { name: "Primary", collected: 8000, outstanding: 2000 },
  { name: "JSS", collected: 6000, outstanding: 3000 },
  { name: "SSS", collected: 5000, outstanding: 4500 },
];

const activityLog = [
  {
    id: 1,
    action: "Added new student profile",
    user: "Admin",
    time: "2 hours ago",
    icon: UserPlusIcon,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: 2,
    action: "Approved Grade 10 Results",
    user: "Principal",
    time: "4 hours ago",
    icon: CheckCircleIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    id: 3,
    action: "Updated School Fees schedule",
    user: "Bursar",
    time: "5 hours ago",
    icon: MoneyIcon,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    id: 4,
    action: "Posted PTA Meeting Announcement",
    user: "Admin",
    time: "1 day ago",
    icon: MegaphoneIcon,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
];

const pendingApprovals = [
  {
    id: 1,
    title: "JSS 1 First Term Results",
    type: "Result",
    submittedBy: "Mr. Ojo",
    date: "Today, 10:00 AM",
  },
  {
    id: 2,
    title: "PTA Meeting Expense",
    type: "Expense",
    submittedBy: "Mrs. Smith",
    date: "Yesterday, 2:30 PM",
  },
  {
    id: 3,
    title: "Curriculum Update for SSS 3",
    type: "Review",
    submittedBy: "Dr. Adebayo",
    date: "Oct 24, 09:15 AM",
  },
];

export default function TenantDashboardPage() {
  const { user } = useUser();
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [addTeacherModal, setAddTeacherModal] = useState(false);
  // const [approveResultsModal, setApproveResultsModal] = useState(false);
  // const [setFeesModal, setSetFeesModal] = useState(false);
  // const [postAnnouncementModal, setPostAnnouncementModal] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: adminRoles.includes(user?.role as AdminRoles),
  });

  const cardsToRender = useMemo(() => {
    if (!stats) return adminStatsCards;

    return adminStatsCards.map((card) => {
      switch (card.title) {
        case "Total Students":
          return { ...card, value: stats.total_students };
        case "Teachers":
          return { ...card, value: stats.total_teachers };
        case "Active Classes":
          return { ...card, value: stats.total_classes };
        case "Support Staff":
          return { ...card, value: stats.total_staff };
        case "Fee Collected":
        case "Pending Approvals":
        default:
          return card;
      }
    });
  }, [stats]);

  return (
    <>
      <div className="px-8 py-6">
        <h1 className="text-2xl font-assistant font-bold">
          Welcome Back {user?.first_name} {user?.last_name}
        </h1>

        {/* ROW 1: Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cardsToRender.map((card) => (
            <StatsCard key={card.title} {...card} />
          ))}
        </div>
        {/* ROW 2: 3 Column Layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:min-h-[400px]">
          {/* Col 1 (40% ≈ 5 cols): Enrollment Chart */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
              Enrollment Distribution
            </h2>
            <div className="flex-1 w-full min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrollmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {enrollmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ENROLLMENT_COLORS[index % ENROLLMENT_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                  1,000
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Col 2 (35% ≈ 4 cols): Fee Collection */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Fee Collection Overview
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Collected vs Outstanding
              </p>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={feeCollectionData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="collected"
                    name="Collected"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="outstanding"
                    name="Outstanding"
                    fill="#ef4444"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Col 3 (25% ≈ 3 cols): Quick Actions */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3 flex-1 justify-start">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 shadow-sm font-semibold text-slate-600 dark:text-slate-300 transition-all"
                onClick={() => setAddStudentModal(true)}
              >
                <UserPlusIcon
                  className="size-5 text-primary-blue"
                  weight="duotone"
                />
                Add Student
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 shadow-sm font-semibold text-slate-600 dark:text-slate-300 transition-all"
                onClick={() => setAddTeacherModal(true)}
              >
                <ChalkboardTeacherIcon
                  className="size-5 text-emerald-500"
                  weight="duotone"
                />
                Add Teacher
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 shadow-sm font-semibold text-slate-600 dark:text-slate-300 transition-all"
              >
                <CheckCircleIcon
                  className="size-5 text-amber-500"
                  weight="duotone"
                />
                Approve Results
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 shadow-sm font-semibold text-slate-600 dark:text-slate-300 transition-all"
              >
                <MoneyIcon
                  className="size-5 text-violet-500"
                  weight="duotone"
                />
                Set Fees
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 shadow-sm font-semibold text-slate-600 dark:text-slate-300 transition-all"
              >
                <MegaphoneIcon
                  className="size-5 text-pink-500"
                  weight="duotone"
                />
                Post Announcement
              </Button>
            </div>
          </div>
        </div>

        {/* Row 3: 2 Column Layout: Activity Log and Pending Approvals */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Activity Log */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Recent Activity
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-blue hover:text-primary-blue/80 font-semibold text-xs h-8"
              >
                View All
              </Button>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              {activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 p-2 rounded-full ${log.bg} ${log.color}`}
                  >
                    <log.icon className="size-4" weight="bold" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {log.action}
                    </p>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-2">
                      <span className="font-semibold">{log.user}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Pending Approvals
              </h2>
              <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pendingApprovals.length} New
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">
                        {item.type}
                      </span>
                      <span>•</span>
                      <span className="font-medium">{item.submittedBy}</span>
                      <span className="hidden sm:inline-block">•</span>
                      <span className="hidden sm:inline-block">
                        {item.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 px-3 bg-primary-blue hover:bg-primary-blue/90 text-white text-xs font-semibold rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-auto border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                View All Requests
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={addStudentModal} onOpenChange={setAddStudentModal}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
          <AddStudent onClose={() => setAddStudentModal(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={addTeacherModal} onOpenChange={setAddTeacherModal}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl p-6">
          <AddTeacher onClose={() => setAddTeacherModal(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
