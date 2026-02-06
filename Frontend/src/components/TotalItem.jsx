import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { DataTable } from "./ui/dataTable";
import { columns } from "./Columns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import api from "@/api";
import Swal from "sweetalert2";

const TotalItem = () => {
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
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const {
    items,
    setItems,
    setShowModal,
    setIsItemModalOpen,
    setSelectedRepairId,
  } = useStores();

  const filteredItems = useMemo(() => {
    let data = items;

    if (searchItem) {
      const keyword = searchItem.toLowerCase();

      data = data.filter((item) =>
        [
          item.item_name,
          item.part_number,
          item.brand,
          item.type,
          item.condition,
          item.location,
          item.shelf_number,
          item.purchase_price?.toString(),
          item.selling_price?.toString(),
          item.quantity?.toString(),
        ]
          .filter(Boolean) // remove null/undefined
          .some((field) => field.toLowerCase().includes(keyword))
      );
    }

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
  }, [items, searchItem, startDate, endDate]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Store Items", 105, 20, { align: "center" });
    const headers = [
      [
        "Item Code",
        "Item Name",
        "Part Number",
        "Brand",
        // "Unit",
        "Quantity",
        // "Low In  Qty",
        "Purchase Price",
        "Selling Price",
        // "Least Price",
        "Condition",
        "Type",
        // "Manufacturer",
        "Location",
        "Shelf Number",
      ],
    ];
    const data = filteredItems.map((item) => [
      item.id || "",
      item.item_name || "",
      item.part_number || "",
      item.brand || "",
      // item.unit || "",
      item.quantity || "",
      // item.low_quantity || "",
      item.purchase_price || "",
      item.selling_price || "",
      // item.least_price || "",
      item.condition || "",
      item.type || "",
      // item.manufacturer || "",
      item.location || "",
      item.shelf_number || "",
    ]);
    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 122, 102], textColor: [255, 255, 255] },
    });
    doc.save("store-items.pdf");
  };

  const handleExportExcel = () => {
    const exportData = filteredItems.map((item) => ({
      item_name: item.item_name || "",
      part_number: item.part_number || "",
      brand: item.brand || "",
      unit: item.unit || "",
      quantity: item.quantity || "",
      low_quantity: item.low_quantity || "",
      purchase_price: item.purchase_price || "",
      selling_price: item.selling_price || "",
      least_price: item.least_price || "",
      condition: item.condition || "",
      type: item.type || "",
      manufacturer: item.manufacturer || "",
      location: item.location || "",
      shelf_number: item.shelf_number || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Items");
    XLSX.writeFile(wb, "store-items.xlsx");
  };

  const handleAddToSales = () => {
    const selectedIds = selectedRows.map((row) => row);
    navigate("/inventory/add-to-sale", { state: { selectedIds } });
  };

  const handleAddToPurchase = () => {
    const selectedIds = selectedRows.map((row) => row);
    navigate("/inventory/order", { state: { selectedIds } });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        item_name: "",
        part_number: "",
        brand: "",
        unit: "",
        quantity: "",
        low_quantity: "",
        purchase_price: "",
        selling_price: "",
        least_price: "",
        condition: "",
        type: "",
        manufacturer: "",
        location: "",
        shelf_number: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Template");
    XLSX.writeFile(wb, "store_template.xlsx");
  };

  const handlePrint = () => {
    const originalTable = document.querySelector("#printableTable table");
    if (!originalTable) return alert("Table not found.");
    const clonedTable = originalTable.cloneNode(true);
    const headerCells = clonedTable.querySelectorAll("thead th");
    let removeIndexes = [];
    headerCells.forEach((th, index) => {
      const text = th.textContent?.toLowerCase();
      const hasCheckbox = th.querySelector("input[type='checkbox']");
      const hasIcon = th.querySelector("svg");
      if (
        text.includes("action") ||
        text.includes("options") ||
        hasCheckbox ||
        hasIcon ||
        text.trim() === ""
      ) {
        removeIndexes.push(index);
      }
    });
    clonedTable.querySelectorAll("tr").forEach((row) => {
      const cells = Array.from(row.children);
      removeIndexes.forEach((i) => {
        if (cells[i]) row.removeChild(cells[i]);
      });
      cells.forEach((cell) => {
        const elements = cell.querySelectorAll(
          "button, svg, .dropdown, [role='button']"
        );
        elements.forEach((el) => el.remove());
      });
    });
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${clonedTable.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current?.click();
  };

  const toNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: true,
      });

      if (!rows.length) {
        toast.error("Import failed: No rows found.");
        return;
      }

      const cleaned = rows
        .map((row) => {
          const normalized = {};
          for (const key in row) {
            normalized[key.trim().toLowerCase()] = row[key];
          }

          if (Object.values(normalized).join("").trim() === "") return null;

          const itemName =
            normalized["item name"] ||
            normalized["item_name"] ||
            normalized["item"];

          if (!itemName) return null;

          return {
            item_name: itemName,
            part_number:
              normalized["part number"] || normalized["part_number"] || null,
            brand: normalized["brand"] || "",
            unit: normalized["unit"] || "",
            quantity: toNumber(
              normalized["quantity"] || normalized["qyt"] || normalized["qnty"]
            ),
            low_quantity: toNumber(
              normalized["low quantity"] || normalized["low_quantity"]
            ),
            purchase_price: toNumber(
              normalized["purchase price"] || normalized["purchase_price"]
            ),
            selling_price: toNumber(
              normalized["selling price"] || normalized["selling_price"]
            ),
            least_price: toNumber(
              normalized["least price"] || normalized["least_price"]
            ),
            image: normalized["image"] || "items/default.jpg",
            condition: normalized["condition"] || "New",
            type: normalized["type"] || "",
            manufacturer: normalized["manufacturer"] || "",
            location: normalized["location"] || "",
            shelf_number:
              normalized["shelf no"] || normalized["shelf_number"] || "",
          };
        })
        .filter(Boolean);

      if (!cleaned.length) {
        toast.error("No valid items found to import.");
        return;
      }

      // ===== PROGRESS MODAL (ANIMATED) =====
      Swal.fire({
        title: "Importing Items...",
        html: `
        <div style="font-size:14px;margin-bottom:6px">
          <span id="import-percent">0%</span>
        </div>

        <div style="background:#e5e7eb;height:12px;border-radius:8px;overflow:hidden">
          <div id="import-bar" style="
            height:100%;
            width:0%;
            background:#2563eb;
            transition: width 0.4s ease;
          "></div>
        </div>
      `,
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      const chunkSize = 100;
      const failedChunks = [];
      let totalInserted = 0;
      let lastMessage = "Import completed";
      let importedCount = 0;

      for (let i = 0; i < cleaned.length; i += chunkSize) {
        const chunk = cleaned.slice(i, i + chunkSize);

        try {
          const res = await api.post("/items/import", { items: chunk });

          const message = res.data?.message || "Import completed";
          const inserted = res.data?.inserted ?? 0;

          totalInserted += inserted;
          importedCount += inserted;
        } catch (err) {
          console.error("Failed to import chunk:", chunk, err);
          failedChunks.push(chunk);
        }

        // Update progress bar based on attempted import
        const percent = Math.min(
          Math.round((importedCount / cleaned.length) * 100),
          100
        );

        const bar = document.getElementById("import-bar");
        const text = document.getElementById("import-percent");

        if (bar && text) {
          bar.style.width = percent + "%";
          text.innerText = percent + "%";
        }
      }

      await new Promise((r) => setTimeout(r, 400));

      Swal.fire({
        icon: "success",
        title: "Import Result",
        html: `
    <p>✅ ${lastMessage}</p>
    <hr/>
    <p>You Imported Total Items Of: <b>${totalInserted}</b></p>

  `,
      });

      fetchItems();

      fetchItems();
    } catch (err) {
      Swal.close();
      toast.error(
        "Import failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/items");
      console.log("FETCH RESPONSE:", res.data);

      // FIX: If backend returns plain array
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.log("Failed to fetch items", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-green-500 mb-4">
        Store / ጠቅላላ የዕቃ ዝርዝር
      </h2>




{/* Top Inventory Controls */}
<div className="bg-white rounded-xl border shadow-sm px-4 py-3 mb-4">
  <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 justify-between">

    {/* LEFT CONTROLS */}
    <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 w-full">

      {/* Branch Selector */}
      <select
        className="h-10 w-48 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setSelectedBranch(e.target.value)}
      >
        <option value="all">All Branches</option>
        <option value="hq">Head Office</option>
        <option value="b1">Branch 01</option>
        <option value="b2">Branch 02</option>
      </select>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search item..."
        value={searchItem}
        onChange={(e) => setSearchItem(e.target.value)}
        
        className="h-10 w-64"
      />

      {/* Item Out */}
      <Button className="h-10 bg-green-500 hover:bg-green-600 text-white"
          onClick={handleAddToSales}>
        Sale
      </Button>

      {/* Transfer */}
      <Button className="h-10 bg-indigo-500 hover:bg-indigo-600 text-white">
        Transfer
      </Button>

      {/* Send to Ecommerce */}
      <Button className="h-10 bg-teal-500 hover:bg-teal-600 text-white">
        Send to Ecommerce
      </Button>

      {/* Request Purchase */}
      <Button className="h-10 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleAddToPurchase}>
        Request Purchase
      </Button>

      {/* Operation Dropdown */}
      <div className="relative group">
        <Button
          variant="outline"
          className="h-10 border-gray-400 text-gray-700"
        >
          Operation ▾
        </Button>

        <div className="absolute left-0 mt-2 w-44 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
            🧱 Build Up
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
            🧨 Destructure
          </button>
        </div>
      </div>
    </div>

    {/* RIGHT CONTROLS */}
    <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">

      {/* Add Item */}
      <Button
        onClick={() => setShowModal(true)}
        className="h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 rounded-lg shadow hover:scale-105 transition"
      >
        + Add Item
      </Button>

      {/* Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        className="h-10 border-green-500 text-green-600"
        onClick={handleImportClick}
      >
        Import
      </Button>

      {/* Export Dropdown */}
      <div className="relative group">
        <Button
          variant="outline"
          className="h-10 border-blue-500 text-blue-600"
        >
          Export ▾
        </Button>

        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
          <button
            onClick={handleDownloadTemplate}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            📄 Template
          </button>
          <button
            onClick={handlePrint}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            🖨 Print
          </button>
          <button
            onClick={handleExportPDF}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            📕 Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
          >
            📗 Export Excel
          </button>
        </div>
      </div>
    </div>
  </div>
</div>







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
          data={filteredItems} // 👈 send all filtered items
        />
      </div>
    </div>
  );
};

export default TotalItem;