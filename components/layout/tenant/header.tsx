import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/user-context";
import { useTenantStore } from "@/lib/stores/tenant.store";
import {
  BellIcon,
  DotsNineIcon,
  ListIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@phosphor-icons/react";

export default function TenantHeader() {
  const { tenant } = useTenantStore();
  const { user } = useUser();

  return (
    <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 docked full-width h-18">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="active:translate-y-0">
          <ListIcon className="text-slate-600 size-6" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1">
            <h1 className="text-2xl font-bold">Eduvia</h1>
            <span className="bg-accent-amber size-1.5 rounded-full font-black"></span>
          </div>
          <Separator orientation="vertical" className="h-8" />
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {tenant?.name}
        </span>
      </div>
      <div className="hidden md:flex flex-1 justify-center max-w-[480px]">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="text-slate-400 size-6" />
          </div>
          <Input
            className="block w-full pl-10 pr-12 py-2 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-container transition-all bg-[#f0f3ff] h-10"
            placeholder="Search anything..."
            type="text"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="p-2 relative">
          <BellIcon className="text-slate-600 size-7" />
          <Badge className="absolute -top-1 -right-0.5 size-4 bg-primary-blue text-[10px] text-white flex items-center justify-center rounded-full font-semibold">
            3
          </Badge>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors scale-95 duration-100 active:opacity-80 active:translate-y-0"
        >
          <DotsNineIcon weight="bold" className="text-slate-600 size-7" />
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-on-surface leading-none">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] font-bold text-primary-blue uppercase tracking-wider mt-1 bg-primary-blue/10 px-2 py-0.5 rounded-full inline-block">
              {user?.role}
            </p>
          </div>
          <div className="relative size-10">
            <Avatar>
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfkA2j7LDj9vo8TQxpgKjdVYy1wZsmZpTTx7aSDPxeaGshMK93qpAeQwIIH6lxqIlBM6Y2MB8-5VSeYdIzJ3G8gf3XY3g5M0mvMMgNF_4LjCd-cT4p-PwE-4qm1-Dic1jIHnvgVmrsscS8eADFNbR732hMnr-b5XInIfZiBjRR7QEgCm0ekZBsNl8EIkSBfGlUoa-pYv12z8QnteLLYQ1en9IQ-xdTOhxTqaoZo2D6ih_tDicKDrlt_JWF9vixsUwaFrPyslmT84o" />
              <AvatarFallback>
                <UserIcon size={24} />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
