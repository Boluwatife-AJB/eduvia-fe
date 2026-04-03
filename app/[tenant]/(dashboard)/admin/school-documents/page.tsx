"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RepositoryView from "@/components/school-admin/tabs/repository-view";
import StorageView from "@/components/school-admin/tabs/storage-view";
import {
  UploadSimpleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";

const docTabs = [
  { name: "Repository View", value: "repository" },
  { name: "Storage Usage", value: "usage" },
] as const;

export default function SchoolDocuments() {
  const [activeTab, setActiveTab] = useState("repository");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeIndex = docTabs.findIndex((tab) => tab.value === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    // <div className="flex flex-col h-[calc(100vh-4rem)]">
    <div className="flex flex-col h-full space-y-6">
      <div className="px-8 py-6 pb-4 border-b shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background z-10 sticky top-0">
        <div>
          <h1 className="text-3xl font-assistant font-bold">
            School Repository
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, share, and organize all school documents securely.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 hidden md:block">
            <Input
              placeholder="Search files..."
              className="pl-9 h-10 w-full rounded-xl bg-muted/30 border-border/50"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
          <Button variant="outline" className="h-10 gap-2 shrink-0 rounded-xl">
            <UploadSimpleIcon weight="bold" className="size-4" />
            Upload File
          </Button>
          <Button
            variant="primary"
            className="h-10 gap-2 shrink-0 rounded-xl shadow-xs"
          >
            <PlusIcon weight="bold" className="size-4" />
            New Folder
          </Button>
        </div>
      </div>
      <div className="px-8 flex-1 overflow-hidden shrink-0 bg-background">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full gap-4"
        >
          <TabsList className="bg-background relative w-full max-w-[400px] rounded-none border-b p-0">
            {docTabs.map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className="bg-background dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none! hover:text-primary-blue-light data-active:text-primary-blue group-data-[variant=default]/tabs-list:data-active:shadow-none"
              >
                {tab.name}
              </TabsTrigger>
            ))}

            <motion.div
              className="bg-primary-blue absolute bottom-0 z-20 h-0.5"
              layoutId="school-documents-tab-underline "
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
              }}
            />
          </TabsList>

          <TabsContent value="repository">
            <RepositoryView />
          </TabsContent>
          <TabsContent value="usage">
            <StorageView />
          </TabsContent>
        </Tabs>
      </div>
      {/* <div className="flex-1 flex overflow-hidden">
        {activeTab === "repository" ? (
          <>
            
            <div className="w-[240px] shrink-0 border-r bg-muted/10 overflow-y-auto flex flex-col p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Navigation Scopes</span>
              <div className="space-y-1">
                {SCOPES.map((scope) => {
                  const Icon = scope.icon;
                  return (
                    <div key={scope.id} className="space-y-0.5">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-2 h-9 text-sm font-medium",
                          !scope.active && "opacity-50 grayscale cursor-not-allowed hover:bg-transparent"
                        )}
                        disabled={!scope.active}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon weight={scope.active ? "fill" : "regular"} className={cn("size-4", scope.active ? "text-primary-blue text-opacity-80" : "text-muted-foreground")} />
                          <span className="truncate">{scope.title}</span>
                        </div>
                        {scope.items.length > 0 && <CaretDownIcon className="size-3 text-muted-foreground" />}
                      </Button>
                      
                      
                      {scope.items.length > 0 && scope.active && (
                        <div className="pl-6 space-y-0.5 mt-0.5 pb-2">
                          {scope.items.map((item) => (
                            <button
                              key={item}
                              onClick={() => setActiveScope(item)}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                                activeScope === item 
                                  ? "bg-primary-blue/10 text-primary-blue font-medium" 
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <FolderSimpleIcon weight={activeScope === item ? "fill" : "regular"} className="size-3.5 shrink-0" />
                              <span className="truncate text-left">{item}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

           
            
            <RepositoryView />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <StorageView />
          </div>
        )}
      </div> */}
    </div>
  );
}
