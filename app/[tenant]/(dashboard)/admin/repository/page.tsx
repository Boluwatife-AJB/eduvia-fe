"use client";

import CreateFolderModal from "@/components/school-admin/modal/create-folder";
import UploadRepositoryFileModal from "@/components/school-admin/modal/upload-repository-file";
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
import { uploadFileToStorage } from "@/lib/services/file-upload";
import { createRepositoryFile } from "@/lib/services/repository-files";
import { localDateTimeToIso8601 } from "@/lib/utils";
import { UploadRepositoryFileFormValues, UploadTargetSelection } from "@/types";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const selectedFolderId = uploadTarget.folderId;
  const isRepositoryTab = activeTab === "repository";

  const { mutateAsync: uploadRepositoryFile, isPending: isUploadingFile } =
    useMutation({
      mutationFn: async ({
        file,
        form,
        target,
        activeScopeFallback,
      }: {
        file: File;
        form: UploadRepositoryFileFormValues;
        target: UploadTargetSelection;

        activeScopeFallback: string;
      }) => {
        if (!target.folderId) {
          throw new Error("Please select a folder before uploading a file.");
        }
        const scope = target.scope?.trim() || activeScopeFallback.trim();
        if (!scope) {
          throw new Error(
            "Missing document scope. Select a folder and try again.",
          );
        }
        // API expects this to be the selected nav scope’s `value` (e.g. CLASS_DOCUMENTS).
        const scopeId = activeScopeFallback.trim() || scope || null;

        const uploadedFile = await uploadFileToStorage(file);

        const tags = form.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean);

        const descriptionTrimmed = form.description.trim();

        const expiryDate = form.expires_at.date?.trim() ?? "";
        const expiryTime = form.expires_at.time?.trim() ?? "";
        const expires_at = expiryDate
          ? localDateTimeToIso8601(expiryDate, expiryTime || "12:00")
          : null;

        const changeTrimmed = form.change_note.trim();
        const change_note = changeTrimmed === "" ? "" : changeTrimmed;

        return createRepositoryFile({
          scope,
          scope_id: scopeId,
          folder_id: target.folderId,
          name: form.name.trim(),
          description: descriptionTrimmed === "" ? null : descriptionTrimmed,
          tags,
          file_url: uploadedFile.file_url,
          file_key: uploadedFile.file_key,
          expires_at,
          change_note,
          linked_record_type: null,
          linked_record_id: null,
        });
      },
      onSuccess: () => {
        toast.success("File uploaded successfully");
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Failed to upload file";
        toast.error(message);
      },
    });

  const handleUploadClick = () => {
    if (activeTab !== "repository") {
      toast.error("Switch to Repository View before uploading.");
      return;
    }

    if (!uploadTarget.folderId) {
      toast.error("Please select a folder before uploading a file.");
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setPendingUploadFile(selectedFile);
    setIsUploadModalOpen(true);
    event.target.value = "";
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    setPendingUploadFile(null);
  };

  const handleUploadModalSubmit = async (
    values: UploadRepositoryFileFormValues,
  ) => {
    if (!pendingUploadFile) return;
    await uploadRepositoryFile({
      file: pendingUploadFile,
      form: values,
      target: uploadTarget,
      activeScopeFallback: activeScope,
    });
  };

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
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={handleFileSelection}
              />
              <Button
                variant="outline"
                className="sm:h-12 h-10 gap-2 shrink-0 rounded-xl"
                onClick={handleUploadClick}
                disabled={isUploadingFile}
              >
                <UploadSimpleIcon weight="bold" className="size-4" />
                {isUploadingFile ? "Uploading..." : "Upload File"}
              </Button>
              <Button
                variant="primary"
                className="sm:h-12 h-10 gap-2 shrink-0 rounded-xl shadow-xs"
                onClick={() => setIsCreateFolderModalOpen(true)}
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

      <CreateFolderModal
        open={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        parentFolderId={selectedFolderId}
      />

      <UploadRepositoryFileModal
        open={isUploadModalOpen}
        file={pendingUploadFile}
        isSubmitting={isUploadingFile}
        onClose={handleUploadModalClose}
        onSubmit={handleUploadModalSubmit}
        uploadContext={uploadTarget}
        activeScopeFallback={activeScope}
      />
    </div>
  );
}
