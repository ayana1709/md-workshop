import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import ProformaHeader from "./ProformaHeader";
import ProformaTable from "./ProformaTable";
import ProformaPrint from "./ManageProforma/modals/ProformaPrint"; // ✅ import your print layout
import { useStores } from "@/contexts/storeContext";
import ProformaFooter from "./ProformaFooter";
import { useNavigate } from "react-router-dom";

function ProformaForm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setProformas } = useStores();

  const [formData, setFormData] = useState({
    // jobId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    refNum: "",
    customerName: "",
    status: "",
    customerTin: "",
    validityDate: "",
    deliveryDate: "",
    preparedBy: "",
    paymentBefore: "",
    notes: "",
  });

  const [labourRows, setLabourRows] = useState([
    { description: "", unit: "", estTime: "", cost: "", total: 0, remark: "" },
  ]);

  const [spareRows, setSpareRows] = useState([
    {
      description: "",
      unit: "",
      brand: "",
      qty: "",
      unit_Price: "",
      total: 0,
      remark: "",
    },
  ]);

  const [labourVat, setLabourVat] = useState(false);
  const [spareVat, setSpareVat] = useState(false);
  const [otherCost, setOtherCost] = useState("");
  const [discount, setDiscount] = useState("");
  const [summary, setSummary] = useState({
    total: "",
    totalVat: "",
    grossTotal: "",
    netPay: "",
    netPayInWords: "",
  });
  const printRef = useRef();

  // inside your component
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        labourRows,
        spareRows,
        labourVat,
        spareVat,
        otherCost,
        discount,
        summary,
      };

      const { data } = await api.post("/proformas", payload);

      setProformas((prev) => [...prev, data]);

      Swal.fire({
        title: "Success!",
        text: "Proforma registered successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        resetForm();
        navigate("/manage-proforma"); // redirect after success
      });
    } catch (error) {
      console.error("Proforma save failed:", error);
      Swal.fire("Error", "Failed to save proforma.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      // jobId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      refNum: "",
      customerName: "",
      status: "",
      customerTin: "",
      validityDate: "",
      deliveryDate: "",
      preparedBy: "",
      paymenttype: "cash",

      paymentBefore: "",
      notes: "",
    });
    setLabourRows([
      {
        description: "",
        unit: "",
        estTime: "",
        cost: "",
        total: 0,
        remark: "",
      },
    ]);
    setSpareRows([
      {
        description: "",
        unit: "",
        brand: "",
        qty: "",
        unit_Price: "",
        total: 0,
        remark: "",
      },
    ]);
    setLabourVat(false);
    setSpareVat(false);
    setOtherCost("");
    setDiscount("");
  };
  const handleSubmitWithStatus = async (statusType) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: statusType || formData.status || "active", // 👈 set "draft" or "active"
        labourRows,
        spareRows,
        labourVat,
        spareVat,
        otherCost,
        discount,
        summary,
      };

      const { data } = await api.post("/proformas", payload);

      setProformas((prev) => [...prev, data]);

      Swal.fire({
        title: "Success!",
        text:
          statusType === "draft"
            ? "Proforma saved as draft."
            : "Proforma registered successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        resetForm();
        navigate("/manage-proforma");
      });
    } catch (error) {
      console.error("Proforma save failed:", error);
      Swal.fire("Error", "Failed to save proforma.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6">
          <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-semibold mb-6 text-center">
              Proforma Invoice
            </h1>
            <div className="space-y-6">
              <ProformaHeader formData={formData} setFormData={setFormData} />
              <ProformaTable
                labourRows={labourRows}
                setLabourRows={setLabourRows}
                spareRows={spareRows}
                setSpareRows={setSpareRows}
                labourVat={labourVat}
                setLabourVat={setLabourVat}
                spareVat={spareVat}
                setSpareVat={setSpareVat}
                otherCost={otherCost}
                setOtherCost={setOtherCost}
                discount={discount}
                setDiscount={setDiscount}
                setSummary={setSummary}
              />
              <ProformaFooter formData={formData} setFormData={setFormData} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              {/* Save as Draft */}
              <button
                onClick={() => handleSubmitWithStatus("draft")}
                disabled={loading}
                className={`px-4 py-2 rounded shadow-md font-medium transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? "Saving..." : "Save as Draft"}
              </button>

              {/* Save Proforma */}
              <button
                onClick={() => handleSubmitWithStatus("active")}
                disabled={loading}
                className={`px-4 py-2 rounded shadow-md font-medium transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? "Saving..." : "Save Proforma"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProformaForm;
