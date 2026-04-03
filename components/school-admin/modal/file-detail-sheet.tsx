"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileRecord } from "../tabs/repository-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DownloadSimpleIcon,
  ShareNetworkIcon,
  ArchiveIcon,
  TrashSimpleIcon,
  ClockCounterClockwiseIcon,
  CaretRightIcon,
  LinkIcon,
  QrCodeIcon,
  PlusIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FileDetailSheetProps {
  file: FileRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getLargeFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl text-xs font-bold">
          PDF
        </div>
      );
    case "video":
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-purple-500/10 text-purple-500 rounded-xl text-xs font-bold">
          VID
        </div>
      );
    case "audio":
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-cyan-500/10 text-cyan-500 rounded-xl text-xs font-bold">
          AUD
        </div>
      );
    case "excel":
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-green-500/10 text-green-500 rounded-xl text-xs font-bold">
          XLS
        </div>
      );
    case "word":
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold">
          DOC
        </div>
      );
    case "image":
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-yellow-500/10 text-yellow-500 rounded-xl text-xs font-bold">
          IMG
        </div>
      );
    default:
      return (
        <div className="h-12 w-12 flex items-center justify-center bg-gray-500/10 text-gray-500 rounded-xl text-xs font-bold">
          FILE
        </div>
      );
  }
};

const VERSION_HISTORY = [
  {
    id: "v3",
    version: "V3",
    uploader: "Admin Office",
    date: "Oct 12, 2025",
    size: "2.4 MB",
    note: "Updated 2025 sections",
  },
  {
    id: "v2",
    version: "V2",
    uploader: "Jane Doe",
    date: "Sep 01, 2024",
    size: "2.3 MB",
    note: "Minor typo fixes",
  },
  {
    id: "v1",
    version: "V1",
    uploader: "System",
    date: "Jan 10, 2023",
    size: "2.1 MB",
    note: "Original document",
  },
];

const ACCESS_LOG = [
  {
    id: "log1",
    name: "Principal Williams",
    action: "Downloaded",
    date: "Oct 14, 2025 09:41 AM",
    ip: "192.168.1.105",
  },
  {
    id: "log2",
    name: "VP Academic",
    action: "Viewed",
    date: "Oct 13, 2025 02:15 PM",
    ip: "192.168.1.112",
  },
  {
    id: "log3",
    name: "Admin Office",
    action: "Uploaded V3",
    date: "Oct 12, 2025 11:20 AM",
    ip: "192.168.1.44",
  },
];

export default function FileDetailSheet({
  file,
  open,
  onOpenChange,
}: FileDetailSheetProps) {
  const [showShare, setShowShare] = useState(false);
  const [expiry, setExpiry] = useState("7d");
  const [maxUses, setMaxUses] = useState("");

  if (!file) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setShowShare(false);
      }}
    >
      {/* 640px wide sheet structure matching generic sheet but overriding max-w */}
      <SheetContent className="sm:max-w-[640px] w-[90vw] overflow-y-auto pb-10">
        <SheetHeader className="pb-4 border-b">
          <div className="flex gap-4 items-start">
            {getLargeFileIcon(file.type)}
            <div className="flex-1 min-w-0 pr-6">
              <SheetTitle className="text-xl font-semibold wrap-break-word">
                {file.name}
              </SheetTitle>
              <div className="flex items-center text-xs text-muted-foreground mt-2 flex-wrap gap-y-2">
                <span>Administrative</span>
                <CaretRightIcon className="size-3 mx-1 shrink-0" />
                <span>School Documents</span>
                <span className="mx-2">•</span>
                <span>{file.size}</span>
                <span className="mx-2">•</span>
                <span>Uploaded {file.uploadDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button variant="primary" size="sm" className="gap-2">
              <DownloadSimpleIcon weight="bold" className="size-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowShare(!showShare)}
            >
              <ShareNetworkIcon weight="bold" className="size-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <PlusIcon weight="bold" className="size-4" />
              New Version
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArchiveIcon weight="bold" className="size-4" />
              Archive
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <TrashSimpleIcon weight="bold" className="size-4" />
              Delete
            </Button>
          </div>

          {/* Share Sub-panel */}
          {showShare && (
            <div className="mt-4 p-4 rounded-xl border bg-muted/20 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <h4 className="text-sm font-medium">Share Document Link</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Link Expiry
                  </label>
                  <Select
                    value={expiry}
                    onValueChange={(val) => setExpiry(val || "")}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="never">Never Expires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Max Uses (Optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    className="h-9"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    readOnly
                    value="https://eduvia.app/share/doc/xyz123"
                    className="h-9 pr-10 font-mono text-xs bg-background"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-muted-foreground"
                  >
                    <LinkIcon className="size-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  title="Show QR Code"
                >
                  <QrCodeIcon className="size-5" />
                </Button>
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Details Section */}
          <section className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1.5">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Official documentation containing guidelines, rules, and
                procedures for staff members. This document is required reading
                for all new employees during the onboarding process.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-muted/50 text-muted-foreground font-normal rounded-md"
                >
                  Policy
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-muted/50 text-muted-foreground font-normal rounded-md"
                >
                  Onboarding
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-muted/50 text-muted-foreground font-normal rounded-md"
                >
                  Staff
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Linked Record</h4>
              <Badge
                variant="outline"
                className="gap-1.5 px-2.5 py-1 text-primary-blue border-primary-blue/30 bg-primary-blue/5"
              >
                <LinkIcon className="size-3" />
                HR Handbook 2025
              </Badge>
            </div>
          </section>

          {/* Version History Accordion Look-alike */}
          <section>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <ClockCounterClockwiseIcon className="size-4 text-muted-foreground" />
              Version History
            </h4>
            <div className="border rounded-xl divide-y">
              {VERSION_HISTORY.map((v, i) => (
                <div
                  key={v.id}
                  className="p-3.5 hover:bg-muted/10 transition-colors flex items-start gap-3"
                >
                  <div
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded w-8 text-center",
                      i === 0
                        ? "bg-primary-blue/10 text-primary-blue"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {v.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-[9px]">
                            {v.uploader.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground font-medium">
                          {v.uploader}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {v.date}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between pr-2">
                      <p className="text-xs text-muted-foreground truncate mr-4">
                        {v.note}
                      </p>
                      <span className="text-xs text-muted-foreground font-mono">
                        {v.size}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 self-center"
                  >
                    <DownloadSimpleIcon className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Access Log Table */}
          <section>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <EyeIcon className="size-4 text-muted-foreground" />
              Recent Access Log
            </h4>
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8">User</TableHead>
                    <TableHead className="text-xs h-8">Action</TableHead>
                    <TableHead className="text-xs h-8">Time</TableHead>
                    <TableHead className="text-xs h-8">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ACCESS_LOG.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-medium">
                        {log.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.date}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.ip}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
