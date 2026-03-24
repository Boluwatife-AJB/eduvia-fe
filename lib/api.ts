import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { getAuthToken } from "./auth";

// const baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "x-tenant-slug": process.env.NEXT_PUBLIC_TENANT_SLUG,
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
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);
