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
  const [isLoading, setIsLoading] = useState(false);
  const {
    items,
    setItems,
    setShowModal,
    setIsItemModalOpen,
    setSelectedRepairId,
  } = useStores();

  const filteredItems = useMemo(() => {
    let data = items;

    // We only handle Date filtering locally now
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
  }, [items, startDate, endDate]);

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
        title: "Importing Items",
        html: `
    <div style="text-align:left;font-size:13px">

      <div id="import-status" style="margin-bottom:6px;color:#374151">
        Preparing import…
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span id="import-count">0 / 0 items</span>
        <span id="import-percent">0%</span>
      </div>

      <div style="
        background:#e5e7eb;
        height:12px;
        border-radius:8px;
        overflow:hidden;
      ">
        <div id="import-bar" style="
          height:100%;
          width:0%;
          background:linear-gradient(45deg,#2563eb,#3b82f6);
          background-size:200% 100%;
          animation: moveBg 1.5s linear infinite;
          transition: width 0.35s ease;
        "></div>
      </div>

      <div style="margin-top:8px;font-size:12px;color:#6b7280">
        Please don’t close this window
      </div>

      <style>
        @keyframes moveBg {
          0% { background-position:0% 50%; }
          100% { background-position:100% 50%; }
        }
      </style>

    </div>
  `,
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      // Import logic
      const chunkSize = 100;
      const failedChunks = [];
      let totalInserted = 0;
      let processed = 0;
      const total = cleaned.length;

      for (let i = 0; i < total; i += chunkSize) {
        const chunk = cleaned.slice(i, i + chunkSize);

        updateUI(
          `Importing items ${i + 1} – ${Math.min(i + chunkSize, total)}`
        );

        try {
          const res = await api.post("/items/import", { items: chunk });

          const inserted = res.data?.inserted ?? chunk.length;
          totalInserted += inserted;
          processed += chunk.length;
        } catch (err) {
          console.error("Import chunk failed", err);
          failedChunks.push(chunk);
          processed += chunk.length;
        }

        updateUI("Processing…");
      }

      // Small delay for smooth UX
      await new Promise((r) => setTimeout(r, 500));

      // Final result
      Swal.fire({
        icon: failedChunks.length ? "warning" : "success",
        title: "Import Completed",
        html: `
    <div style="text-align:left;font-size:14px">
      <p>✅ Imported: <b>${totalInserted}</b> items</p>
      ${
        failedChunks.length
          ? `<p style="color:#b91c1c">
               ⚠️ Failed Chunks: ${failedChunks.length}
             </p>`
          : ""
      }
      <hr/>
      <p style="font-size:12px;color:#6b7280">
        You can safely continue working now.
      </p>
    </div>
  `,
      });

      // UI updater
      function updateUI(status) {
        const percent = Math.min(Math.round((processed / total) * 100), 100);

        const bar = document.getElementById("import-bar");
        const percentEl = document.getElementById("import-percent");
        const countEl = document.getElementById("import-count");
        const statusEl = document.getElementById("import-status");

        if (bar) bar.style.width = percent + "%";
        if (percentEl) percentEl.innerText = percent + "%";
        if (countEl) countEl.innerText = `${processed} / ${total} items`;
        if (statusEl) statusEl.innerText = status;
      }
    } catch (err) {
      Swal.close();
      toast.error(
        "Import failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const fetchItems = async (query = "") => {
    setIsLoading(true);
    try {
      const res = await api.get(`/items?search=${encodeURIComponent(query)}`);

      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error("Scout search failed", err);
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const scoutTimer = setTimeout(() => {
      fetchItems(searchItem);
    }, 500);

    return () => clearTimeout(scoutTimer);
  }, [searchItem]);
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-green-500 mb-4">
        Store / ጠቅላላ የዕቃ ዝርዝር
      </h2>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        {/* Search & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Search Input with Spinner */}
<div className="relative">
            <Input
              placeholder="Scout inventory..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="w-64 pr-10"
            />
            {searchItem && !isLoading && (
              <button onClick={() => setSearchItem("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 text-lg">✕</button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              className="bg-green-500 text-white hover:bg-green-600 w-full sm:w-auto"
              onClick={handleAddToSales}
            >
              Item Out
            </Button>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto"
              onClick={handleAddToPurchase}
            >
              Request Purchase
            </Button>
          </div>
        </div>

        {/* Import / Export Controls */}
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <Button
            onClick={() => setShowModal(true)}
            className="
              font-extrabold 
              text-white 
              bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 
              px-6 py-2 
              rounded-lg 
              shadow-md 
              hover:shadow-lg 
              hover:scale-105 
              transition-all 
              duration-200 
              flex items-center gap-2
            "
          >
            <span className="text-xl">+</span> Add Item
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={handleImportClick}
            >
              Imp1997-12ort
            </Button>

            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={handleDownloadTemplate}
            >
              Template
            </Button>

            <Button
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              onClick={handlePrint}
            >
              Print
            </Button>
          </div>

          <Button
            className="bg-green-500 text-white hover:bg-green-600"
            onClick={handleExportPDF}
          >
            PDF
          </Button>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleExportExcel}
          >
            Excel
          </Button>
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
