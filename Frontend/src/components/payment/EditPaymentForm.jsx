import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import EditCustomerInfo from "./EditCustomerInfo";
import EditCostTables from "./EditCostTables";
import EditPaymentInfo from "./EditPaymentInfo";
import api from "@/api";
import BackButton from "../BackButton";

function EditPaymentForm() {
  const { job_id } = useParams(); // useParams hook
  const jobId = job_id; // your backend expects `jobId`

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customer, setCustomer] = useState({});
  const [costs, setCosts] = useState({});
  const [payment, setPayment] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/payments/job/${jobId}`);
        const data = res.data;

        setCustomer({
          jobId: data.jobId,
          name: data.name,
          mobile: data.mobile,
          plate: data.plate,
          model: data.model,
          priority: data.priority,
          receivedDate: data.receivedDate,
          dateOut: data.dateOut,
        });

        setPayment({
          method: data.method,
          status: data.status,
          paidAmount: data.paidAmount,
          remainingAmount: data.remainingAmount,
          reference: data.reference,
          date: data.date,
          paidBy: data.paidBy,
          approvedBy: data.approvedBy,
          reason: data.reason,
          remarks: data.remarks,
        });

        setCosts({
          labour: data.labourCosts || [],
          spares: data.spareCosts || [],
          others: data.otherCosts || [],
          summary: data.summary || {},
        });

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching payment:", err);
        Swal.fire("Error", "Failed to load payment data", "error");
      }
    };

    fetchData();
  }, [jobId]);

  // ...handleSubmit + validateData remain same

  const validateData = () => {
    if (!customer.jobId) {
      Swal.fire({
        title: "Error",
        text: "Job ID is required",
        icon: "error",
      });
      return false;
    }

    const missingCustomer = Object.entries(customer).filter(
      ([key, value]) => key !== "jobId" && !value
    );

    if (missingCustomer.length > 0) {
      Swal.fire({
        title: "Warning",
        text: `Some customer info is empty: ${missingCustomer
          .map(([key]) => key)
          .join(", ")}`,
        icon: "warning",
      });
    }

    if (!payment.method || !payment.status || !payment.paidAmount) {
      Swal.fire({
        title: "Error",
        text: "Payment info is incomplete",
        icon: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateData()) return;

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
      const response = await api.put(
        `/payments/job/${customer.jobId}`,
        payload
      );

      Swal.fire({
        title: "Success!",
        text: response.data.message || "Payment updated successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });

      console.log("✅ Backend response:", response.data);
    } catch (error) {
      console.error("❌ Error updating payment:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while updating the payment.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading payment data...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 transition-colors duration-300">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <BackButton />
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Edit Payment
              </h2>

              <EditCustomerInfo value={customer} onChange={setCustomer} />
              <EditCostTables
                value={{
                  labour: costs.labourCosts || [],
                  spares: costs.spareCosts || [],
                  others: costs.otherCosts || [],
                  vatLabour: costs.vatLabour ?? false,
                  vatSpare: costs.vatSpare ?? false,
                  vatOther: costs.vatOther ?? false,
                  summary: costs.summary || {},
                }}
                onChange={setCosts}
              />

              <EditPaymentInfo value={payment} onChange={setPayment} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg shadow-md"
                >
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditPaymentForm;
