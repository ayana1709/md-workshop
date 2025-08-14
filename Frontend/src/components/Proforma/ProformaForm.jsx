import { useState, useRef } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import ProformaHeader from "./ProformaHeader";
import ProformaTable from "./ProformaTable";
import ProformaTotals from "./ProformaTotals";
import ProformaFooter from "./ProformaFooter";
import { useStores } from "@/contexts/storeContext";

function ProformaForm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setProformas } = useStores();

  const [formData, setFormData] = useState({
    jobId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    product_name: "",
    types_of_jobs: "",
    customerName: "",
    items: [
      {
        description: "",
        quantity: 1,
        materialCost: 0,
        laborCost: 0,
        totalCost: 0,
      },
    ],
    preparedBy: "",
    deliveryTime: "",
    notes: "",
  });

  // Ref for printable section
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Proforma_${formData.jobId || "Invoice"}`,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/proformas", formData);
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
          // Open the print page for this proforma in a new tab
          const printWindow = window.open(
            `/proforma-print/${data.id}?print=true`,
            "_blank"
          );
          // Reset form after giving the browser a moment to open the page
          setTimeout(resetForm, 500);
        } else {
          resetForm();
        }
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
      product_name: "",
      types_of_jobs: "",
      customerName: "",
      items: [
        {
          description: "",
          quantity: 1,
          materialCost: 0,
          laborCost: 0,
          totalCost: 0,
        },
      ],
      preparedBy: "",
      deliveryTime: "",
      notes: "",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-semibold mb-6 text-center">
              Proforma Invoice
            </h1>

            {/* Printable Section */}
            <div ref={printRef} className="print-container">
              <ProformaHeader formData={formData} setFormData={setFormData} />
              <ProformaTable formData={formData} setFormData={setFormData} />
              {/* <ProformaTotals formData={formData} /> */}
              <ProformaFooter formData={formData} setFormData={setFormData} />
            </div>

            {/* Action buttons */}
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
