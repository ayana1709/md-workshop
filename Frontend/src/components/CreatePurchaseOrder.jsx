// AddSalesPage.jsx
import api from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";

const CreatePurchaseOrder = () => {
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

  console.log(customer);

  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(items);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setCustomer((prev) => ({ ...prev, salesDate: today }));
  }, []);

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 uppercase tracking-wide">
            Add New Purchase
          </h2>

          {/* Sales Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                value={customer.salesDate}
                onChange={(e) =>
                  setCustomer({ ...customer, salesDate: e.target.value })
                }
              />
            </div>

            {/* Supplier Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name
              </label>
              <input
                type="text"
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Supplier name"
                value={customer.supplierName}
                onChange={(e) =>
                  setCustomer({ ...customer, supplierName: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowCustomerInfo((prev) => !prev)}
                className="absolute right-2 top-8 p-1 rounded-full hover:bg-gray-200"
              >
                <CiSquareMore size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Company Name"
                value={customer.companyName}
                onChange={(e) =>
                  setCustomer({ ...customer, companyName: e.target.value })
                }
              />
            </div>

            {/* Tin Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tin Number
              </label>
              <input
                type="text"
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Tin Number"
                value={customer.tinNumber}
                onChange={(e) =>
                  setCustomer({ ...customer, tinNumber: e.target.value })
                }
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Reference number"
                value={customer.referenceNumber}
                onChange={(e) =>
                  setCustomer({ ...customer, referenceNumber: e.target.value })
                }
              />
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark
              </label>
              <input
                type="text"
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Remark"
                value={customer.remark}
                onChange={(e) =>
                  setCustomer({ ...customer, remark: e.target.value })
                }
              />
            </div>
          </div>

          {/* Additional Supplier Info */}
          {showCustomerInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border">
              {[
                { key: "mobile", placeholder: "Mobile Number" },
                { key: "office", placeholder: "Office Phone" },
                { key: "phone", placeholder: "Phone" },
                { key: "website", placeholder: "Website" },
                { key: "email", placeholder: "Email", type: "email" },
                { key: "address", placeholder: "Address" },
                { key: "bank", placeholder: "Bank Account" },
                { key: "other", placeholder: "Other Info" },
              ].map((field, i) => (
                <input
                  key={i}
                  type={field.type || "text"}
                  className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder={field.placeholder}
                  value={customer[field.key]}
                  onChange={(e) =>
                    setCustomer({ ...customer, [field.key]: e.target.value })
                  }
                />
              ))}
            </div>
          )}

          {/* Items Table */}
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow mb-4">
            <table className="min-w-[900px] border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
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
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
                            key === "price" || key === "saleQty"
                              ? "number"
                              : "text"
                          }
                          className="border rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-blue-400 outline-none"
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
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className="rounded-md mb-6 px-4 py-2 border bg-gray-200 hover:bg-gray-300 transition"
          >
            + Add Row
          </button>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setCustomer({});
                setItems([]);
              }}
              className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;
