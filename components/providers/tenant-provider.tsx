"use client";

import { publicApi } from "@/lib/api";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { useQuery } from "@tanstack/react-query";
import { ParamValue } from "next/dist/server/request/params";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const fetchTenant = async (slug: ParamValue) => {
  const response = await publicApi.get(`tenant/${slug}/public`);
  return response.data.data;
};

export default function TenantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant } = useParams();
  const setTenant = useTenantStore((state) => state.setTenant);

  const {
    data: tenantData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tenant", tenant],
    queryFn: () => fetchTenant(tenant),
  });

  useEffect(() => {
    if (tenantData) {
      setTenant(tenantData);
    }
  }, [tenantData]);

  return <>{children}</>;
}
