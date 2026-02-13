import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { DataTable } from "./ui/dataTable";
import { columns } from "./Columns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "@/api";
import Swal from "sweetalert2";
import {
  Plus,
  Upload,
  Download,
  FileText,
  Printer,
  FileDown,
} from "lucide-react";

const LowStore = () => {
  const printRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchItem, setSearchItem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [actionDropdownOpen, setActionDropdownOpen] = useState(null); // track row id
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [configItem, setConfigItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);

  const {
    items,
    setItems,
    setShowModal,
    setIsItemModalOpen,
    setSelectedRepairId,
  } = useStores();

  // Fetch branches from backend
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/departments");
        setBranches(res.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);
  // Fetch items filtered by branch
  const fetchItems = async (branchId = selectedBranch) => {
    try {
      const url =
        branchId && branchId !== "all"
          ? `/item/low_stock?branch_id=${branchId}`
          : "/item/low_stock";
      const res = await api.get(url);
      setItems(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };
  // Refetch items when selected branch changes
  useEffect(() => {
    fetchItems();
  }, [selectedBranch]);
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands"),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (err) {
        console.error("Failed to fetch categories/brands", err);
      }
    };
    fetchMeta();
  }, []);
  const filteredItems = useMemo(() => {
    let data = items;

    // 🔍 Search
    if (searchItem) {
      const keyword = searchItem.toLowerCase();
      data = data.filter((item) =>
        [
          item.item_code,
          item.item_name,
          item.part_number,
          item.brand?.name,
          item.category?.name,
          item.branch?.name,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(keyword)),
      );
    }

    // 🏷 Category filter
    if (selectedCategory !== "all") {
      data = data.filter(
        (item) => item.category?.id === Number(selectedCategory),
      );
    }

    // 🏭 Brand filter
    if (selectedBrand !== "all") {
      data = data.filter((item) => item.brand?.id === Number(selectedBrand));
    }

    // 📅 Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      data = data.filter((item) => {
        const created = new Date(item.created_at);
        return created >= start && created <= end;
      });
    }

    return data;
  }, [items, searchItem, startDate, endDate, selectedCategory, selectedBrand]);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const generateTemplate = (type) => {
    let headers = [];

    if (type === "item_only") {
      headers = [
        "item_name",
        "part_number",
        "category",
        "brand",
        "unit",
        "quantity", // initial_stock
        "minimum_stock", //low_stock
        "branch",
        "location",
      ];
    }

    if (type === "item_purchase") {
      headers = [
        "item_name",
        "part_number",
        "category",
        "brand",
        "unit",
        "quantity", // initial_stock
        "minimum_stock", //low_stock
        "branch",
        "location",
        "purchasing_price", // actual_unit_price
      ];
    }

    if (type === "item_purchase_sell") {
      headers = [
        "item_name",
        "part_number",
        "category",
        "brand",
        "unit",
        "quantity", // initial_stock
        "minimum_stock", //low_stock
        "branch",
        "location",
        "purchasing_price", // actual_unit_price
        "selling_price", //actual_selling_price
      ];
    }

    // Create empty row for user to fill
    const dataToExport = [
      headers.reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
    ];

    // Export to Excel
    const ws = XLSX.utils.json_to_sheet(dataToExport, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `template_${type}.xlsx`);
  };
  //
  const exportToExcel = () => {
    // Map filtered items to only needed columns in correct order
    const dataToExport = filteredItems.map((item) => ({
      item_code: item.item_code,
      item_name: item.item_name,
      part_number: item.part_number,
      category: item.category?.name || "",
      brand: item.brand?.name || "",
      unit: item.unit,
      quantity: item.initial_stock,
      minimum_stock: item.low_stock,
      branch: item.branch?.name || "",
      location: item.location,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items");
    XLSX.writeFile(wb, "filtered_items.xlsx");
  };
  //
  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Item Code",
      "Item Name",
      "Part Number",
      "Category",
      "Brand",
      "Unit",
      "Quantity",
      "Minimum Stock",
      "Branch",
      "Location",
    ];

    const tableRows = filteredItems.map((item) => [
      item.item_code,
      item.item_name,
      item.part_number,
      item.category?.name || "",
      item.brand?.name || "",
      item.unit,
      item.initial_stock,
      item.low_stock,
      item.branch?.name || "",
      item.location,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("filtered_items.pdf");
  };
  //
  const printTable = () => {
    const tableHeaders = [
      "Item Code",
      "Item Name",
      "Part Number",
      "Category",
      "Brand",
      "Unit",
      "Quantity",
      "Minimum Stock",
      "Branch",
      "Location",
    ];

    // Map filteredItems to table rows
    const tableRows = filteredItems.map((item) => [
      item.item_code,
      item.item_name,
      item.part_number,
      item.category?.name || "",
      item.brand?.name || "",
      item.unit,
      item.initial_stock,
      item.low_stock,
      item.branch?.name || "",
      item.location,
    ]);

    // Generate HTML table
    let html = `<table style="width:100%; border-collapse: collapse;">
    <thead>
      <tr>${tableHeaders
        .map(
          (h) =>
            `<th style="border:1px solid #000; padding:6px; text-align:left;">${h}</th>`,
        )
        .join("")}</tr>
    </thead>
    <tbody>
      ${tableRows
        .map(
          (row) =>
            `<tr>${row
              .map(
                (cell) =>
                  `<td style="border:1px solid #000; padding:6px;">${cell}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")}
    </tbody>
  </table>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print Items</title>
      </head>
      <body>
        <h2>Store Items</h2>
        ${html}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  //import

  const importItems = async (file) => {
    if (!file) return;

    try {
      setImporting(true);

      Swal.fire({
        title: "Importing items...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
        defval: "",
      });

      if (!jsonData.length) {
        Swal.fire("Empty File", "Excel file has no data", "error");
        return;
      }

      const res = await api.post(
        "/items/import",
        { items: jsonData },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      Swal.close();

      Swal.fire(
        "Success",
        `${res.data.inserted || 0} items imported`,
        "success",
      );

      fetchItems();
    } catch (err) {
      Swal.close();

      Swal.fire(
        "Import Failed",
        err.response?.data?.message || "Server error",
        "error",
      );
    } finally {
      setImporting(false);

      // ✅ THIS LINE FIXES EVERYTHING
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ---------- Render ----------
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-green-500 mb-4">
        Items with low stock / ከ10 በታች ቀሪ ያላቸው እቃዎች
      </h2>

      {/* Top Controls */}
      {/* Top Controls */}
      <div className="bg-white rounded-xl border shadow-sm px-4 py-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* ===== Group 1: Branch Selector + Search ===== */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              className="h-10 w-38 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-24 border rounded-lg px-3 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              className="h-10 w-24 border rounded-lg px-3 text-sm"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <Input
              type="text"
              placeholder="Search item..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="h-10 w-64 sm:w-40"
            />
          </div>

          {/* ===== Group 2: Add Item + Import ===== */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-center">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>

            <Button
              onClick={() => fileInputRef.current.click()}
              disabled={importing}
              className={`bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow flex items-center justify-center ${
                importing ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="w-4 h-4 mr-1" />
              {importing ? "Importing..." : "Import"}
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept=".xlsx,.csv"
              onChange={(e) => importItems(e.target.files[0])}
            />
          </div>

          {/* ===== Group 3: Template, Export, Print, PDF ===== */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <Button
              onClick={() => setTemplateOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow"
            >
              <FileText className="w-4 h-4 mr-1" />
              Template
            </Button>

            <Button
              onClick={exportToExcel}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>

            <Button
              onClick={printTable}
              className="bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>

            <Button
              onClick={exportToPDF}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white shadow"
            >
              <FileDown className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {templateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[90%] max-w-md p-6 shadow-lg animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Select Template Type
            </h3>

            <div className="space-y-3">
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  generateTemplate("item_only");
                  setTemplateOpen(false);
                }}
              >
                Item Only
              </Button>

              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  generateTemplate("item_purchase");
                  setTemplateOpen(false);
                }}
              >
                Item + Purchase
              </Button>

              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => {
                  generateTemplate("item_purchase_sell");
                  setTemplateOpen(false);
                }}
              >
                Item + Purchase + Sell
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setTemplateOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div id="printableTable" className="overflow-x-auto">
        <DataTable
          columns={columns({
            selectedRows,
            setSelectedRows,
            setItems,
            printRef,
            isEditOpen,
            setIsEditOpen,
            selectedItem,
            setSelectedItem,
            setIsItemModalOpen,
            setSelectedRepairId,
          })}
          data={filteredItems}
        />
      </div>
    </div>
  );
};

export default LowStore;
