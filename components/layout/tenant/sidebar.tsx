"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { getNavConfigForRole } from "@/lib/data";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types";
import { BuildingIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

function normalizePath(path: string) {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed || "/";
}

function tenantHref(tenant: string, href: string) {
  if (!href || href === "/") return `/${tenant}`;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `/${tenant}${path}`;
}

function isNavItemActive(
  pathname: string,
  tenant: string,
  itemHref: string,
): boolean {
  const full = tenantHref(tenant, itemHref);
  const p = normalizePath(pathname);
  const h = normalizePath(full);
  if (itemHref === "/" || itemHref === "") {
    return p === h;
  }
  return p === h || p.startsWith(`${h}/`);
}

function NavRow({
  tenant,
  item,
  pathname,
  collapsed,
}: {
  tenant: string;
  item: NavLink;
  pathname: string;
  collapsed: boolean;
}) {
  const href = tenantHref(tenant, item.href);
  const active = isNavItemActive(pathname, tenant, item.href);
  const Icon = item.Icon;

  return (
    <Link
      href={href}
      title={collapsed ? item.title : undefined}
      className={cn(
        "flex items-center text-sm tracking-tight transition-all duration-200",
        collapsed ? "justify-center rounded-lg px-2 py-3" : "gap-3 px-4 py-3",
        active
          ? "bg-primary-blue/5 font-semibold text-primary-blue"
          : "text-slate-600 opacity-80 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50",
        collapsed
          ? ""
          : active
            ? "translate-x-1 border-l-4 border-primary-blue"
            : "border-l-4 border-transparent",
      )}
    >
      <Icon
        className={cn("shrink-0", collapsed ? "size-5.5" : "size-5")}
        weight={active ? "fill" : "regular"}
      />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}

export default function TenantSidebar({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) {
  const { tenant } = useTenantStore();
  const params = useParams<{ tenant: string }>();
  const pathname = usePathname() ?? "";
  const { user, isLoading } = useUser();

  const tenantSlug = params.tenant ?? tenant?.slug ?? "";

  const { dashboard, sections } = useMemo(
    () => getNavConfigForRole(user?.role),
    [user?.role],
  );

  const collapsed = !isSidebarOpen;

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col bg-sidebar py-6 transition-[width] duration-200 ease-out lg:flex dark:bg-[#001C3B]",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className={cn("mb-8", collapsed ? "px-2" : "px-6")}>
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <Avatar
            className={cn(collapsed ? "size-11" : "size-12")}
            title={collapsed ? (tenant?.name ?? undefined) : undefined}
          >
            <AvatarImage src={tenant?.logo} />
            <AvatarFallback>
              <BuildingIcon weight="bold" className="size-6" />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-tight text-primary-blue">
                {tenant?.name}
              </h2>
              <span className="mt-1 inline-block rounded-full bg-primary-blue/10 px-2 py-0.5 text-[10px] font-semibold text-primary-blue">
                2024/2025 — First Term
              </span>
            </div>
          )}
        </div>
      </div>

      <nav
        className={cn(
          "custom-scrollbar flex-1 space-y-1 overflow-y-auto",
          collapsed ? "px-1" : "px-2",
        )}
      >
        {tenantSlug ? (
          <>
            <NavRow
              tenant={tenantSlug}
              item={dashboard}
              pathname={pathname}
              collapsed={collapsed}
            />
            {sections.map((section) => (
              <div key={section.label}>
                {collapsed ? (
                  <div
                    className="mx-2 my-3 h-px bg-slate-200 dark:bg-slate-700"
                    aria-hidden
                  />
                ) : (
                  <div className="px-4 pt-4 pb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {section.label}
                    </span>
                  </div>
                )}
                {section.items.map((item) => (
                  <NavRow
                    key={`${section.label}-${item.href}-${item.title}`}
                    tenant={tenantSlug}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            ))}
            {!collapsed && !isLoading && sections.length === 0 && user && (
              <p className="px-4 pt-2 text-xs text-slate-500">
                No navigation items are configured for your role.
              </p>
            )}
          </>
        ) : (
          !collapsed && (
            <p className="px-4 text-xs text-slate-500">
              Missing tenant context.
            </p>
          )
        )}
      </nav>

      {/* {!collapsed && (
        <div className="mt-auto space-y-4 border-t border-slate-200 px-6 pt-6">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-500">
                Storage
              </span>
              <span className="text-[10px] font-semibold text-primary-blue">
                82%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary-blue"
                style={{ width: "82%" }}
              />
            </div>
            <button
              type="button"
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-blue hover:underline"
            >
              Upgrade Storage
              <CaretRightIcon className="size-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <InfoIcon className="size-4" />
              App Version 1.0.0
            </span>
            <a className="transition-colors hover:text-primary" href="#">
              Help
            </a>
          </div>
        </div>
      )} */}
    </aside>
  );
}
