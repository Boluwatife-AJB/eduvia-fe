import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api";
import {
  filesTestData,
  foldersTestData,
  schoolDocumentsScopes,
} from "@/lib/data";
import { cn, formatBytes } from "@/lib/utils";
import {
  FolderContent,
  RepositoryFolder,
  SelectableFolder,
  UploadTargetSelection,
} from "@/types";
import {
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  FileDocIcon,
  FileIcon,
  FilePdfIcon,
  FileXlsIcon,
  FolderIcon,
  FolderSimpleIcon,
  ImageIcon,
  ImagesIcon,
  MusicNoteIcon,
  ShareNetworkIcon,
  TrashSimpleIcon,
  VideoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useQuery } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { SetStateAction } from "react";

// FIXME: When a folder with content is clicked it doesn't display the content. The folder content is not fetched.

// Types
interface RepositoryViewNewProps {
  selectedFolderId: string | null;
  activeScope: string;
  onActiveScopeChange: (value: SetStateAction<string>) => void;
  onUploadTargetChange: (value: SetStateAction<UploadTargetSelection>) => void;
}

interface ScopeFolderTreeProps {
  folders: RepositoryFolder[] | undefined;
  isLoading: boolean;
  selectedFolderId: string | null;
  onSelectFolder: (folder: SelectableFolder) => void;
  folderContent: FolderContent | undefined;
  isFolderContentPending: boolean;
}

interface FolderNodeProps {
  folder: RepositoryFolder;
  depth: number;
  selectedFolderId: string | null;
  folderContent: FolderContent | undefined;
  isFolderContentPending: boolean;
  onSelectFolder: (folder: SelectableFolder) => void;
}

interface FolderContentListProps {
  folderContent: FolderContent | undefined;
  isLoading: boolean;
  onSelectFolder: (folder: SelectableFolder) => void;
}

