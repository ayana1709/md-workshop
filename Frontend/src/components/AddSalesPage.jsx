// AddSalesPage.jsx
import api from "../api";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSquareMore } from "react-icons/ci";
import { toast } from "react-toastify";

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
  const [remark, setRemark] = useState("");
  const [customer, setCustomer] = useState({
    salesDate: "",
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
  });

  console.log(customer);

  const [items, setItems] = useState([]);

  const navigate = useNavigate();

  console.log(items);

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
        description: "",
        partNumber: "",
        brand: "",
        unit: "",
        price: 0,
        quantity: "",

        saleQty: 1,
      },
    ]);
  };

  //  import axios from "axios";

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

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
        description: itemData.description || "",
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
    const saleData = {
      sales_date: customer.salesDate,
      customer_name: customer.customerName,
      company_name: customer.companyName,
      tin_number: customer.tinNumber,
      vat_rate: vatRate,
      discount,
      paid_amount: PaidAmount,
      total_amount: totalAmount,
      sub_total: subTotal,
      due_amount: dueAmount,
      mobile,
      office,
      phone,
      website,
      email,
      address,
      bank_account: bankAccount,
      other_info: otherInfo,
      payment_type: paymentType,
      payment_status: paymentStatus,
      remark: remark,
      items: items.map((item) => ({
        item_id: item.id,
        description: item.description,
        part_number: item.part_number,
        brand: item.brand,
        unit: item.unit,
        unit_price: parseFloat(item.unit_price),
        sale_quantity: parseInt(item.saleQty),
      })),
    };

    try {
      const res = await api.post("/sales", saleData);
      console.log("✅ Sale created successfully:", res.data);
      toast.success("Sale created successfully!");
      navigate("/inventory/sales");

      // Reset form fields
      setCustomer({
        salesDate: "",
        customerName: "",
        companyName: "",
        tinNumber: "",
      });
      setVatRate("");
      setDiscount("");
      // setPaidAmount("");
      // setTotalAmount("");
      // setSubTotal("");
      setDueAmount("");
      setMobile("");
      setOffice("");
      setPhone("");
      setWebsite("");
      setEmail("");
      setAddress("");
      setBankAccount("");
      setOtherInfo("");
      setPaymentType("");
      setPaymentStatus("");
      setRemark("");
      setItems([]); // or initialize with one empty item if needed
    } catch (error) {
      console.error("❌ Error creating sale:", error);
      toast.error("Failed to create sale. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-white max-w-[90%] mx-auto rounded-md shadow">
      <h2 className="pl-4 text-xl font-semibold mb-4 text-gray-800 uppercase tracking-wider">
        Add Sales
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
          <label>Customer Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded-sm"
            placeholder="Customer Name"
            value={customer.customerName}
            onChange={(e) =>
              setCustomer({ ...customer, customerName: e.target.value })
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

        <div>
          <label>VAT</label>
          <select
            className="border p-2 w-full"
            value={vatRate}
            onChange={(e) => setVatRate(Number(e.target.value))}
          >
            <option value="0">No VAT</option>
            <option value="15">15%</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border mb-4 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">#</th>
            <th className="p-2">Item Description</th>
            <th className="p-2">Part Number</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Unit</th>
            <th className="p-2">Price</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Available</th>
            <th className="p-2">Total</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{index + 1}</td>

              {/* Editable Fields */}
              <td>
                <input
                  className="border p-1 w-full"
                  value={item.description || ""}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={items[index]?.part_number || ""}
                  onChange={(e) =>
                    handlePartNumberChange(index, e.target.value)
                  }
                  placeholder="Enter Part Number"
                />
              </td>
              <td>
                <input
                  className="border p-1 w-full"
                  value={item.brand || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleItemChange(index, "part_number", val);
                    handlePartNumberChange(index, val);
                  }}
                />
              </td>
              <td>
                <input
                  className="border p-1 w-full"
                  value={item.unit || ""}
                  onChange={(e) =>
                    handleItemChange(index, "unit", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  className="border p-1 w-full"
                  value={item.unit_price || 0}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "unit_price",
                      parseFloat(e.target.value)
                    )
                  }
                />
              </td>

              {/* Sale Quantity (editable) */}
              <td>
                <input
                  type="number"
                  min="1"
                  className="border p-1 w-full"
                  value={item.saleQty}
                  onChange={(e) =>
                    handleItemChange(index, "saleQty", parseInt(e.target.value))
                  }
                />
              </td>

              {/* Available Quantity (readonly) */}
              <td>{item.quantity ?? 0}</td>

              {/* Row Total */}
              <td className="p-2">
                {((item.saleQty ?? 1) * (item.unit_price ?? 0)).toFixed(2)}
              </td>

              {/* Delete Button */}
              <td className="p-2 text-center">
                <button
                  onClick={() => handleDeleteRow(index)}
                  className="text-red-500 text-center"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleAddRow}
        className="rounded-sm mb-4 my-4 px-4 py-1 border bg-gray-200 hover:bg-gray-300 transition-all duration-all"
      >
        Add Row
      </button>

      {/* Totals and Payment Info */}
      <div className="grid grid-cols-2 gap-4 p-6 text-sm">
        <div className="space-y-2">
          <div>
            <label>Sub Total:</label>
            <input
              className="border p-1 w-full rounded-md"
              readOnly
              disabled
              value={subTotal.toFixed(2)}
            />
          </div>
          <div>
            <label>VAT:</label>
            <input
              className="border p-1 w-full rounded-md"
              readOnly
              disabled
              value={vatAmount.toFixed(2)}
            />
          </div>
          <div>
            <label>Total Amount:</label>
            <input
              className="border p-1 w-full rounded-md"
              readOnly
              disabled
              value={totalAmount.toFixed(2)}
            />
          </div>
          <div>
            <label>Discount:</label>
            <input
              type="number"
              className="border p-1 w-full rounded-md"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Grand Total:</label>
            <input
              className="border p-1 w-full rounded-md"
              readOnly
              disabled
              value={grandTotal.toFixed(2)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label>Paid Amount:</label>
            <input
              type="number"
              className="border p-1 w-full rounded-md"
              readOnly
              disabled
              value={PaidAmount}
              //   onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Due Amount:</label>
            <input
              className="border p-1 w-full rounded-sm bg-gray-200"
              readOnly
              disabled
              value={Number(dueAmount).toFixed(2)}
            />
          </div>
          <div>
            <label>Payment Type:</label>
            <select
              className="border p-1 w-full rounded-sm ring-0 outline-none focus:ring-0 focus:outline-none"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="">--SELECT--</option>
              <option value="Cash">Cash</option>
              <option value="Transfer">Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          <div>
            <label>Payment Status:</label>
            <select
              className="border p-1 w-full rounded-sm ring-0 outline-none focus:ring-0 focus:outline-none"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="Full Payment">Full Payment</option>
              <option value="Advanced Payment">Advanced Payment</option>
              <option value="No Payment">No Payment</option>
            </select>
          </div>

          <div>
            <label>Remark:</label>
            <select
              className="border p-1 w-full ring-0 rounded-sm outline-none focus:ring-0 focus:outline-none"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            >
              <option value="">-- Select Remark --</option>
              <option value="Sold">Sold</option>
              <option value="Pending">Pending</option>
              <option value="On Credit">On Credit</option>
              <option value="Canceled">Canceled</option>
              <option value="Returned">Returned</option>
              <option value="Refund">Refund</option>
              <option value="Delivery Note">Delivery Note</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>
      </div>

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

export default AddSalesPage;
