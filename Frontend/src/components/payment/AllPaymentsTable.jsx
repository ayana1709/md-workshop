import { useEffect, useMemo, useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import api from "@/api";
import { FaSearch, FaFileExcel, FaPrint, FaChevronDown } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Sidebar from "@/partials/Sidebar";
import BackButton from "../BackButton";
import { useNavigate } from "react-router-dom";
import ActionDropdown from "./ActionDropdown";
import Swal from "sweetalert2";

function AllPaymentsTable() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments");
        setData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch payments:", err);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColumnsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRow = (id) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === data.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(data.map((d) => d.id)));
  };

  const deleteRow = async (jobId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This payment will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/payments/by-job/${jobId}`);
        setData((prev) => prev.filter((d) => d.job_id !== jobId)); // <-- key update

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The payment has been successfully removed.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Failed to delete:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete payment. Please try again.",
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm("Delete selected payments?")) {
      await Promise.all(
        [...selectedRows].map((id) => api.delete(`/payments/${id}`))
      );
      setData(data.filter((d) => !selectedRows.has(d.id)));
      setSelectedRows(new Set());
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.text("Payments Report", 14, 10);
    const rows = data.map((row) => [
      row.job_id,
      row.customer_name,
      row.plate_number,
      row.payment_method,
      row.payment_status,
      row.paid_amount,
      row.remaining_amount,
      row.ref_no,
      row.payment_date,
      row.paid_by,
      row.approved_by,
    ]);
    doc.autoTable({
      head: [
        [
          "Job ID",
          "Customer Name",
          "Plate Number",
          "Method",
          "Status",
          "Paid",
          "Remaining",
          "Ref No",
          "Date",
          "Paid By",
          "Approved By",
        ],
      ],
      body: rows,
    });
    doc.save("payments.pdf");
  };

  const columns = useMemo(() => {
    return [
      {
        id: "select",
        header: () => <input type="checkbox" onChange={toggleAll} />,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.original.id)}
            onChange={() => toggleRow(row.original.id)}
          />
        ),
      },
      { accessorKey: "job_id", header: "Job ID" },
      { accessorKey: "customer_name", header: "Customer Name" },
      { accessorKey: "plate_number", header: "Plate Number" },
      { accessorKey: "payment_method", header: "Method" },
      { accessorKey: "payment_status", header: "Status" },
      { accessorKey: "paid_amount", header: "Paid (ETB)" },
      { accessorKey: "remaining_amount", header: "Remaining (ETB)" },
      { accessorKey: "ref_no", header: "Ref No" },
      { accessorKey: "payment_date", header: "Date" },
      { accessorKey: "paid_by", header: "Paid By" },
      { accessorKey: "approved_by", header: "Approved By" },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionDropdown row={row} onDelete={deleteRow} />,
      },
    ];
  }, [selectedRows]);

  const filteredData = useMemo(() => {
    return data.filter((payment) => {
      const matchStatus = statusFilter
        ? payment.payment_status === statusFilter
        : true;
      const matchDate =
        (!dateRange.from ||
          new Date(payment.payment_date) >= new Date(dateRange.from)) &&
        (!dateRange.to ||
          new Date(payment.payment_date) <= new Date(dateRange.to));
      return matchStatus && matchDate;
    });
  }, [data, statusFilter, dateRange]);

  const table = useReactTable({
    data: filteredData,

    columns,
    state: {
      globalFilter,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex h-screen">
      <div className="w-60 flex-shrink-0 bg-white dark:bg-gray-900 border-r">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="p-4 sm:p-6 max-w-9xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              All Payments
            </h2>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            {/* Left: Search + Toggle */}

            <div className="flex items-center gap-3 flex-wrap">
              {/* 🔍 Global search */}
              <div className="relative flex items-center">
                <FaSearch className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search payments..."
                  className="pl-10 pr-3 py-2 border rounded-md text-sm"
                />
              </div>

              {/* 📅 Date Range */}
              <div className="flex items-center gap-2 text-sm">
                <label>From:</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
                <label>To:</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
              </div>

              {/* ✅ Status Filter */}
              <div className="text-sm">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="Full Payment">Full Payment </option>
                  <option value="Advance">Advance</option>
                  <option value="Credit">Credit</option>
                  <option value="Remaining">Remaining</option>

                  {/* Add more statuses as needed */}
                </select>
              </div>

              {/* 📋 Column toggle */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                  className="flex items-center px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-sm font-medium"
                >
                  Columns <FaChevronDown className="ml-2" />
                </button>

                {showColumnsDropdown && (
                  <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 border rounded shadow-lg p-2">
                    {table.getAllLeafColumns().map((col) => (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 text-sm py-1"
                      >
                        <input
                          type="checkbox"
                          checked={col.getIsVisible()}
                          onChange={col.getToggleVisibilityHandler()}
                        />
                        {col.id}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Excel, PDF, Delete */}
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
              >
                <FaFileExcel /> Excel
              </button>
              <button
                onClick={handlePrintPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
              >
                <FaPrint /> PDF
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg shadow border">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-2 text-left">
                        {flexRender(
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
                  <tr
                    key={row.id}
                    className="even:bg-gray-50 dark:even:bg-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2">
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
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AllPaymentsTable;
