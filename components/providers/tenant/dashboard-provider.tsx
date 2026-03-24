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
      <div className="flex flex-col min-h-screen w-full">
        <TenantHeader />
        <TenantSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </UserProvider>
  );
}
