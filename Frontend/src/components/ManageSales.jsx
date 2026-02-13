import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Download, Eye } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "@/api";
import { toast } from "react-toastify";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import { useStores } from "@/contexts/storeContext";
import { useNavigate } from "react-router-dom";

// import Sidebar from "@/partials/Sidebar";
// import { useStore } from "@/store";

export default function ManageSales() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const [selectedSale, setSelectedSale] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // const { companyData } = useStores();
  const { companyData } = useStores();
  const navigate = useNavigate();

  const companyInfo = {
    name: companyData?.name_en || "Company Name",
    nameAm: companyData?.name_am || "የኩባኒያ ስም",
    phone: companyData?.phone || "Phone",
    address: companyData?.address || "Address",
    tin: companyData?.tin ? `TIN: ${companyData.tin}` : "TIN: -",
    logo: companyData?.logo
      ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
      : "", // fallback image if needed
  };

  useEffect(() => {
    api
      .get("/salee")
      .then((res) => setSales(res.data))
      .catch((err) => console.error(err));
  }, []);

  console.log(selectedSale);
  const columns = [
    {
      header: "#",
      cell: ({ row }) => row.index + 1,
    },

    {
      header: "Date",
      accessorKey: "created_at",
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },

    {
      header: "Customer",
      accessorFn: (row) => row.customer?.full_name || "-",
    },

    {
      header: "Phone",
      accessorFn: (row) => row.customer?.phone || "-",
    },

    {
      header: "Sale Type",
      accessorKey: "sale_type",
      cell: ({ getValue }) =>
        getValue() === "with_receipt" ? "With Receipt" : "Without Receipt",
    },

    {
      header: "Subtotal",
      accessorKey: "subtotal",
    },

    {
      header: "VAT",
      accessorKey: "vat_amount",
    },

    {
      header: "Grand Total",
      accessorKey: "grand_total",
    },

    {
      header: "Paid",
      accessorFn: (row) => row.receipt?.paid_amount || "0.00",
    },

    {
      header: "Payment",
      accessorFn: (row) => row.receipt?.payment_type || "-",
    },

    {
      header: "Branch",
      accessorFn: (row) => row.branch?.name || "-",
    },

    {
      header: "Created By",
      accessorFn: (row) => row.creator?.name || "-",
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sale = row.original;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-40 space-y-2 p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedSale(sale);
                  setOpenView(true);
                }}
              >
                View
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(`/sales/edit/${sale.id}`)}
              >
                Edit
              </Button>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  const table = useReactTable({
    data: sales,
    columns,
    state: {
      columnVisibility,
      globalFilter: search,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "sales-data.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 16);
    const tableData = sales.map((row) =>
      columns.map((col) => row[col.accessorKey]),
    );
    const tableHeaders = columns.map((col) => col.header);
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 20,
    });
    doc.save("sales-data.pdf");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="relative z-[9] flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="p-4 space-y-4 bg-white p-6 rounded-md">
          {/* Controls */}
          {/* Controls */}
          {/* Controls */}
          <div className="bg-gray-50 p-4 rounded-lg border shadow-sm flex flex-wrap items-end justify-between gap-4">
            {/* Left-side filters */}
            <div className="flex flex-wrap items-end gap-4">
              {/* Search */}

              {/* Status Dropdown
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border px-3 py-2 rounded-md bg-white focus:ring focus:ring-blue-200 w-40"
                >
                  <option value="">All</option>
                  <option value="Requested">Requested</option>
                  <option value="Store Out">Store Out</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div> */}
            </div>

            {/* Right-side buttons */}
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Eye size={16} /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                  {table.getAllColumns().map(
                    (column) =>
                      column.getCanHide() && (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={column.getIsVisible()}
                          onCheckedChange={() => column.toggleVisibility()}
                        >
                          {column.columnDef.header}
                        </DropdownMenuCheckboxItem>
                      ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={exportToExcel}
                className="flex items-center gap-1"
              >
                <Download size={16} /> Excel
              </Button>

              <Button onClick={exportToPDF} className="flex items-center gap-1">
                <Download size={16} /> PDF
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              {" "}
              {/* 👈 this line helps trigger scroll */}
              <thead className="bg-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 text-left font-medium whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Dialog open={openView} onOpenChange={setOpenView}>
            <DialogContent className="max-w-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Sale Details
                </DialogTitle>
                <DialogDescription>
                  Complete information about the selected sale.
                </DialogDescription>
              </DialogHeader>

              {selectedSale && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-1">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <strong>Ref Number:</strong> {selectedSale.ref_num}
                      </div>
                      <div>
                        <strong>Sale ID:</strong> {selectedSale.id}
                      </div>
                      <div>
                        <strong>Sales Date:</strong> {selectedSale.sales_date}
                      </div>
                      <div>
                        <strong>Requested Date:</strong>{" "}
                        {selectedSale.requested_date}
                      </div>
                      <div>
                        <strong>Status:</strong> {selectedSale.status}
                      </div>
                      <div>
                        <strong>Approved By:</strong>{" "}
                        {selectedSale.approved_by || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-1">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <strong>Customer Name:</strong>{" "}
                        {selectedSale.customer_name}
                      </div>
                      <div>
                        <strong>Company:</strong>{" "}
                        {selectedSale.company_name || "N/A"}
                      </div>
                      <div>
                        <strong>TIN Number:</strong>{" "}
                        {selectedSale.tin_number || "N/A"}
                      </div>
                      <div>
                        <strong>Contact:</strong>{" "}
                        {selectedSale.phone || selectedSale.mobile || "N/A"}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedSale.email || "N/A"}
                      </div>
                      <div>
                        <strong>Address:</strong>{" "}
                        {selectedSale.address || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-1">
                      Delivery Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <strong>Delivered By:</strong>{" "}
                        {selectedSale.delivered_by || "N/A"}
                      </div>
                      <div>
                        <strong>Location:</strong>{" "}
                        {selectedSale.location || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-1">
                      Remark
                    </h3>
                    <p className="text-sm mt-2 bg-gray-50 p-3 rounded border">
                      {selectedSale.remark || "No remark"}
                    </p>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-1">
                      Items List
                    </h3>
                    <div className="overflow-auto border rounded mt-3">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 border">#</th>
                            <th className="p-2 border">Item Name</th>
                            <th className="p-2 border">Unit</th>
                            <th className="p-2 border">Qty</th>
                            <th className="p-2 border">Price</th>
                            <th className="p-2 border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSale.items?.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border p-2 text-center">
                                {index + 1}
                              </td>
                              <td className="border p-2">
                                {item.pivot.item_name}
                              </td>
                              <td className="border p-2 text-center">
                                {item.pivot.unit}
                              </td>
                              <td className="border p-2 text-center">
                                {item.pivot.sale_quantity}
                              </td>
                              <td className="border p-2 text-right">
                                {item.pivot.selling_price}
                              </td>
                              <td className="border p-2 text-right">
                                {(
                                  item.pivot.sale_quantity *
                                  item.pivot.selling_price
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
