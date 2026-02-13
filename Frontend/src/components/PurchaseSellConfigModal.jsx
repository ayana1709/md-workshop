import { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";

export default function PurchaseSellConfigModal({ open, setOpen, item }) {
  const itemCode = item?.item_code;

  const [loading, setLoading] = useState(false);

  const [purchase, setPurchase] = useState({
    quantity: "",
    actual_unit_price: "",
    purchase_type: "without_receipt",
    receipt_number: "",
    vat_amount: "",
    total_with_vat: "",
  });

  const [sale, setSale] = useState({
    actual_unit_price: "",
    sale_type: "cash",
  });

  const [hasPurchase, setHasPurchase] = useState(false);
  const [hasSale, setHasSale] = useState(false);

  // Fetch purchase and sale data when modal opens
  useEffect(() => {
    if (!open || !itemCode) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.allSettled([
          api.get(`/purchasee/${itemCode}`),
          api.get(`/salee/${itemCode}`),
        ]);

        // PURCHASE
        if (pRes.status === "fulfilled" && pRes.value.data) {
          const p = Array.isArray(pRes.value.data)
            ? pRes.value.data[0]
            : pRes.value.data;

          if (p) {
            setPurchase({
              quantity: p.quantity ?? "",
              actual_unit_price: p.actual_unit_price ?? "",
              purchase_type: p.purchase_type ?? "without_receipt",
              receipt_number: p.receipt?.receipt_number ?? "",
              vat_amount: p.receipt?.vat_amount ?? "",
              total_with_vat: p.receipt?.total_with_vat ?? "",
            });
            setHasPurchase(true);
          }
        }

        // SALE
        if (sRes.status === "fulfilled" && sRes.value.data) {
          const s = Array.isArray(sRes.value.data)
            ? sRes.value.data[0]
            : sRes.value.data;

          if (s) {
            setSale({
              actual_unit_price: s.actual_unit_price ?? "",
              sale_type: s.sale_type ?? "cash",
            });
            setHasSale(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, itemCode]);

  const handleSave = async () => {
    try {
      // SAVE PURCHASE
      if (hasPurchase) {
        await api.put(`/purchasee/${itemCode}`, purchase);
      } else {
        await api.post(`/purchasee`, {
          ...purchase,
          item_code: itemCode,
          branch_id: item.branch_id,
        });
      }

      // SAVE SALE
      if (hasSale) {
        await api.put(`/salee/${itemCode}`, sale);
      } else {
        await api.post(`/salee`, {
          ...sale,
          item_code: itemCode,
          branch_id: item.branch_id,
        });
      }

      Swal.fire("Saved", "Purchase & Sale config saved", "success");
      setOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save config", "error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4">
          Purchase & Sale Config – {item?.item_name}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* PURCHASE */}
            <div>
              <h3 className="font-medium mb-2">Purchase</h3>

              <select
                className="w-full border rounded px-3 py-2 mb-2"
                value={purchase.purchase_type}
                onChange={(e) =>
                  setPurchase({ ...purchase, purchase_type: e.target.value })
                }
              >
                <option value="without_receipt">Without Receipt</option>
                <option value="with_receipt">With Receipt</option>
              </select>

              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Quantity"
                type="number"
                value={purchase.quantity}
                onChange={(e) =>
                  setPurchase({ ...purchase, quantity: e.target.value })
                }
              />

              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Actual Unit Price"
                type="number"
                value={purchase.actual_unit_price}
                onChange={(e) =>
                  setPurchase({
                    ...purchase,
                    actual_unit_price: e.target.value,
                  })
                }
              />

              {purchase.purchase_type === "with_receipt" && (
                <div className="space-y-2 mt-2">
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Receipt Number"
                    value={purchase.receipt_number}
                    onChange={(e) =>
                      setPurchase({
                        ...purchase,
                        receipt_number: e.target.value,
                      })
                    }
                  />
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="VAT Amount"
                    type="number"
                    value={purchase.vat_amount}
                    onChange={(e) =>
                      setPurchase({ ...purchase, vat_amount: e.target.value })
                    }
                  />
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Total With VAT"
                    type="number"
                    value={purchase.total_with_vat}
                    onChange={(e) =>
                      setPurchase({
                        ...purchase,
                        total_with_vat: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            {/* SALE */}
            <div>
              <h3 className="font-medium mb-2">Sale</h3>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Actual Unit Price"
                type="number"
                value={sale.actual_unit_price}
                onChange={(e) =>
                  setSale({ ...sale, actual_unit_price: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-black text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
