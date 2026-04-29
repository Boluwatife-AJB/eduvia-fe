import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatFolderDate, getFolderListFileCount } from "@/lib/utils";
import { SubfolderGridItem, UploadTargetSelection } from "@/types";
import { DotsThreeIcon, FolderIcon } from "@phosphor-icons/react/dist/ssr";
import { SetStateAction } from "react";
import { folderCardPalette } from "@/lib/data";

interface FolderGridProps {
  folders: SubfolderGridItem[];
  onUploadTargetChange: (value: SetStateAction<UploadTargetSelection>) => void;
}

/**
 * Renders a responsive grid of folder cards in the main content area.
 */
export function FolderGrid({ folders, onUploadTargetChange }: FolderGridProps) {
  if (!folders.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder, index) => {
        const palette = folderCardPalette[index % folderCardPalette.length];
        const fileCount = getFolderListFileCount(folder);

        return (
          <Card
            key={folder.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 border border-border/50"
            onClick={() =>
              onUploadTargetChange({
                scope: folder.scope,
                scopeId: folder.scope_id,
                folderId: folder.id,
              })
            }
          >
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-xl", palette.bg, palette.color)}>
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
                {fileCount != null && (
                  <>
                    <span>
                      {fileCount} {fileCount === 1 ? "file" : "files"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                  </>
                )}
                <span>Updated {formatFolderDate(folder.updated_at)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">
                  {folder.name.charAt(0).toUpperCase() || "F"}
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
  );
}
