"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowUpRightIcon,
  HardDrivesIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";

const STORAGE_TOTAL = 500; // GB
const STORAGE_USED = 412; // GB
const USAGE_PERCENTAGE = (STORAGE_USED / STORAGE_TOTAL) * 100;

const DONUT_DATA = [
  { name: "Used", value: STORAGE_USED, fill: "#3b82f6" },
  { name: "Free", value: STORAGE_TOTAL - STORAGE_USED, fill: "#e2e8f0" },
];

const SCOPE_DATA = [
  { name: "Academic", value: 185 },
  { name: "Administrative", value: 95 },
  { name: "Events", value: 65 },
  { name: "Operations", value: 42 },
  { name: "Student Welfare", value: 15 },
  { name: "Sport Records", value: 10 },
];

const RECENT_UPLOADS = [
  {
    id: "1",
    filename: "Physics Lab Guide.pdf",
    scope: "Academic",
    uploader: "Mr. Johnson",
    size: "4.2 MB",
    date: "2 mins ago",
    badgeColor: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "2",
    filename: "Term 1 Financial Report.xlsx",
    scope: "Administrative",
    uploader: "Finance Dept",
    size: "1.8 MB",
    date: "1 hour ago",
    badgeColor: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "3",
    filename: "Sports Day Highlights.mp4",
    scope: "Events",
    uploader: "Media Club",
    size: "450 MB",
    date: "3 hours ago",
    badgeColor: "bg-orange-500/10 text-orange-600",
  },
  {
    id: "4",
    filename: "Health Safety Guidelines.pdf",
    scope: "Student Welfare",
    uploader: "Nurse Sarah",
    size: "1.2 MB",
    date: "Yesterday",
    badgeColor: "bg-green-500/10 text-green-600",
  },
  {
    id: "5",
    filename: "Library Inventory Q3.xlsx",
    scope: "Operations",
    uploader: "Librarian",
    size: "850 KB",
    date: "Yesterday",
    badgeColor: "bg-indigo-500/10 text-indigo-600",
  },
];

const barChartConfig = {
  academic: {
    label: "Academic",
    color: "#3b82f6",
  },
  administrative: {
    label: "Administrative",
    color: "#e2e8f0",
  },
  events: {
    label: "Events",
    color: "#e2e8f0",
  },
  operations: {
    label: "Operations",
    color: "#e2e8f0",
  },
  welfare: {
    label: "Student Welfare",
    color: "#e2e8f0",
  },
  sport: {
    label: "Sport",
    color: "#e2e8f0",
  },
};

const donutChartConfig = {
  used: {
    label: "Used",
    color: "#3b82f6",
  },
  free: {
    label: "Free",
    color: "#e2e8f0",
  },
};

export default function StorageView() {
  const isNearLimit = USAGE_PERCENTAGE > 80;

  return (
    <div className="flex-1 p-4 space-y-8 overflow-y-auto h-[calc(100vh-16rem)] custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Gauge/Donut */}
        <Card className="p-6 col-span-1 border border-border/50 flex flex-col items-center justify-center relative shadow-sm">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="p-2 bg-primary-blue/10 text-primary-blue rounded-lg">
              <HardDrivesIcon weight="fill" className="size-5" />
            </div>
            <span className="font-semibold text-foreground">
              Storage Overview
            </span>
          </div>

          <div className="h-64 w-full mt-8 relative">
            <ChartContainer
              config={donutChartConfig}
              className="h-full w-full min-h-0 aspect-auto"
            >
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                />
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-4xl font-bold leading-none tabular-nums text-foreground">
                {USAGE_PERCENTAGE.toFixed(0)}%
              </span>
              <span className="text-sm leading-none text-muted-foreground">
                Used
              </span>
            </div>
          </div>

          <div className="w-full text-center mt-2 flex flex-col items-center gap-4">
            <div className="flex justify-center items-center gap-8 text-sm">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <span className="w-3 h-3 rounded-full bg-primary-blue" /> Used
                </div>
                <span className="font-semibold text-foreground">
                  {STORAGE_USED} GB
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <span className="w-3 h-3 rounded-full bg-slate-200" /> Free
                </div>
                <span className="font-semibold text-foreground">
                  {STORAGE_TOTAL - STORAGE_USED} GB
                </span>
              </div>
            </div>

            <div
              className={cn(
                "w-full p-4 rounded-xl flex items-center justify-between",
                isNearLimit
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-muted/50 border border-border/50",
              )}
            >
              <div className="flex flex-col items-start text-left">
                <Badge
                  variant={isNearLimit ? "outline" : "secondary"}
                  className={cn(
                    "mb-1",
                    isNearLimit
                      ? "border-amber-500 text-amber-600 bg-amber-500/10"
                      : "",
                  )}
                >
                  Pro Plan
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {isNearLimit
                    ? "Approaching storage limit."
                    : "Plenty of space available."}
                </span>
              </div>
              {isNearLimit && (
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                >
                  <TrendUpIcon weight="bold" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Per-scope Bar Chart */}
        <Card className="p-6 col-span-1 lg:col-span-2 border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">
              Usage by Repository Scope
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-blue h-8 text-xs gap-1"
            >
              View Detailed Report <ArrowUpRightIcon />
            </Button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ChartContainer
              config={barChartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart
                data={SCOPE_DATA}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13 }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} GB`, "Usage"]}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>
      </div>

      {/* Recent Uploads Table */}
      {/* <div className="space-y-4">
        <h3 className="text-lg font-semibold font-assistant">
          Recent Uploads (All Scopes)
        </h3>
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_UPLOADS.map((upload) => (
                <TableRow key={upload.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-foreground">
                    {upload.filename}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("border-0 font-normal", upload.badgeColor)}
                    >
                      {upload.scope}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {upload.uploader.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {upload.uploader}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {upload.size}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {upload.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div> */}
    </div>
  );
}
