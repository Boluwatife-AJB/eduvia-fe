import TenantDashboardProvider from "@/components/providers/tenant/dashboard-provider";

export default function TenantDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TenantDashboardProvider>{children}</TenantDashboardProvider>;
}
