"use client";

import { buttonVariants } from "@/components/ui/button";
import { useTenantStore } from "@/lib/stores/tenant.store";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Assessments() {
  const { tenant } = useTenantStore();

  return (
    <div className="px-8 py-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-assistant font-bold">Assessments</h1>

        <Link
          href={`/${tenant?.slug}/teacher/assessments/create-assessment`}
          className={buttonVariants({
            variant: "primary",
            size: "default",
            className: "h-11 gap-2",
          })}
        >
          <PlusIcon className="size-4" />
          Create Assessment
        </Link>
      </div>
    </div>
  );
}
