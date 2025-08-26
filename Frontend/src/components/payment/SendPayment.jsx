import { useStores } from "@/contexts/storeContext";
import PrintSummary from "../PrintSummary";
import { useParams } from "react-router-dom";
import BackButton from "../BackButton";
import Sidebar from "@/partials/Sidebar";
import { useEffect, useState } from "react";
import api from "@/api";
import Swal from "sweetalert2";

function SendPayment() {
  const { jobId } = useParams();
  const { getGrandTotal } = useStores();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" }); // type: 'success' | 'error'

  const total = getGrandTotal(jobId);
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-08-27"

  const [formData, setFormData] = useState({
    payment_method: "Cash",
    payment_status: "Full Payment",
    paid_by: "",
    approved_by: "",
    ref_no: Math.random().toString(36).substring(2, 10).toUpperCase(), // Random editable ref_no
    payment_date: today, // auto set today's date
    reason: "",
    remark: "",
    paid_amount: total,
    remaining_amount: 0,
    customer_name: "",
    plate_number: "",
    job_id: jobId,
    repair_registration_id: null,
    from_bank: "",
    to_bank: "",
  });

  const remainingAmount = total - Number(formData.paid_amount || 0);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const res = await api.get(`/repairs/${jobId}`);
        const data = res.data;
        if (data) {
          setFormData((prev) => ({
            ...prev,
            customer_name: data.customer_name,
            product_name: data.product_name,
            repair_registration_id: data.id,
            job_id: data.job_id,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch customer info:", err);
      }
    };

    if (jobId) fetchCustomerInfo();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      remaining_amount: remainingAmount,
    };

    try {
      await api.post("/payments", payload);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "✅ Payment submitted successfully!",
        timer: 2500,
        showConfirmButton: false,
      });

      // Reset form but keep customer-related info
      setFormData((prev) => ({
        payment_method: "Cash",
        payment_status: "Full Payment",
        paid_by: "",
        approved_by: "",
        ref_no: Math.random().toString(36).substring(2, 10).toUpperCase(),
        payment_date: "",
        reason: "",
        remark: "",
        paid_amount: total,
        remaining_amount: 0,
        from_bank: "",
        to_bank: "",
        customer_name: prev.customer_name,
        job_id: prev.job_id,
        repair_registration_id: prev.repair_registration_id,
      }));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ Submission failed. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: message,
      });
    }
  };

  return (
    <div className="flex overflow-hidden overflow-y-auto">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="fixed top-4 left-[19%] z-[99999999]">
          <BackButton />
        </div>
        <div>
          <PrintSummary jobId={jobId} />
          <div className="max-w-5xl mx-auto px-6 pb-12">
            <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-800 dark:text-white border-b pb-2">
              Payment Details
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-6 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md"
            >
              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  readOnly
                  className="w-full p-2 rounded-md border bg-gray-200 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  readOnly
                  className="w-full p-2 rounded-md border bg-gray-200 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                >
                  <option>Cash</option>
                  <option>Transfer</option>
                  <option>Credit</option>
                  <option>Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Payment Status
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                >
                  <option>Full Payment</option>
                  <option>Advance</option>
                  <option>Credit</option>
                  <option>Remaining</option>
                </select>
              </div>

              {formData.payment_method === "Transfer" && (
                <>
                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      From Bank
                    </label>
                    <input
                      type="text"
                      name="from_bank"
                      value={formData.from_bank}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-800 dark:text-white">
                      To Bank
                    </label>
                    <input
                      type="text"
                      name="to_bank"
                      value={formData.to_bank}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Paid Amount (ETB)
                </label>
                <input
                  type="number"
                  name="paid_amount"
                  value={formData.paid_amount}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Remaining Amount (ETB)
                </label>
                <input
                  type="text"
                  value={remainingAmount.toFixed(2)}
                  readOnly
                  className="w-full p-2 rounded-md border bg-gray-200 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Reference No
                </label>
                <input
                  type="text"
                  name="ref_no"
                  value={formData.ref_no}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Date of Payment
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Paid By
                </label>
                <input
                  type="text"
                  name="paid_by"
                  value={formData.paid_by}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-800 dark:text-white">
                  Approved By
                </label>
                <input
                  type="text"
                  name="approved_by"
                  value={formData.approved_by}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium text-gray-800 dark:text-white">
                  Reason of Payment
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium text-gray-800 dark:text-white">
                  Remark
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 rounded-md border"
                />
              </div>

              <div className="col-span-2 text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendPayment;
