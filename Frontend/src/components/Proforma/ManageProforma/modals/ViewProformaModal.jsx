import React from "react";

function ViewProformaModal({ proforma, open, onClose }) {
  if (!open || !proforma) return null;

  // destructuring for cleaner code
  const {
    id,
    job_id,
    date,
    customer_name,
    customer_tin,
    product_name,
    types_of_jobs,
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
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          Proforma #{id}
        </h2>

        {/* General Info */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
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
            <strong>Product:</strong> {product_name}
          </p>
          <p>
            <strong>Type of Job:</strong> {types_of_jobs}
          </p>
          <p>
            <strong>Prepared By:</strong> {prepared_by}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Delivery Date:</strong> {delivery_date || "-"}
          </p>
          <p>
            <strong>Reference:</strong> {ref_num}
          </p>
          <p>
            <strong>Validity:</strong> {validity_date} days
          </p>
          <p>
            <strong>Notes:</strong> {notes}
          </p>
        </div>

        {/* Items Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Labour Items</h3>
          <table className="w-full border rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {labour_items?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">{item.unit_price}</td>
                  <td className="p-2 text-right">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Spare Items</h3>
          <table className="w-full border rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {spare_items?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">{item.unit_price}</td>
                  <td className="p-2 text-right">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-6 border-t pt-4 text-sm">
          <div className="grid grid-cols-2 gap-2 max-w-md ml-auto">
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
              <strong>Gross Total:</strong> {gross_total}
            </p>
            <p>
              <strong>Withholding:</strong> {withholding}
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
