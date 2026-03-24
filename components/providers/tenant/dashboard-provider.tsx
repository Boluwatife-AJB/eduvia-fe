"use client";

import TenantHeader from "@/components/layout/tenant/header";
import TenantSidebar from "@/components/layout/tenant/sidebar";
import { UserProvider } from "@/contexts/user-context";

export default function TenantDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="">
        <TenantHeader />
        <div className="flex h-[calc(100vh-75px)] overflow-hidden">
          <TenantSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
