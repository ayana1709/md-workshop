import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import ViewProformaModal from "./ViewProformaModal";
import PrintProformaModal from "./PrintProformaModal";
import EditProformaModal from "./EditProformaModal";
import { ChevronDown } from "lucide-react";

/** Small component so we can use hooks safely */
function ActionsCell({ row, onView, onPrint, onEdit, onDelete }) {
  const [openMenu, setOpenMenu] = useState(false);
  const { job_id, id } = row.original;

  return (
    <div className="relative">
      <button
        onClick={() => setOpenMenu((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-cyan-700 text-white font-medium shadow-sm hover:bg-cyan-600 transition"
        aria-haspopup="menu"
        aria-expanded={openMenu}
      >
        Actions
        <ChevronDown size={18} className="text-white" />
      </button>

      {openMenu && (
        <div
          className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-20"
          role="menu"
        >
          <button
            onClick={() => {
              setOpenMenu(false);
              onView(job_id);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            role="menuitem"
          >
            View
          </button>
          <button
            onClick={() => {
              setOpenMenu(false);
              onPrint(job_id);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            role="menuitem"
          >
            Print
          </button>
          <button
            onClick={() => {
              setOpenMenu(false);
              onEdit(job_id);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            role="menuitem"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setOpenMenu(false);
              onDelete(job_id); // delete usually by DB id
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            role="menuitem"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ManageProforma() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // modal state (top-level, single source of truth)
  const [selectedProforma, setSelectedProforma] = useState(null);
  console.log(selectedProforma);
  const [viewOpen, setViewOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    try {
      const res = await api.get("/proformas");
      setProformas(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch proformas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** <-- keep this OUTSIDE handleDelete */
  const fetchProformaDetails = async (jobId, type) => {
    try {
      const res = await api.get(`/proformas/${jobId}`); // endpoint returns by job_id
      setSelectedProforma(res.data);
      if (type === "view") setViewOpen(true);
      if (type === "print") setPrintOpen(true);
      if (type === "edit") setEditOpen(true);
    } catch (err) {
      console.error("Failed to fetch proforma details", err);
      Swal.fire("Error", "Failed to load proforma.", "error");
    }
  };

  const handleDelete = async (jobId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This proforma will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      // Adjust to your backend route: /proforma/{id} vs /proformas/{id}
      await api.delete(`/proformas/${jobId}`);
      Swal.fire("Deleted!", "Proforma deleted successfully.", "success");
      fetchProformas();
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "#", cell: (info) => info.row.index + 1 },
      { accessorKey: "date", header: "Date" },
      { accessorKey: "job_id", header: "Job ID" },
      { accessorKey: "customer_name", header: "Customer" },
      { accessorKey: "product_name", header: "Product Name" },
      { accessorKey: "ref_num", header: "Ref Num" },
      { accessorKey: "delivery_date", header: "Delivery Date" },
      {
        accessorKey: "net_pay",
        header: "Net Total",
        cell: (info) => `${Number(info.getValue()).toFixed(2)} Birr`,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionsCell
            row={row}
            onView={(jobId) => fetchProformaDetails(jobId, "view")}
            onPrint={(jobId) => fetchProformaDetails(jobId, "print")}
            onEdit={(jobId) => fetchProformaDetails(jobId, "edit")}
            onDelete={(jobId) => handleDelete(jobId)}
          />
        ),
      },
    ],
    [] // functions are stable in this component; if you prefer, add them to deps
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
              {/* <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                + New Proforma
              </button> */}
            </div>

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

      {/* Top-level modals (controlled by viewOpen/printOpen/editOpen) */}
      <ViewProformaModal
        proforma={selectedProforma}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />
      <PrintProformaModal
        proforma={selectedProforma}
        open={printOpen}
        onClose={() => setPrintOpen(false)}
      />
      <EditProformaModal
        proforma={selectedProforma}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchProformas}
      />
    </div>
  );
}

export default ManageProforma;
