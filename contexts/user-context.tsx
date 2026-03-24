"use client";

import { apiClient } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import type { Role, TenantSlice } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
  identifier: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  mfa_enabled: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  tenant: TenantSlice;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const fetchUser = async (): Promise<User> => {
  const response = await apiClient.get("/auth/me");
  const payload = response.data as { data?: User } | User;
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data
  ) {
    return payload.data;
  }
  return payload as User;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    enabled: Boolean(getAuthToken("access")),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load user data.";
      toast.error(message);
    }
  }, [error]);

  const value: UserContextType = {
    user: user ?? null,
    isLoading,
    refetchUser: () => {
      void queryRefetch();
    },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
