import { useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import BackButton from "../BackButton";
import api from "@/api";

function AddPayment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const generateJobId = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase(); // 6-digit number
  const generateRefNo = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

  const [formData, setFormData] = useState({
    job_id: generateJobId(),
    ref_no: generateRefNo(),
    customer_name: "",
    product_name: "",
    payment_method: "Cash",
    payment_status: "Full Payment",
    paid_amount: "",
    remaining_amount: "",
    payment_date: "",
    paid_by: "",
    approved_by: "",
    reason: "",
    remark: "",
    from_bank: "",
    to_bank: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments/quick", formData);

      Swal.fire({
        icon: "success",
        title: "Success 🎉",
        text: "Payment submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData((prev) => ({
        ...prev,
        job_id: generateJobId(),
        ref_no: generateRefNo(),
        paid_amount: "",
        remaining_amount: "",
        payment_date: "",
        paid_by: "",
        approved_by: "",
        reason: "",
        remark: "",
        from_bank: "",
        to_bank: "",
      }));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err?.response?.data?.message || "Submission failed.",
      });
    }
  };

  const inputStyle =
    "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="w-full max-w-5xl mx-auto px-6 py-12">
          {/* <BackButton /> */}
          <h1 className="text-3xl font-bold mb-6 border-b pb-2">
            Payment Entry Form
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Job ID & Ref No */}
            <InputField
              name="job_id"
              label="Job ID"
              type="string"
              value={formData.job_id}
              handleChange={handleChange}
              readOnly
              className={inputStyle + " bg-gray-100 dark:bg-gray-800"}
            />
            <InputField
              name="ref_no"
              label="Reference Number"
              value={formData.ref_no}
              handleChange={handleChange}
              readOnly
              className={inputStyle + " bg-gray-100 dark:bg-gray-800"}
            />

            {/* Customer Info */}
            <InputField
              name="customer_name"
              label="Customer Name"
              value={formData.customer_name}
              handleChange={handleChange}
              className={inputStyle}
            />
            <InputField
              name="product_name"
              label="Product Name"
              value={formData.product_name}
              handleChange={handleChange}
              className={inputStyle}
            />

            {/* Payment Method & Status */}
            <SelectField
              name="payment_method"
              label="Payment Method"
              value={formData.payment_method}
              handleChange={handleChange}
              className={inputStyle}
            >
              <option>Cash</option>
              <option>Transfer</option>
              <option>Credit</option>
              <option>Cheque</option>
            </SelectField>

            <SelectField
              name="payment_status"
              label="Payment Status"
              value={formData.payment_status}
              handleChange={handleChange}
              className={inputStyle}
            >
              <option>Full Payment</option>
              <option>Advance</option>
              <option>Credit</option>
              <option>Remaining</option>
            </SelectField>

            {/* If Transfer */}
            {formData.payment_method === "Transfer" && (
              <>
                <InputField
                  name="from_bank"
                  label="From Bank"
                  value={formData.from_bank}
                  handleChange={handleChange}
                  className={inputStyle}
                />
                <InputField
                  name="to_bank"
                  label="To Bank"
                  value={formData.to_bank}
                  handleChange={handleChange}
                  className={inputStyle}
                />
              </>
            )}

            {/* Amounts */}
            <InputField
              name="paid_amount"
              label="Paid Amount (ETB)"
              type="number"
              value={formData.paid_amount}
              handleChange={handleChange}
              className={inputStyle}
            />
            <InputField
              name="remaining_amount"
              label="Remaining Amount (ETB)"
              type="number"
              value={formData.remaining_amount}
              handleChange={handleChange}
              className={inputStyle}
            />

            {/* Dates & People */}
            <InputField
              name="payment_date"
              label="Payment Date"
              type="date"
              value={formData.payment_date}
              handleChange={handleChange}
              className={inputStyle}
            />
            <InputField
              name="paid_by"
              label="Paid By"
              value={formData.paid_by}
              handleChange={handleChange}
              className={inputStyle}
            />
            <InputField
              name="approved_by"
              label="Approved By"
              value={formData.approved_by}
              handleChange={handleChange}
              className={inputStyle}
            />

            {/* Reason & Remarks */}
            <InputField
              name="reason"
              label="Reason of Payment"
              value={formData.reason}
              handleChange={handleChange}
              className={inputStyle + " col-span-1 md:col-span-2"}
            />
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Remark</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={4}
                className={`${inputStyle} resize-none`}
              />
            </div>

            <div className="md:col-span-2 text-right mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                Submit Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Field
const InputField = ({
  name,
  label,
  value,
  handleChange,
  className,
  type = "text",
  readOnly = false,
}) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      className={className}
    />
  </div>
);

// Reusable Select Field
const SelectField = ({
  name,
  label,
  value,
  handleChange,
  className,
  children,
}) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className={className}
    >
      {children}
    </select>
  </div>
);

export default AddPayment;
