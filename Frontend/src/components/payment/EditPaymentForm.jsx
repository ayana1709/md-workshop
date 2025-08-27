import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import BackButton from "../BackButton";
import Swal from "sweetalert2";

function EditPaymentForm() {
  const { job_id } = useParams(); // now using job_id from route
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  console.log(job_id);
  const [formData, setFormData] = useState({
    job_id: "",
    customer_name: "",
    // plate_number: "",
    payment_method: "Cash",
    payment_status: "Full Payment",
    paid_amount: "",
    remaining_amount: "",
    ref_no: "",
    payment_date: "",
    paid_by: "",
    approved_by: "",
    reason: "",
    remark: "",
  });

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/payments/by-job/${job_id}`);
        setFormData(res.data);
      } catch (err) {
        console.error("Failed to fetch payment by job_id:", err);
      }
    };

    if (job_id) fetchPayment();
  }, [job_id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.payment_date) newErrors.payment_date = "Required";
    if (!formData.paid_amount || formData.paid_amount < 0)
      newErrors.paid_amount = "Invalid amount";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire(
        "⚠️ Invalid Input",
        "Please fix highlighted fields.",
        "warning"
      );
      return;
    }

    try {
      await api.put(`/payments/by-job/${job_id}`, formData);
      await Swal.fire({
        icon: "success",
        title: "Updated Successfully 🎉",
        text: "Payment has been updated.",
        showConfirmButton: false,
        timer: 2000,
      });
      navigate("/all-payments");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const inputStyle = (name) =>
    `w-full p-2 rounded-md border text-sm ${
      errors[name] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
    } focus:outline-none focus:ring-2 ${
      errors[name] ? "focus:ring-red-400" : "focus:ring-blue-500"
    } dark:bg-gray-800 dark:text-white`;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="fixed phone:top-[13%] tablet:top-4 phone:left-2 tablet:left-[19%] z-[99999999]">
          <BackButton />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Edit Payment (Staff Only)
            </h1>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Read-only fields */}
              <Input
                label="Job ID"
                name="job_id"
                value={formData.job_id}
                readOnly
              />
              <Input
                label="Customer Name"
                name="customer_name"
                value={formData.customer_name}
                readOnly
              />
              {/* <Input
                label="Plate Number"
                name="plate_number"
                value={formData.plate_number}
                readOnly
              /> */}
              <Input
                label="Reference No"
                name="ref_no"
                value={formData.ref_no}
                readOnly
              />

              {/* Editable fields */}
              <Select
                label="Payment Method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <option>Cash</option>
                <option>Transfer</option>
                <option>Cheque</option>
                <option>Credit</option>
              </Select>

              <Select
                label="Payment Status"
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
              >
                <option>Full Payment</option>
                <option>Advance</option>
                <option>Credit</option>
                <option>Remaining</option>
              </Select>

              <Input
                type="number"
                label="Paid Amount"
                name="paid_amount"
                value={formData.paid_amount}
                onChange={handleChange}
                error={errors.paid_amount}
              />
              <Input
                type="number"
                label="Remaining Amount"
                name="remaining_amount"
                value={formData.remaining_amount}
                onChange={handleChange}
              />
              <Input
                type="date"
                label="Payment Date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                error={errors.payment_date}
              />
              <Input
                label="Paid By"
                name="paid_by"
                value={formData.paid_by}
                onChange={handleChange}
              />
              <Input
                label="Approved By"
                name="approved_by"
                value={formData.approved_by}
                onChange={handleChange}
              />
              <Input
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              />

              <div className="col-span-2">
                <label className="block font-medium mb-1">Remark</label>
                <textarea
                  name="remark"
                  rows={3}
                  value={formData.remark}
                  onChange={handleChange}
                  className={inputStyle("remark") + " resize-none"}
                />
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Input Field
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
  error,
}) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full p-2 rounded-md border text-sm ${
        error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
      } focus:outline-none focus:ring-2 ${
        error ? "focus:ring-red-400" : "focus:ring-blue-500"
      } dark:bg-gray-800 dark:text-white ${
        readOnly ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Select Field
const Select = ({ label, name, value, onChange, children }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  </div>
);

export default EditPaymentForm;
