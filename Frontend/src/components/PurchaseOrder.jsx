// AddSalesPage.jsx
import api from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const PurchaseOrder = () => {
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
  const [remark, setRemark] = useState("");
  const [customer, setCustomer] = useState({
    salesDate: "",
    supplierName: "",
    companyName: "",
    tinNumber: "",
    referenceNumber: "",
    remark: "",
    mobile: "",
    office: "",
    phone: "",
    website: "",
    email: "",
    address: "",
    bank: "",
    other: "",
  });

  // console.log(customer);

  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // console.log(items);
  // useEffect(() => {
  //   const today = new Date().toISOString().split("T")[0];
  //   setCustomer((prev) => ({ ...prev, salesDate: today }));
  // }, []);
  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      api
        .post("/items/fetch-selected", { ids: selectedIds })
        .then((res) => {
          const itemsWithSaleQty = res.data.items.map((item) => ({
            ...item,
            price: "",
            saleQty: "", // default initial value
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
        saleQty: "",
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDeleteRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculations
  const subTotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const subtotal = items.reduce((acc, item) => {
    return acc + item.quantity * item.unit_price;
  }, 0);

  const vatAmount = (vatRate / 100) * subTotal;
  const totalAmount = subTotal + vatAmount;
  const grandTotal = subTotal + vatAmount - discount;

  const PaidAmount = grandTotal;
  const handleSubmit = async () => {
    const generateRandomId = () => {
      return Math.floor(1000 + Math.random() * 9000); // Generates a number from 1000 to 9999
    };
    // Random alphanumeric ID

    const purchaseData = {
      sales_date: customer.salesDate,
      supplier_name: customer.supplierName,
      company_name: customer.companyName,
      tin_number: customer.tinNumber,
      reference_number: customer.referenceNumber,
      mobile,
      office,
      phone,
      website,
      email,
      address,
      bank_account: bankAccount,
      other_info: otherInfo,
      remark: customer.remark,
      items: items.map((item) => ({
        item_id: item.id || generateRandomId(), // ✅ Fallback to random ID if not present
        item_name: item.item_name,
        part_number: item.part_number,
        brand: item.brand,
        unit: item.unit,
        unit_price: parseFloat(item.price) || 0,
        sale_quantity: parseInt(item.saleQty) || 0,
      })),
    };

    try {
      console.log(purchaseData);
      const res = await api.post("/purchases", purchaseData);
      toast.success("Item successfully purchased!");
      navigate("/purchase");
    } catch (error) {
      console.error("❌ Error creating purchase:", error);
      toast.error("Failed to submit purchase.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 bg-white max-w-6xl mx-auto rounded-2xl shadow-lg border border-gray-100"
    >
      {/* Title */}
      <h2 className="text-2xl font-bold mb-8 text-gray-800 uppercase tracking-wide">
        Add to Purchase
      </h2>

      {/* Sales Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Purchase Date", type: "date", key: "salesDate" },
          {
            label: "Supplier Name",
            type: "text",
            key: "supplierName",
            extraButton: true,
          },
          { label: "Company Name", type: "text", key: "companyName" },
          { label: "Tin Number", type: "text", key: "tinNumber" },
          { label: "Reference Number", type: "text", key: "referenceNumber" },
          { label: "Remark", type: "text", key: "remark" },
        ].map((field, i) => (
          <div key={i} className="relative">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              {field.label}
            </label>
            <input
              type={field.type}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm hover:border-gray-400"
              placeholder={field.label}
              value={customer[field.key]}
              onChange={(e) =>
                setCustomer({ ...customer, [field.key]: e.target.value })
              }
            />
            {field.extraButton && (
              <button
                type="button"
                onClick={() => setShowCustomerInfo((prev) => !prev)}
                className="absolute right-3 top-10 text-gray-500 hover:text-blue-600 transition"
              >
                <CiSquareMore size={24} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Extra Customer Info */}
      {showCustomerInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border bg-gray-50 rounded-xl mb-8"
        >
          {[
            { placeholder: "Mobile Number", key: "mobile" },
            { placeholder: "Office Phone", key: "office" },
            { placeholder: "Phone", key: "phone" },
            { placeholder: "Website", key: "website" },
            { placeholder: "Email", key: "email", type: "email" },
            { placeholder: "Address", key: "address" },
            { placeholder: "Bank Account", key: "bank" },
            { placeholder: "Other Info", key: "other" },
          ].map((field, i) => (
            <input
              key={i}
              type={field.type || "text"}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm hover:border-gray-400"
              placeholder={field.placeholder}
              value={customer[field.key]}
              onChange={(e) =>
                setCustomer({ ...customer, [field.key]: e.target.value })
              }
            />
          ))}
        </motion.div>
      )}

      {/* Items Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-md">
        <table className="min-w-[900px] border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "#",
                "Item Name",
                "Part Number",
                "Brand",
                "Unit",
                "Price",
                "Quantity",
                "Action",
              ].map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-semibold border-b border-gray-200 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2">{index + 1}</td>
                {[
                  "item_name",
                  "part_number",
                  "brand",
                  "unit",
                  "price",
                  "saleQty",
                ].map((key, i) => (
                  <td key={i} className="px-4 py-2">
                    <input
                      type={
                        key === "price" || key === "saleQty" ? "number" : "text"
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm hover:border-gray-400"
                      value={item[key] || ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          key,
                          key === "price" || key === "saleQty"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value
                        )
                      }
                    />
                  </td>
                ))}
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDeleteRow(index)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg transition"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row */}
      <div className="mt-4">
        <button
          onClick={handleAddRow}
          className="px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-100 rounded-lg text-sm font-medium transition shadow-sm"
        >
          + Add Row
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition font-semibold"
        >
          💾 Save Changes
        </button>
        <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">
          🔄 Reset
        </button>
      </div>
    </motion.div>
  );
};

export default PurchaseOrder;
