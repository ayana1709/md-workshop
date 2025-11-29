import React, { useState } from "react";
import Swal from "sweetalert2";
import CustomerInfo from "./CustomerInfo";
import CostTables from "./CostTables";
import PaymentInfo from "./PaymentInfo";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import api from "@/api";
import { useNavigate } from "react-router-dom";
import FormalCostTables from "./FormalCostTables";

function FormalPayment() {
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
    if (submitting) return;
    setSubmitting(true);

    try {
      // Use FormData to support image uploads
      const payload = new FormData();

      // Customer info
      payload.append("date", customer.date || "");
      payload.append("name", customer.customerName || "");
      payload.append("reference", customer.refNum || "");
      payload.append("fs", customer.fsNum || "");
      payload.append("mobile", customer.mobile || "");
      payload.append("tin", customer.tin || "");
      payload.append("vat", customer.vat || "");

      // Payment info
      payload.append("method", payment.method || "cash");
      payload.append("status", payment.status || "full");
      payload.append("paidAmount", payment.paidAmount || 0);
      payload.append("remainingAmount", payment.remainingAmount || 0);
      payload.append("paidBy", payment.paidBy || "");
      payload.append("approvedBy", payment.approvedBy || "");
      payload.append("reason", payment.reason || "");
      payload.append("remarks", payment.remarks || "");

      // 🔹 Include bank or cheque details
      payload.append("fromBank", payment.fromBank || "");
      payload.append("toBank", payment.toBank || "");
      payload.append("otherFromBank", payment.otherFromBank || "");
      payload.append("otherToBank", payment.otherToBank || "");
      payload.append("chequeNumber", payment.chequeNumber || "");

      // 🔹 Attach image (for both transfer or cheque)
      if (payment.image) {
        payload.append("image", payment.image);
      }

      // 🔹 Add cost details (must stringify for FormData)
      payload.append("labourCosts", JSON.stringify(costs.labour || []));
      payload.append("spareCosts", JSON.stringify(costs.spares || []));
      payload.append("otherCosts", JSON.stringify(costs.others || []));
      payload.append("summary", JSON.stringify(costs.summary || {}));

      // Send request
      const response = await api.post("/payments", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Success!",
        text: response.data.message || "Payment saved successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      }).then(() => {
        resetForm();
        navigate("/all-payments");
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
      setSubmitting(false);
    }
  };

  const handleSubmitWithStatus = async (statusType) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();

      // Customer info
      payload.append("date", customer.date || "");
      payload.append("name", customer.customerName || "");
      payload.append("reference", customer.refNum || "");
      payload.append("fs", customer.fsNum || "");
      payload.append("mobile", customer.mobile || "");
      payload.append("tin", customer.tin || "");
      payload.append("vat", customer.vat || "");

      // Payment info
      payload.append("method", payment.method || "cash");
      payload.append("status", statusType || payment.status || "full"); // 👈 Draft or full
      payload.append("paidAmount", payment.paidAmount || 0);
      payload.append("remainingAmount", payment.remainingAmount || 0);
      payload.append("paidBy", payment.paidBy || "");
      payload.append("approvedBy", payment.approvedBy || "");
      payload.append("reason", payment.reason || "");
      payload.append("remarks", payment.remarks || "");

      // Bank / Cheque / Image
      payload.append("fromBank", payment.fromBank || "");
      payload.append("toBank", payment.toBank || "");
      payload.append("otherFromBank", payment.otherFromBank || "");
      payload.append("otherToBank", payment.otherToBank || "");
      payload.append("chequeNumber", payment.chequeNumber || "");
      if (payment.image) payload.append("image", payment.image);

      // Cost Details
      payload.append("labourCosts", JSON.stringify(costs.labour || []));
      payload.append("spareCosts", JSON.stringify(costs.spares || []));
      payload.append("otherCosts", JSON.stringify(costs.others || []));
      payload.append("summary", JSON.stringify(costs.summary || {}));

      const response = await api.post("/payments", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Success!",
        text:
          statusType === "draft"
            ? "Saved as draft successfully."
            : response.data.message || "Payment saved successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      }).then(() => {
        resetForm();
        navigate("/all-payments");
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
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 space-y-8 w-full max-w-full"
            >
              {/* Page Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Create New Payment
                </h2>
              </div>

              {/* Customer Info */}
              <section className="space-y-6">
                <CustomerInfo onChange={handleCustomerChange} />
              </section>

              {/* Cost Tables (scroll only this if needed) */}
              <section className="space-y-6 overflow-x-auto">
                <FormalCostTables
                  onChange={(data) => {
                    handleCostChange(data);
                    // Update PaymentInfo default paidAmount when grandTotal changes
                    if (data?.summary?.grandTotal) {
                      setPayment((prev) => ({
                        ...prev,
                        paidAmount: data.summary.grandTotal.toFixed(2),
                        remainingAmount: 0, // initially fully paid
                      }));
                    }
                  }}
                />
              </section>

              {/* Payment Info */}
              <section className="space-y-6">
                <PaymentInfo
                  onChange={handlePaymentChange}
                  totalAmount={costs.summary?.grandTotal || 0}
                  defaultPaid={costs.summary?.grandTotal || 0}
                />
              </section>

              {/* Action Buttons */}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg shadow-md transition-all font-medium ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 active:scale-95"
                  }`}
                >
                  {submitting ? "Saving..." : "Save Payment"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitWithStatus("draft")}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg shadow-md transition-all font-medium ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105 active:scale-95"
                  }`}
                >
                  {submitting ? "Saving..." : "Save as Draft"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FormalPayment;
