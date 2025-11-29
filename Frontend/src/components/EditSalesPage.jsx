import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";
import api from "../api";
import DateInput from "./DateInput";

const EditSalesPage = () => {
  const { id } = useParams(); // <-- from /sales/edit/:id
  const navigate = useNavigate();

  // customer / sale fields
  const [customer, setCustomer] = useState({
    salesDate: "",
    refNum: "",
    approvedBy: "",
    customerName: "",
    companyName: "",
    tinNumber: "",
    mobile: "",
    office: "",
    phone: "",
    website: "",
    email: "",
    address: "",
    bank: "",
    other: "",
    location: "",
    deliveredBy: "",
    requestedDate: "",
  });

  const [items, setItems] = useState([]);
  const [vatRate, setVatRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Full Payment");
  const [remark, setRemark] = useState("sold");
  const [status, setStatus] = useState("Requested");
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // bank fields (kept from your Add form)
  const [fromBank, setFromBank] = useState("");
  const [toBank, setToBank] = useState("");
  const [customFromBank, setCustomFromBank] = useState("");
  const [customToBank, setCustomToBank] = useState("");

  // --- Fetch sale on mount ---
  useEffect(() => {
    if (!id) return;
    const fetchSale = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/sales/${id}`);
        const sale = res.data;

        // Map main fields
        setCustomer({
          salesDate: sale.sales_date || "",
          refNum: sale.ref_num || "",
          approvedBy: sale.approved_by || "",
          customerName: sale.customer_name || "",
          companyName: sale.company_name || "",
          tinNumber: sale.tin_number || "",
          mobile: sale.mobile || "",
          office: sale.office || "",
          phone: sale.phone || "",
          website: sale.website || "",
          email: sale.email || "",
          address: sale.address || "",
          bank: sale.bank_account || "",
          other: sale.other_info || "",
          location: sale.location || "",
          deliveredBy: sale.delivered_by || "",
          requestedDate:
            sale.requested_date === "1111-11-11"
              ? ""
              : sale.requested_date || "",
        });

        setVatRate(Number(sale.vat_rate) || 0);
        setDiscount(Number(sale.discount) || 0);
        setDueAmount(Number(sale.due_amount) || 0);
        setPaymentStatus(sale.payment_status || "Full Payment");
        setPaymentType(sale.payment_type || "");
        setRemark(sale.remark || "sold");
        setStatus(sale.status || "Requested");

        // Map pivot items into the expected front-end structure:
        // keep available quantity from item, and pivot selling_price & sale_quantity
        const mappedItems = (sale.items || []).map((it) => ({
          id: it.id, // actual item id
          item_name: it.pivot?.item_name ?? it.item_name ?? "",
          part_number: it.pivot?.part_number ?? it.part_number ?? "",
          brand: it.pivot?.brand ?? it.brand ?? "",
          unit: it.pivot?.unit ?? it.unit ?? "",
          selling_price: Number(
            it.pivot?.selling_price ?? it.selling_price ?? 0
          ),
          saleQty: Number(it.pivot?.sale_quantity ?? 1),
          quantity: Number(it.quantity ?? 0), // available stock
        }));
        setItems(mappedItems);
      } catch (err) {
        console.error("Failed to fetch sale:", err);
        toast.error("Failed to load sale data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  // --- Utilities ---
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handlePartNumberChange = async (index, value) => {
    // Keep part number locally
    handleItemChange(index, "part_number", value);

    // try fetch item by part number to fill details
    if (!value) return;
    try {
      const response = await api.get(`/items/part/${value}`);
      const itemData = response.data;

      const updated = [...items];
      const cur = updated[index] || {};
      updated[index] = {
        ...cur,
        id: itemData.id ?? cur.id,
        part_number: value,
        item_name: itemData.item_name || cur.item_name || "",
        brand: itemData.brand || cur.brand || "",
        unit: itemData.unit || cur.unit || "",
        selling_price:
          parseFloat(
            itemData.selling_price ??
              itemData.unit_price ??
              cur.selling_price ??
              0
          ) || 0,
        quantity: parseInt(itemData.quantity ?? cur.quantity ?? 0),
      };
      setItems(updated);
    } catch (err) {
      // item not found — keep the typed value
      console.warn("Item fetch failed for part:", value, err);
    }
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: null,
        item_name: "",
        part_number: "",
        brand: "",
        unit: "",
        selling_price: 0,
        saleQty: 1,
        quantity: 0,
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculations
  const subTotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.selling_price) || 0) * (Number(item.saleQty) || 0),
    0
  );
  const vatAmount = (vatRate / 100) * subTotal;
  const totalAmount = subTotal + vatAmount;
  const grandTotal = totalAmount - (Number(discount) || 0);
  const PaidAmount = grandTotal; // same as your Add form logic

  // Validation
  const validate = () => {
    let temp = {};
    if (!customer.salesDate) temp.salesDate = "Sales date is required.";
    if (items.length === 0) temp.items = "At least one item is required.";
    // ensure part_numbers and saleQty and selling_price exist
    items.forEach((it, idx) => {
      if (!it.part_number) temp[`item_${idx}_part`] = "Part number is required";
      if (!it.selling_price || Number(it.selling_price) <= 0)
        temp[`item_${idx}_price`] = "Price required";
      if (!it.saleQty || Number(it.saleQty) <= 0)
        temp[`item_${idx}_qty`] = "Quantity required";
    });
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // --- Submit update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix form errors first.");
      return;
    }

    // Resolve bank names (if you use them)
    const resolvedFromBank = fromBank === "Other" ? customFromBank : fromBank;
    const resolvedToBank = toBank === "Other" ? customToBank : toBank;

    const saleData = {
      sales_date: customer.salesDate,
      ref_num: customer.refNum,
      approved_by: customer.approvedBy,
      customer_name: customer.customerName,
      company_name: customer.companyName,
      tin_number: customer.tinNumber,
      vat_rate: vatRate,
      discount,
      paid_amount: PaidAmount,
      total_amount: totalAmount,
      sub_total: subTotal,
      due_amount: dueAmount,

      mobile: customer.mobile,
      office: customer.office,
      phone: customer.phone,
      website: customer.website,
      email: customer.email,
      address: customer.address,
      bank_account: customer.bank,
      other_info: customer.other,

      location: customer.location,
      delivered_by: customer.deliveredBy,
      requested_date: customer.requestedDate || null,

      payment_status: paymentStatus || null,
      payment_type: paymentType || null,

      remark,
      status,

      items: items.map((it) => ({
        // match server expected shape
        item_id: it.id ?? null,
        item_name: it.item_name,
        part_number: it.part_number,
        brand: it.brand,
        unit: it.unit,
        selling_price: Number(it.selling_price) || 0,
        sale_quantity: Number(it.saleQty) || 0,
      })),
    };

    try {
      setLoading(true);
      await api.put(`/sales/${id}`, saleData);
      toast.success("Sale updated successfully!");
      navigate("/sales");
    } catch (err) {
      console.error("Update failed:", err);
      const msg =
        (err.response && err.response.data && err.response.data.error) ||
        "Failed to update sale.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !customer.salesDate) {
    // initial loading
    return <div className="p-6">Loading sale...</div>;
  }

  return (
    <div className="p-4 bg-white max-w-[90%] mx-auto rounded-md shadow">
      <h2 className="pl-4 text-xl font-semibold mb-4 text-gray-800 uppercase tracking-wider">
        Edit Store Out — {customer.refNum || `#${id}`}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Sales Info */}
        <div className="w-full max-w-3xl mx-auto px-4 py-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
            Customer Information
          </h2>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-700">*</span>
              </label>

              <DateInput
                value={customer.salesDate}
                onChange={(val) => setCustomer({ ...customer, salesDate: val })}
                placeholder="YYYY-MM-DD"
                className={`border rounded-lg px-3 py-2 text-sm w-full transition ${
                  errors.salesDate
                    ? "border-red-500 focus:border-red-500 focus:ring focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                }`}
              />

              {errors.salesDate && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.salesDate}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Ref Number
              </label>
              <input
                type="text"
                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                value={customer.refNum}
                onChange={(e) =>
                  setCustomer({ ...customer, refNum: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-700 mb-1">
                TO
              </label>
              <input
                type="text"
                placeholder="Customer Name"
                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                value={customer.customerName}
                onChange={(e) =>
                  setCustomer({ ...customer, customerName: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowCustomerInfo((prev) => !prev)}
                className="absolute right-2 top-9 flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
              >
                <CiSquareMore size={24} className="text-gray-600" />
              </button>
            </div>

            {showCustomerInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 bg-gray-50 rounded-xl">
                {[
                  { key: "mobile", placeholder: "Mobile Number" },
                  { key: "office", placeholder: "Office Phone" },
                  { key: "phone", placeholder: "Phone" },
                  { key: "website", placeholder: "Website" },
                  { key: "email", placeholder: "Email", type: "email" },
                  { key: "address", placeholder: "Address" },
                  { key: "bank", placeholder: "Bank Account" },
                  { key: "other", placeholder: "Other Info" },
                ].map((field) => (
                  <input
                    key={field.key}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                    value={customer[field.key] || ""}
                    onChange={(e) =>
                      setCustomer({ ...customer, [field.key]: e.target.value })
                    }
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                type="text"
                placeholder="reason..."
                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                value={customer.companyName}
                onChange={(e) =>
                  setCustomer({ ...customer, companyName: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Requested By
              </label>
              <input
                type="text"
                placeholder=""
                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                value={customer.tinNumber}
                onChange={(e) =>
                  setCustomer({ ...customer, tinNumber: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                VAT
              </label>
              <select
                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
              >
                <option value="0">No VAT</option>
                <option value="15">15%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-6">
          <table className="min-w-full border-collapse text-xs sm:text-sm md:text-base">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {[
                  "#",
                  "Item name",
                  "Part Number*",
                  "Brand",
                  "Unit",
                  "Price",
                  "Quantity",
                  "Available",
                  "Total",
                  "Action",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-2 sm:px-3 py-2 text-left text-gray-700 font-semibold whitespace-nowrap"
                  >
                    {h === "Part Number*" ? (
                      <span>
                        Part Number <span className="text-red-600">*</span>
                      </span>
                    ) : (
                      h
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-2 sm:px-3 py-2">{index + 1}</td>

                  <td className="px-2 sm:px-3 py-2 min-w-[140px] sm:min-w-[160px]">
                    <input
                      className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={item.item_name || ""}
                      onChange={(e) =>
                        handleItemChange(index, "item_name", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-2 sm:px-3 py-2 min-w-[140px] sm:min-w-[160px]">
                    <input
                      type="text"
                      className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={item.part_number || ""}
                      onChange={(e) =>
                        handlePartNumberChange(index, e.target.value)
                      }
                      placeholder="Enter Part Number"
                    />
                    {errors[`item_${index}_part`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors[`item_${index}_part`]}
                      </div>
                    )}
                  </td>

                  <td className="px-2 sm:px-3 py-2 min-w-[120px] sm:min-w-[140px]">
                    <input
                      className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={item.brand || ""}
                      onChange={(e) =>
                        handleItemChange(index, "brand", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-2 sm:px-3 py-2 min-w-[90px] sm:min-w-[100px]">
                    <input
                      className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={item.unit || ""}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-2 sm:px-3 py-2 min-w-[100px] sm:min-w-[120px]">
                    <input
                      type="number"
                      className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm no-spinner focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={item.selling_price || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === "" ? "" : Number(raw);
                        handleItemChange(
                          index,
                          "selling_price",
                          isNaN(val) ? 0 : val
                        );
                      }}
                    />
                    {errors[`item_${index}_price`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors[`item_${index}_price`]}
                      </div>
                    )}
                  </td>

                  <td className="px-2 sm:px-3 py-2 min-w-[100px] sm:min-w-[120px]">
                    <input
                      type="number"
                      min={1}
                      max={item.quantity ?? ""}
                      className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm no-spinner focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      value={item.saleQty ?? ""}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        if (rawVal === "") {
                          handleItemChange(index, "saleQty", "");
                          return;
                        }
                        let val = Number(rawVal);
                        if (isNaN(val)) val = 1;
                        if (val < 1) val = 1;
                        if (item.quantity && val > item.quantity)
                          val = item.quantity;
                        handleItemChange(index, "saleQty", val);
                      }}
                    />
                    {errors[`item_${index}_qty`] && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors[`item_${index}_qty`]}
                      </div>
                    )}
                  </td>

                  <td className="px-2 sm:px-3 py-2">{item.quantity ?? 0}</td>

                  <td className="px-2 sm:px-3 py-2 font-medium">
                    {(
                      (Number(item.saleQty) || 0) *
                      (Number(item.selling_price) || 0)
                    ).toFixed(2)}
                  </td>

                  <td className="px-2 sm:px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(index)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="my-4">
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded-sm mb-4 my-4 px-4 py-1 border bg-gray-200 hover:bg-gray-300 transition-all duration-all"
          >
            Add Row
          </button>
        </div>

        {/* Totals and Payment Info */}
        <div className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Subtotal</span>
                <span className="font-medium">{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-700">VAT ({vatRate}%)</span>
                <span className="font-medium">{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-700">Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value || 0))}
                  className="border rounded px-2 py-1 w-32"
                />
              </div>
              <div className="flex justify-between mt-3 border-t pt-3">
                <span className="text-sm text-gray-700">Grand Total</span>
                <span className="font-semibold">{grandTotal.toFixed(2)}</span>
              </div>
            </div> */}

            <div className="md:col-span-2">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  From (Location)
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="border rounded px-2 py-1"
                  value={customer.location}
                  onChange={(e) =>
                    setCustomer({ ...customer, location: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Approved By
                  </label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    value={customer.approvedBy}
                    onChange={(e) =>
                      setCustomer({ ...customer, approvedBy: e.target.value })
                    }
                  />
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="Requested">Requested</option>
                    <option value="Store Out">Store Out</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Requested Date
                  </label>
                  <DateInput
                    value={customer.requestedDate}
                    onChange={(val) =>
                      setCustomer({ ...customer, requestedDate: val })
                    }
                    placeholder="YYYY-MM-DD"
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Delivered By
                  </label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    value={customer.deliveredBy}
                    onChange={(e) =>
                      setCustomer({ ...customer, deliveredBy: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4 justify-end py-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/sales")}
              className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditSalesPage;
