import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function DataTable({ columns, data, onView, onEdit, onDelete }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const COLUMN_VISIBILITY_KEY = "datatable-column-visibility";

  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      COLUMN_VISIBILITY_KEY,
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // const table = useReactTable({
  //   data,
  //   columns,
  //   state: { sorting, pagination },
  //   onPaginationChange: setPagination,
  //   getCoreRowModel: getCoreRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  // });

  return (
    <div className="space-y-4">
      {/* Column visibility dropdown */}
      <div className="flex justify-between items-center">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Toggle Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Header Actions */}
              <div className="px-2 py-2 flex justify-between border-b border-gray-100 mb-1">
                <button
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:underline"
                  onClick={(e) => {
                    // Prevent menu from closing on click
                    e.stopPropagation();
                    table
                      .getAllColumns()
                      .forEach((col) => col.toggleVisibility(true));
                  }}
                >
                  Show All
                </button>
                <button
                  className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    table
                      .getAllColumns()
                      .forEach((col) => col.toggleVisibility(false));
                  }}
                >
                  Hide All
                </button>
              </div>

              {/* Column List */}
              <div className="max-h-[300px] overflow-y-auto">
                {table.getAllColumns().map((column) =>
                  column.getCanHide() ? (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      // This is the key: prevent the menu from closing
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  ) : null
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-700 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-sm  font-medium cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-4 text-center text-sm text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* Number Pagination */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {/* Prev Button */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={`px-3 py-1 border rounded ${
            !table.getCanPreviousPage()
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {(() => {
          const pages = [];
          const totalPages = table.getPageCount();
          const currentPage = table.getState().pagination.pageIndex + 1;

          const add = (...arr) => pages.push(...arr);

          if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) add(i);
          } else {
            if (currentPage <= 3) add(1, 2, 3, 4, "...", totalPages);
            else if (currentPage >= totalPages - 2)
              add(
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages
              );
            else
              add(
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages
              );
          }

          return pages.map((page, idx) =>
            page === "..." ? (
              <span key={idx} className="px-3 py-1 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => table.setPageIndex(page - 1)}
                className={`px-3 py-1 border rounded ${
                  page === currentPage
                    ? "bg-blue-500 text-white font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            )
          );
        })()}

        {/* Next Button */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={`px-3 py-1 border rounded ${
            !table.getCanNextPage()
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
