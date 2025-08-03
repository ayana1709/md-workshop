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

export default function ManageSales() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const [selectedSale, setSelectedSale] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    api
      .get("/sales")
      .then((res) => setSales(res.data))
      .catch((err) => console.error(err));
  }, []);

  console.log(selectedSale);

  const columns = [
    { accessorKey: "id", header: "#" },
    { accessorKey: "sales_date", header: "Sales Date" },
    { accessorKey: "customer_name", header: "Customer Name / Details" },
    { accessorKey: "total_amount", header: "Sales Amount" },
    { accessorKey: "paid_amount", header: "Paid" },
    { accessorKey: "due_amount", header: "Remaining" },
    {
      accessorKey: "payment_status",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.getValue("payment_status");

        const colorMap = {
          "Full Payment": "bg-green-100 text-green-800",
          "Advanced Payment": "bg-orange-100 text-orange-800",
          "No Payment": "bg-red-100 text-red-800",
        };

        const statusStyle = colorMap[status] || "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${statusStyle}`}
          >
            {status}
          </span>
        );
      },
    },

    {
      accessorKey: "payment_type",
      header: "Banks",
      cell: ({ row }) => {
        const bank = row.getValue("payment_type");

        const bankColorMap = {
          Cash: "bg-blue-100 text-blue-800",
          Transfer: "bg-purple-100 text-purple-800",
          Cheque: "bg-yellow-100 text-yellow-800",
          Credit: "bg-indigo-100 text-indigo-800",
        };

        const bankStyle = bankColorMap[bank] || "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${bankStyle}`}
          >
            {bank}
          </span>
        );
      },
    },

    {
      accessorKey: "from",
      header: "From",
      cell: () => "Stock", // <- your default stock value
    },
    { accessorKey: "remark", header: "Remark" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sale = row.original;

        const openViewDialog = () => {
          setSelectedSale(sale);
          setOpenView(true);
        };

        const openEditDialog = () => {
          setSelectedSale(sale);
          setOpenEdit(true);
        };

        const handleDelete = () => {
          if (confirm("Are you sure you want to delete this sale?")) {
            console.log("Deleting sale:", sale);
            // Perform your delete logic here
          }
        };

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-40 space-y-2 p-2"
              side="bottom"
              align="start"
            >
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
                onClick={() => {
                  setSelectedSale(sale);
                  setOpenEdit(true);
                }}
              >
                Edit
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                Delete
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
      columns.map((col) => row[col.accessorKey])
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
    <div className="p-4 space-y-4 bg-white p-6 rounded-md">
      {/* Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[300px]"
        />

        <div className="flex gap-2 flex-wrap">
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
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={exportToExcel} className="flex items-center gap-1">
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
                          header.getContext()
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              Information about the selected sale.
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>ID:</strong> {selectedSale.id}
              </div>
              <div>
                <strong>Sales Date:</strong> {selectedSale.sales_date}
              </div>
              <div>
                <strong>Customer Name:</strong>{" "}
                {selectedSale.customer_name || "N/A"}
              </div>
              <div>
                <strong>Phone Number:</strong>{" "}
                {selectedSale.phone_number || "N/A"}
              </div>
              <div>
                <strong>Total Amount:</strong> {selectedSale.total_amount}
              </div>
              <div>
                <strong>Paid Amount:</strong> {selectedSale.paid_amount}
              </div>
              <div>
                <strong>Due Amount:</strong> {selectedSale.due_amount}
              </div>
              <div>
                <strong>Payment Status:</strong> {selectedSale.payment_status}
              </div>
              <div>
                <strong>Payment Type:</strong> {selectedSale.payment_type}
              </div>
              <div>
                <strong>Vat:</strong> {selectedSale.vat_rate}
              </div>
              <div>
                <strong>Tin Number:</strong> {selectedSale.tin_number}
              </div>
              <div>
                <strong>From</strong> {selectedSale.stock || "stock"}
              </div>
              <div>
                <strong>Remark:</strong> {selectedSale.remark}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>Update the sales information.</DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();

                const payload = {
                  ...selectedSale,
                  items: selectedSale.items.map((item) => ({
                    part_number: item.part_number,
                    description: item.pivot.description || "",
                    brand: item.pivot.brand || "",
                    unit: item.pivot.unit || "",
                    unit_price: item.pivot.unit_price,
                    sale_quantity: item.pivot.sale_quantity,
                  })),
                };

                api
                  .put(`/sales/${selectedSale.id}`, payload)
                  .then((res) => {
                    toast.success("Sale updated successfully");
                    setOpenEdit(false);
                  })
                  .catch((err) => {
                    toast.error("Failed to update sale");
                    console.error(err);
                  });
              }}
            >
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  value={selectedSale.customer_name}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      customer_name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={selectedSale.company_name}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      company_name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tin Number</label>
                <Input
                  value={selectedSale.tin_number}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      tin_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vat Rate</label>
                <Input
                  value={selectedSale.vat_rate}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      vat_rate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sub Total</label>
                <Input
                  value={selectedSale.sub_total}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      sub_total: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Total Amount</label>
                <Input
                  value={selectedSale.total_amount}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      total_amount: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Paid Amount</label>
                <Input
                  value={selectedSale.paid_amount}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      paid_amount: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Due Amount</label>
                <Input
                  value={selectedSale.due_amount}
                  onChange={(e) =>
                    setSelectedSale({
                      ...selectedSale,
                      due_amount: e.target.value,
                    })
                  }
                />
              </div>

              {selectedSale.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border p-4 rounded-lg"
                >
                  <p className="font-medium text-gray-700">Item {index + 1}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Sale Quantity
                      </label>
                      <Input
                        type="number"
                        value={item.pivot.sale_quantity}
                        onChange={(e) => {
                          const items = [...selectedSale.items];
                          items[index].pivot.sale_quantity = parseInt(
                            e.target.value
                          );
                          setSelectedSale({ ...selectedSale, items });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
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
  );
}
