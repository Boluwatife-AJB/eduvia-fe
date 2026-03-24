import { create } from "zustand";

interface TenantProfile {
  id: string;
  name: string;
  slug: string;
  logo: string;
  status: string;
  is_suspended: boolean;
}

interface TenantStore {
  tenant: TenantProfile | null;
  isLoading: boolean;
  error: string | null;
  setTenant: (tenant: TenantProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTenantStore = create<TenantStore>((set) => ({
  tenant: null,
  isLoading: false,
  error: null,
  setTenant: (tenant) => set({ tenant }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
