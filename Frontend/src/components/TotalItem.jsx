import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "../contexts/storeContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { DataTable } from "./ui/dataTable"; // Assuming this is your ShadCN wrapper
import { columns } from "./columns"; // We'll define this shortly
import { FiSearch } from "react-icons/fi";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

import { toast } from "react-toastify";
import api from "@/api";

const TotalItem = () => {
  const printRef = useRef(null);
  const fileInputRef = useRef(null); // top of component
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchItem, setSearchItem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
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
  console.log(selectedRows);

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
        "Description",
        "Part Number",
        "Brand",
        "Unit",
        "Quantity",
        "Purchase Price",
        "Selling Price",
        "Location",
      ],
    ];

    const data = filteredItems.map((item) => [
      item.id || "",
      item.description || "",
      item.part_number || "",
      item.brand || "",
      item.unit || "",
      item.quantity || 0,
      item.purchase_price || "0.00",
      item.selling_price || "0.00",
      item.location || "",
    ]);

    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [0, 122, 102],
        textColor: [255, 255, 255],
      },
    });

    doc.save("store-items.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredItems);
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

  const handlePrint = () => {
    const originalTable = document.querySelector("#printableTable table");
    if (!originalTable) return alert("Table not found.");

    const clonedTable = originalTable.cloneNode(true);

    // Identify indexes of unwanted columns
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

    // Clean rows
    clonedTable.querySelectorAll("tr").forEach((row) => {
      const cells = Array.from(row.children);

      // Remove entire column cells (checkbox, actions)
      removeIndexes.forEach((i) => {
        if (cells[i]) row.removeChild(cells[i]);
      });

      // Inside remaining cells, remove only interactive elements (buttons, dropdowns, icons)
      cells.forEach((cell) => {
        // Remove buttons/icons inside the cell, but preserve text
        const buttonsAndIcons = cell.querySelectorAll(
          "button, svg, .dropdown, [role='button']"
        );
        buttonsAndIcons.forEach((el) => {
          el.remove();
        });
      });
    });

    // Print the cleaned table
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${clonedTable.outerHTML}
        </body>
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

      const importedItems = XLSX.utils.sheet_to_json(worksheet);

      // Send to backend
      const response = await api.post("/items/import", {
        items: importedItems,
      });

      toast.success("Items imported successfully!");

      // ✅ Use the backend response that includes item.code
      if (response.data.items) {
        setItems((prev) => [...prev, ...response.data.items]);
      }
    } catch (error) {
      toast.error(
        "Import failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-green-500 mb-4">
        Store / ጠቅላላ የዕቃ ዝርዝር
      </h2>
      <div className="flex flex-wrap justify-between gap-4 mb-4 items-center">
        <div className="flex items-center gap-4 rounded-md px-2">
          <Input
            type="text"
            placeholder="Search part number..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="focus:ring-0 ml-2"
          />

          <div className="flex items-center gap-2">
            {" "}
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            className=""
          >
            + Add Item
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Button variant="outline" onClick={handleImportClick}>
            Import
          </Button>
          <Button onClick={handlePrint}>Print</Button>
          <Button onClick={handleExportPDF}>PDF</Button>
          <Button onClick={handleExportExcel}>Excel</Button>
        </div>
      </div>

      <div id="printableTable">
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
          data={paginatedItems}
          manualPagination
          pageCount={totalPages}
          pageIndex={currentPage - 1}
          onPaginationChange={(page) => setCurrentPage(page + 1)}
        />
      </div>
    </div>
  );
};

export default TotalItem;
