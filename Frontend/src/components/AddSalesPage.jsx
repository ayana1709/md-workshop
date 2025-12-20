// AddSalesPage.jsx
import api from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";
import DateInput from "./DateInput";
import ItemSearchInput from "./ItemSearchInput";

const AddSalesPage = () => {
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
  const handleItemSelect = (index, selectedItem) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      id: selectedItem.id,
      item_name: selectedItem.item_name,
      part_number: selectedItem.part_number,
      brand: selectedItem.brand,
      unit: selectedItem.unit,
      selling_price: selectedItem.selling_price,
      quantity: selectedItem.quantity,
      saleQty: updatedItems[index].saleQty || 1,
    };

    setItems(updatedItems);
  };
const handleReset = () => {
  // 1. Reset Customer and Logistic fields
  setCustomer({
    salesDate: new Date().toISOString().split("T")[0], // Reset to today's date
    refNum: "", // Note: You might want to re-trigger fetchRefNum here
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

  // 2. Reset Items list
  setItems([]);

  // 3. Reset Totals and Status
  setVatRate(0);
  setDiscount(0);
  setDueAmount(0);
  setStatus("Requested");
  setPaymentType("");
  setPaymentStatus("Full Payment");
  setRemark("sold");

  // 4. Reset Banks
  setFromBank("");
  setToBank("");
  setCustomFromBank("");
  setCustomToBank("");

  // 5. Clear any UI states
  setShowCustomerInfo(false);
  setErrors({});

  // 6. Optional: Re-fetch the latest Ref Number to stay updated
  fetchRefNum(); 

  toast.info("Form has been reset");
};
  // Common styling for inputs to ensure consistency
  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400";
  const labelClass =
    "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1";

return (
  <div className="min-h-screen bg-[#f8fafc] p-3 md:p-8 font-sans">
    <div className="max-w-[1640px] mx-auto">
      
      {/* 1. TOP ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gray-800 p-6 rounded-t-2xl border-b border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-200 tracking-tight uppercase">Store Out Form</h1>
          <p className="text-gray-100 text-sm font-medium">Inventory Release Management</p>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-b-2xl shadow-sm border-x border-b border-gray-100 space-y-8">
        
        {/* 2. CUSTOMER & INFO GRID */}
        <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-5 w-1 bg-blue-600 rounded-full"></div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Sales Date */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Date <span className="text-red-500">*</span></label>
              <DateInput
                value={customer.salesDate}
                onChange={(val) => setCustomer({ ...customer, salesDate: val })}
                placeholder="DD/MM/YYYY"
                className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm transition-all outline-none focus:ring-4 ${
                  errors.salesDate ? "border-red-500 focus:ring-red-50" : "border-gray-200 focus:border-blue-500 focus:ring-blue-50"
                }`}
              />
              {errors.salesDate && <span className="text-red-500 text-[10px] mt-1 font-bold ml-1 uppercase tracking-tighter">{errors.salesDate}</span>}
            </div>

            {/* Ref Number */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Ref Number</label>
              <input
                type="text"
                placeholder="REF-000"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                value={customer.refNum}
                onChange={(e) => setCustomer({ ...customer, refNum: e.target.value })}
              />
            </div>

            {/* Customer Name / TO */}
            <div className="flex flex-col relative lg:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase ml-1">TO (Recipient)</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Type Customer Name..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                  value={customer.customerName}
                  onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerInfo((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <CiSquareMore size={24} />
                </button>
              </div>
            </div>

            {/* Extra Customer Fields */}
            {showCustomerInfo && (
              <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-inner animate-fadeIn">
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
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs w-full focus:border-blue-400 outline-none transition-all"
                    value={customer[field.key] || ""}
                    onChange={(e) => setCustomer({ ...customer, [field.key]: e.target.value })}
                  />
                ))}
              </div>
            )}

            {/* Reason */}
            <div className="flex flex-col lg:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Reason / Purpose</label>
              <input
                type="text"
                placeholder="reason..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                value={customer.companyName}
                onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
              />
            </div>

            {/* Requested By */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Requested By</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                value={customer.tinNumber}
                onChange={(e) => setCustomer({ ...customer, tinNumber: e.target.value })}
              />
            </div>

            {/* VAT */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase ml-1">VAT Config</label>
              <select
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer font-bold text-blue-600"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
              >
                <option value="0">No VAT (0%)</option>
                <option value="15">Standard (15%)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. ITEMS TABLE SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Inventory List</h3>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              + Add Item Row
            </button>
          </div>

          <div className="w-full overflow-hidden border border-gray-200 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    {["#", "Item name", "Part Number*", "Brand", "Unit", "Price", "Quantity", "Available", "Total", "Action"].map((header, i) => (
                      <th key={i} className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                        {header === "Part Number*" ? (
                          <span>Part Number <span className="text-red-400">*</span></span>
                        ) : header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-4 py-3 text-xs font-bold text-gray-400">{index + 1}</td>
                      <td className="px-2 py-3 min-w-[200px]">
                        <ItemSearchInput
                          value={item.item_name}
                          searchField="item_name"
                          placeholder="Search item name..."
                          disabled={false}
                          onChange={(value) => handleItemChange(index, "item_name", value)}
                          onItemSelect={(selectedItem) => handleItemSelect(index, selectedItem)}
                        />
                      </td>
                      <td className="px-2 py-3 min-w-[180px]">
                        <ItemSearchInput
                          value={item.part_number || ""}
                          searchField="part_number"
                          placeholder="Search part..."
                          disabled={false}
                          onChange={(value) => handleItemChange(index, "part_number", value)}
                          onItemSelect={(selectedItem) => handleItemSelect(index, selectedItem)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 transition-all"
                          value={item.brand || ""}
                          onChange={(e) => handleItemChange(index, "brand", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 transition-all"
                          value={item.unit || ""}
                          onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 transition-all font-medium"
                          value={item.selling_price ?? ""}
                          onChange={(e) => handleItemChange(index, "selling_price", e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          className="w-24 border border-blue-200 bg-blue-50 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 transition-all font-black text-blue-700"
                          value={item.saleQty ?? ""}
                          onChange={(e) => {
                            let val = e.target.value === "" ? "" : Number(e.target.value);
                            if (val !== "" && item.quantity && val > item.quantity) val = item.quantity;
                            handleItemChange(index, "saleQty", val);
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-400">{item.quantity ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-black text-gray-800">
                        {((Number(item.saleQty) || 0) * (Number(item.selling_price) || 0)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleDeleteRow(index)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. FOOTER LOGISTICS */}
        <section className="pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">From Location</label>
              <input 
                type="text" 
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" 
                value={customer.location} 
                onChange={(e) => setCustomer({ ...customer, location: e.target.value })} 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Approved By</label>
              <input 
                type="text" 
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" 
                value={customer.approvedBy} 
                onChange={(e) => setCustomer({ ...customer, approvedBy: e.target.value })} 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Requested Date</label>
              <DateInput 
                value={customer.requestedDate} 
                onChange={(val) => setCustomer({ ...customer, requestedDate: val })} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Delivered By</label>
              <input 
                type="text" 
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500" 
                value={customer.deliveredBy} 
                onChange={(e) => setCustomer({ ...customer, deliveredBy: e.target.value })} 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Form Status</label>
              <select 
                className="w-full  rounded-xl px-4 py-2 text-sm text-gray-900 font-black outline-none cursor-pointer" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Requested">Requested</option>
                <option value="Store Out">Store Out</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>
        </section>
      <div className="flex justify-end gap-3 mt-4 md:mt-0">
          <button 
            onClick={handleReset}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            type="button"
          >
            Reset
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>

    </div>
  </div>
);
};

export default AddSalesPage;
