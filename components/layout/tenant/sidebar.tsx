"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { getNavConfigForRole } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/lib/stores/tenant.store";
import type { NavLink } from "@/types";
import { BuildingIcon, CaretRightIcon, InfoIcon } from "@phosphor-icons/react";
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
}: {
  tenant: string;
  item: NavLink;
  pathname: string;
}) {
  const href = tenantHref(tenant, item.href);
  const active = isNavItemActive(pathname, tenant, item.href);
  const Icon = item.Icon;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 py-3 px-4  text-sm tracking-tight transition-all duration-200",
        active
          ? "translate-x-1 border-l-4 border-primary-blue bg-primary-blue/5 font-semibold text-primary-blue"
          : "border-l-4 border-transparent text-slate-600 opacity-80 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50",
      )}
    >
      <Icon className="size-5 shrink-0" weight={active ? "fill" : "regular"} />
      <span>{item.title}</span>
    </Link>
  );
}

export default function TenantSidebar() {
  const { tenant } = useTenantStore();
  const params = useParams<{ tenant: string }>();
  const pathname = usePathname() ?? "";
  const { user, isLoading } = useUser();

  const tenantSlug = params.tenant ?? tenant?.slug ?? "";

  const { dashboard, sections } = useMemo(
    () => getNavConfigForRole(user?.role),
    [user?.role],
  );

  return (
    <aside className="tonal-architecture no-borders hidden h-full w-[260px] shrink-0 flex-col bg-sidebar py-6 lg:flex dark:bg-[#001C3B]">
      <div className="mb-8 px-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={tenant?.logo} />
            <AvatarFallback>
              <BuildingIcon weight="bold" className="size-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-primary-blue">
              {tenant?.name}
            </h2>
            <span className="mt-1 inline-block rounded-full bg-primary-blue/10 px-2 py-0.5 text-[10px] font-semibold text-primary-blue">
              2024/2025 — First Term
            </span>
          </div>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-2">
        {tenantSlug ? (
          <>
            <NavRow tenant={tenantSlug} item={dashboard} pathname={pathname} />
            {sections.map((section) => (
              <div key={section.label}>
                <div className="px-4 pt-4 pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {section.label}
                  </span>
                </div>
                {section.items.map((item) => (
                  <NavRow
                    key={`${section.label}-${item.href}-${item.title}`}
                    tenant={tenantSlug}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </div>
            ))}
            {!isLoading && sections.length === 0 && user && (
              <p className="px-4 pt-2 text-xs text-slate-500">
                No navigation items are configured for your role.
              </p>
            )}
          </>
        ) : (
          <p className="px-4 text-xs text-slate-500">Missing tenant context.</p>
        )}
      </nav>

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
            {/* TODO: Replace with shadcn progress bar3 */}
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
    </aside>
  );
}
