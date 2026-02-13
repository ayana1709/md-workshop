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
import { Layers, Wrench } from "lucide-react";
const Operation = () => {
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
          ? `/items?branch_id=${branchId}`
          : "/items";
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

  const filteredItems = useMemo(() => {
    let data = items;

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
          item.selling_price?.toString(),
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(keyword)),
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

  // ---------- Render ----------
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-green-500 mb-4">
        Operation Page
      </h2>

      {/* Top Controls */}
      <div className="bg-white rounded-xl border shadow-sm px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          {/* LEFT */}
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 w-full">
            {/* Branch Selector */}
            <select
              className="h-10 w-48 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500"
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

            {/* Search */}
            <Input
              type="text"
              placeholder="Search item..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="h-10 w-64"
            />
            <div className="flex flex-wrap gap-2 w-full md:w-auto md:ml-auto">
              {/* Assemble Item */}
              <Button
                onClick={() => {
                  toast.info("Assemble Item");
                  // navigate("/operation/assemble"); // optional
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:scale-105 transition"
              >
                <Layers className="w-4 h-4 mr-1" />
                Assemble Item
              </Button>

              {/* Split Into Parts */}
              <Button
                onClick={() => {
                  Swal.fire({
                    title: "Split item into parts?",
                    text: "This will separate the selected item into individual components and return them to stock.",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#f59e0b", // amber
                    confirmButtonText: "Yes, Split",
                  });
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow hover:scale-105 transition"
              >
                <Wrench className="w-4 h-4 mr-1" />
                Split Into Parts
              </Button>
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
          data={filteredItems}
        />
      </div>
    </div>
  );
};

export default Operation;
