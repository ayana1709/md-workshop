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

const Purchases = () => {
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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

  // Columns config
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "reference_number", header: "Ref.No" },
      { accessorKey: "sales_date", header: "Order Date" },
      { accessorKey: "supplier_name", header: "Supplier Name" },
      { accessorKey: "mobile", header: "Prepared By" },
      { accessorKey: "status", header: "Status" },
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
    <div className="bg-white p-6 container mx-auto py-8 rounded-md">
      <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search supplier or company..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button onClick={exportCSV}>Export to CSV</Button>
          <Button onClick={exportToPDF}>Export PDF</Button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchased Items</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto mt-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-2 py-1">Item ID</th>
                  <th className="text-left px-2 py-1">Description</th>
                  <th className="text-left px-2 py-1">Part #</th>
                  <th className="text-left px-2 py-1">Brand</th>
                  <th className="text-left px-2 py-1">Unit</th>
                  <th className="text-left px-2 py-1">Unit Price</th>
                  <th className="text-left px-2 py-1">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-2 py-1">{item.item_id}</td>
                    <td className="px-2 py-1">{item.description}</td>
                    <td className="px-2 py-1">{item.part_number}</td>
                    <td className="px-2 py-1">{item.brand}</td>
                    <td className="px-2 py-1">{item.unit}</td>
                    <td className="px-2 py-1">{item.unit_price}</td>
                    <td className="px-2 py-1">{item.sale_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchases;
