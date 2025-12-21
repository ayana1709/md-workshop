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

const LowStore = () => {
  const {
    setItems, // Global sync if needed
    setIsItemModalOpen,
    setSelectedRepairId,
  } = useStores();

  const printRef = useRef(null);
  const navigate = useNavigate();

  // --- STATE ---
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

  // --- API FETCH (Server-Side Pagination) ---
  const fetchLowStockItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchItem || "",
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });

      // Target your low-stock route
      const res = await api.get(`/items/low-stock?${params.toString()}`);

      // Handle Laravel Type B Response (Paginated)
      const itemsArray = res.data.data || [];
      const totalCount = res.data.total || 0;

      setItemsList(itemsArray);
      setTotalItems(totalCount);
      
      // Keep global store in sync
      setItems(itemsArray); 
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Failed to load low stock items");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to page 1 on new search
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchItem]);

  // Debounced Fetching
  useEffect(() => {
    const scoutTimer = setTimeout(() => {
      fetchLowStockItems();
    }, 500);
    return () => clearTimeout(scoutTimer);
  }, [searchItem, pagination.pageIndex, pagination.pageSize]);

  // --- HANDLERS ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Low Stock Items Report", 105, 20, { align: "center" });
    const headers = [["ID", "Name", "Part Number", "Qty", "Location"]];
    const data = itemsList.map(i => [i.id, i.item_name, i.part_number, i.quantity, i.location]);
    doc.autoTable({ startY: 30, head: headers, body: data });
    doc.save("low-stock.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(itemsList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Low Stock");
    XLSX.writeFile(wb, "low-stock.xlsx");
  };

  const handleAddToPurchase = () => {
    if (selectedRows.length === 0) {
      return toast.info("Please select items to request purchase.");
    }
    navigate("/inventory/order", { state: { selectedIds: selectedRows } });
  };

  const handlePrint = () => {
    const table = document.querySelector("#printableTable table").cloneNode(true);
    table.querySelectorAll("th:last-child, td:last-child, button, svg").forEach(el => el.remove());
    const win = window.open("", "", "height=600,width=800");
    win.document.write(`<html><head><style>table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;}</style></head><body>${table.outerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-orange-500 mb-4">
        Items with low stock / ከ10 በታች ቀሪ ያላቸው እቃዎች
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
            {isLoading && (
              <span className="absolute right-3 top-2.5 animate-spin text-gray-400">⏳</span>
            )}
          </div>
          
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={handleAddToPurchase}
          >
            Request Purchase
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrint}>Print</Button>
          <Button className="bg-green-500 text-white" onClick={handleExportPDF}>PDF</Button>
          <Button className="bg-blue-500 text-white" onClick={handleExportExcel}>Excel</Button>
        </div>
      </div>

      <div id="printableTable" className="overflow-x-auto">
        <DataTable
          columns={columns({
            selectedRows,
            setSelectedRows,
            setItems: setItemsList, // Pass local state setter to columns
            printRef,
            isEditOpen,
            setIsEditOpen,
            selectedItem,
            setSelectedItem,
            setIsItemModalOpen,
            setSelectedRepairId,
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

export default LowStore;