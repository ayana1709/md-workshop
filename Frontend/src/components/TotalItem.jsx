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
import confetti from "canvas-confetti";

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
      const rows = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { defval: "", raw: true }
      );

      const cleaned = rows
        .map((row) => {
          const n = {};
          for (const k in row) n[k.trim().toLowerCase()] = row[k];
          const name = n["item name"] || n["item_name"] || n["item"];
          if (!name) return null;

          return {
            item_name: name,
            part_number: n["part number"] || n["part_number"] || null,
            brand: n["brand"] || "",
            unit: n["unit"] || "",
            quantity: toNumber(n["quantity"] || n["qty"]),
            low_quantity: toNumber(n["low quantity"] || n["low_quantity"]),
            purchase_price: toNumber(
              n["purchase price"] || n["purchase_price"]
            ),
            selling_price: toNumber(n["selling price"] || n["selling_price"]),
            least_price: toNumber(n["least price"] || n["least_price"]),
            image: n["image"] || "items/default.jpg",
            condition: n["condition"] || "New",
            type: n["type"] || "",
            manufacturer: n["manufacturer"] || "",
            location: n["location"] || "",
            shelf_number: n["shelf no"] || n["shelf_number"] || "",
          };
        })
        .filter(Boolean);

      if (!cleaned.length) {
        toast.error("No valid data found in file.");
        return;
      }

      // ===== THE BEST CIRCULAR PROGRESS UI =====
      Swal.fire({
        title:
          '<span style="color:#1e293b; font-size:22px; font-weight:700;">Syncing Assets</span>',
        html: `
        <div style="display:flex; flex-direction:column; align-items:center; padding: 15px 0;">
          <div style="position:relative; width:150px; height:150px;">
            <svg width="150" height="150" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" stroke-width="8" />
              <circle id="p-circle" cx="60" cy="60" r="52" fill="none" 
                stroke="url(#neonGrad)" stroke-width="10" stroke-linecap="round"
                stroke-dasharray="326.7" stroke-dashoffset="326.7"
                style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);" />
              <defs>
                <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#3b82f6" />
                  <stop offset="100%" style="stop-color:#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div id="p-percent" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:26px; font-weight:800; color:#1e293b; font-family:sans-serif;">0%</div>
          </div>
          <div id="p-status" style="margin-top:25px; font-weight:600; color:#475569; font-size:15px;">Initializing upload...</div>
          <div id="p-count" style="font-size:12px; color:#94a3b8; margin-top:5px; text-transform:uppercase; letter-spacing:1px;">Ready</div>
        </div>
      `,
        allowOutsideClick: false,
        showConfirmButton: false,
        background: "#fff",
        willOpen: () => {
          Swal.getPopup().style.borderRadius = "28px";
        },
      });

      const chunkSize = 100;
      let totalInserted = 0;
      let processed = 0;
      const total = cleaned.length;

      for (let i = 0; i < total; i += chunkSize) {
        const chunk = cleaned.slice(i, i + chunkSize);

        try {
          const res = await api.post("/items/import", { items: chunk });
          totalInserted += res.data?.inserted ?? chunk.length;
        } catch (err) {
          console.error("Batch failed", err);
        }

        processed = Math.min(i + chunkSize, total);

        // Update UI
        const percent = Math.round((processed / total) * 100);
        const circle = document.getElementById("p-circle");
        const percText = document.getElementById("p-percent");
        const statusText = document.getElementById("p-status");
        const countText = document.getElementById("p-count");

        if (circle)
          circle.style.strokeDashoffset = 326.7 - (percent / 100) * 326.7;
        if (percText) percText.innerText = `${percent}%`;
        if (countText) countText.innerText = `${processed} / ${total} items`;
        if (statusText)
          statusText.innerText =
            percent === 100
              ? "Finalizing database..."
              : "Uploading inventory...";
      }

      // Success Burst & Refresh
      triggerCelebration();
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      fetchItems();

      window.dispatchEvent(new Event("refreshInventoryStats"));
      await Swal.fire({
        icon: "success",
        title: "Import Successful",
        text: `Added ${totalInserted} items to your inventory.`,
        confirmButtonText: "Great!",
        confirmButtonColor: "#3b82f6",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.getPopup().style.borderRadius = "28px";
        },
      });
    } catch (err) {
      Swal.fire("Error", "Import failed unexpectedly", "error");
    }
  };

  /**
   * Fires a high-end multi-directional confetti show
   */
  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 2;
      // Left side
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6"],
        zIndex: 10000,
      });
      // Right side
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6"],
        zIndex: 10000,
      });

      requestAnimationFrame(frame);
    };
    frame();
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
          <Button variant="outline" onClick={handleImportClick}>
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
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(2px)",
              transition: "all 0.3s ease",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
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
            pagination
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
