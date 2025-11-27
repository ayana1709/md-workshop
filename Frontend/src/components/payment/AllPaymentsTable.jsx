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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Sidebar from "@/partials/Sidebar";
import { useNavigate } from "react-router-dom";
import ActionDropdown from "./ActionDropdown";
import Swal from "sweetalert2";
import Header from "@/partials/Header";
import { format } from "date-fns"; // install with npm install date-fns

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
  // const navigate = useNavigate();``
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
        await api.delete(`/payments/job/${jobId}`);
        setData((prev) => prev.filter((d) => d.jobId !== jobId));

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
    if (selectedRows.size === 0) {
      alert("No payments selected.");
      return;
    }

    if (confirm(`Delete ${selectedRows.size} selected payment(s)?`)) {
      try {
        // Send one DELETE request with all IDs
        await api.delete("/payments/bulk", {
          data: { ids: Array.from(selectedRows) },
        });

        // Remove deleted items from state
        setData((prev) => prev.filter((d) => !selectedRows.has(d.id)));

        // Clear selection
        setSelectedRows(new Set());

        alert("✅ Selected payments deleted successfully.");
      } catch (error) {
        console.error("Bulk delete failed:", error);
        alert("❌ Failed to delete selected payments.");
      }
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };
  const handleCreateFormalPayment = () => {
    navigate("/formalpayment");
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
    const getMethodBadge = (method) => {
      if (!method) return <span className="text-gray-400 italic">—</span>;

      const colors = {
        cash: "bg-green-100 text-green-700 border-green-300",
        transfer: "bg-blue-100 text-blue-700 border-blue-300",
        card: "bg-purple-100 text-purple-700 border-purple-300",
        cheque: "bg-yellow-100 text-yellow-700 border-yellow-300",
        credit: "bg-orange-100 text-orange-700 border-orange-300",
      };

      const methodNames = {
        cash: "Cash",
        transfer: "Bank Transfer",
        card: "Card Payment",
        cheque: "Cheque",
        credit: "Credit",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${
            colors[method] || "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {methodNames[method] || method}
        </span>
      );
    };

    const getStatusBadge = (status) => {
      if (!status) return <span className="text-gray-400 italic">—</span>;

      const colors = {
        full: "bg-green-100 text-green-700 border-green-300",
        partial: "bg-yellow-100 text-yellow-700 border-yellow-300",
        pending: "bg-blue-100 text-blue-700 border-blue-300",
        nopayment: "bg-red-100 text-red-700 border-red-300",
      };

      const statusNames = {
        full: "Full Payment",
        partial: "Partial Payment",
        pending: "Pending",
        nopayment: "No Payment",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${
            colors[status] || "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {statusNames[status] || status}
        </span>
      );
    };

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
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.date;
          return date ? format(new Date(date), "dd/MM/yyyy") : "";
        },
      },
      { accessorKey: "reference", header: "Ref Num" },
      { accessorKey: "name", header: "Customer Name" },
      {
        accessorKey: "reason",
        header: "Payment For",
        cell: ({ row }) => {
          const reason = row.original.reason;
          if (!reason) return "—";

          const list = reason
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line, index) => (
              <li key={index} className="list-disc ml-4">
                {line}
              </li>
            ));

          return <ul>{list}</ul>;
        },
      },
      { accessorKey: "paidAmount", header: "Paid (ETB)" },
      { accessorKey: "remainingAmount", header: "Remaining (ETB)" },
      {
        accessorKey: "method",
        header: "Payment Method",
        cell: ({ row }) => getMethodBadge(row.original.method),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: "actions",
        header: "Action",
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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Title */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              All Payments
            </h2>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
            {/* 🔍 Search + Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex items-center w-full sm:w-64">
                <FaSearch className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search payments..."
                  className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <label>From:</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-1">
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
              </div>

              {/* Status Filter */}
              <div className="text-sm w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-3 py-2 w-full sm:w-auto"
                >
                  <option value="">All Statuses</option>
                  <option value="Full Payment">Full Payment</option>
                  <option value="Advance">Advance</option>
                  <option value="Credit">Credit</option>
                  <option value="Remaining">Remaining</option>
                </select>
              </div>

              {/* Columns Dropdown */}
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

            {/* Export & Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreateFormalPayment}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm w-full sm:w-auto"
              >
                Create Formal Payment
                {/* <FaFileExcel />  */}
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm w-full sm:w-auto"
              >
                <FaFileExcel /> Excel
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm w-full sm:w-auto"
              >
                <FaPrint /> PDF
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm w-full sm:w-auto"
              >
                Delete Selected
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg shadow border">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 sm:px-4 py-2 text-left whitespace-nowrap"
                      >
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
                      <td
                        key={cell.id}
                        className="px-2 sm:px-4 py-2 whitespace-nowrap"
                      >
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

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50 w-full sm:w-auto"
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50 w-full sm:w-auto"
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
