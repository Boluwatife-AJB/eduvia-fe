import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Meta, Parent } from "@/types";
import {
  CaretLeftIcon,
  CaretLineLeftIcon,
  CaretLineRightIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface ParentsTableProps<TValue> {
  columns: ColumnDef<Parent, TValue>[];
  data: Parent[];
  meta: Meta;
  itemsPerPage: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export default function ParentsTable<TValue>({
  columns,
  data,
  meta,
  itemsPerPage,
  isLoading = false,
  onPageChange,
  onItemsPerPageChange,
}: ParentsTableProps<TValue>) {
  const { tenant } = useParams<{ tenant: string }>();
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="w-full rounded-md border space-y-6">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-12 ",
                    index === 0
                      ? "pl-6"
                      : index === headerGroup.headers.length - 1
                        ? "pr-6"
                        : "px-2",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Loading parents…
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={
                  () =>
                    router.push(`/${tenant}/admin/parents/${row.original.id}`)
                  // console.log(row.original?.id)
                }
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex w-full flex-wrap items-center justify-between gap-6 max-sm:justify-center px-6">
        <div className="flex shrink-0 items-center gap-3">
          <Label htmlFor="rows-per-page">Rows per page</Label>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger
              id="rows-per-page"
              className="w-fit whitespace-nowrap"
            >
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-muted-foreground flex grow items-center justify-end whitespace-nowrap max-sm:justify-center">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            Showing <span className="text-foreground">{from}</span> to{" "}
            <span className="text-foreground">{to}</span> of{" "}
            <span className="text-foreground">{meta.total}</span> parents
          </p>
        </div>
        <Pagination className="w-fit max-sm:mx-0">
          <PaginationContent>
            {meta.has_previous_page && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to first page"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                >
                  <CaretLineLeftIcon className="size-4" />
                </PaginationLink>
              </PaginationItem>
            )}
            {meta.has_previous_page && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to previous page"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(meta.page - 1);
                  }}
                >
                  <CaretLeftIcon className="size-4" />
                </PaginationLink>
              </PaginationItem>
            )}
            {meta.total_pages > 1 &&
              [...Array(meta.total_pages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href={`#${index + 1}`}
                    isActive={index + 1 === meta.page}
                    className="rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(index + 1);
                    }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            {meta.has_next_page && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to next page"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(meta.page + 1);
                  }}
                >
                  <CaretRightIcon className="size-4" />
                </PaginationLink>
              </PaginationItem>
            )}
            {meta.total_pages > 1 && meta.page < meta.total_pages && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to last page"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(meta.total_pages);
                  }}
                >
                  <CaretLineRightIcon className="size-4" />
                </PaginationLink>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
