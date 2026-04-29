import { FolderContent, RepositoryFolder, SubfolderGridItem } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { format, isValid, parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseFormDate(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const ymd = parse(value, "yyyy-MM-dd", new Date());
  if (isValid(ymd)) return ymd;
  const fromIso = new Date(value);
  return isValid(fromIso) ? fromIso : undefined;
}

/** Normalizes calendar / `<input type="date">` values to `yyyy-MM-dd` for school-setup APIs. */
export function toApiDateString(value: string): string {
  const d = parseFormDate(value);
  if (!d) return value.trim();
  return format(d, "yyyy-MM-dd");
}

/** Builds an ISO 8601 instant from a calendar date and optional time (local), defaulting time to 12:00. */
export function localDateTimeToIso8601(
  dateStr: string,
  timeStr?: string | null,
): string | null {
  const date = dateStr?.trim() ?? "";
  if (!date) return null;
  const time = (timeStr?.trim() || "12:00").slice(0, 5);
  const d = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  if (!isValid(d)) return null;
  return d.toISOString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatFolderDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

// Tree Traversal Functions
export function folderInTree(
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

export function findFolderById(
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

export function getFolderNamePath(
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

// Count Helpers
export function getFolderListFileCount(
  folder: SubfolderGridItem,
): number | null {
  if ("_count" in folder && folder._count != null) {
    return folder._count.files;
  }
  return null;
}

// Folder Node State Derivation
/**
 * Derives all state needed to render a single folder node.
 * Centralises the boolean logic that was previously scattered across JSX.
 */
export function deriveFolderNodeState(
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
