// AddSalesPage.jsx
import api from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import DateInput from "./DateInput";

const NewAddSalesPage = () => {
  const location = useLocation();
  const { selectedIds } = location.state || {};

  const [vatRate, setVatRate] = useState(0); // in percent
  const [discount, setDiscount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [mobile, setMobile] = useState("");
  const [office, setOffice] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Full Payment");
  const [remark, setRemark] = useState("sold");
  // const [paymentType, setPaymentType] = useState("");
  const [fromBank, setFromBank] = useState("");
  const [toBank, setToBank] = useState("");
  const [customFromBank, setCustomFromBank] = useState("");
  const [customToBank, setCustomToBank] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    // NEW fields
    location: "",
    deliveredBy: "",
    requestedDate: "",
  });

  // console.log(customer);

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Requested");

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};

    if (!customer.salesDate) {
      tempErrors.salesDate = "Sales date is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // ✅ true if no errors
  };
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      api
        .post("/items/fetch-selected", { ids: selectedIds })
        .then((res) => {
          const itemsWithSaleQty = res.data.items.map((item) => ({
            ...item,
            saleQty: 1, // default initial value
          }));
          setItems(itemsWithSaleQty);
        })
        .catch((err) => {
          console.error("Failed to fetch selected items:", err);
        });
    }
  }, [selectedIds]);

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        item_name: "",
        partNumber: "",
        brand: "",
        unit: "",
        price: "",
        quantity: "",
        saleQty: 1,
      },
    ]);
  };

  //  import axios from "axios";
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setCustomer((prev) => ({ ...prev, salesDate: today }));
  }, []);
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };
  useEffect(() => {
    const fetchRefNum = async () => {
      try {
        const res = await api.get("/sales/latest-ref");
        setCustomer((prev) => ({ ...prev, refNum: res.data.refNum }));
      } catch (err) {
        console.error("Error fetching ref number:", err);
        setCustomer((prev) => ({ ...prev, refNum: "REF0001" }));
      }
    };
    fetchRefNum();
  }, []);
  const handlePartNumberChange = async (index, value) => {
    // Always update part number immediately
    handleItemChange(index, "part_number", value);

    try {
      const response = await api.get(`/items/part/${value}`);
      const itemData = response.data;

      const updatedItems = [...items];
      const currentItem = updatedItems[index];

      updatedItems[index] = {
        ...currentItem,
        part_number: value, // ensure part number is preserved
        item_name: itemData.item_name || "",
        brand: itemData.brand || "",
        unit: itemData.unit || "",
        unit_price: parseFloat(itemData.unit_price) || 0,
        quantity: parseInt(itemData.quantity) || 0,
        // any other fields...
      };

      setItems(updatedItems);
    } catch (error) {
      console.error("Item not found or fetch error:", error);
    }
  };

  const handleDeleteRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculations
  const subTotal = items.reduce(
    (sum, item) => sum + item.selling_price * item.saleQty,
    0
  );
  const subtotal = items.reduce((acc, item) => {
    return acc + item.saleQty * item.selling_price;
  }, 0);

  const vatAmount = (vatRate / 100) * subTotal;
  const totalAmount = subTotal + vatAmount;
  const grandTotal = subTotal + vatAmount - discount;

  const PaidAmount = grandTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔎 Collect validation errors
    let errorMessages = [];

    if (!customer.salesDate) {
      errorMessages.push("Sales date is required.");
    }
    // if (!customer.customerName) {
    //   errorMessages.push("Customer name is required.");
    // }
    // if (items.length === 0) {
    //   errorMessages.push("At least one item must be added.");
    // }
    // if (!paymentType) {
    //   errorMessages.push("Payment type is required.");
    // }
    // if (paymentType === "Transfer") {
    //   if (!fromBank && !customFromBank) {
    //     errorMessages.push("From Bank is required for transfer.");
    //   }
    //   if (!toBank && !customToBank) {
    //     errorMessages.push("To Bank is required for transfer.");
    //   }
    // }

    // ❌ Stop if errors exist
    if (errorMessages.length > 0) {
      errorMessages.forEach((msg) => toast.error(msg));
      return;
    }

    // ✅ Resolve banks for Transfer case
    let resolvedFromBank = fromBank === "Other" ? customFromBank : fromBank;
    let resolvedToBank = toBank === "Other" ? customToBank : toBank;

    // Inside handleSubmit saleData payload:

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
      requested_date: customer.requestedDate,

      // payment_type,
      payment_status: paymentStatus || null,
      payment_type: paymentType || null,

      remark,
      status,

      //  ADD THIS 👇👇👇
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.item_name,
        part_number: item.part_number,
        brand: item.brand,
        unit: item.unit,
        selling_price: parseFloat(item.selling_price),
        sale_quantity: parseInt(item.saleQty),
      })),
    };

    try {
      const res = await api.post("/sales", saleData);
      toast.success("Sale created successfully!");
      navigate("/sales");

      // ✅ Reset form fields

      // After success submit
      setCustomer({
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
        // reset new fields
        location: "",
        deliveredBy: "",
        requestedDate: "",
      });

      setVatRate(0);
      setDiscount(0);
      setDueAmount(0);
      setPaymentType("");
      setPaymentStatus("Full Payment");
      setRemark("sold");
      setFromBank("");
      setToBank("");
      setCustomFromBank("");
      setCustomToBank("");
      setItems([]);
    } catch (error) {
      console.error("❌ Error creating sale:", error);
      toast.error("Failed to create sale. Please try again.");
    }
  };
  useEffect(() => {
    const fetchRefNum = async () => {
      try {
        const res = await api.get("/sales/latest-ref");
        setCustomer((prev) => ({
          ...prev,
          refNum: res.data.latest_ref,
        }));
      } catch (err) {
        console.error("Error fetching ref number:", err);
        setCustomer((prev) => ({
          ...prev,
          refNum: "REF-0001",
        }));
      }
    };

    fetchRefNum();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="p-4 bg-white max-w-[90%] mx-auto rounded-md shadow">
              <h2 className="pl-4 text-xl font-semibold mb-4 text-gray-800 uppercase tracking-wider">
                Store Out Form
              </h2>

              {/* Sales Info */}
              <div className="w-full max-w-3xl mx-auto px-4 py-6 bg-white rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Customer Information
                </h2>

                <div className="flex flex-col gap-5">
                  {/* Sales Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-700">*</span>
                    </label>

                    <DateInput
                      value={customer.salesDate}
                      onChange={(val) =>
                        setCustomer({ ...customer, salesDate: val })
                      }
                      placeholder="DD/MM/YYYY"
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
                      placeholder=""
                      className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-lg px-3 py-2 text-sm w-full transition"
                      value={customer.refNum}
                      onChange={(e) =>
                        setCustomer({ ...customer, refNum: e.target.value })
                      }
                    />
                  </div>
                  {/* Customer Name */}
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
                        setCustomer({
                          ...customer,
                          customerName: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomerInfo((prev) => !prev)}
                      className="absolute right-2 top-9 flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
                    >
                      <CiSquareMore size={24} className="text-gray-600" />
                    </button>
                  </div>{" "}
                  {showCustomerInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 bg-gray-50 rounded-xl animate-fadeIn">
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
                            setCustomer({
                              ...customer,
                              [field.key]: e.target.value,
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                  {/* Company Name */}
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
                        setCustomer({
                          ...customer,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* TIN */}
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
                  {/* VAT */}
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
              {/* Items Table */}
              <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
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
                      ].map((header, i) => (
                        <th
                          key={i}
                          className="px-2 sm:px-3 py-2 text-left text-gray-700 font-semibold whitespace-nowrap"
                        >
                          {header === "Part Number*" ? (
                            <span>
                              Part Number{" "}
                              <span className="text-red-600">*</span>
                            </span>
                          ) : (
                            header
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
                        {/* # */}
                        <td className="px-2 sm:px-3 py-2">{index + 1}</td>

                        {/* Item name */}
                        <td className="px-2 sm:px-3 py-2 min-w-[140px] sm:min-w-[160px]">
                          <input
                            className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.item_name || ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "item_name",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        {/* Part Number */}
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
                        </td>

                        {/* Brand */}
                        <td className="px-2 sm:px-3 py-2 min-w-[120px] sm:min-w-[140px]">
                          <input
                            className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.brand || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleItemChange(index, "brand", val);
                              // handlePartNumberChange(index, val);
                            }}
                          />
                        </td>

                        {/* Unit */}
                        <td className="px-2 sm:px-3 py-2 min-w-[90px] sm:min-w-[100px]">
                          <input
                            className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.unit || ""}
                            onChange={(e) =>
                              handleItemChange(index, "unit", e.target.value)
                            }
                          />
                        </td>

                        {/* Price */}
                        <td className="px-2 sm:px-3 py-2 min-w-[100px] sm:min-w-[120px]">
                          <input
                            type="number"
                            className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm no-spinner focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.selling_price || ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const val = raw === "" ? "" : Number(raw); // keep empty if user clears input
                              handleItemChange(
                                index,
                                "selling_price",
                                isNaN(val) ? 0 : val
                              );
                            }}
                          />
                        </td>

                        {/* Quantity (Sale) */}
                        <td className="px-2 sm:px-3 py-2 min-w-[100px] sm:min-w-[120px]">
                          <input
                            type="number"
                            min={1}
                            max={item.quantity ?? ""}
                            className="border rounded-md px-2 py-1 w-full text-xs sm:text-sm no-spinner focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            value={item.saleQty ?? ""}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              // Allow empty for typing, but enforce number only
                              if (rawVal === "") {
                                handleItemChange(index, "saleQty", "");
                                return;
                              }

                              let val = Number(rawVal);
                              if (isNaN(val)) val = 1; // fallback if invalid
                              if (val < 1) val = 1; // enforce min
                              if (item.quantity && val > item.quantity) {
                                val = item.quantity; // enforce max
                              }

                              handleItemChange(index, "saleQty", val);
                            }}
                          />
                        </td>

                        {/* Available */}
                        <td className="px-2 sm:px-3 py-2">
                          {item.quantity ?? 0}
                        </td>

                        {/* Total */}
                        <td className="px-2 sm:px-3 py-2 font-medium">
                          {(
                            (Number(item.saleQty) || 0) *
                            (Number(item.selling_price) || 0)
                          ).toFixed(2)}
                        </td>

                        {/* Action */}
                        <td className="px-2 sm:px-3 py-2 text-center">
                          <button
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

              <button
                onClick={handleAddRow}
                className="rounded-sm mb-4 my-4 px-4 py-1 border bg-gray-200 hover:bg-gray-300 transition-all duration-all"
              >
                Add Row
              </button>

              {/* Totals and Payment Info */}
              {/* Totals and Payment Info */}
              <div className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6 mt-6">
                {/* Buttons */}

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    From (Location)
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    className="border ..."
                    value={customer.location}
                    onChange={(e) =>
                      setCustomer({ ...customer, location: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Approved By
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    className="border ..."
                    value={customer.approvedBy}
                    onChange={(e) =>
                      setCustomer({ ...customer, approvedBy: e.target.value })
                    }
                  />
                </div>

                {/* Requested Date */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Requested Date
                  </label>
                  <DateInput
                    value={customer.requestedDate}
                    onChange={(val) =>
                      setCustomer({ ...customer, requestedDate: val })
                    }
                    placeholder="DD/MM/YYYY"
                    className="border rounded-lg px-3 py-2 text-sm w-full transition border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Delivered By
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    className="border ..."
                    value={customer.deliveredBy}
                    onChange={(e) =>
                      setCustomer({ ...customer, deliveredBy: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>

                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Requested">Requested</option>
                    <option value="Store Out">Store Out</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>

                <div className="mt-6 flex gap-4 justify-end py-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewAddSalesPage;
