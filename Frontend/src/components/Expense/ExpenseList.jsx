// src/components/Expense/ExpenseList.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
// import { useStores } from "@/contexts/storeContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useStores } from "@/contexts/storeContext";

// Debounce function
function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function ExpenseList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [openActionId, setOpenActionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const parentRef = useRef();
  // const CompanyData = useStores();
  const { companyData } = useStores(); // get company info
  const CompanyData = companyData;
  const companyLogo = CompanyData.logo;

  // Fetch Expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    const close = () => setOpenActionId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Preprocess data for search
  const preparedData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        _searchStr: [
          d.id,
          d.date,
          d.category,
          d.amount,
          d.payment_method,
          d.reference_no,
          d.paid_by,
          d.approved_by,
          d.staff_name,
          d.vendor_name,
        ]
          .join("||")
          .toLowerCase(),
      })),
    [data]
  );

  // Apply filters
  const filteredData = useMemo(() => {
    const q = globalFilter?.toLowerCase()?.trim();
    return preparedData.filter((row) => {
      if (categoryFilter && row.category !== categoryFilter) return false;
      if (dateFrom && new Date(row.date) < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(row.date) > to) return false;
      }
      if (q && !row._searchStr.includes(q)) return false;
      return true;
    });
  }, [preparedData, globalFilter, categoryFilter, dateFrom, dateTo]);

  const debouncedSetGlobalFilter = useCallback(
    debounce(setGlobalFilter, 300),
    []
  );

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected() ?? false}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 50,
      },
      { accessorKey: "id", header: "ID", size: 60 },
      { accessorKey: "date", header: "Date", size: 110 },
      { accessorKey: "category", header: "Category", size: 120 },
      { accessorKey: "amount", header: "Amount (ETB)", size: 120 },
      { accessorKey: "payment_method", header: "Payment", size: 100 },
      { accessorKey: "reference_no", header: "Ref No.", size: 100 },
      { accessorKey: "paid_by", header: "Paid By", size: 120 },

      {
        id: "actions",
        header: "Actions",
        size: 140,
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <div
              className="relative inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionId((prev) => (prev === id ? null : id));
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Action
              </button>
              {openActionId === id && (
                <ul className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50">
                  <li>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleView(row.original)}
                    >
                      View
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleEdit(row.original)}
                    >
                      Edit
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => handleDeleteRow(row.original)}
                    >
                      Delete
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleDownloadReceipt(row.original)}
                    >
                      Download PDF
                    </button>
                  </li>
                </ul>
              )}
            </div>
          );
        },
      },
    ],
    [openActionId]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedExpenseIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((k) => rowSelection[k])
        .map((k) => table.getRow(k)?.original?.id)
        .filter(Boolean),
    [rowSelection, table]
  );

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  // Action handlers
  const navigate = useNavigate();
  // const [openActionId, setOpenActionId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    expense: null,
  });

  const handleView = (expense) => {
    navigate(`/expenses/${expense.id}`); // goes to view page
  };

  const handleEdit = (expense) => {
    navigate(`/expenses/${expense.id}/edit`); // goes to edit form
  };

  const handleDeleteRow = (expense) => {
    setDeleteModal({ open: true, expense });
  };

  const confirmDelete = async () => {
    try {
      console.log("Deleting expense:", deleteModal.expense); // 👈 check this
      await api.delete(`/expenses/${deleteModal.expense.id}`);

      // Close modal
      setDeleteModal({ open: false, expense: null });

      // Show success popup
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Expense was successfully deleted.",
        timer: 2000,
        showConfirmButton: false,
      });

      // ✅ Reload table data here (re-fetch or filter out deleted row)
      // fetchExpenses(); or update state directly
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to delete expense. Please try again.",
      });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ open: false, expense: null });
  };

  async function handleBulkDelete() {
    if (!selectedExpenseIds.length) return alert("No rows selected.");
    if (!confirm(`Delete ${selectedExpenseIds.length} selected expenses?`))
      return;
    try {
      await api.post("/expenses/bulk-delete", { ids: selectedExpenseIds });
      setRowSelection({});
      fetchExpenses();
      alert("Deleted selected expenses.");
    } catch {
      alert("Bulk delete failed");
    }
  }
  // Helper: convert image URL to base64
  async function getImageDataUrl(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function handleDownloadReceipt(row) {
    const doc = new jsPDF();

    const y = 20;

    // --- Watermark ---
    // --- Watermark ---
    doc.setFontSize(80);
    doc.setTextColor(230, 230, 230); // very light gray
    doc.setFont("helvetica", "bold");
    doc.text("EXPENSE", 40, 150, { angle: 45 });

    // --- Logo ---
    if (companyData?.logo) {
      try {
        const imgUrl = `${import.meta.env.VITE_API_URL}/storage/${
          companyData.logo
        }`;
        const imgData = await getImageDataUrl(imgUrl);
        doc.addImage(imgData, "PNG", 14, y, 30, 30);
      } catch (err) {
        console.warn("Failed to load company logo:", err);
      }
    }

    // --- Header Text ---
    doc.setFontSize(16);
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(companyData?.name_am || "የኩባንያ ስም", 50, y + 8);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(companyData?.name_en || "Company Name", 50, y + 18);

    // Right-aligned info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Address: ${companyData?.address || "----"}`, 140, y);
    doc.text(`TIN: ${companyData?.tin || "----"}`, 140, y + 5);
    doc.text(`VAT: ${companyData?.vat || "----"}`, 140, y + 10);

    // --- Expense Table ---
    autoTable(doc, {
      startY: y + 40,
      head: [["Field", "Value"]],
      body: [
        ["ID", row.id],
        ["Date", row.date],
        ["Category", row.category],
        ["Amount", row.amount + " ETB"],
        ["Payment Method", row.payment_method],
        ["Reference No.", row.reference_no || "-"],
        ["Paid By", row.paid_by || "-"],
        ["Approved By", row.approved_by || "-"],
        ["Remarks", row.remarks || "-"],
      ],
      theme: "grid",
      headStyles: { fillColor: [255, 0, 0], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 11 },
    });

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      14,
      pageHeight - 10
    );
    doc.text(
      companyData?.tagline || "Powered by YourCompany",
      doc.internal.pageSize.width - 60,
      pageHeight - 10
    );

    doc.save(`expense-${row.id}.pdf`);
  }

  function exportExcel() {
    const rows = filteredData.map((r) => ({
      ID: r.id,
      Date: r.date,
      Category: r.category,
      Amount: r.amount,
      PaymentMethod: r.payment_method,
      PaidBy: r.paid_by,
      Reference: r.reference_no,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, "expenses.xlsx");
  }

  function printTable() {
    const tableEl = document.getElementById("expenseTable");
    if (!tableEl) return;

    // Clone the table and remove Actions column
    const clonedTable = tableEl.cloneNode(true);
    clonedTable.querySelectorAll("th").forEach((th, idx) => {
      if (th.innerText === "Actions") {
        clonedTable
          .querySelectorAll("tr")
          .forEach((tr) => tr.children[idx]?.remove());
      }
    });

    clonedTable.querySelectorAll("td").forEach((td) => {
      if (td.getAttribute("data-column") === "actions") td.remove();
    });

    // const { companyData } = useStores(); // get company info

    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
    <html>
      <head>
        <title>Expense Table</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; position: relative; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .logo { flex: 1; }
          .logo img { height: 60px; object-fit: contain; }
          .company-names { flex: 2; text-align: center; }
          .company-names h2 { margin: 0; }
          .company-names h2:first-child { color: #d32f2f; font-weight: bold; } /* Amharic name */
          .company-names h2:last-child { color: #000; font-weight: bold; text-transform: uppercase; } /* English name */
          .company-details { flex: 1; text-align: right; font-size: 12px; }
          .company-details p { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #999; padding: 8px; text-align: left; }
          th { background-color: #6b7280; color: #fff; } /* Tailwind gray-500 */
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { position: fixed; bottom: 10px; width: 100%; font-size: 12px; display: flex; justify-content: space-between; }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            font-size: 80px;
            color: rgba(200,200,200,0.2);
            transform: translate(-50%, -50%) rotate(-45deg);
            z-index: -1;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="watermark">EXPENSE</div>
        <div class="header">
          <div class="logo">
            ${
              companyData?.logo
                ? `<img src="${import.meta.env.VITE_API_URL}/storage/${
                    companyData.logo
                  }" />`
                : ""
            }
          </div>
          <div class="company-names">
            <h2>${companyData?.name_am || "የኩባንያ ስም"}</h2>
            <h2>${companyData?.name_en || "Company Name"}</h2>
          </div>
          <div class="company-details">
            <p>Address: ${companyData?.address || "----"}</p>
            <p>TIN: ${companyData?.tin || "----"}</p>
            <p>VAT Reg.: ${companyData?.vat || "----"}</p>
          </div>
        </div>
        ${clonedTable.outerHTML}
        <div class="footer">
          <span>Generated on: ${new Date().toLocaleString()}</span>
          <span>Powered by YourCompany</span>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function DeleteModal({ open, expense, onConfirm, onCancel }) {
    if (!open) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
          <p className="mb-6">
            Are you sure you want to delete{" "}
            <span className="font-medium">{expense?.category}</span> expense?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Total expense
  const totalExpense = useMemo(() => {
    return filteredData.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  }, [filteredData]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6">
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => debouncedSetGlobalFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-60"
            />

            <select
              className="border px-3 py-2 rounded w-full sm:w-auto"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="labor">Labor</option>
              <option value="outsourcing">Outsourcing</option>
              <option value="utilities">Utilities</option>
              <option value="operations">Operations</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border px-2 py-1 rounded w-full sm:w-auto"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border px-2 py-1 rounded w-full sm:w-auto"
              />
            </div>

            <div className="ml-auto flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={printTable}
                className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
              >
                Print
              </button>
              <button
                onClick={exportExcel}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Excel
              </button>
            </div>
          </div>

          {/* Bulk actions + total */}
          <div className="mb-3 flex flex-wrap gap-3 items-center">
            <button
              onClick={handleBulkDelete}
              disabled={!selectedExpenseIds.length}
              className={`px-3 py-2 rounded transition ${
                selectedExpenseIds.length
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Delete Selected ({selectedExpenseIds.length})
            </button>

            <div className="ml-auto px-4 py-2 bg-gray-100 rounded text-sm font-semibold text-gray-700">
              Total Expense: {totalExpense.toFixed(2)} ETB
            </div>
          </div>

          {/* Table */}
          <div
            ref={parentRef}
            className="overflow-y-auto max-h-[500px] relative bg-white rounded shadow"
          >
            <div className="relative w-full overflow-x-auto rounded-lg border bg-white">
              <table
                id="expenseTable"
                className="w-full min-w-[600px] text-sm text-left border-collapse"
              >
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 font-medium border-b text-left whitespace-nowrap overflow-hidden text-ellipsis"
                          style={{ width: header.column.columnDef.size || 120 }}
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
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 border-b text-gray-700 whitespace-nowrap"
                          style={{ width: cell.column.columnDef.size || 120 }}
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
          </div>
        </main>
      </div>

      <DeleteModal
        open={deleteModal.open}
        expense={deleteModal.expense}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