// Constants
const folderCardPalette = [
  { color: "text-blue-500", bg: "bg-blue-500/10" },
  { color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { color: "text-amber-500", bg: "bg-amber-500/10" },
  { color: "text-violet-500", bg: "bg-violet-500/10" },
];

const MIME_ICON_MAP: Record<string, React.ElementType> = {
  "application/pdf": FilePdfIcon,
  "application/msword": FileDocIcon,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    FileDocIcon,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    FileXlsIcon,
  "image/jpeg": ImageIcon,
  "image/png": ImagesIcon,
  "audio/mpeg": MusicNoteIcon,
  "audio/mp3": MusicNoteIcon,
  "video/mp4": VideoIcon,
  "video/mkv": VideoIcon,
};

// Style Variants
const sidebarItemVariants = cva(
  "flex w-full justify-start items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors hover:no-underline",
  {
    variants: {
      active: {
        true: "bg-primary-blue/10 text-primary-blue font-medium",
        false: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
    },
  },
);

const folderNodeButtonVariants = cva(
  "flex w-full justify-start items-center gap-1.5 rounded-md px-2 py-2 text-left text-[11px] transition-colors hover:no-underline",
  {
    variants: {
      depth: {
        root: "font-medium text-foreground/90 hover:bg-muted/70",
        nested: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      selected: {
        true: "bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/15",
        false: "",
      },
    },
  },
);

const scopeTriggerVariants = cva(
  [
    "h-9 min-h-9 gap-0 py-0 px-2 w-full",
    "flex-nowrap items-center justify-between",
    "rounded-md border-0 bg-transparent shadow-none",
    "text-left text-sm font-medium",
    "hover:no-underline",
    "focus-visible:ring-2 focus-visible:ring-ring/40",
    "data-open:bg-transparent",
  ],
  {
    variants: {
      active: {
        true: "text-foreground hover:bg-muted/50",
        false: "cursor-not-allowed opacity-50 grayscale",
      },
    },
  },
);

// Utility Functions
function formatFolderDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

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

/**
 * Derives all state needed to render a single folder node.
 * Centralises the boolean logic that was previously scattered across JSX.
 */
function deriveFolderNodeState(
  folder: RepositoryFolder,
  selectedFolderId: string | null,
  folderContent: FolderContent | undefined,
  isFolderContentPending: boolean,
) {
  const isSelected = selectedFolderId === folder.id;

  // Content is considered "loaded" only when this specific folder is selected,
  // the query has settled, and the response belongs to this folder.
  const isContentLoaded =
    isSelected &&
    !isFolderContentPending &&
    folderContent?.folder.id === folder.id;

  // Subfolders returned by /contents that aren't already in the tree
  // (avoids duplicate rows when the API mirrors folder.children).
  const orphanSubfolders = isContentLoaded
    ? folderContent!.sub_folders.filter(
        (s) => !folder.children?.some((c) => c.id === s.id),
      )
    : [];

  const isEmpty =
    isContentLoaded &&
    orphanSubfolders.length === 0 &&
    !folderContent!.files.length &&
    !folder.children?.length;

  return { isSelected, isContentLoaded, orphanSubfolders, isEmpty };
}

// Shared Primitive Components
function FileTypeIcon({
  mimeType,
  size = "size-6",
  weight = "regular",
}: {
  mimeType: string;
  size?: string;
  weight?: string;
}) {
  const Icon = MIME_ICON_MAP[mimeType] ?? FileIcon;
  return <Icon weight={weight} className={cn(size, "shrink-0")} />;
}

function SidebarMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 text-[11px] text-muted-foreground flex items-center gap-2">
      {children}
    </p>
  );
}

/**
 * Renders the sub-folders and files of a selected folder.
 * Used by both FolderNode (in-tree) and the orphan block (out-of-tree),
 * eliminating the previous duplication.
 */
function FolderContentList({
  folderContent,
  isLoading,
  onSelectFolder,
}: FolderContentListProps) {
  if (isLoading) {
    return (
      <SidebarMessage>
        <Spinner className="size-4" />
        Loading folder content…
      </SidebarMessage>
    );
  }

  if (!folderContent) return null;

  const isEmpty =
    folderContent.sub_folders.length === 0 && folderContent.files.length === 0;

  if (isEmpty) {
    return <SidebarMessage>Folder is empty</SidebarMessage>;
  }

  return (
    <>
      {folderContent.sub_folders.map((f) => (
        <Button
          key={f.id}
          type="button"
          variant="link"
          onClick={() => onSelectFolder(f)}
          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:no-underline"
        >
          <FolderSimpleIcon className="size-4 shrink-0" />
          <span className="truncate">{f.name}</span>
        </Button>
      ))}
      {folderContent.files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground"
        >
          <FileTypeIcon
            mimeType={file.versions[0].mime_type}
            size="size-4"
            weight="fill"
          />
          <span className="truncate">{file.name}</span>
        </div>
      ))}
    </>
  );
}

// Folder Node
/**
 * A single recursive node in the sidebar folder tree.
 * Previously a closure inside ScopeFolderTree; extracting it as a proper
 * component makes it independently testable and allows React.memo if needed.
 */
