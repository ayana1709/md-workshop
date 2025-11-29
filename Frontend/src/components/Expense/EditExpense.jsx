import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const banks = ["Awash", "CBE", "Dashen", "Coop", "Abyssinia", "Other"];

  const [form, setForm] = useState({
    date: "",
    category: "",
    amount: "",
    payment_method: "",
    reference_no: "",
    paid_by: "",
    approved_by: "",
    remarks: "",
    staff_name: "",
    hours: "",
    rate: "",
    service_provider: "",
    service_type: "",
    job_id: "",
    utility_type: "",
    billing_period: "",
    account_no: "",
    vendor_name: "",
    contract_no: "",
    beneficiary: "",
    from_bank: "",
    to_bank: "",
    from_bank_other: "",
    to_bank_other: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch expense
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await api.get(`/expenses/${id}`);
        setForm(data);
      } catch (err) {
        console.error("Failed to fetch expense:", err);
        alert("Expense not found.");
        navigate("/expenses");
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/expenses/${id}`, form);
      alert("Expense updated successfully!");
      navigate(`/expenses/${id}`);
    } catch (err) {
      console.error("Failed to update expense:", err);
      alert("Failed to update expense.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  const renderCategoryFields = () => {
    switch (form.category) {
      case "labor":
        return (
          <>
            <div>
              <label className="block font-medium">Staff/Mechanic Name</label>
              <input
                type="text"
                name="staff_name"
                value={form.staff_name || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Hours/Days Worked</label>
                <input
                  type="number"
                  name="hours"
                  value={form.hours || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg [appearance:textfield]"
                />
              </div>
              <div>
                <label className="block font-medium">Rate per Hour/Day</label>
                <input
                  type="number"
                  name="rate"
                  value={form.rate || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg [appearance:textfield]"
                />
              </div>
            </div>
          </>
        );
      case "outsourcing":
        return (
          <>
            <div>
              <label className="block font-medium">Service Provider Name</label>
              <input
                type="text"
                name="service_provider"
                value={form.service_provider || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium">Service Type</label>
              <input
                type="text"
                name="service_type"
                value={form.service_type || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium">Job ID</label>
              <input
                type="text"
                name="job_id"
                value={form.job_id || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </>
        );
      case "utilities":
        return (
          <>
            <div>
              <label className="block font-medium">Utility Type</label>
              <input
                type="text"
                name="utility_type"
                value={form.utility_type || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium">Billing Period</label>
              <input
                type="text"
                name="billing_period"
                value={form.billing_period || ""}
                onChange={handleChange}
                placeholder="e.g., Sept 2025"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium">Account/Customer No.</label>
              <input
                type="text"
                name="account_no"
                value={form.account_no || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </>
        );
      case "operations":
        return (
          <>
            <div>
              <label className="block font-medium">Vendor Name</label>
              <input
                type="text"
                name="vendor_name"
                value={form.vendor_name || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium">Contract/Invoice No.</label>
              <input
                type="text"
                name="contract_no"
                value={form.contract_no || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </>
        );
      case "miscellaneous":
        return (
          <div>
            <label className="block font-medium">Beneficiary</label>
            <input
              type="text"
              name="beneficiary"
              value={form.beneficiary || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium">Category</label>
                  <select
                    name="category"
                    value={form.category || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">-- Select Category --</option>
                    <option value="labor">Labor</option>
                    <option value="outsourcing">Outsourcing</option>
                    <option value="utilities">Utilities</option>
                    <option value="operations">Garage Operations</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Fields */}
              {renderCategoryFields()}

              {/* Amount & Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Amount (ETB)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg [appearance:textfield]"
                  />
                </div>
                <div>
                  <label className="block font-medium">Payment Method</label>
                  <select
                    name="payment_method"
                    value={form.payment_method || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">-- Select Method --</option>
                    <option value="cash">Cash</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>

              {/* Bank Transfer Fields */}
              {form.payment_method === "transfer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium">From Bank</label>
                    <select
                      name="from_bank"
                      value={form.from_bank || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">-- Select Bank --</option>
                      {banks.map((bank) => (
                        <option key={bank} value={bank.toLowerCase()}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    {form.from_bank === "other" && (
                      <input
                        type="text"
                        name="from_bank_other"
                        placeholder="Enter bank name"
                        value={form.from_bank_other || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block font-medium">To Bank</label>
                    <select
                      name="to_bank"
                      value={form.to_bank || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">-- Select Bank --</option>
                      {banks.map((bank) => (
                        <option key={bank} value={bank.toLowerCase()}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    {form.to_bank === "other" && (
                      <input
                        type="text"
                        name="to_bank_other"
                        placeholder="Enter bank name"
                        value={form.to_bank_other || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Reference, Paid By, Approved By, Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Reference No.</label>
                  <input
                    type="text"
                    name="reference_no"
                    value={form.reference_no || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium">Paid By</label>
                  <input
                    type="text"
                    name="paid_by"
                    value={form.paid_by || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Approved By</label>
                  <input
                    type="text"
                    name="approved_by"
                    value={form.approved_by || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={form.remarks || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 active:scale-95 transition transform"
              >
                {saving ? "Saving..." : "Update Expense"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
``;
