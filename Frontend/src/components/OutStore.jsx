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

const OutStore = () => {
  const {
    setItems, // We use the store's setItems to keep global sync
    setIsItemModalOpen,
    setSelectedRepairId,
  } = useStores();

  const printRef = useRef(null);
  const navigate = useNavigate();

  // Local state for the table
  const [itemsList, setItemsList] = useState([]);
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

  // --- API FETCH (Targeting the /items/out route) ---

const fetchOutItems = async () => {
  setIsLoading(true);

  try {
    const response = await api.get("/items/out-of-stock", {
      params: {
        search: searchItem || "",
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      },
    });

    // 1. Extract the data from Laravel Paginate structure
    const rows = response.data.data || [];
    const total = response.data.total || 0;

    // 2. Update the correct local states
    setItemsList(rows);    // Updates the rows in the table
    setTotalItems(total);  // Updates the pagination numbers
    
    // 3. Optional: Sync global store if you need it elsewhere
    setItems(rows); 

  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Failed to fetch out of stock items");
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
      fetchOutItems();
    }, 500);
    return () => clearTimeout(scoutTimer);
  }, [searchItem, pagination.pageIndex, pagination.pageSize]);

  // --- HANDLERS ---

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Out of Stock Items", 105, 20, { align: "center" });
    const headers = [
      ["Item Code", "Item Name", "Part Number", "Brand", "Location"],
    ];
    const data = itemsList.map((item) => [
      item.id,
      item.item_name,
      item.part_number,
      item.brand,
      item.location,
    ]);
    doc.autoTable({ startY: 30, head: headers, body: data });
    doc.save("out-of-stock-items.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(itemsList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Out of Stock");
    XLSX.writeFile(wb, "out-of-stock.xlsx");
  };

  const handleAddToPurchase = () => {
    if (selectedRows.length === 0) {
      toast.warn("Please select items to request purchase.");
      return;
    }
    navigate("/inventory/order", { state: { selectedIds: selectedRows } });
  };

  const handlePrint = () => {
    const content = document
      .querySelector("#printableTable table")
      .cloneNode(true);
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

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      {/* Title changed to reflect Finished Items */}
      <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-4">
        Finished Items / የተጠናቀቁ እቃዎች (Out of Stock)
      </h2>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
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
              <span className="absolute right-3 top-2.5 animate-spin">⏳</span>
            )}
          </div>

          <div className="flex gap-2">
            {/* Removed "Item Out" button since they are already out */}
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={handleAddToPurchase}
            >
              Request Purchase
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Removed "Add Item" and "Import" to keep this view as a report/status view */}
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
            setItems: setItemsList, // Use local setter for column interactions
            printRef,
            isEditOpen,
            setIsEditOpen,
            selectedItem,
            setSelectedItem,
            setIsItemModalOpen,
            setSelectedRepairId,
            pagination
          })}
          data={itemsList}
          rowCount={totalItems}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  );
};

export default OutStore;
