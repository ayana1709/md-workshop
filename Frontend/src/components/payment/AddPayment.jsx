import React, { useState } from "react";
import Swal from "sweetalert2";
import CustomerInfo from "./CustomerInfo";
import CostTables from "./CostTables";
import PaymentInfo from "./PaymentInfo";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import { useNavigate } from "react-router-dom";

function AddPayment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false); // prevent double submit
  const navigate = useNavigate();

  // States for the 3 sections
  const [customer, setCustomer] = useState({});
  const [costs, setCosts] = useState({});
  const [payment, setPayment] = useState({});

  const handleCustomerChange = (data) => setCustomer(data);
  const handleCostChange = (data) => setCosts(data);
  const handlePaymentChange = (data) => setPayment(data);

  const resetForm = () => {
    setCustomer({});
    setCosts({});
    setPayment({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // prevent double click
    setSubmitting(true);

    // Flatten customer and payment fields + keep costs in arrays
    const payload = {
      jobId: customer.jobId || "",
      name: customer.name || "",
      mobile: customer.mobile || "",
      plate: customer.plate || "",
      model: customer.model || "",
      priority: customer.priority || "",
      receivedDate: customer.receivedDate || "",
      dateOut: customer.dateOut || "",

      method: payment.method || "cash",
      status: payment.status || "full",

      paidAmount: payment.paidAmount || 0,
      remainingAmount: payment.remainingAmount || 0,
      reference: payment.reference || "",
      date: payment.date || "",
      paidBy: payment.paidBy || "",
      approvedBy: payment.approvedBy || "",
      reason: payment.reason || "",
      remarks: payment.remarks || "",

      labourCosts: costs.labour || [],
      spareCosts: costs.spares || [],
      otherCosts: costs.others || [],
      summary: costs.summary || {},
    };

    try {
      const response = await api.post("/payments", payload);

      Swal.fire({
        title: "Success!",
        text: response.data.message || "Payment saved successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      }).then(() => {
        resetForm();
        navigate("/all-payments"); // ✅ redirect after save
      });
    } catch (error) {
      console.error("❌ Error sending payment:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while saving the payment.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSubmitting(false); // re-enable button
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 space-y-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Create New Payment
                </h2>
              </div>

              <section className="space-y-6">
                <CustomerInfo onChange={handleCustomerChange} />
              </section>

              <section className="space-y-6">
                <CostTables onChange={handleCostChange} />
              </section>

              <section className="space-y-6">
                <PaymentInfo onChange={handlePaymentChange} />
              </section>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-lg shadow-md transition-all ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 active:scale-95"
                  }`}
                >
                  {submitting ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddPayment;
