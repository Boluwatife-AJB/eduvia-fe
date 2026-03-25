"use client";

import TenantHeader from "@/components/layout/tenant/header";
import TenantSidebar from "@/components/layout/tenant/sidebar";
import { UserProvider } from "@/contexts/user-context";
import { useState } from "react";

export default function TenantDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <UserProvider>
      <div className="">
        <TenantHeader toggleSidebar={toggleSidebar} />
        <div className="flex h-[calc(100vh-75px)] overflow-hidden">
          <TenantSidebar isSidebarOpen={isSidebarOpen} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
