import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes } from "@/lib/utils";
import { FolderContent } from "@/types";
import {
  ClockCounterClockwiseIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  ShareNetworkIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { FileTypeIcon } from "../repository-sidebar";

interface FilesTableProps {
  activeFolderContent: FolderContent | undefined;
  isFolderContentPending: boolean;
  selectedFolderId: string | null;
  itemLabel: string;
}

/**
 * Renders a table of files belonging to the currently selected folder (or scope root).
 */
export function FilesTable({
  activeFolderContent,
  isFolderContentPending,
  selectedFolderId,
  itemLabel,
}: FilesTableProps) {
  const heading = selectedFolderId
    ? (activeFolderContent?.folder.name ?? "Selected Folder")
    : itemLabel;

  const isLoadingFiles = Boolean(selectedFolderId && isFolderContentPending);
  const files = activeFolderContent?.files ?? [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold font-assistant">
        Files in {heading}
      </h3>

      <Card className="overflow-hidden border border-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoadingFiles ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-20 text-center text-sm text-muted-foreground"
                >
                  Loading folder files...
                </TableCell>
              </TableRow>
            ) : files.length > 0 ? (
              files.map((file) => (
                <TableRow
                  key={file.id}
                  className="cursor-pointer hover:bg-muted/20"
                >
                  <TableCell>
                    <FileTypeIcon
                      mimeType={file.versions[0]?.mime_type ?? ""}
                      size="size-6"
                      weight="fill"
                    />
                  </TableCell>

                  <TableCell className="font-medium">{file.name}</TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatBytes(
                      Number(file.versions[0]?.file_size_bytes ?? 0),
                    )}
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
                          {file.versions[0]?.uploaded_by.first_name
                            ?.charAt(0)
                            .toUpperCase() ??
                            file.versions[0]?.uploaded_by.last_name
                              ?.charAt(0)
                              .toUpperCase() ??
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {file.versions[0]?.uploaded_by.first_name}{" "}
                        {file.versions[0]?.uploaded_by.last_name}
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
                              <DotsThreeIcon weight="bold" className="size-5" />
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-20 text-center text-sm text-muted-foreground"
                >
                  No files in this folder.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
