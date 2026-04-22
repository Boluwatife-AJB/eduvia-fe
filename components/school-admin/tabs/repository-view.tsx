"use client";

import { Fragment, useMemo, useState } from "react";
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
import { cn, formatBytes } from "@/lib/utils";
import {
  FolderIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  ShareNetworkIcon,
  TrashSimpleIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react";
import FileDetailSheet from "../modal/file-detail-sheet";
import {
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
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DEFAULT_OPEN_NAV_SCOPE_IDS = schoolDocumentsScopes
  .filter((s) => s.active && s.items.length > 0)
  .map((s) => s.id);

const FOLDER_CARD_PALETTE = [
  { color: "text-blue-500", bg: "bg-blue-500/10" },
  { color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { color: "text-amber-500", bg: "bg-amber-500/10" },
  { color: "text-violet-500", bg: "bg-violet-500/10" },
] as const;

type SubfolderGridItem =
  | RepositoryFolder
  | FolderContent["sub_folders"][number];

function getFolderListFileCount(f: SubfolderGridItem): number | null {
  if ("_count" in f && f._count != null && typeof f._count.files === "number") {
    return f._count.files;
  }
  return null;
}

function formatFolderUpdatedAt(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

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

type SelectableFolder = Pick<
  RepositoryFolder,
  "id" | "scope" | "scope_id" | "name"
>;

type BreadcrumbSeg =
  | { type: "root" }
  | { type: "group"; label: string }
  | { type: "scope"; label: string }
  | { type: "folder"; id: string; name: string };

function folderInTree(
  list: RepositoryFolder[] | undefined,
  id: string,
): boolean {
  if (!list?.length) return false;
  for (const f of list) {
    if (f.id === id) return true;
    if (folderInTree(f.children, id)) return true;
  }
  return false;
}

function findFolderById(
  list: RepositoryFolder[] | undefined,
  id: string,
): RepositoryFolder | null {
  if (!list?.length) return null;
  for (const f of list) {
    if (f.id === id) return f;
    const inChild = findFolderById(f.children, id);
    if (inChild) return inChild;
  }
  return null;
}

function getFolderNamePath(
  list: RepositoryFolder[] | undefined,
  targetId: string,
  path: { id: string; name: string }[] = [],
): { id: string; name: string }[] | null {
  if (!list?.length) return null;
  for (const f of list) {
    const next = [...path, { id: f.id, name: f.name }];
    if (f.id === targetId) return next;
    const inChild = getFolderNamePath(f.children, targetId, next);
    if (inChild) return inChild;
  }
  return null;
}

function ScopeFolderTree({
  folders,
  isLoading,
  selectedFolderId,
  onSelectFolder,
  folderContent,
  isFolderContentPending,
}: {
  folders: RepositoryFolder[] | undefined;
  isLoading: boolean;
  selectedFolderId: string | null;
  onSelectFolder: (folder: SelectableFolder) => void;
  folderContent: FolderContent | undefined;
  isFolderContentPending: boolean;
}) {
  if (isLoading) {
    return (
      <div className="mt-1.5 pl-2 ml-2 border-l border-border/50 py-1">
        <p className="px-2 text-[11px] text-muted-foreground flex items-center">
          <Spinner className="size-4 " />
          <span className="ml-2">Loading folders…</span>
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

  const renderFolderNode = (folder: RepositoryFolder, depth = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const isContentForThisFolder =
      isSelected && folderContent && folderContent.folder.id === folder.id;
    // Subfolders in the /contents response usually mirror `folder.children` from
    // the folder tree; listing both caused duplicate rows (often in different order).
    const subfoldersOnlyInContents =
      isContentForThisFolder && !isFolderContentPending
        ? folderContent.sub_folders.filter(
            (s) => !folder.children?.some((c) => c.id === s.id),
          )
        : [];
    const hasOrphanSubfolders = subfoldersOnlyInContents.length > 0;
    const hasNoChildren = !folder.children?.length;
    return (
      <div key={folder.id} className="space-y-0.5">
        <button
          type="button"
          onClick={() => onSelectFolder(folder)}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-left text-[11px] transition-colors",
            depth > 0
              ? "text-muted-foreground hover:bg-muted hover:text-foreground"
              : "font-medium text-foreground/90 hover:bg-muted/70",
            isSelected &&
              "bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/15",
          )}
        >
          <FolderSimpleIcon
            weight={isSelected ? "fill" : "regular"}
            className="size-4 shrink-0"
          />
          <span className="truncate">{folder.name}</span>
          {folder._count?.files != null ? (
            <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/80">
              {folder._count.files}
            </span>
          ) : null}
        </button>

        {isSelected ? (
          <div className="mt-0.5 pl-2 ml-0.5 space-y-0.5 border-l border-border/50 py-0.5">
            {isFolderContentPending ? (
              <p className="px-1 text-[11px] text-muted-foreground flex items-center">
                <Spinner className="size-4 " />
                <span className="ml-2">Loading folder content…</span>
              </p>
            ) : null}
            {!isFolderContentPending && isContentForThisFolder
              ? subfoldersOnlyInContents.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectFolder(sub)}
                    className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <FolderSimpleIcon className="size-4 shrink-0" />
                    <span className="truncate">{sub.name}</span>
                  </button>
                ))
              : null}
            {isContentForThisFolder && !isFolderContentPending
              ? folderContent.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {getMimeTypeIcon(file.versions[0].mime_type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                ))
              : null}
            {!isFolderContentPending &&
            isContentForThisFolder &&
            !hasOrphanSubfolders &&
            !folderContent?.files.length &&
            hasNoChildren ? (
              <p className="px-1 text-[11px] text-muted-foreground">
                Folder is empty
              </p>
            ) : null}
          </div>
        ) : null}

        {folder.children?.length ? (
          <div className="space-y-0.5 pl-3">
            {folder.children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

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

  const selectedFolderIsInTree = Boolean(
    selectedFolderId && folders && folderInTree(folders, selectedFolderId),
  );

  const folderNamePath = useMemo(() => {
    if (!selectedFolderId) return null;
    const fromTree = getFolderNamePath(folders, selectedFolderId);
    if (fromTree) return fromTree;
    if (folderContent?.folder?.id === selectedFolderId) {
      return [{ id: folderContent.folder.id, name: folderContent.folder.name }];
    }
    return null;
  }, [selectedFolderId, folders, folderContent]);

  /** Folders to show in the main grid: scope root when no folder is selected, otherwise children of the selected folder. */
  const scopeOrParentFolders = useMemo((): SubfolderGridItem[] | null => {
    if (!activeScope) return null;
    if (!selectedFolderId) {
      if (isFoldersPending) return null;
      if (!folders?.length) return [];
      return folders;
    }
    if (isFolderContentPending) return null;
    if (!folderContent || folderContent.folder.id !== selectedFolderId) {
      return null;
    }
    if (folderContent.sub_folders.length > 0) {
      return folderContent.sub_folders;
    }
    const node = findFolderById(folders, selectedFolderId);
    if (node?.children?.length) {
      return node.children;
    }
    return [];
  }, [
    activeScope,
    selectedFolderId,
    isFoldersPending,
    isFolderContentPending,
    folderContent,
    folders,
  ]);

  let groupTitle: string | null = null;
  let itemLabel = activeScope;
  for (const s of schoolDocumentsScopes) {
    const item = s.items.find((i) => i.value === activeScope);
    if (item) {
      groupTitle = s.title;
      itemLabel = item.label;
      break;
    }
  }

  const breadcrumbSegments: BreadcrumbSeg[] = (() => {
    const segs: BreadcrumbSeg[] = [{ type: "root" }];
    if (groupTitle) {
      segs.push({ type: "group", label: groupTitle });
    }
    segs.push({ type: "scope", label: itemLabel });
    if (folderNamePath) {
      for (const f of folderNamePath) {
        segs.push({ type: "folder", id: f.id, name: f.name });
      }
    }
    return segs;
  })();

  return (
    <div className="flex">
      {/* Navigation Scopes */}
      <div className="w-[240px] h-[calc(100vh-16rem)] shrink-0 border-r bg-muted/10 overflow-y-auto flex flex-col p-1 custom-scrollbar">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Navigation Scopes
        </span>
        <Accordion
          multiple
          defaultValue={DEFAULT_OPEN_NAV_SCOPE_IDS}
          className="w-full gap-0.5"
        >
          {/* TODO: Add drag and drop functionality to reorder the scopes, files and folders. */}
          {schoolDocumentsScopes.map((scope) => {
            const Icon = scope.icon;
            const hasNavItems = scope.items.length > 0 && scope.active;

            return (
              <AccordionItem
                key={scope.id}
                value={scope.id}
                disabled={!scope.active}
                className="border-0 last:border-0 not-last:border-0"
              >
                <AccordionTrigger
                  className={cn(
                    "h-9 min-h-9 gap-0 py-0 px-2 w-full",
                    "flex-nowrap items-center justify-between",
                    "rounded-md border-0 bg-transparent shadow-none",
                    "text-left text-sm font-medium",
                    "hover:no-underline",
                    "focus-visible:ring-2 focus-visible:ring-ring/40",
                    "data-open:bg-transparent",
                    scope.active
                      ? "text-foreground hover:bg-muted/50"
                      : "cursor-not-allowed opacity-50 grayscale",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-1">
                    <Icon
                      weight={scope.active ? "fill" : "regular"}
                      className={cn(
                        "size-4 shrink-0",
                        scope.active
                          ? "text-primary-blue text-opacity-80"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">{scope.title}</span>
                  </div>
                </AccordionTrigger>
                {hasNavItems ? (
                  <AccordionContent className="p-0 pt-0.5 pb-2 [&>div]:h-auto [&>div]:p-0">
                    <div className="space-y-0.5 pl-6 pr-0 pb-0.5">
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
                                folderContent={folderContent}
                                isFolderContentPending={isFolderContentPending}
                                onSelectFolder={(folder) => {
                                  onUploadTargetChange({
                                    scope: folder.scope,
                                    scopeId: folder.scope_id,
                                    folderId: folder.id,
                                  });
                                }}
                              />
                              {selectedFolderId &&
                              !selectedFolderIsInTree &&
                              !isFoldersPending ? (
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
                                  {folderContent?.sub_folders.map((f) => (
                                    <button
                                      key={f.id}
                                      type="button"
                                      onClick={() =>
                                        onUploadTargetChange({
                                          scope: f.scope,
                                          scopeId: f.scope_id,
                                          folderId: f.id,
                                        })
                                      }
                                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                      <FolderSimpleIcon className="size-4 shrink-0" />
                                      <span className="truncate">{f.name}</span>
                                    </button>
                                  ))}
                                  {folderContent?.files.map((file) => (
                                    <div
                                      key={file.id}
                                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground"
                                    >
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
                  </AccordionContent>
                ) : null}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      ;{/* Repository View */}
      <div className="flex-1 pl-6 pr-4 h-[calc(100vh-16rem)] pt-6 space-y-8 min-h-0 overflow-y-auto custom-scrollbar pb-6">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbSegments.map((seg, index) => {
              const isCurrent = index === breadcrumbSegments.length - 1;
              const key =
                seg.type === "root"
                  ? "root"
                  : seg.type === "group"
                    ? "group"
                    : seg.type === "scope"
                      ? "scope"
                      : `folder-${seg.id}`;
              const label =
                seg.type === "root"
                  ? "School Repository"
                  : seg.type === "group" || seg.type === "scope"
                    ? seg.label
                    : seg.name;

              const goToScopeRoot = () => {
                onUploadTargetChange({
                  scope: activeScope,
                  scopeId: null,
                  folderId: null,
                });
              };

              return (
                <Fragment key={key}>
                  {index > 0 ? (
                    <BreadcrumbSeparator className="mx-0.5" />
                  ) : null}
                  <BreadcrumbItem>
                    {isCurrent ? (
                      <BreadcrumbPage className="font-assistant font-medium text-foreground">
                        {label}
                      </BreadcrumbPage>
                    ) : null}
                    {!isCurrent && seg.type === "root" ? (
                      <BreadcrumbLink
                        className="text-sm"
                        render={
                          <button
                            type="button"
                            className="text-muted-foreground"
                            onClick={goToScopeRoot}
                          />
                        }
                      >
                        {label}
                      </BreadcrumbLink>
                    ) : null}
                    {!isCurrent && seg.type === "group" ? (
                      <span className="text-muted-foreground max-w-40 truncate sm:max-w-none text-sm">
                        {label}
                      </span>
                    ) : null}
                    {!isCurrent && seg.type === "scope" ? (
                      <BreadcrumbLink
                        className="text-sm"
                        render={
                          <button
                            type="button"
                            className="text-muted-foreground"
                            onClick={goToScopeRoot}
                          />
                        }
                      >
                        {label}
                      </BreadcrumbLink>
                    ) : null}
                    {!isCurrent && seg.type === "folder" ? (
                      <BreadcrumbLink
                        className="text-sm"
                        render={
                          <button
                            type="button"
                            className="text-muted-foreground max-w-40 truncate"
                            onClick={() => {
                              const f = findFolderById(folders, seg.id);
                              if (f) {
                                onUploadTargetChange({
                                  scope: f.scope,
                                  scopeId: f.scope_id,
                                  folderId: f.id,
                                });
                              }
                            }}
                          />
                        }
                      >
                        {label}
                      </BreadcrumbLink>
                    ) : null}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {scopeOrParentFolders && scopeOrParentFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scopeOrParentFolders.map((folder, index) => {
              const palette =
                FOLDER_CARD_PALETTE[index % FOLDER_CARD_PALETTE.length];
              const fileCount = getFolderListFileCount(folder);
              return (
                <Card
                  key={folder.id}
                  className="p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 border border-border/50"
                  onClick={() =>
                    onUploadTargetChange({
                      scope: folder.scope,
                      scopeId: folder.scope_id,
                      folderId: folder.id,
                    })
                  }
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        palette.bg,
                        palette.color,
                      )}
                    >
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
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                      {folder.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                      {fileCount != null ? (
                        <span>
                          {fileCount} {fileCount === 1 ? "file" : "files"}
                        </span>
                      ) : null}
                      {fileCount != null ? (
                        <span className="w-1 h-1 rounded-full bg-border" />
                      ) : null}
                      <span>
                        Updated {formatFolderUpdatedAt(folder.updated_at)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {folder.name.charAt(0).toUpperCase() || "F"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      Created {formatFolderUpdatedAt(folder.created_at)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}

        {/* File List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-assistant">
            Files in{" "}
            {selectedFolderId ? folderContent?.folder.name : activeScope}
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
                {folderContent?.files.map((file) => (
                  <TableRow
                    key={file.id}
                    className="cursor-pointer hover:bg-muted/20"
                    // onClick={() => setSelectedFile(file)}
                  >
                    <TableCell>
                      {getFileIcon(file.versions[0].mime_type)}
                    </TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatBytes(Number(file.versions[0].file_size_bytes))}
                    </TableCell>
                    <TableCell>
                      {file.versions.length > 1 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-blue-500/10 text-blue-600 border-blue-500/20"
                        >
                          V{file.versions.length}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm pl-2">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(file.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {/* {file.versions[0].uploaded_by.charAt(0)} */}
                            BW
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">
                          {/* {file.versions[0].uploaded_by} */}
                          Bolu Wale
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
                {/* {FILES.map((file) => (
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
                ))} */}
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
      ; ; ; ; ;
    </div>
  );
}
