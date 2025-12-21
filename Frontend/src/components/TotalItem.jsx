import React, { useRef, useState, useEffect } from "react";
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
  const {
    items,
    setItems,
    setShowModal,
    setIsItemModalOpen,
    setSelectedRepairId,
  } = useStores();

  const fileInputRef = useRef(null);
  const printRef = useRef(null);
  const navigate = useNavigate();

  const [searchItem, setSearchItem] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchItem || "",
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });

      const res = await api.get(`/items?${params.toString()}`);

      // Laravel standard: res.data.data for items, res.data.total for count
      setItems(res.data.data || []);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page when searching
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchItem]);

  // Debounced Fetch
  useEffect(() => {
    const scoutTimer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(scoutTimer);
  }, [searchItem, pagination.pageIndex, pagination.pageSize]);

  // --- HANDLERS ---

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Store Items", 105, 20, { align: "center" });
    const headers = [
      [
        "Item Code",
        "Item Name",
        "Part Number",
        "Brand",
        "Quantity",
        "Price",
        "Condition",
        "Location",
      ],
    ];
    const data = items.map((item) => [
      item.id,
      item.item_name,
      item.part_number,
      item.brand,
      item.quantity,
      item.selling_price,
      item.condition,
      item.location,
    ]);
    doc.autoTable({ startY: 30, head: headers, body: data });
    doc.save("store-items.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Items");
    XLSX.writeFile(wb, "store-items.xlsx");
  };

  const handleAddToSales = () => {
    navigate("/inventory/add-to-sale", {
      state: { selectedIds: selectedRows },
    });
  };

  const handleAddToPurchase = () => {
    navigate("/inventory/order", { state: { selectedIds: selectedRows } });
  };

  const handlePrint = () => {
    const content = document
      .querySelector("#printableTable table")
      .cloneNode(true);
    // Remove action columns/buttons from clone before printing
    content
      .querySelectorAll("th:last-child, td:last-child, button, svg")
      .forEach((el) => el.remove());

    const win = window.open("", "", "height=600,width=800");
    win.document.write(
      `<html><head><title>Print</title><style>table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;}</style></head><body>${content.outerHTML}</body></html>`
    );
    win.document.close();
    win.print();
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

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-green-500 mb-4">
        Store / ጠቅላላ የዕቃ ዝርዝር
      </h2>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <div className="relative">
              <Input
                placeholder="Search part number..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-64"
              />
              {searchItem && !isLoading && (
                <button
                  onClick={() => setSearchItem("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400"
                >
                  ✕
                </button>
              )}
              {isLoading && (
                <span className="absolute right-3 top-2.5 animate-spin">
                  ⏳
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handleAddToSales}
            >
              Item Out
            </Button>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={handleAddToPurchase}
            >
              Request Purchase
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            + Add Item
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current.click()}
          >
            Import
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
          <Button className="bg-green-500 text-white" onClick={handleExportPDF}>
            PDF
          </Button>
          <Button
            className="bg-blue-500 text-white"
            onClick={handleExportExcel}
          >
            Excel
          </Button>
        </div>
      </div>

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
          data={items} 
          rowCount={totalItems}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  );
};

export default TotalItem;
