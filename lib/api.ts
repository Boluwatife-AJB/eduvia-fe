import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { getAuthToken, setAuthToken } from "./auth";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshAccessTokenPromise: Promise<string> | null = null;

function isAccessTokenExpiredResponse(error: unknown): error is AxiosError {
  if (!axios.isAxiosError(error) || !error.response) return false;
  const data = error.response.data as { message?: string } | undefined;
  return (
    error.response.status === 401 && data?.message === "Access token expired"
  );
}

/**
 * Calls POST /auth/refresh with plain axios (not apiClient) to avoid interceptor loops.
 * Deduplicates concurrent refresh attempts.
 */
function refreshAccessToken(): Promise<string> {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  refreshAccessTokenPromise = (async () => {
    const refreshToken = getAuthToken("refresh");
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const tenantSlug = getAuthToken("tenant");
    const { data: body } = await axios.post<unknown>(
      "/auth/refresh",
      { refresh_token: refreshToken },
      {
        baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
        headers: {
          "Content-Type": "application/json",
          ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
        },
      },
    );

    const payload = (
      body && typeof body === "object" && "data" in body
        ? (body as { data: unknown }).data
        : body
    ) as { access_token?: string; refresh_token?: string };

    if (!payload?.access_token) {
      throw new Error("Refresh response missing access_token");
    }

    setAuthToken({
      access_token: payload.access_token,
      refresh_token: payload.refresh_token ?? refreshToken,
    });

    return payload.access_token;
  })();

  refreshAccessTokenPromise = refreshAccessTokenPromise.finally(() => {
    refreshAccessTokenPromise = null;
  });

  return refreshAccessTokenPromise;
}

// const baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

export const privateApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "x-tenant-slug": process.env.NEXT_PUBLIC_TENANT_SLUG,
  },
});

privateApi.interceptors.request.use(
  (config) => {
    const authToken = Cookies.get("ev-access-token");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAuthToken("access");
    const tenantSlug = getAuthToken("tenant");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (tenantSlug) {
      config.headers["x-tenant-slug"] = tenantSlug;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !originalRequest ||
      originalRequest._retry ||
      !isAccessTokenExpiredResponse(error)
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";
    if (url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      const headers = AxiosHeaders.from(originalRequest.headers ?? {});
      headers.set("Authorization", `Bearer ${accessToken}`);
      originalRequest.headers = headers;
      return apiClient.request(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);
