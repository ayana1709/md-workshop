import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function DataTable({
  columns,
  data,
  rowCount, 
  pagination, 
  onPaginationChange, 
}) {
  const [sorting, setSorting] = useState([]);
  const COLUMN_VISIBILITY_KEY = "datatable-column-visibility";
  // Load visibility from localStorage
  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);


  // Inside DataTable.jsx, update the hook config:
const table = useReactTable({
  data: data || [], // Ensure it defaults to an empty array
  columns,
  // Safety: prevent NaN if rowCount is undefined
  pageCount: rowCount ? Math.ceil(rowCount / pagination.pageSize) : 0, 
  manualPagination: true, 
  state: {
    pagination,
    sorting,
    columnVisibility,
  },
  onPaginationChange,
  onColumnVisibilityChange: setColumnVisibility,
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
});

  // Helper for pagination numbers logic
  const paginationRange = useMemo(() => {
    const pages = [];
    const totalPages = table.getPageCount();
    const currentPage = pagination.pageIndex + 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  }, [table.getPageCount(), pagination.pageIndex]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">Toggle Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2 flex justify-between border-b mb-1">
              <button className="text-[10px] font-bold text-blue-600 hover:underline" onClick={() => table.toggleAllColumnsVisible(true)}>Show All</button>
              <button className="text-[10px] font-bold text-red-600 hover:underline" onClick={() => table.toggleAllColumnsVisible(false)}>Hide All</button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {table.getAllColumns().map((column) => column.getCanHide() && (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-700 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-left text-sm font-medium cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted()] ?? null}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr><td colSpan={columns.length} className="px-3 py-4 text-center text-sm text-gray-500">No data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</Button>
        
        {paginationRange.map((page, idx) => (
          page === "..." ? (
            <span key={idx} className="px-3 py-1 text-gray-500">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => table.setPageIndex(page - 1)}
              className={`px-3 py-1 border rounded text-sm ${page === (pagination.pageIndex + 1) ? "bg-blue-500 text-white font-semibold" : "hover:bg-gray-200"}`}
            >
              {page}
            </button>
          )
        ))}

        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </div>
  );
}