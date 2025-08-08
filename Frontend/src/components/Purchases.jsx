import React, { useEffect, useMemo, useState } from "react";

import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash, Pencil } from "lucide-react";
import { jsPDF } from "jspdf";
import api from "../api";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import autoTable from "jspdf-autotable";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

const Purchases = () => {
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/purchases");
        setData(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Failed to fetch purchases", err);
      }
    };
    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    const f = data.filter(
      (row) =>
        row.supplier_name?.toLowerCase().includes(filterValue.toLowerCase()) ||
        row.company_name?.toLowerCase().includes(filterValue.toLowerCase())
    );
    setFiltered(f);
  }, [filterValue, data]);
  const flatData = useMemo(() => {
    return filtered.flatMap((purchase) =>
      purchase.items.map((item) => ({
        id: purchase.id,
        reference_number: purchase.reference_number,
        sales_date: purchase.sales_date,
        supplier_name: purchase.supplier_name,
        remark: purchase.remark,
        description: item.description,
        part_number: item.part_number,
        brand: item.brand,
        sale_quantity: item.sale_quantity,
        unit_price: parseFloat(item.unit_price),
      }))
    );
  }, [filtered]);

  // Columns config
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "reference_number", header: "Ref.No" },
      { accessorKey: "sales_date", header: "Order Date" },
      { accessorKey: "supplier_name", header: "Supplier Name" },
      { accessorKey: "description", header: "Item Description" },
      { accessorKey: "part_number", header: "Part No" },
      { accessorKey: "brand", header: "Brand" },
      { accessorKey: "sale_quantity", header: "Qty" },
      { accessorKey: "unit_price", header: "Unit Price" },
      {
        header: "Total",
        accessorFn: (row) =>
          (parseFloat(row.unit_price) * row.sale_quantity).toFixed(2),
        id: "total",
        cell: (info) => <span>{info.getValue()}</span>,
      },
      { accessorKey: "remark", header: "Remark" },
      {
        id: "actions",
        header: "Options",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Export CSV
  const exportCSV = () => {
    const csv = Papa.unparse(filtered.map(({ items, ...rest }) => rest));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "purchase-orders.csv");
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const selectedRows = table.getFilteredSelectedRowModel().rows;

    const rowsToExport =
      selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;

    const tableData = rowsToExport.map((row) =>
      row.getVisibleCells().map((cell) => cell.getValue())
    );

    const headers = table
      .getAllColumns()
      .filter((col) => col.getIsVisible())
      .map((col) => col.columnDef.header);

    autoTable(doc, {
      head: [headers],
      body: tableData,
    });

    doc.save("purchase-data.pdf");
  };

  // Delete purchase
  const handleDelete = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      setData((prev) => prev.filter((order) => order.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  // Edit (placeholder)
  const handleEdit = (order) => {
    alert(`Edit not implemented. Order ID: ${order.id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">
              Purchase Orders
            </h2>

            {/* Search & Export Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <Input
                placeholder="Search supplier or company..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="max-w-md"
              />
              <div className="flex items-center gap-2">
                <Button onClick={exportCSV} variant="outline">
                  Export CSV
                </Button>
                <Button onClick={exportToPDF}>Export PDF</Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-auto">
              <DataTable columns={columns} data={filtered} />
            </div>
          </div>
        </main>

        {/* Modal Dialog for Purchase Items */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl bg-white shadow-xl rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                Purchased Items
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto mt-4 max-h-96 border rounded">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2">Item ID</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Part #</th>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Unit Price</th>
                    <th className="px-3 py-2">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{item.item_id}</td>
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2">{item.part_number}</td>
                      <td className="px-3 py-2">{item.brand}</td>
                      <td className="px-3 py-2">{item.unit}</td>
                      <td className="px-3 py-2">{item.unit_price}</td>
                      <td className="px-3 py-2">{item.sale_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default Purchases;
