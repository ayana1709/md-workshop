import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

function ManageProforma() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    try {
      const res = await api.get("/proforma");
      setProformas(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch proformas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This proforma will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/proforma/${id}`);
        Swal.fire("Deleted!", "Proforma deleted successfully.", "success");
        fetchProformas();
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "customer_name",
        header: "Customer",
      },
      {
        accessorKey: "product_name",
        header: "Product Name",
      },
      {
        accessorKey: "net_total",
        header: "Net Total",
        cell: (info) => `${Number(info.getValue()).toFixed(2)} Birr`,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            <Link
              to={`/proforma/view/${row.original.id}`}
              className="text-blue-600 hover:underline"
            >
              View
            </Link>
            <Link
              to={`/proforma/print/${row.original.id}`}
              className="text-green-600 hover:underline"
            >
              Print
            </Link>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: proformas,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="max-w-7xl mx-auto bg-white p-6 shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Manage Proformas</h1>
              <Link
                to="/proforma/create"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + New Proforma
              </Link>
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="border px-3 py-2 mb-4 rounded w-full md:w-1/3"
            />

            {loading ? (
              <p className="text-center py-10 text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm rounded-md overflow-hidden">
                  <thead className="bg-gray-100 text-gray-800 font-semibold">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="border px-3 py-2 text-left"
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
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="border px-3 py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-3 py-1 border rounded mr-2"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-3 py-1 border rounded"
                    >
                      Next
                    </button>
                  </div>
                  <span>
                    Page{" "}
                    <strong>
                      {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManageProforma;
