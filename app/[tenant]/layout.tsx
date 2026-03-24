import TenantProvider from "@/components/providers/tenant/tenant-provider";
import { apiClient } from "@/lib/api";

const fetchTenant = async (slug: string) => {
  const response = await apiClient.get(`/tenant/${slug}/public`);
  return response.data.data;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await fetchTenant(tenantSlug);

  return {
    title: tenant ? `${tenant.name} — Eduvia` : "Eduvia",
    description: tenant?.motto ?? "School Management Platform",
    icons: { icon: tenant?.logo ?? "/eduvia-favicon.ico" },
  };
}

export default function TenantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TenantProvider>{children}</TenantProvider>;
}
