import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import ProformaActions from "./ProformaActions";

function ProformaTable({
  data,
  loading,
  error,
  globalFilter,
  onView,
  onPrint,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "#" },
      { accessorKey: "ref_num", header: "Ref Num" }, // ✅ Use ref_num
      { accessorKey: "date", header: "Proforma Date" },
      { accessorKey: "delivery_date", header: "Delivery Date" },
      { accessorKey: "customer_name", header: "Customer Name" },
      {
        accessorKey: "net_pay",
        header: "Total Amount",
        cell: (info) => `${Number(info.getValue() || 0).toFixed(2)} Birr`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          let colorClass = "bg-gray-200 text-gray-800";

          if (status === "Pending")
            colorClass = "bg-yellow-100 text-yellow-800";
          if (status === "sold") colorClass = "bg-green-100 text-green-800";
          if (status === "canceled") colorClass = "bg-red-100 text-red-800";
          if (status === "refund") colorClass = "bg-blue-100 text-blue-800";
          if (status === "returned")
            colorClass = "bg-indigo-100 text-indigo-800";

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ProformaActions
            row={row}
            onView={onView}
            onPrint={onPrint}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onView, onPrint, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      {/* ===== Desktop / Tablet Table ===== */}
      <div className="overflow-x-auto relative w-full overflow-visible">
        <table className="min-w-full border border-gray-200 text-sm rounded-lg shadow-md">
          <thead className="bg-gray-400 text-gray-900 font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border px-3 py-2 text-left bg-gray-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border px-3 py-2 relative overflow-visible" // 👈 Important for dropdown
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <div>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border rounded-lg mr-2 disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Next
          </button>
        </div>
        <span className="text-gray-600">
          Page{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
      </div>
    </>
  );
}

export default ProformaTable;
