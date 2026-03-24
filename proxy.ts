import { NextRequest, NextResponse } from "next/server";

/** First path segment is not a tenant slug (marketing, system routes, etc.). */
const RESERVED_FIRST_SEGMENTS = new Set(["onboarding", "system"]);

const TENANT_AUTH_SEGMENTS = new Set([
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
]);

const SYSTEM_AUTH_SEGMENTS = new Set([
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
]);

/** Cookie set after super-admin login (`app/super-admin/(dashboard)/`). */
const SYSTEM_ACCESS_TOKEN = "sy-access-token";

/** Cookie set after tenant-scoped login (`app/[tenant]/(dashboard)/`). */
const TENANT_ACCESS_TOKEN = "ev-access-token";

function isSuperAdminDashboardPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/system") return true;
  if (!normalized.startsWith("/system/")) return false;
  const sub = normalized.slice("/system/".length).split("/")[0];
  if (!sub) return true;
  return !SYSTEM_AUTH_SEGMENTS.has(sub);
}

/**
 * Matches `app/[tenant]/(dashboard)/…` URLs: /{tenant} and /{tenant}/…
 * Excludes tenant auth under `app/[tenant]/(auth)/…`.
 */
function isTenantDashboardPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 1) return false;
  const tenant = parts[0];
  if (RESERVED_FIRST_SEGMENTS.has(tenant)) return false;
  if (parts.length === 1) return true;
  return !TENANT_AUTH_SEGMENTS.has(parts[1]);
}

function isProtectedDashboardPath(pathname: string): boolean {
  return isSuperAdminDashboardPath(pathname) || isTenantDashboardPath(pathname);
}

function getAccessTokenForProtectedPath(
  request: NextRequest,
  pathname: string,
): ReturnType<NextRequest["cookies"]["get"]> {
  if (isSuperAdminDashboardPath(pathname)) {
    return request.cookies.get(SYSTEM_ACCESS_TOKEN);
  }
  return request.cookies.get(TENANT_ACCESS_TOKEN);
}

function signInUrlForRequest(request: NextRequest, pathname: string): URL {
  if (pathname.startsWith("/system")) {
    return new URL("/system/sign-in", request.url);
  }
  const tenant = pathname.split("/").filter(Boolean)[0];
  if (tenant) {
    return new URL(`/${tenant}/sign-in`, request.url);
  }
  return new URL("/", request.url);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    pathname.includes("/static/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!isProtectedDashboardPath(pathname)) {
    return NextResponse.next();
  }

  const token = getAccessTokenForProtectedPath(request, pathname);
  if (!token) {
    return NextResponse.redirect(signInUrlForRequest(request, pathname));
  }

  return NextResponse.next();
}
