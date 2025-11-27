import { useEffect, useState, useRef } from "react";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import Swal from "sweetalert2";
import ProformaTable from "./ProformaTable";
import ProformaSearch from "./ProformaSearch";
import ViewProformaModal from "./modals/ViewProformaModal";
import EditProformaModal from "./modals/EditProformaModal";
import ProformaPrint from "./modals/ProformaPrint";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import DateInput from "@/components/DateInput";

function ManageProforma() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proformas, setProformas] = useState([]);
  const [filteredProformas, setFilteredProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  // const tableRef = useRef();

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    try {
      const res = await api.get("/proformas");
      setProformas(res.data);
      setFilteredProformas(res.data);
      setError(null);
    } catch {
      setError("Failed to fetch proformas.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Date filter logic
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredProformas(proformas);
      return;
    }

    const filtered = proformas.filter((item) => {
      const d = new Date(item.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    setFilteredProformas(filtered);
  }, [startDate, endDate, proformas]);

  const fetchProformaDetails = async (jobId, type) => {
    try {
      const res = await api.get(`/proformas/${jobId}`);
      setSelectedProforma(res.data);
      if (type === "view") setViewOpen(true);
      if (type === "print") setPrintOpen(true);
      if (type === "edit") setEditOpen(true);
    } catch {
      Swal.fire("Error", "Failed to load proforma.", "error");
    }
  };

  const handleDelete = async (jobId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This proforma will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/proformas/${jobId}`);
      Swal.fire("Deleted!", "Proforma deleted successfully.", "success");
      fetchProformas();
    } catch {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ✅ Print current table
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef, // ✅ New API for v3+
    documentTitle: "Proforma List",
  });

  // ✅ Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Proforma List", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [
        ["#", "Ref Num", "Date", "Delivery", "Customer", "Amount", "Status"],
      ],
      body: filteredProformas.map((p, i) => [
        i + 1,
        p.ref_num,
        p.date,
        p.delivery_date,
        p.customer_name,
        `${p.net_pay?.toFixed(2)} Birr`,
        p.status,
      ]),
      theme: "grid",
      styles: { fontSize: 8 },
    });
    doc.save("Proforma_List.pdf");
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    const sheetData = filteredProformas.map((p, i) => ({
      "#": i + 1,
      "Ref Num": p.ref_num,
      Date: p.date,
      Delivery: p.delivery_date,
      Customer: p.customer_name,
      Amount: `${Number(p.net_pay || 0).toFixed(2)} Birr`,
      Status: p.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proformas");
    XLSX.writeFile(workbook, "Proforma_List.xlsx");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Swal.fire("Imported", `File "${file.name}" uploaded (mock).`, "success");
    e.target.value = "";
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6">
          <div className="w-full bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-md rounded-xl">
            {/* Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Manage Proformas
              </h1>
              <button
                onClick={() => navigate("/proformas/create")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm"
              >
                + Create Formal Proforma
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-3">
              {/* Left side */}
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                <DateInput
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  placeholder="From date"
                  className="w-36 border border-gray-300 p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-gray-500 font-medium">to</span>
                <DateInput
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  placeholder="To date"
                  className="w-36 border border-gray-300 p-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400"
                />

                {/* Search input */}
                <div className="flex-grow min-w-[200px]">
                  <ProformaSearch
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Right side (Export buttons) */}
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleExportExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  PDF
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  Print
                </button>
              </div>
            </div>

            {/* ======= Table ======= */}
            <div className="overflow-x-auto mt-4" ref={printRef}>
              <ProformaTable
                data={filteredProformas}
                loading={loading}
                error={error}
                globalFilter={globalFilter}
                onView={(id) => fetchProformaDetails(id, "view")}
                onPrint={(id) => fetchProformaDetails(id, "print")}
                onEdit={(id) => fetchProformaDetails(id, "edit")}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </main>
      </div>

      {/* ======= Modals ======= */}
      <ViewProformaModal
        proforma={selectedProforma}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />
      <ProformaPrint
        proforma={selectedProforma}
        open={printOpen}
        onClose={() => setPrintOpen(false)}
      />
      <EditProformaModal
        proforma={selectedProforma}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchProformas}
      />
    </div>
  );
}

export default ManageProforma;
