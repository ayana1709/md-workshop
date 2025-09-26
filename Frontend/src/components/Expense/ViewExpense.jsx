import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

export default function ViewExpense() {
  const { id } = useParams(); // get expense id from URL
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await api.get(`/expenses/${id}`);
        setExpense(data);
      } catch (err) {
        console.error("Failed to fetch expense:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!expense) return <p className="p-6">Expense not found</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow rounded-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
              Expense Details
            </h2>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <p>
                <span className="font-semibold">ID:</span> {expense.id}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {expense.date}
              </p>
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {expense.category}
              </p>
              <p>
                <span className="font-semibold">Amount:</span> {expense.amount}
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span>{" "}
                {expense.payment_method || "-"}
              </p>
              <p>
                <span className="font-semibold">Reference No:</span>{" "}
                {expense.reference_no || "-"}
              </p>
              <p>
                <span className="font-semibold">Paid By:</span>{" "}
                {expense.paid_by || "-"}
              </p>
              <p>
                <span className="font-semibold">Approved By:</span>{" "}
                {expense.approved_by || "-"}
              </p>
              <p>
                <span className="font-semibold">Staff Name:</span>{" "}
                {expense.staff_name || "-"}
              </p>
              <p>
                <span className="font-semibold">Remarks:</span>{" "}
                {expense.remarks || "-"}
              </p>
              <p>
                <span className="font-semibold">Utility Type:</span>{" "}
                {expense.utility_type || "-"}
              </p>
              <p>
                <span className="font-semibold">Billing Period:</span>{" "}
                {expense.billing_period || "-"}
              </p>
              <p>
                <span className="font-semibold">Account No:</span>{" "}
                {expense.account_no || "-"}
              </p>
              <p>
                <span className="font-semibold">Service Provider:</span>{" "}
                {expense.service_provider || "-"}
              </p>
              <p>
                <span className="font-semibold">Service Type:</span>{" "}
                {expense.service_type || "-"}
              </p>
              <p>
                <span className="font-semibold">Vendor Name:</span>{" "}
                {expense.vendor_name || "-"}
              </p>
              <p>
                <span className="font-semibold">Contract No:</span>{" "}
                {expense.contract_no || "-"}
              </p>
              <p>
                <span className="font-semibold">Beneficiary:</span>{" "}
                {expense.beneficiary || "-"}
              </p>
              <p>
                <span className="font-semibold">Created At:</span>{" "}
                {expense.created_at}
              </p>
              <p>
                <span className="font-semibold">Updated At:</span>{" "}
                {expense.updated_at}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to={`/expenses/${expense.id}/edit`}
                className="px-4 py-2 text-center bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Edit
              </Link>
              <Link
                to="/expense"
                className="px-4 py-2 text-center bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Back
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
