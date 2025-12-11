import React, { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

import Input from "@/components/StoreIssue/Input";
import Select from "@/components/StoreIssue/Select";
import TextArea from "@/components/StoreIssue/TextArea"; 
import ItemTable from "@/components/StoreIssue/ItemTable";

const StoreIssueForm = ({ isEdit = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    objective_for: "",
    priority: 3,
    store_items: [],
    subtotal: 0, 
    total_vat: 0, 
    total_price_including_vat: 0, 
    amount_in_words: "",
    received_by: "",
    requested_from: "",
    store_branch: "",
    requested_by: "",
    requested_department: "",
    requested_user: "",
    requested_status: "pending",
    request_remark: "",
    
    delivered_by: "",
    delivered_dept: "",
    delivered_status: "not_delivered",
    delivered_remark: "",
    delivered_date: "",

    issued_to: "",
    issued_department: "",
    issued_status: "not_issued",
    issued_remark: "",
    issued_date: "",

    approved_by: "",
    approved_name: "",
    approved_dept: "",
    approved_status: "not_approved",
    approved_remark: "",
    approved_date: "",
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchIssueData(id);
    }
  }, [isEdit, id]);

  const fetchIssueData = async (issueId) => {
    try {
      const response = await api.get(`/store-issues/${issueId}`);
      const data = response.data.data || response.data;
      
      // 🚨 Robust state merge and parsing for numbers and dates
      setForm(prevForm => ({
        ...prevForm,
        ...data,
        // Parse numbers to ensure calculation functions work
        subtotal: parseFloat(data.subtotal) || 0,
        total_vat: parseFloat(data.total_vat) || 0,
        total_price_including_vat: parseFloat(data.total_price_including_vat) || 0,

        // Format dates correctly for input[type="date"]
        date: data.date ? new Date(data.date).toISOString().split("T")[0] : prevForm.date,
        delivered_date: data.delivered_date ? new Date(data.delivered_date).toISOString().split("T")[0] : "",
        issued_date: data.issued_date ? new Date(data.issued_date).toISOString().split("T")[0] : "",
        approved_date: data.approved_date ? new Date(data.approved_date).toISOString().split("T")[0] : "",
      }));

    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch store issue data.",
      });
      navigate("/store-issue/manager");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemUpdate = (newItems, costs) => {
    // Costs from ItemTable should already be numbers, but ensure they are.
    setForm((prev) => ({
      ...prev,
      store_items: newItems,
      subtotal: parseFloat(costs.subtotal) || 0,
      total_vat: parseFloat(costs.total_vat) || 0,
      total_price_including_vat: parseFloat(costs.total_price_including_vat) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.store_items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Items",
        text: "Please add at least one item to the store issue request.",
      });
      return;
    }

    const requiredFields = [
        "objective_for",
        "amount_in_words",
        "requested_by",
        "requested_department",
        "requested_status",
    ];
    
    let valid = true;
    const newErrors = {};
    requiredFields.forEach(field => {
        if (!form[field] || String(form[field]).trim() === "") {
            newErrors[field] = ["This field is required."];
            valid = false;
        }
    });

    if (!valid) {
        setErrors(newErrors);
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please fill in all required basic information fields.",
        });
        return;
    }

    try {
      if (isEdit) {
        await api.put(`/store-issues/${id}`, form);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Store Issue Request updated successfully.",
        });
      } else {
        await api.post("/store-issues", form);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Store Issue Request submitted successfully.",
        });
      }
      navigate("/store-issue/manager");
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "An unexpected error occurred.",
        });
      }
    }
  };

  // Helper function to safely parse and format currency
  const formatCurrency = (value) => {
      // 🚨 FIX: Safely parse the value to a float, defaulting to 0 if invalid.
      return (parseFloat(value) || 0).toFixed(2);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEdit
                  ? `✏️ Edit Store Issue Request: ${form.ref_no || id}`
                  : "➕ Create New Store Issue Request"}
              </h2>

              <button
                type="button"
                onClick={() => navigate("/store-issue/manager")}
                className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
              >
                Back to Store Issue Manager
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* --- 1. Basic Information --- */}
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                General Request Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-md dark:border-gray-700">
                <Input
                  label="Requested By (Full Name) *"
                  name="requested_by"
                  value={form.requested_by}
                  onChange={handleChange}
                  error={errors.requested_by}
                />
                <Input
                  label="Request Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  error={errors.date}
                />
                <Select
                  label="Priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  options={[
                    { value: 1, label: "1 - Urgent" },
                    { value: 2, label: "2 - High" },
                    { value: 3, label: "3 - Normal" },
                  ]}
                  error={errors.priority}
                />
                <Input
                  label="Objective/Reason For Issue *"
                  name="objective_for"
                  value={form.objective_for}
                  onChange={handleChange}
                  error={errors.objective_for}
                  className="md:col-span-2"
                />
                <Input
                  label="Amount in Words *"
                  name="amount_in_words"
                  value={form.amount_in_words}
                  onChange={handleChange}
                  error={errors.amount_in_words}
                />
                <Input
                  label="Requesting Department *"
                  name="requested_department"
                  value={form.requested_department}
                  onChange={handleChange}
                  error={errors.requested_department}
                />
                <Input
                  label="Requested From (e.g., Project/Budget)"
                  name="requested_from"
                  value={form.requested_from}
                  onChange={handleChange}
                  error={errors.requested_from}
                />
                <Select
                  label="Requested Status *"
                  name="requested_status"
                  value={form.requested_status}
                  onChange={handleChange}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                  error={errors.requested_status}
                />
                <Input
                  label="Store Branch"
                  name="store_branch"
                  value={form.store_branch}
                  onChange={handleChange}
                  error={errors.store_branch}
                />
                <Input
                  label="Requested User (Optional System Field)"
                  name="requested_user"
                  value={form.requested_user}
                  onChange={handleChange}
                  error={errors.requested_user}
                />
                 <TextArea
                    label="Request Remark"
                    name="request_remark"
                    value={form.request_remark}
                    onChange={handleChange}
                    error={errors.request_remark}
                    className="md:col-span-3"
                />
              </div>

              {/* --- 2. Store Items --- */}
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-t pt-4 dark:border-gray-700">
                📦 Items Requested
              </h3>
              <ItemTable
                items={form.store_items}
                onUpdate={handleItemUpdate}
                error={errors.store_items}
              />

              {/* --- 3. Cost Summary --- */}
              <div className="flex justify-end mt-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner w-full max-w-sm">
                  <h4 className="font-bold text-lg mb-2 dark:text-white">
                    Summary
                  </h4>
                  <p className="flex justify-between dark:text-gray-300">
                    <span>Subtotal:</span> **${formatCurrency(form.subtotal)}**
                  </p>
                  <p className="flex justify-between dark:text-gray-300">
                    <span>VAT:</span> **${formatCurrency(form.total_vat)}**
                  </p>
                  <p className="font-bold mt-1 border-t pt-2 dark:border-gray-600 flex justify-between dark:text-white">
                    <span>Total (Incl. VAT):</span> **$
                    {formatCurrency(form.total_price_including_vat)}**
                  </p>
                </div>
              </div>


              {/* --- 4. Approval Information --- */}
              <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white border-t pt-4 dark:border-gray-700">
                ✔️ Approval Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-4 border rounded-md dark:border-gray-700">
                <Select
                  label="Approved Status"
                  name="approved_status"
                  value={form.approved_status}
                  onChange={handleChange}
                  options={[
                    { value: "approved", label: "Approved" },
                    { value: "not_approved", label: "Not Approved" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                  error={errors.approved_status}
                />
                <Input
                  label="Approved By (User ID/Name)"
                  name="approved_by"
                  value={form.approved_by}
                  onChange={handleChange}
                  error={errors.approved_by}
                />
                <Input
                  label="Approved Name (Full Name)"
                  name="approved_name"
                  value={form.approved_name}
                  onChange={handleChange}
                  error={errors.approved_name}
                />
                <Input
                  label="Approved Department"
                  name="approved_dept"
                  value={form.approved_dept}
                  onChange={handleChange}
                  error={errors.approved_dept}
                />
                <Input
                  label="Approval Date"
                  name="approved_date"
                  type="date"
                  // Reformat date for input display
                  value={form.approved_date ? new Date(form.approved_date).toISOString().split("T")[0] : ''}
                  onChange={handleChange}
                  error={errors.approved_date}
                  className="md:col-span-1"
                />
                <TextArea
                  name="approved_remark"
                  label="Approval Remark"
                  value={form.approved_remark}
                  onChange={handleChange}
                  rows="3"
                  error={errors.approved_remark}
                  className="md:col-span-3"
                />
              </div>

              {/* --- 5. Issued Information (Store/Warehouse Staff) --- */}
              <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white border-t pt-4 dark:border-gray-700">
                📦 Issued Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-4 border rounded-md dark:border-gray-700">
                <Select
                  label="Issued Status"
                  name="issued_status"
                  value={form.issued_status}
                  onChange={handleChange}
                  options={[
                    { value: "issued", label: "Issued" },
                    { value: "not_issued", label: "Not Issued" },
                  ]}
                  error={errors.issued_status}
                />
                <Input
                  label="Issued To/By"
                  name="issued_to"
                  value={form.issued_to}
                  onChange={handleChange}
                  error={errors.issued_to}
                />
                <Input
                  label="Issued Department"
                  name="issued_department"
                  value={form.issued_department}
                  onChange={handleChange}
                  error={errors.issued_department}
                />
                <Input
                  label="Issued Date"
                  name="issued_date"
                  type="date"
                  value={form.issued_date ? new Date(form.issued_date).toISOString().split("T")[0] : ''}
                  onChange={handleChange}
                  error={errors.issued_date}
                />
                <TextArea
                  name="issued_remark"
                  label="Issued Remark"
                  value={form.issued_remark}
                  onChange={handleChange}
                  rows="3"
                  error={errors.issued_remark}
                  className="md:col-span-4"
                />
              </div>

              {/* --- 6. Delivered/Received Information (Recipient) --- */}
              <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800 dark:text-white border-t pt-4 dark:border-gray-700">
                🤝 Delivery/Received Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-4 border rounded-md dark:border-gray-700">
                <Select
                  label="Delivered Status"
                  name="delivered_status"
                  value={form.delivered_status}
                  onChange={handleChange}
                  options={[
                    { value: "delivered", label: "Delivered" },
                    { value: "not_delivered", label: "Not Delivered" },
                  ]}
                  error={errors.delivered_status}
                />
                <Input
                  label="Received By"
                  name="received_by"
                  value={form.received_by}
                  onChange={handleChange}
                  error={errors.received_by}
                />
                <Input
                  label="Delivered By"
                  name="delivered_by"
                  value={form.delivered_by}
                  onChange={handleChange}
                  error={errors.delivered_by}
                />
                <Input
                  label="Delivered Department"
                  name="delivered_dept"
                  value={form.delivered_dept}
                  onChange={handleChange}
                  error={errors.delivered_dept}
                />
                <Input
                  label="Delivered Date"
                  name="delivered_date"
                  type="date"
                  value={form.delivered_date ? new Date(form.delivered_date).toISOString().split("T")[0] : ''}
                  onChange={handleChange}
                  error={errors.delivered_date}
                />
                <TextArea
                  name="delivered_remark"
                  label="Delivery Remark"
                  value={form.delivered_remark}
                  onChange={handleChange}
                  rows="3"
                  error={errors.delivered_remark}
                  className="md:col-span-4"
                />
              </div>

              {/* --- Submit Button --- */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-lg"
                >
                  {isEdit ? "Update Store Issue" : "Submit Store Issue Request"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreIssueForm;