import React from "react";

function ViewProformaModal({ proforma, open, onClose }) {
  if (!open || !proforma) return null;

  const {
    id,
    job_id,
    date,
    customer_name,
    customer_tin,
    status,
    prepared_by,
    delivery_date,
    ref_num,
    validity_date,
    notes,
    payment_before,
    discount,
    other_cost,
    labour_vat,
    spare_vat,
    total,
    total_vat,
    gross_total,
    withholding,
    net_pay,
    net_pay_in_words,
    labour_items,
    spare_items,
  } = proforma;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Header */}
        <div className="border-b pb-4 mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Proforma Invoice #{id}
          </h2>
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold ${
              status === "canceled"
                ? "bg-red-100 text-red-700"
                : status === "returned"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status}
          </span>
        </div>

        {/* General Info */}
        <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
          <p>
            <strong>Customer:</strong> {customer_name}
          </p>
          <p>
            <strong>TIN:</strong> {customer_tin}
          </p>
          <p>
            <strong>Job ID:</strong> {job_id}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Reference:</strong> {ref_num}
          </p>
          <p>
            <strong>Validity:</strong> {validity_date || "-"}
          </p>
          <p>
            <strong>Delivery Date:</strong> {delivery_date || "-"}
          </p>
          <p>
            <strong>Prepared By:</strong> {prepared_by || "-"}
          </p>
          <p className="md:col-span-2">
            <strong>Notes:</strong> {notes || "-"}
          </p>
        </div>

        {/* Labour Items Table */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Labour Items
          </h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2">Unit</th>
                  <th className="p-2">Cost</th>
                  <th className="p-2">Est. Time</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {labour_items?.length > 0 ? (
                  labour_items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-center">{item.unit}</td>
                      <td className="p-2 text-center">{item.cost}</td>
                      <td className="p-2 text-center">{item.est_time}</td>
                      <td className="p-2 text-right">{item.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-400">
                      No labour items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spare Items Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Spare Items
          </h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2">Unit</th>
                  <th className="p-2">Brand</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Unit Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {spare_items?.length > 0 ? (
                  spare_items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-center">{item.unit}</td>
                      <td className="p-2 text-center">{item.brand}</td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-center">
                        {item.unit_price || "-"}
                      </td>
                      <td className="p-2 text-right">{item.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-400">
                      No spare items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="mt-8 border-t pt-4 text-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Summary</h3>
          <div className="grid sm:grid-cols-2 gap-2 max-w-lg ml-auto">
            <p>
              <strong>Payment Before:</strong> {payment_before}
            </p>
            <p>
              <strong>Discount:</strong> {discount}
            </p>
            <p>
              <strong>Other Cost:</strong> {other_cost}
            </p>
            <p>
              <strong>Labour VAT:</strong> {labour_vat}
            </p>
            <p>
              <strong>Spare VAT:</strong> {spare_vat}
            </p>
            <p>
              <strong>Total VAT:</strong> {total_vat}
            </p>
            <p>
              <strong>Total:</strong> {total}
            </p>
            <p>
              <strong>Gross Total:</strong> {gross_total}
            </p>
            <p>
              <strong>Withholding:</strong> {withholding || "-"}
            </p>
            <p className="font-bold text-lg text-green-600 col-span-2">
              Net Pay: {net_pay} Birr
            </p>
            <p className="italic col-span-2">In Words: {net_pay_in_words}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProformaModal;
