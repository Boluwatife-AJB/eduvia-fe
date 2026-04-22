"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FolderIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  ShareNetworkIcon,
  TrashSimpleIcon,
  ClockCounterClockwiseIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import FileDetailSheet from "../modal/file-detail-sheet";
import {
  CaretDownIcon,
  FileDocIcon,
  FileIcon,
  FilePdfIcon,
  FileXlsIcon,
  FolderSimpleIcon,
  ImageIcon,
  MusicNoteIcon,
  VideoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { schoolDocumentsScopes } from "@/lib/data";
import { FolderContent, RepositoryFolder } from "@/types";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Mock Data
const FOLDERS = [
  {
    id: "1",
    name: "Policy Documents",
    fileCount: 42,
    lastModified: "2 days ago",
    creator: { name: "Admin Setup", avatar: "" },
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "2",
    name: "Handbooks",
    fileCount: 15,
    lastModified: "1 week ago",
    creator: { name: "System", avatar: "" },
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    id: "3",
    name: "Forms & Templates",
    fileCount: 28,
    lastModified: "1 month ago",
    creator: { name: "Principal Office", avatar: "" },
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export type FileRecord = {
  id: string;
  name: string;
  type: "pdf" | "video" | "audio" | "excel" | "word" | "image";
  size: string;
  version: number;
  uploadDate: string;
  uploader: string;
};

const FILES: FileRecord[] = [
  {
    id: "101",
    name: "Staff Code of Conduct.pdf",
    type: "pdf",
    size: "2.4 MB",
    version: 3,
    uploadDate: "Oct 12, 2025",
    uploader: "Admin Office",
  },
  {
    id: "102",
    name: "Welcome Assembly 2025.mp4",
    type: "video",
    size: "145 MB",
    version: 1,
    uploadDate: "Sep 01, 2025",
    uploader: "Media Dept",
  },
  {
    id: "103",
    name: "Annual Budget 2025.xlsx",
    type: "excel",
    size: "850 KB",
    version: 2,
    uploadDate: "Jan 10, 2025",
    uploader: "Finance Dept",
  },
  {
    id: "104",
    name: "School Anthem.mp3",
    type: "audio",
    size: "4.2 MB",
    version: 1,
    uploadDate: "Aug 15, 2024",
    uploader: "Music Dept",
  },
  {
    id: "105",
    name: "Parent Handbook.docx",
    type: "word",
    size: "1.2 MB",
    version: 5,
    uploadDate: "Aug 20, 2025",
    uploader: "Admissions",
  },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return (
        <div className="p-2 bg-red-500/10 text-red-500 rounded-md">PDF</div>
      );
    case "video":
      return (
        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-md">
          VID
        </div>
      );
    case "audio":
      return (
        <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-md">AUD</div>
      );
    case "excel":
      return (
        <div className="p-2 bg-green-500/10 text-green-500 rounded-md">XLS</div>
      );
    case "word":
      return (
        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">DOC</div>
      );
    case "image":
      return (
        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-md">
          IMG
        </div>
      );
    default:
      return (
        <div className="p-2 bg-gray-500/10 text-gray-500 rounded-md">FILE</div>
      );
  }
};

const getMimeTypeIcon = (mimeType: string) => {
  switch (mimeType) {
    case "application/pdf":
      return <FilePdfIcon weight="fill" className="size-4 shrink-0" />;
    case "video/mp4":
      return <VideoIcon weight="fill" className="size-4 shrink-0" />;
    case "audio/mp3":
      return <MusicNoteIcon weight="fill" className="size-4 shrink-0" />;
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return <FileXlsIcon weight="fill" className="size-4 shrink-0" />;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <FileDocIcon weight="fill" className="size-4 shrink-0" />;
    case "image/jpeg":
      return <ImageIcon weight="fill" className="size-4 shrink-0" />;
    default:
      return <FileIcon weight="fill" className="size-4 shrink-0" />;
  }
};

const fetchFolders = async (
  scope: string = "SCHOOL_DOCUMENTS",
  parentId?: string,
  scopeId?: string,
): Promise<RepositoryFolder[]> => {
  const response = await apiClient.get("/repository/folders", {
    params: {
      scope: scope || "SCHOOL_DOCUMENTS",
      parent_folder_id: parentId,
      scope_id: scopeId,
    },
  });
  return response.data.data;
};

const fetchFolderContent = async (folderId: string): Promise<FolderContent> => {
  const response = await apiClient.get(
    `/repository/folders/${folderId}/contents`,
  );
  return response.data.data;
};

export type UploadTargetSelection = {
  scope: string;
  scopeId: string | null;
  folderId: string | null;
};

interface RepositoryViewProps {
  activeScope: string;
  selectedFolderId: string | null;
  onActiveScopeChange: (scope: string) => void;
  onUploadTargetChange: (target: UploadTargetSelection) => void;
}

function ScopeFolderTree({
  folders,
  isLoading,
  selectedFolderId,
  onSelectFolder,
}: {
  folders: RepositoryFolder[] | undefined;
  isLoading: boolean;
  selectedFolderId: string | null;
  onSelectFolder: (folder: RepositoryFolder) => void;
}) {
  if (isLoading) {
    return (
      <div className="mt-1.5 pl-2 ml-2 border-l border-border/50 py-1">
        <p className="px-2 text-[11px] text-muted-foreground">
          Loading folders…
        </p>
      </div>
    );
  }

  if (!folders?.length) {
    return (
      <div className="mt-1.5 pl-2 ml-2 border-l border-border/50 py-1">
        <p className="px-2 text-[11px] text-muted-foreground">No folders yet</p>
      </div>
    );
  }

  const renderFolderNode = (folder: RepositoryFolder, depth = 0) => (
    <div key={folder.id} className="space-y-0.5">
      <button
        type="button"
        onClick={() => onSelectFolder(folder)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] transition-colors",
          depth > 0
            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
            : "font-medium text-foreground/90 hover:bg-muted/70",
          selectedFolderId === folder.id &&
            "bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/15",
        )}
      >
        <FolderSimpleIcon
          weight={selectedFolderId === folder.id ? "fill" : "regular"}
          className="size-4 shrink-0"
        />
        <span className="truncate">{folder.name}</span>
        {folder._count?.files != null ? (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/80">
            {folder._count.files}
          </span>
        ) : null}
      </button>

      {folder.children?.length ? (
        <div className="space-y-0.5 pl-3">
          {folder.children.map((child) => renderFolderNode(child, depth + 1))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="mt-1.5 pl-2 ml-2 space-y-2 border-l border-border/50">
      {folders.map((folder) => renderFolderNode(folder))}
    </div>
  );
}

export default function RepositoryView({
  activeScope,
  selectedFolderId,
  onActiveScopeChange,
  onUploadTargetChange,
}: RepositoryViewProps) {
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);

  const { data: folderContent, isPending: isFolderContentPending } = useQuery({
    queryKey: ["repository-folder-content", selectedFolderId],
    queryFn: () => fetchFolderContent(selectedFolderId ?? ""),
    enabled: Boolean(selectedFolderId && selectedFolderId !== null),
  });

  const { data: folders, isPending: isFoldersPending } = useQuery({
    queryKey: ["repository-folders", activeScope],
    queryFn: () => fetchFolders(activeScope),
    enabled: Boolean(activeScope),
  });

  return (
    <div className="flex">
      {/* Navigation Scopes */}
      <div className="w-[240px] h-[calc(100vh-16rem)] shrink-0 border-r bg-muted/10 overflow-y-auto flex flex-col p-4 custom-scrollbar">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Navigation Scopes
        </span>
        <div className="space-y-1">
          {schoolDocumentsScopes.map((scope) => {
            const Icon = scope.icon;
            return (
              <div key={scope.id} className="space-y-0.5">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between px-2 h-9 text-sm font-medium",
                    !scope.active &&
                      "opacity-50 grayscale cursor-not-allowed hover:bg-transparent",
                  )}
                  disabled={!scope.active}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      weight={scope.active ? "fill" : "regular"}
                      className={cn(
                        "size-4",
                        scope.active
                          ? "text-primary-blue text-opacity-80"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">{scope.title}</span>
                  </div>
                  {scope.items.length > 0 && (
                    <CaretDownIcon className="size-3 text-muted-foreground" />
                  )}
                </Button>

                {scope.items.length > 0 && scope.active && (
                  <div className="pl-6 space-y-0.5 mt-0.5 pb-2">
                    {scope.items.map((item) => (
                      <div key={item.value} className="space-y-0">
                        <button
                          type="button"
                          onClick={() => {
                            onActiveScopeChange(item.value);
                            onUploadTargetChange({
                              scope: item.value,
                              scopeId: null,
                              folderId: null,
                            });
                            // setSelectedFolderId(null);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                            activeScope === item.value
                              ? "bg-primary-blue/10 text-primary-blue font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <FolderSimpleIcon
                            weight={
                              activeScope === item.value ? "fill" : "regular"
                            }
                            className="size-3.5 shrink-0"
                          />
                          <span className="truncate text-left">
                            {item.label}
                          </span>
                        </button>
                        {activeScope === item.value ? (
                          <>
                            <ScopeFolderTree
                              folders={folders}
                              isLoading={isFoldersPending}
                              selectedFolderId={selectedFolderId}
                              onSelectFolder={(folder) => {
                                onUploadTargetChange({
                                  scope: folder.scope,
                                  scopeId: folder.scope_id,
                                  folderId: folder.id,
                                });
                              }}
                            />
                            {selectedFolderId ? (
                              <div className="mt-1.5 pl-2 ml-2 space-y-0.5 border-l border-border/50 py-1">
                                {isFolderContentPending ? (
                                  <p className="px-2 text-[11px] text-muted-foreground">
                                    Loading folder content…
                                  </p>
                                ) : null}
                                {folderContent &&
                                folderContent.sub_folders.length === 0 &&
                                folderContent.files.length === 0 ? (
                                  <p className="px-2 text-[11px] text-muted-foreground">
                                    Folder is empty
                                  </p>
                                ) : null}
                                {folderContent?.sub_folders.map((folder) => (
                                  <button
                                    key={folder.id}
                                    type="button"
                                    onClick={() =>
                                      onUploadTargetChange({
                                        scope: folder.scope,
                                        scopeId: folder.scope_id,
                                        folderId: folder.id,
                                      })
                                    }
                                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  >
                                    <FolderSimpleIcon className="size-4 shrink-0" />
                                    <span className="truncate">
                                      {folder.name}
                                    </span>
                                  </button>
                                ))}
                                {folderContent?.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  >
                                    {/* {getFileIcon(
                                      file.versions[0].mime_type.split(
                                        "/"
                                      )[1] as string
                                    )} */}
                                    {getMimeTypeIcon(
                                      file.versions[0].mime_type,
                                    )}
                                    <span className="truncate">
                                      {file.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Repository View */}
      <div className="flex-1 pl-6 pr-4 h-[calc(100vh-16rem)] pt-6 space-y-8 min-h-0 overflow-y-auto custom-scrollbar pb-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">
            School Repository
          </span>
          <CaretRightIcon className="size-3 mx-2" />
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Administrative
          </span>
          <CaretRightIcon className="size-3 mx-2" />
          <span className="text-foreground font-medium">School Documents</span>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOLDERS.map((folder) => (
            <Card
              key={folder.id}
              className="p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 border border-border/50"
            >
              <div className="flex justify-between items-start">
                <div className={cn("p-3 rounded-xl", folder.bg, folder.color)}>
                  <FolderIcon weight="fill" className="size-6" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <DotsThreeIcon weight="bold" className="size-5" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open Folder</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {folder.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span>{folder.fileCount} files</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>Modified {folder.lastModified}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">
                    {folder.creator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Created by {folder.creator.name}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* File List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-assistant">
            Files in School Documents
          </h3>
          <Card className="overflow-hidden border border-border/50">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FILES.map((file) => (
                  <TableRow
                    key={file.id}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => setSelectedFile(file)}
                  >
                    <TableCell>{getFileIcon(file.type)}</TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.size}
                    </TableCell>
                    <TableCell>
                      {file.version > 1 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-blue-500/10 text-blue-600 border-blue-500/20"
                        >
                          V{file.version}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm pl-2">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.uploadDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {file.uploader.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">
                          {file.uploader}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex justify-end pr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <DotsThreeIcon
                                  weight="bold"
                                  className="size-5"
                                />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>
                              <DownloadSimpleIcon className="size-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ShareNetworkIcon className="size-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClockCounterClockwiseIcon className="size-4 mr-2" />
                              Version History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <TrashSimpleIcon className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <FileDetailSheet
          file={selectedFile}
          open={selectedFile !== null}
          onOpenChange={(open) => !open && setSelectedFile(null)}
        />
      </div>
    </div>
  );
}
