"use client";

import RepositoryViewNew from "@/components/school-admin/tabs/repository-view-new";
import StorageView from "@/components/school-admin/tabs/storage-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/motion-tabs";
import { UploadTargetSelection } from "@/types";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

const tabs = [
  {
    label: "Repository View",
    value: "repository",
  },
  {
    label: "Storage Usage",
    value: "usage",
  },
];

const DEFAULT_UPLOAD_TARGET: UploadTargetSelection = {
  scope: "SCHOOL_DOCUMENTS",
  scopeId: null,
  folderId: null,
};

export default function Repository() {
  const [activeTab, setActiveTab] = useState("repository");
  const [activeScope, setActiveScope] = useState<string>("SCHOOL_DOCUMENTS");
  const [uploadTarget, setUploadTarget] = useState<UploadTargetSelection>(
    DEFAULT_UPLOAD_TARGET,
  );

  const selectedFolderId = uploadTarget.folderId;
  const isRepositoryTab = activeTab === "repository";

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="px-8 py-6 shrink-0 flex items-center justify-between  gap-4 bg-background z-10 sticky top-0">
        <div>
          <h1 className="text-3xl font-assistant font-bold">
            School Repository
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, share, and organize all school documents securely.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 hidden md:block">
            <Input
              placeholder="Search files..."
              className="pl-9 sm:h-12 h-10 w-full rounded-xl bg-muted/30 border-border/80 focus-visible:ring-1 focus-visible:ring-offset-0 "
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
          {isRepositoryTab && (
            <>
              <Button
                variant="outline"
                className="sm:h-12 h-10 gap-2 shrink-0 rounded-xl"
              >
                <UploadSimpleIcon weight="bold" className="size-4" />
                Upload File
              </Button>
              <Button
                variant="primary"
                className="sm:h-12 h-10 gap-2 shrink-0 rounded-xl shadow-xs"
              >
                <PlusIcon weight="bold" className="size-4" />
                New Folder
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-8 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-2"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContents>
            <TabsContent value="repository">
              <RepositoryViewNew
                activeScope={activeScope}
                onActiveScopeChange={setActiveScope}
                selectedFolderId={selectedFolderId}
                onUploadTargetChange={setUploadTarget}
              />
            </TabsContent>
            <TabsContent value="usage">
              <StorageView />
            </TabsContent>
          </TabsContents>
        </Tabs>
      </div>
    </div>
  );
}
