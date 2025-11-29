import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import EditCustomerInfo from "./EditCustomerInfo";
import EditCostTables from "./EditCostTables";
import EditPaymentInfo from "./EditPaymentInfo";
import api from "@/api";
import BackButton from "../BackButton";

function EditPaymentForm() {
  const { id } = useParams(); // fetch payment by ID (not jobId)
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customer, setCustomer] = useState({});
  const [costs, setCosts] = useState({});
  const [payment, setPayment] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch payment by ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/payments/job/${id}`); // ✅ fetch by id
        const data = res.data;

        console.log("✅ Full fetched data:", data);

        // 👤 Customer info (updated structure)
        const customerData = {
          date: data.date || "",
          reference: data.reference || "",
          fs: data.fs || "",
          name: data.name || "",
          mobile: data.mobile || "",
          tin: data.tin || "",
          vat: data.vat || "",
        };
        setCustomer(customerData);
        console.log("👤 Customer data sent to EditCustomerInfo:", customerData);

        // 💳 Payment info
        const paymentData = {
          method: data.method || "",
          status: data.status || "",
          paidAmount: data.paidAmount || 0,
          remainingAmount: data.remainingAmount || 0,
          reference: data.reference || "",
          date: data.date || "",
          paidBy: data.paidBy || "",
          approvedBy: data.approvedBy || "",
          reason: data.reason || "",
          remarks: data.remarks || "",
        };
        setPayment(paymentData);
        console.log("💳 Payment data sent to EditPaymentInfo:", paymentData);

        // ⚙️ Cost info
        const costData = {
          labour: data.labourCosts || [],
          spares: data.spareCosts || [],
          others: data.otherCosts || [],
          summary: data.summary || {},
        };
        setCosts(costData);
        console.log("🧾 Cost data sent to EditCostTables:", costData);

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching payment:", err);
        Swal.fire("Error", "Failed to load payment data", "error");
      }
    };

    fetchData();
  }, [id]);

  // Validate before update
  const validateData = () => {
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

  // Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateData()) return;

    // 🧩 Build payload safely
    const payload = {
      // Customer fields
      date: customer.date || "",
      reference: customer.reference || "",
      fs: customer.fs || "",
      name: customer.name || "",
      mobile: customer.mobile || "",
      tin: customer.tin || "",
      vat: customer.vat || "",

      // Payment fields
      method: payment.method || "cash",
      status: payment.status || "full",
      paidAmount: Number(payment.paidAmount) || 0,
      remainingAmount: Number(payment.remainingAmount) || 0,
      paidBy: payment.paidBy || "",
      approvedBy: payment.approvedBy || "",
      reason: payment.reason || "",
      remarks: payment.remarks || "",

      // ✅ Only include cost arrays if they have data
      ...(costs.labour?.length ? { labourCosts: costs.labour } : {}),
      ...(costs.spares?.length ? { spareCosts: costs.spares } : {}),
      ...(costs.others?.length ? { otherCosts: costs.others } : {}),
      ...(Object.keys(costs.summary || {}).length
        ? { summary: costs.summary }
        : {}),
    };

    console.log("🧾 Final update payload:", payload);

    try {
      const response = await api.put(`/payments/job/${id}`, payload);

      Swal.fire({
        title: "Success!",
        text: response.data.message || "Payment updated successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      }).then(() => {
        navigate("/all-payments");
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
          {/* <BackButton /> */}

          <div className="max-w-5xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Edit Payment
              </h2>

              {/* 👤 Customer Info */}
              <EditCustomerInfo value={customer} onChange={setCustomer} />

              {/* ⚙️ Cost Tables */}
              <EditCostTables
                value={{
                  labour: costs.labour || [],
                  spares: costs.spares || [],
                  others: costs.others || [],
                  summary: costs.summary || {},
                }}
                onChange={(newCosts) => {
                  setCosts({
                    labour: newCosts.labourCosts || [],
                    spares: newCosts.spareCosts || [],
                    others: newCosts.otherCosts || [],
                    summary: newCosts.summary || {},
                    vatLabour: newCosts.vatLabour || false,
                    vatSpare: newCosts.vatSpare || false,
                    vatOther: newCosts.vatOther || false,
                  });
                }}
              />

              {/* 💳 Payment Info */}
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
