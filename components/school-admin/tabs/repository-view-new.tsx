import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { foldersTestData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { DotsThreeIcon, FolderIcon } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { SetStateAction } from "react";

interface RepositoryViewNewProps {
  selectedFolderId: string | null;
  onSelectedFolderIdChange: (value: SetStateAction<string | null>) => void;
}

const folderCardPalette = [
  { color: "text-blue-500", bg: "bg-blue-500/10" },
  { color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { color: "text-amber-500", bg: "bg-amber-500/10" },
  { color: "text-violet-500", bg: "bg-violet-500/10" },
];

function formatFolderUpdatedAt(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export default function RepositoryViewNew({
  selectedFolderId,
  onSelectedFolderIdChange,
}: RepositoryViewNewProps) {
  return (
    <div className="flex ">
      {/* Navigation scopes (Sidebar) */}
      <div className="w-[240px] h-[calc(100vh-16rem)] shrink-0 border-r bg-muted/10 overflow-y-auto flex flex-col p-1 pt-2 custom-scrollbar">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Navigation Scopes
        </span>
      </div>

      {/* Repository View (Main Content) */}
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
                    <span>
                      Updated {formatFolderUpdatedAt(folder.updated_at)}
                    </span>
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
                    Created {formatFolderUpdatedAt(folder.created_at)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Files Table */}
      </div>
    </div>
  );
}
