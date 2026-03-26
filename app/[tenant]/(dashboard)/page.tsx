"use client";

import StatsCard from "@/components/layout/stats-card";
import { useUser } from "@/contexts/user-context";
import { apiClient } from "@/lib/api";
import { adminRoles, adminStatsCards } from "@/lib/data";
import { AdminRoles, StatsResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const fetchStats = async (): Promise<StatsResponse> => {
  const response = await apiClient.get("/users/stats");
  return response.data.data;
};

export default function TenantDashboardPage() {
  const { user } = useUser();

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
        default:
          return card;
      }
    });
  }, [stats]);

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-assistant font-bold">
        Welcome Back {user?.first_name} {user?.last_name}
      </h1>

      {/* ROW 1: Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cardsToRender.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>
      {/* ROW 2: Student Distribution Graph, Fee Collection Analytics */}
      {/* ROW 3: Quick Actions (Add new student, add new teacher, add new parent, add new staff), Pending Clearance */}
      {/* ROW 4: Recent Activity, Announcements */}
    </div>
  );
}
