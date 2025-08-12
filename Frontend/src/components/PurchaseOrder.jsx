// AddSalesPage.jsx
import api from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";

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

  console.log(customer);

  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // console.log(items);

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
    <div className="p-4 bg-white max-w-[90%] mx-auto rounded-md shadow">
      <h2 className="pl-4 text-xl font-semibold mb-4 text-gray-800 uppercase tracking-wider">
        Add to purchase
      </h2>

      {/* Sales Info */}
      <div className="flex flex-col gap-4 mb-4 w-[85%] px-4">
        <div>
          <label>Sales Date</label>
          <input
            type="date"
            className="border p-2 w-full rounded-sm"
            value={customer.salesDate}
            onChange={(e) =>
              setCustomer({ ...customer, salesDate: e.target.value })
            }
          />
        </div>

        <div className="relative">
          <label>Supplier Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded-sm"
            placeholder="supplier name"
            value={customer.supplierName}
            onChange={(e) =>
              setCustomer({ ...customer, supplierName: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowCustomerInfo((prev) => !prev)}
            className="absolute -right-[6%] text-sm text-blue-600 underline"
          >
            <CiSquareMore size={36} className="text-gray-600" />
          </button>
        </div>

        <div>
          <label>Company Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded-sm"
            placeholder="Company Name"
            value={customer.companyName}
            onChange={(e) =>
              setCustomer({ ...customer, companyName: e.target.value })
            }
          />
        </div>

        <div>
          <label>Tin Number</label>
          <input
            type="text"
            className="border p-2 w-full rounded-sm"
            placeholder="Tin Number"
            value={customer.tinNumber}
            onChange={(e) =>
              setCustomer({ ...customer, tinNumber: e.target.value })
            }
          />
        </div>
        <div>
          <label>Reference Number</label>
          <input
            type="text"
            className="border p-2 w-full rounded-sm"
            placeholder="reference number"
            value={customer.referenceNumber}
            onChange={(e) =>
              setCustomer({ ...customer, referenceNumber: e.target.value })
            }
          />
        </div>
        <div>
          <label>Remark</label>
          <input
            type="text"
            className="border p-2 w-full rounded-sm"
            placeholder="remark"
            value={customer.remark}
            onChange={(e) =>
              setCustomer({ ...customer, remark: e.target.value })
            }
          />
        </div>

        {showCustomerInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border bg-gray-50 rounded-md">
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Mobile Number"
              value={customer.mobile}
              onChange={(e) =>
                setCustomer({ ...customer, mobile: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Office Phone"
              value={customer.office}
              onChange={(e) =>
                setCustomer({ ...customer, office: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Phone"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Website"
              value={customer.website}
              onChange={(e) =>
                setCustomer({ ...customer, website: e.target.value })
              }
            />
            <input
              type="email"
              className="border p-2 w-full rounded-sm"
              placeholder="Email"
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Address"
              value={customer.address}
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Bank Account"
              value={customer.bank}
              onChange={(e) =>
                setCustomer({ ...customer, bank: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 w-full rounded-sm"
              placeholder="Other Info"
              value={customer.other}
              onChange={(e) =>
                setCustomer({ ...customer, other: e.target.value })
              }
            />
          </div>
        )}
      </div>

      {/* Items Table */}

      <div className="overflow-x-auto">
        <table className="min-w-full border mb-4 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 whitespace-nowrap">#</th>
              <th className="p-2 whitespace-nowrap">Item Name</th>
              <th className="p-2 whitespace-nowrap">Part Number</th>
              <th className="p-2 whitespace-nowrap">Brand</th>
              <th className="p-2 whitespace-nowrap">Unit</th>
              <th className="p-2 whitespace-nowrap">Price</th>
              <th className="p-2 whitespace-nowrap">Quantity</th>
              <th className="p-2 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-2 whitespace-nowrap">{index + 1}</td>

                <td className="p-2">
                  <input
                    className="border p-1 w-full"
                    value={item.item_name || ""}
                    onChange={(e) =>
                      handleItemChange(index, "item_name", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    className="border p-1 w-full"
                    value={item.part_number || ""}
                    onChange={(e) =>
                      handleItemChange(index, "part_number", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    className="border p-1 w-full"
                    value={item.brand || ""}
                    onChange={(e) =>
                      handleItemChange(index, "brand", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    className="border p-1 w-full"
                    value={item.unit || ""}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    className="border p-1 w-full"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "price",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    className="border p-1 w-full"
                    value={item.saleQty}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "saleQty",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </td>

                <td className="p-2 text-center whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteRow(index)}
                    className="text-lg text-red-500 hover:text-red-700"
                    aria-label={`Delete item ${item.item_name}`}
                  >
                    ×
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

      {/* Buttons */}
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
  );
};

export default PurchaseOrder;
