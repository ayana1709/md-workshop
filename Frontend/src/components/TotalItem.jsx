import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { DataTable } from "./ui/dataTable";
import { columns } from "./columns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import api from "@/api";

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
      data = data.filter((item) =>
        item.part_number?.toLowerCase().includes(searchItem.toLowerCase())
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

          // skip empty
          if (Object.values(normalized).join("").trim() === "") return null;

          const quantity =
            normalized["quantity"] ||
            normalized["qty"] ||
            normalized["qnty"] ||
            "";

          return {
            item_name:
              normalized["item name"] ||
              normalized["item_name"] ||
              normalized["item"] ||
              "",
            part_number:
              normalized["part number"] || normalized["part_number"] || null,
            brand: normalized["brand"] || "",
            unit: normalized["unit"] || "",
            quantity: Number(quantity) || 0,
            low_quantity:
              normalized["low quantity"] || normalized["low_quantity"] || 0,
            purchase_price:
              normalized["purchase price"] || normalized["purchase_price"] || 0,
            selling_price:
              normalized["selling price"] || normalized["selling_price"] || 0,
            least_price:
              normalized["least price"] || normalized["least_price"] || 0,

            // Default image automatically
            image: normalized["image"] || "items/default.jpg",

            condition: normalized["condition"] || "New",
            type: normalized["type"] || "",
            manufacturer: normalized["manufacturer"] || "",
            location: normalized["location"] || "",
            shelf_number:
              normalized["shelf number"] || normalized["shelf_number"] || "",
          };
        })
        .filter(Boolean);

      const response = await api.post("/items/import", {
        items: cleaned,
      });

      toast.success("Items imported successfully!");

      // 🟢 Re-fetch items instead of manual setItems
      await fetchItems(); // <-- You MUST create this function
    } catch (error) {
      toast.error(
        "Import failed: " + (error.response?.data?.message || error.message)
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

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        {/* Search & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search part number..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="w-full sm:w-64"
          />
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
              Import
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
