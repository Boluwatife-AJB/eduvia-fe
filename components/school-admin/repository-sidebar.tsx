import {
  FolderContent,
  RepositoryFolder,
  SelectableFolder,
  UploadTargetSelection,
} from "@/types";
import { FileIcon, FolderSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { SetStateAction } from "react";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { MIME_ICON_MAP, schoolDocumentsScopes } from "@/lib/data";
import { cva } from "class-variance-authority";
import { cn, deriveFolderNodeState } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface RepositorySidebarProps {
  activeScope: string;
  selectedFolderId: string | null;
  folders: RepositoryFolder[] | undefined;
  isFoldersPending: boolean;
  activeFolderContent: FolderContent | undefined;
  isFolderContentPending: boolean;
  showOrphanBlock: boolean;
  onActiveScopeChange: (value: SetStateAction<string>) => void;
  onUploadTargetChange: (value: SetStateAction<UploadTargetSelection>) => void;
}

interface SidebarMessageProps {
  children: React.ReactNode;
}

interface FolderContentListProps {
  folderContent: FolderContent | undefined;
  isLoading: boolean;
  onSelectFolder: (folder: SelectableFolder) => void;
}

interface FileTypeIconProps {
  mimeType: string;
  size?: string;
  weight?: string;
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

export function FileTypeIcon({
  mimeType,
  size = "size-6",
  weight = "regular",
}: FileTypeIconProps) {
  const Icon = MIME_ICON_MAP[mimeType] ?? FileIcon;
  return <Icon weight={weight} className={cn(size, "shrink-0")} />;
}

export default function RepositorySidebar({
  activeScope,
  selectedFolderId,
  folders,
  isFoldersPending,
  activeFolderContent,
  isFolderContentPending,
  showOrphanBlock,
  onActiveScopeChange,
  onUploadTargetChange,
}: RepositorySidebarProps) {
  const handleScopeSelect = (scopeValue: string) => {
    onActiveScopeChange(scopeValue);
    onUploadTargetChange({ scope: scopeValue, scopeId: null, folderId: null });
  };

  const handleFolderSelect = (folder: SelectableFolder) => {
    onUploadTargetChange({
      scope: folder.scope,
      scopeId: folder.scope_id,
      folderId: folder.id,
    });
  };

  return (
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
                            onClick={() => handleScopeSelect(item.value)}
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
                                folderContent={activeFolderContent}
                                isFolderContentPending={isFolderContentPending}
                                onSelectFolder={handleFolderSelect}
                              />

                              {/* Orphan block: selected folder not found in the fetched tree */}
                              {showOrphanBlock && (
                                <div className="mt-1.5 pl-2 ml-2 space-y-0.5 border-l border-border/50 py-1">
                                  <FolderContentList
                                    folderContent={activeFolderContent}
                                    isLoading={isFolderContentPending}
                                    onSelectFolder={handleFolderSelect}
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
  );
}

function SidebarMessage({ children }: SidebarMessageProps) {
  return (
    <p className="px-2 text-[11px] text-muted-foreground flex items-center gap-2">
      {children}
    </p>
  );
}

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
    <div className="space-y-0.5">
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

          {/* Orphan subfolders: present in the API response but not in tree children */}
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

      {/*
       * Recursive children must remain mounted even when the parent isn't selected —
       * unmounting collapses the subtree whenever a nested folder is clicked.
       */}
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
