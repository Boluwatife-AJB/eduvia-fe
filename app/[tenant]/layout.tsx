import TenantProvider from "@/components/providers/tenant-provider";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantProvider>{children}</TenantProvider>;
}
