import axios from "axios";
import Cookies from "js-cookie";

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
