"use client";

import { apiClient } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const fetchTenant = async (slug: string) => {
  const response = await apiClient.get(`/tenant/${slug}/public`);
  return response.data;
};

export default function TenantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant } = useParams<{ tenant: string }>();
  const setTenant = useTenantStore((state) => state.setTenant);
  const setLoading = useTenantStore((state) => state.setLoading);
  const setError = useTenantStore((state) => state.setError);

  const {
    data: tenantData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tenant", tenant],
    queryFn: () => fetchTenant(tenant),
    enabled: Boolean(tenant),
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load tenant data.";
      setError(message);
      setTenant(null);
      return;
    }

    setError(null);
    if (tenantData) {
      setTenant(tenantData);
      setAuthToken({
        tenant_slug: tenantData.slug,
      });
    }
  }, [error, setError, setTenant, tenantData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading tenant...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "Unable to load tenant data."}
      </div>
    );
  }

  return <>{children}</>;
}