function FolderNode({
  folder,
  depth,
  selectedFolderId,
  folderContent,
  isFolderContentPending,
  onSelectFolder,
}: FolderNodeProps) {
  const { isSelected, isContentLoaded, orphanSubfolders, isEmpty } =
    deriveFolderNodeState(
      folder,
      selectedFolderId,
      folderContent,
      isFolderContentPending,
    );

  return (
    <div key={folder.id} className="space-y-0.5">
      <Button
        type="button"
        variant="link"
        onClick={() => onSelectFolder(folder)}
        className={folderNodeButtonVariants({
          depth: depth > 0 ? "nested" : "root",
          selected: isSelected,
        })}
      >
        <FolderSimpleIcon
          weight={isSelected ? "fill" : "regular"}
          className="size-4 shrink-0"
        />
        <span className="truncate">{folder.name}</span>
        {folder._count?.files != null && (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/80">
            {folder._count.files}
          </span>
        )}
      </Button>

      {isSelected && (
        <div className="mt-0.5 pl-2 ml-0.5 space-y-0.5 border-l border-border/50 py-0.5">
          {/* Pending state */}
          {isFolderContentPending && (
            <SidebarMessage>
              <Spinner className="size-4" />
              Loading folder content…
            </SidebarMessage>
          )}

          {/* Orphan subfolders (in API response but not in tree children) */}
          {isContentLoaded &&
            orphanSubfolders.map((sub) => (
              <Button
                key={sub.id}
                type="button"
                variant="link"
                onClick={() => onSelectFolder(sub)}
                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:no-underline"
              >
                <FolderSimpleIcon className="size-4 shrink-0" />
                <span className="truncate">{sub.name}</span>
              </Button>
            ))}

          {/* Files */}
          {isContentLoaded &&
            folderContent!.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground"
              >
                <FileTypeIcon
                  mimeType={file.versions[0].mime_type}
                  size="size-4"
                  weight="fill"
                />
                <span className="truncate">{file.name}</span>
              </div>
            ))}

          {/* Empty state */}
          {isEmpty && <SidebarMessage>Folder is empty</SidebarMessage>}

          {/* Recursive children */}
          {!!folder.children?.length && (
            <div className="space-y-0.5">
              {folder.children.map((child) => (
                <FolderNode
                  key={child.id}
                  folder={child}
                  depth={depth + 1}
                  selectedFolderId={selectedFolderId}
                  folderContent={folderContent}
                  isFolderContentPending={isFolderContentPending}
                  onSelectFolder={onSelectFolder}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScopeFolderTree({
  folders,
  isLoading,
  selectedFolderId,
  onSelectFolder,
  folderContent,
  isFolderContentPending,
}: ScopeFolderTreeProps) {
  if (isLoading) {
    return (
      <div className="mt-1.5 pl-2 ml-2 border-l border-border/50 py-1">
        <SidebarMessage>
          <Spinner className="size-4" />
          Loading folders…
        </SidebarMessage>
      </div>
    );
  }

  if (!folders?.length) {
    return (
      <div className="mt-1.5 pl-2 ml-2 border-l border-border/50 py-1">
        <SidebarMessage>No folders yet</SidebarMessage>
      </div>
    );
  }

  return (
    <div className="mt-1.5 pl-2 ml-2 space-y-2 border-l border-border/50">
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          selectedFolderId={selectedFolderId}
          folderContent={folderContent}
          isFolderContentPending={isFolderContentPending}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </div>
  );
}

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

export default function RepositoryViewNew({
  activeScope,
  onActiveScopeChange,
  selectedFolderId,
  onUploadTargetChange,
}: RepositoryViewNewProps) {
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

  // Whether the orphan block (folder selected but not found in tree) should show
  const showOrphanBlock =
    Boolean(selectedFolderId) && !selectedFolderIsInTree && !isFoldersPending;

  return (
    <div className="flex ">
      {/* Navigation scopes (Sidebar) */}
      <div className="w-[240px] h-[calc(100vh-16rem)] shrink-0 border-r bg-muted/10 overflow-y-auto flex flex-col p-1 pt-2 custom-scrollbar">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Navigation Scopes
        </span>

        <Accordion className="w-full gap-0.5">
          {schoolDocumentsScopes.map((scope) => {
            const hasNavItems = scope.items.length > 0 && scope.active;

            return (
              <AccordionItem
                key={scope.id}
                value={scope.id}
                disabled={!scope.active}
                className="border-0 last:border-0 not-last:border-0"
              >
                <AccordionTrigger
                  className={scopeTriggerVariants({ active: scope.active })}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-1">
                    <scope.icon
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

                {hasNavItems && (
                  <AccordionContent className="p-0 pt-0.5 pb-2 [&>div]:h-auto [&>div]:p-0">
                    <div className="space-y-0.5 pl-3! pr-0 pb-0.5">
                      {scope.items.map((item) => {
                        const isActiveItem = activeScope === item.value;

                        return (
                          <div key={item.value} className="space-y-0">
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => onActiveScopeChange(item.value)}
                              className={sidebarItemVariants({
                                active: isActiveItem,
                              })}
                            >
                              <FolderSimpleIcon
                                weight={isActiveItem ? "fill" : "regular"}
                                className="size-3.5 shrink-0"
                              />
                              <span className="truncate text-left">
                                {item.label}
                              </span>
                            </Button>

                            {isActiveItem && (
                              <>
                                <ScopeFolderTree
                                  folders={folders}
                                  isLoading={isFoldersPending}
                                  selectedFolderId={selectedFolderId}
                                  folderContent={folderContent}
                                  isFolderContentPending={
                                    isFolderContentPending
                                  }
                                  onSelectFolder={(folder) =>
                                    onUploadTargetChange({
                                      scope: folder.scope,
                                      scopeId: folder.scope_id,
                                      folderId: folder.id,
                                    })
                                  }
                                />

                                {/* Orphan block: selected folder not present in the fetched tree */}
                                {showOrphanBlock && (
                                  <div className="mt-1.5 pl-2 ml-2 space-y-0.5 border-l border-border/50 py-1">
                                    <FolderContentList
                                      folderContent={folderContent}
                                      isLoading={isFolderContentPending}
                                      onSelectFolder={(f) =>
                                        onUploadTargetChange({
                                          scope: f.scope,
                                          scopeId: f.scope_id,
                                          folderId: f.id,
                                        })
                                      }
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      ;{/* Repository View (Main Content) */}
      <div className="flex-1 pl-6 pr-4 h-[calc(100vh-18rem)] pt-2 space-y-8 min-h-0 overflow-y-auto custom-scrollbar pb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sm cursor-pointer">
                School Repository
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sm cursor-pointer">
                JSS 1 Gold
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-sm cursor-pointer">
                Mathematics
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Folders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foldersTestData.map((folder, index) => {
            const palette = folderCardPalette[index % folderCardPalette.length];
            return (
              <Card
                key={folder.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 border border-border/50"
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn("p-3 rounded-xl", palette.bg, palette.color)}
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
                    {folder.file_count != null ? (
                      <span>
                        {folder.file_count}{" "}
                        {folder.file_count === 1 ? "file" : "files"}
                      </span>
                    ) : null}
                    {folder.file_count != null ? (
                      <span className="w-1 h-1 rounded-full bg-border" />
                    ) : null}
                    <span>Updated {formatFolderDate(folder.updated_at)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">
                      {folder.created_by.first_name.charAt(0).toUpperCase()}
                      {folder.created_by.last_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    Created {formatFolderDate(folder.created_at)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Files Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-assistant">
            Files in JSS 1 Gold
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
                {filesTestData.map((file) => (
                  <TableRow
                    key={file.id}
                    className="cursor-pointer hover:bg-muted/20"
                  >
                    <TableCell>
                      <FileTypeIcon
                        mimeType={file.mime_type}
                        size="6"
                        // weight="fill"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {file.file_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatBytes(Number(file.file_size_bytes))}
                    </TableCell>
                    <TableCell>
                      {file.file_versions.length > 1 ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-blue-500/10 text-blue-600 border-blue-500/20"
                        >
                          V{file.file_versions.length}
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
                            {file.created_by.first_name.charAt(0).toUpperCase()}
                            {file.created_by.last_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">
                          {file.created_by.first_name}{" "}
                          {file.created_by.last_name}
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
      </div>
      ;
    </div>
  );
}
