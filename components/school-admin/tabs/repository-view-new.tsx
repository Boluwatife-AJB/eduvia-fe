import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api";
import { schoolDocumentsScopes } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  FolderContent,
  RepositoryFolder,
  SelectableFolder,
  UploadTargetSelection,
} from "@/types";
import {
  FileDocIcon,
  FileIcon,
  FilePdfIcon,
  FileXlsIcon,
  FolderSimpleIcon,
  ImageIcon,
  ImagesIcon,
  MusicNoteIcon,
  VideoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useQuery } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { Fragment, SetStateAction, useMemo } from "react";
import { FolderGrid } from "../folder-grid";
import RepositorySidebar from "../repository-sidebar";
import { FilesTable } from "../table/files-table";

// FIXME: When a folder with content is clicked it doesn't display the content. The folder content is not fetched.

// Types
interface RepositoryViewNewProps {
  selectedFolderId: string | null;
  activeScope: string;
  onActiveScopeChange: (value: SetStateAction<string>) => void;
  onUploadTargetChange: (value: SetStateAction<UploadTargetSelection>) => void;
}

interface FolderNodeProps {
  folder: RepositoryFolder;
  depth: number;
  selectedFolderId: string | null;
  folderContent: FolderContent | undefined;
  isFolderContentPending: boolean;
  onSelectFolder: (folder: SelectableFolder) => void;
}

type SubfolderGridItem =
  | RepositoryFolder
  | FolderContent["sub_folders"][number];
type BreadcrumbSeg =
  | { type: "root" }
  | { type: "group"; label: string }
  | { type: "scope"; label: string }
  | { type: "folder"; id: string; name: string };

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

// Utility Functions

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
        </div>
      )}

      {/* Recursive children must remain mounted even when parent isn't selected,
          otherwise selecting a nested folder collapses its subtree. */}
      {!!folder.children?.length && (
        <div className="space-y-0.5 pl-3">
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

  // Prevent stale rendering while switching folders/scopes:
  // only treat content as usable if it belongs to the current selection.
  const activeFolderContent =
    selectedFolderId && folderContent?.folder?.id === selectedFolderId
      ? folderContent
      : undefined;

  const selectedFolderIsInTree = Boolean(
    selectedFolderId && folders && folderInTree(folders, selectedFolderId),
  );

  // Whether the orphan block (folder selected but not found in tree) should show
  const showOrphanBlock =
    Boolean(selectedFolderId) && !selectedFolderIsInTree && !isFoldersPending;

  const folderNamePath = useMemo(() => {
    if (!selectedFolderId) return null;
    const fromTree = getFolderNamePath(folders, selectedFolderId);
    if (fromTree) return fromTree;
    if (activeFolderContent?.folder?.id === selectedFolderId) {
      return [
        {
          id: activeFolderContent.folder.id,
          name: activeFolderContent.folder.name,
        },
      ];
    }
    return null;
  }, [selectedFolderId, folders, activeFolderContent]);

  const scopeOrParentFolders = useMemo((): SubfolderGridItem[] | null => {
    if (!activeScope) return null;
    if (!selectedFolderId) {
      if (isFoldersPending) return null;
      return folders ?? [];
    }
    if (isFolderContentPending) return null;
    if (!activeFolderContent) return [];
    return activeFolderContent.sub_folders;
  }, [
    activeScope,
    selectedFolderId,
    isFoldersPending,
    folders,
    isFolderContentPending,
    activeFolderContent,
  ]);

  let groupTitle: string | null = null;
  let itemLabel = activeScope;
  for (const scope of schoolDocumentsScopes) {
    const item = scope.items.find((i) => i.value === activeScope);
    if (item) {
      groupTitle = scope.title;
      itemLabel = item.label;
      break;
    }
  }

  const breadcrumbSegments: BreadcrumbSeg[] = (() => {
    const segments: BreadcrumbSeg[] = [{ type: "root" }];
    if (groupTitle) segments.push({ type: "group", label: groupTitle });
    segments.push({ type: "scope", label: itemLabel });
    if (folderNamePath) {
      for (const folder of folderNamePath) {
        segments.push({ type: "folder", id: folder.id, name: folder.name });
      }
    }
    return segments;
  })();

  return (
    <div className="flex ">
      {/* Navigation scopes (Sidebar) */}

      <RepositorySidebar
        activeScope={activeScope}
        selectedFolderId={selectedFolderId}
        folders={folders}
        isFoldersPending={isFoldersPending}
        activeFolderContent={activeFolderContent}
        isFolderContentPending={isFolderContentPending}
        showOrphanBlock={showOrphanBlock}
        onActiveScopeChange={onActiveScopeChange}
        onUploadTargetChange={onUploadTargetChange}
      />

      {/* Repository View (Main Content) */}
      <div className="flex-1 pl-6 pr-4 h-[calc(100vh-16rem)] pt-2 space-y-8 min-h-0 overflow-y-auto custom-scrollbar pb-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbSegments.map((segment, index) => {
              const isCurrent = index === breadcrumbSegments.length - 1;
              const key =
                segment.type === "root"
                  ? "root"
                  : segment.type === "group"
                    ? "group"
                    : segment.type === "scope"
                      ? "scope"
                      : `folder-${segment.id}`;
              const label =
                segment.type === "root"
                  ? "School Repository"
                  : segment.type === "group" || segment.type === "scope"
                    ? segment.label
                    : segment.name;

              const goToScopeRoot = () =>
                onUploadTargetChange({
                  scope: activeScope,
                  scopeId: null,
                  folderId: null,
                });

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

                    {!isCurrent && segment.type === "root" ? (
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

                    {!isCurrent && segment.type === "group" ? (
                      <span className="text-muted-foreground max-w-40 truncate sm:max-w-none text-sm">
                        {label}
                      </span>
                    ) : null}

                    {!isCurrent && segment.type === "scope" ? (
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

                    {!isCurrent && segment.type === "folder" ? (
                      <BreadcrumbLink
                        className="text-sm"
                        render={
                          <button
                            type="button"
                            className="text-muted-foreground max-w-40 truncate"
                            onClick={() => {
                              const folder = findFolderById(
                                folders,
                                segment.id,
                              );
                              if (folder) {
                                onUploadTargetChange({
                                  scope: folder.scope,
                                  scopeId: folder.scope_id,
                                  folderId: folder.id,
                                });
                                return;
                              }
                              if (
                                activeFolderContent?.folder?.id === segment.id
                              ) {
                                onUploadTargetChange({
                                  scope: activeFolderContent.folder.scope,
                                  scopeId: activeFolderContent.folder.scope_id,
                                  folderId: activeFolderContent.folder.id,
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
        {/* Folders */}
        {scopeOrParentFolders && scopeOrParentFolders.length > 0 && (
          <FolderGrid
            folders={scopeOrParentFolders}
            onUploadTargetChange={onUploadTargetChange}
          />
        )}
        {/* Files Table */}
        <FilesTable
          activeFolderContent={activeFolderContent}
          isFolderContentPending={isFolderContentPending}
          selectedFolderId={selectedFolderId}
          itemLabel={itemLabel}
        />
      </div>
    </div>
  );
}
