import { useState, useRef } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import ProformaHeader from "./ProformaHeader";
import ProformaTable from "./ProformaTable";
import { useStores } from "@/contexts/storeContext";

function ProformaForm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setProformas } = useStores();

  const [formData, setFormData] = useState({
    jobId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    refNum: "",
    customerName: "",
    product_name: "",
    types_of_jobs: "",
    customerTin: "",
    validityDate: "",
    deliveryDate: "",
    preparedBy: "",
    paymentBefore: "",
    notes: "",
  });

  const [labourRows, setLabourRows] = useState([
    { description: "", unit: "", estTime: "", cost: 0, total: 0 },
  ]);

  const [spareRows, setSpareRows] = useState([
    { description: "", unit: "", brand: "", qty: 0, unitPrice: 0, total: 0 },
  ]);

  const [labourVat, setLabourVat] = useState(false);
  const [spareVat, setSpareVat] = useState(false);
  const [otherCost, setOtherCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    totalVat: 0,
    grossTotal: 0,
    withholding: 0,
    netPay: 0,
    netPayInWords: "",
  });

  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Proforma_${formData.jobId || "Invoice"}`,
  });

  const validateForm = () => {
    const requiredFields = [
      "jobId",
      "customerName",
      "product_name",
      "types_of_jobs",
    ];
    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      Swal.fire(
        "Validation Error",
        `Please fill in required fields: ${missing.join(", ")}`,
        "warning"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        ...formData, // Proforma header data
        labourRows, // Labour table rows
        spareRows, // Spare table rows
        labourVat, // Labour VAT toggle
        spareVat, // Spare VAT toggle
        otherCost, // Other costs
        discount, // Discount
        summary, // Computed summary (total, VAT, gross, netPay, etc.)
      };

      console.log("Proforma Payload:", payload); // For testing

      // Send to backend
      const { data } = await api.post("/proformas", payload);

      // Update local state if needed
      setProformas((prev) => [...prev, data]);

      Swal.fire({
        title: "Success!",
        text: "Proforma created successfully. Do you want to print it?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Yes, Print",
        cancelButtonText: "No, Thanks",
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(`/proforma-print/${data.id}?print=true`, "_blank");
        }
        resetForm();
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
      jobId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      refNum: "",
      customerName: "",
      product_name: "",
      types_of_jobs: "",
      customerTin: "",
      validityDate: "",
      deliveryDate: "",
      preparedBy: "",
      paymentBefore: "",
      notes: "",
    });
    setLabourRows([
      { description: "", unit: "", estTime: "", cost: 0, total: 0 },
    ]);
    setSpareRows([
      { description: "", unit: "", brand: "", qty: 0, unitPrice: 0, total: 0 },
    ]);
    setLabourVat(false);
    setSpareVat(false);
    setOtherCost(0);
    setDiscount(0);
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

            <div ref={printRef} className="print-container space-y-6">
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
                setSummary={setSummary} // ✅ pass setter
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
