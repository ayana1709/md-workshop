import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, History, Camera, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useLocation } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import BackButton from "./BackButton";

function NewAddSalesPage() {
  /* =======================
     Router state
  ======================== */
  const location = useLocation();
  const passedItems = location.state?.items || [];
  const branchId = location.state?.branch_id;
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(branchId || "");

  /* =======================
     State
  ======================== */
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [withReceipt, setWithReceipt] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [receiptImages, setReceiptImages] = useState([]);
  const [applyVat, setApplyVat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const qrRef = useRef(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [payment, setPayment] = useState({
    method: "cash",
    paid: 0,
    soldBy: "",
    remark: "",
  });

  /* =======================
     PRELOAD ITEMS FROM MOVEMENT
  ======================== */
  useEffect(() => {
    if (!passedItems.length) return;

    const normalized = passedItems.map((item) => {
      const unitPrice = Number(item.selling_price || 0); // <-- use selling_price

      return {
        item_id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        part_number: item.part_number,

        brand: item.brand,
        category: item.category,

        available_quantity: item.initial_stock,

        unit_price: unitPrice,
        vat_percent: 15,

        quantity: 1,
        total: unitPrice,
      };
    });

    setCart(normalized);
  }, [passedItems]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/departments");
        setBranches(res.data || []);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  /* =======================
     SEARCH ITEMS
  ======================== */
  useEffect(() => {
    if (!search.trim()) {
      setItems([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await api.get("/sales/items/search", {
          params: {
            q: search,
            branch_id: selectedBranch || undefined, // send branch_id only if selected
          },
        });

        setItems(res.data.items || []);
      } catch (err) {
        setItems([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search, selectedBranch]); // <-- add selectedBranch here

  /* =======================
     ADD TO CART
  ======================== */
  const addToCart = (item) => {
    const unitPrice = Number(item.selling_price || 0); // <-- use selling_price

    const normalizedItem = {
      item_id: item.id || item.item_id,
      item_code: item.item_code,
      item_name: item.item_name,
      part_number: item.part_number,
      brand: item.brand,
      category: item.category,
      available_quantity: item.available_quantity || item.initial_stock || 0,
      unit_price: unitPrice,
      quantity: 1,
      total: unitPrice,
      vat_percent: 15,
    };

    setCart((prev) => {
      const exists = prev.find((i) => i.item_code === normalizedItem.item_code);

      if (exists) {
        return prev.map((i) =>
          i.item_code === normalizedItem.item_code
            ? {
                ...i,
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * i.unit_price,
              }
            : i,
        );
      }

      return [...prev, normalizedItem];
    });

    setSearch("");
    setItems([]);
  };

  /* =======================
     UPDATE QUANTITY
  ======================== */
  const updateQuantity = (itemCode, qty) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.item_code !== itemCode) return item;
        if (qty < 1) return item;
        if (qty > item.available_quantity) {
          toast.warning("Quantity exceeds stock");
          return item;
        }

        return {
          ...item,
          quantity: qty,
          total: qty * item.unit_price,
        };
      }),
    );
  };

  /* =======================
     QR SCAN
  ======================== */
  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5Qrcode("qr-reader");
    qrRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (code) => {
          try {
            const res = await api.get(`/items/by-code/${code}`, {
              params: { branch_id: branchId },
            });
            addToCart(res.data);
            stopScanner();
          } catch {
            toast.error("Item not found");
          }
        },
      )
      .catch(() => toast.error("Camera error"));

    return () => stopScanner();
  }, [showScanner, branchId]);

  const stopScanner = () => {
    if (qrRef.current) {
      qrRef.current.stop().then(() => qrRef.current.clear());
      qrRef.current = null;
    }
    setShowScanner(false);
  };

  /* =======================
     TOTALS
  ======================== */
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.total, 0), [cart]);

  // const grandTotal = subtotal + vat;

  const vatAmount = applyVat
    ? cart.reduce((sum, i) => sum + i.total * (i.vat_percent / 100), 0)
    : 0;
  const grandTotal = subtotal + vatAmount;

  const remaining = Math.max(grandTotal - payment.paid, 0);

  const paymentStatus =
    payment.paid >= grandTotal && grandTotal > 0 ? "Paid" : "Unpaid";
  /* =======================
     COMPLETE SALE
  ======================== */
  const [loading, setLoading] = useState(false);

  const handleCompleteSale = async () => {
    if (loading) return;

    /* ======================
     VALIDATION
  ====================== */
    if (!selectedBranch) {
      return Swal.fire({
        icon: "warning",
        title: "Branch Required",
        text: "Please select a branch before completing the sale.",
      });
    }

    if (!cart.length) {
      return Swal.fire({
        icon: "warning",
        title: "Cart Empty",
        text: "Your cart is empty. Please add items before completing the sale.",
      });
    }

    if (!customer.name || !customer.phone) {
      return Swal.fire({
        icon: "warning",
        title: "Customer Info Missing",
        text: "Customer name and phone are required.",
      });
    }

    if (payment.paid < 0) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Payment",
        text: "Paid amount cannot be negative.",
      });
    }

    try {
      setLoading(true);

      /* ======================
       PREPARE ITEMS
    ====================== */
      const payloadItems = cart.map((i) => ({
        item_code: i.item_code, // PRIMARY KEY
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        vat_percent: applyVat ? Number(i.vat_percent) : 0,
        total_price: Number(i.total),
      }));

      /* ======================
       BUILD FORM DATA
    ====================== */
      const formData = new FormData();

      formData.append("branch_id", selectedBranch);
      formData.append(
        "sale_type",
        withReceipt ? "with_receipt" : "without_receipt",
      );
      formData.append("apply_vat", applyVat ? 1 : 0);
      formData.append("subtotal", subtotal);
      formData.append("vat_amount", vatAmount);
      formData.append("grand_total", grandTotal);
      formData.append("customer_name", customer.name);
      formData.append("customer_phone", customer.phone);
      formData.append("customer_address", customer.address || "");
      formData.append("customer_tin", customer.tin || "");
      formData.append("payment_method", payment.method);
      formData.append("paid_amount", payment.paid);
      formData.append("remaining_amount", remaining);
      formData.append("payment_status", paymentStatus);
      formData.append("sold_by", payment.soldBy || "");
      formData.append("remark", payment.remark || "");

      if (payment.method === "check") {
        formData.append("check_number", payment.checkNumber || "");
      }

      if (payment.method === "transfer") {
        formData.append("transfer_info", payment.transferInfo || "");
      }

      if (withReceipt) {
        formData.append("invoice_number", payment.invoiceNumber || "");
        formData.append("invoice_date", payment.invoiceDate || "");
      }

      formData.append("items", JSON.stringify(payloadItems));

      receiptImages.forEach((file) => {
        formData.append("receipt_images[]", file);
      });

      /* ======================
       SEND TO BACKEND
    ====================== */
      const res = await api.post("/salee", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: "Sale Completed",
        text: "The sale has been successfully recorded.",
        timer: 2500,
        showConfirmButton: false,
      });

      /* ======================
       RESET FORM
    ====================== */
      setCart([]);
      setReceiptImages([]);
      setCustomer({ name: "", phone: "", address: "", tin: "" });
      setPayment({ method: "cash", paid: 0, soldBy: "", remark: "" });
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message || "Sale failed. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Sale Failed",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================== */
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                🧾 QuickPOS
              </h1>

              <button className="flex items-center gap-2 border px-3 py-1.5 rounded text-sm">
                <History size={16} />
                Sales History
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* LEFT */}
              <div className="col-span-8 space-y-6">
                {/* Product Search */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Product Search</h3>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <select
                        className="border rounded px-3 py-2"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                      >
                        <option value="">All Branches</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan QR / Item code / Name / Part number"
                        autoFocus
                      />
                    </div>

                    <button
                      onClick={() => setShowScanner(true)}
                      className="border rounded px-3"
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  {items.length > 0 && (
                    <div className="border rounded mt-2 max-h-48 overflow-auto">
                      {items.map((item) => (
                        <div
                          key={item.item_code}
                          onClick={() => addToCart(item)}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                        >
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-xs text-gray-500">
                              {item.brand?.name} • {item.category?.name}
                            </p>
                          </div>

                          <div className="text-right text-xs">
                            <p>{item.unit_price} ETB</p>

                            <p className="text-gray-400">
                              Stock: {item.available_quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart */}
                <div className="bg-white rounded-lg border p-4 min-h-[300px]">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-medium">Cart</h3>
                    <span className="text-sm text-gray-500">
                      {cart.length} item(s)
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 h-48">
                      <ShoppingCart size={40} />
                      <p className="mt-2">Cart is empty</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
                      <thead className="bg-blue-500 text-white">
                        <tr>
                          <th className="text-left py-2 px-3">Item</th>
                          <th className="text-center py-2 px-3">Qty</th>
                          <th className="text-right py-2 px-3">Price</th>
                          <th className="text-right py-2 px-3">Total</th>
                          <th className="text-center py-2 px-3">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {cart.map((item) => (
                          <tr
                            key={item.item_code}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-2 px-3">{item.item_name}</td>

                            <td className="text-center py-2 px-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  onClick={() =>
                                    updateQuantity(
                                      item.item_code,
                                      item.quantity - 1,
                                    )
                                  }
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item.item_code,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-16 text-center border rounded px-1 py-1"
                                />
                                <button
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  onClick={() =>
                                    updateQuantity(
                                      item.item_code,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="text-right py-2 px-3">
                              {item.unit_price.toFixed(2)}
                            </td>
                            <td className="text-right py-2 px-3">
                              {item.total.toFixed(2)}
                            </td>

                            <td className="text-center py-2 px-3">
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() =>
                                  setCart((prev) =>
                                    prev.filter(
                                      (i) => i.item_code !== item.item_code,
                                    ),
                                  )
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Totals */}
                <div className="bg-white rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>VAT</span>
                    <span>{vatAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-semibold">
                    <span>Grand Total</span>
                    <span>{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              {/* RIGHT SIDE PANEL */}
              <div className="col-span-4 space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border p-4 shadow-md">
                  <h3 className="font-bold text-lg mb-4 text-blue-700">
                    Customer Information
                  </h3>

                  <div className="mb-3">
                    <label className="block text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter customer full name"
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter phone number"
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium">Address</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter address"
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer({ ...customer, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium">
                      TIN Number
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter TIN number"
                      value={customer.tin}
                      onChange={(e) =>
                        setCustomer({ ...customer, tin: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Sale Type and VAT */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border p-4 shadow-md">
                  <h3 className="font-bold text-lg mb-3 text-green-700">
                    Sale Options
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span>With Receipt?</span>
                    <input
                      type="checkbox"
                      checked={withReceipt}
                      onChange={() => setWithReceipt(!withReceipt)}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Apply VAT?</span>
                    <input
                      type="checkbox"
                      checked={applyVat}
                      onChange={() => setApplyVat(!applyVat)}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                {/* Receipt Upload */}
                {withReceipt && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border p-4 shadow-md">
                    <h3 className="font-bold text-lg mb-3 text-yellow-700">
                      Receipt Details
                    </h3>

                    <label className="block text-sm font-medium mb-1">
                      Attach Images / Screenshots
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="w-full mb-3"
                      onChange={(e) => setReceiptImages([...e.target.files])}
                    />

                    <label className="block text-sm font-medium mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter invoice number"
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          invoiceNumber: e.target.value,
                        })
                      }
                    />

                    <label className="block text-sm font-medium mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-400"
                      onChange={(e) =>
                        setPayment({ ...payment, invoiceDate: e.target.value })
                      }
                    />
                  </div>
                )}

                {/* Payment Section */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border p-4 shadow-md">
                  <h3 className="font-bold text-lg mb-3 text-purple-700">
                    Payment
                  </h3>

                  <label className="block text-sm font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-purple-400"
                    value={payment.method}
                    onChange={(e) =>
                      setPayment({ ...payment, method: e.target.value })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>

                  {/* Conditional Fields */}
                  {payment.method === "check" && (
                    <input
                      className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-purple-400"
                      placeholder="Check Number"
                      onChange={(e) =>
                        setPayment({ ...payment, checkNumber: e.target.value })
                      }
                    />
                  )}

                  {payment.method === "transfer" && (
                    <>
                      <label className="block text-sm font-medium mb-1">
                        From Bank → To Bank
                      </label>
                      <select
                        className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-purple-400"
                        onChange={(e) => {
                          if (e.target.value === "other") {
                            setPayment({ ...payment, transferInfo: "" });
                          } else {
                            setPayment({
                              ...payment,
                              transferInfo: e.target.value,
                            });
                          }
                        }}
                      >
                        <option value="">Select Bank</option>
                        <option value="CBE → Dashen">CBE → Dashen</option>
                        <option value="Awash → Nib">Awash → Nib</option>
                        <option value="other">Other (manual input)</option>
                      </select>
                      {payment.transferInfo === "" && (
                        <input
                          className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-purple-400"
                          placeholder="Enter From Bank → To Bank manually"
                          onChange={(e) =>
                            setPayment({
                              ...payment,
                              transferInfo: e.target.value,
                            })
                          }
                        />
                      )}
                    </>
                  )}

                  {/* Paid Amount */}
                  <label className="block text-sm font-medium mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded p-2 mb-2 focus:ring-2 focus:ring-purple-400"
                    value={payment.paid}
                    onChange={(e) =>
                      setPayment({ ...payment, paid: Number(e.target.value) })
                    }
                  />

                  {/* Remaining & Status */}
                  <div className="flex justify-between text-sm mb-2">
                    <span>Remaining</span>
                    <span>{remaining.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span>Status</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>

                  {/* Sold by / Remarks */}
                  <input
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-purple-400"
                    placeholder="Sold By"
                    onChange={(e) =>
                      setPayment({ ...payment, soldBy: e.target.value })
                    }
                  />
                  <input
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-purple-400"
                    placeholder="Remarks"
                    onChange={(e) =>
                      setPayment({ ...payment, remark: e.target.value })
                    }
                  />

                  {/* Attach Screenshot */}
                  <label className="block text-sm font-medium mb-1">
                    Attach Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border rounded p-2 mb-3"
                    onChange={(e) =>
                      setReceiptImages([...receiptImages, ...e.target.files])
                    }
                  />

                  {/* Complete Sale */}
                  <button
                    disabled={loading}
                    onClick={handleCompleteSale}
                    className={`w-full py-2 rounded transition-all ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-gray-800 text-white"
                    }`}
                  >
                    {loading ? "Processing..." : "Complete Sale"}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Modal */}
            {showScanner && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg w-80">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Scan QR</h3>
                    <X className="cursor-pointer" onClick={stopScanner} />
                  </div>
                  <div id="qr-reader" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewAddSalesPage;
