import React from "react";

function ViewProformaModal({ proforma, open, onClose }) {
  if (!open || !proforma) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-3/4 max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Proforma #{proforma.id}</h2>
        <p>
          <strong>Customer:</strong> {proforma.customer_name}
        </p>
        <p>
          <strong>Job ID:</strong> {proforma.job_id}
        </p>
        <p>
          <strong>Date:</strong> {proforma.date}
        </p>
        <p>
          <strong>Total:</strong> {proforma.net_pay} Birr
        </p>

        <h3 className="mt-4 font-semibold">Labour Items</h3>
        <ul className="list-disc ml-6">
          {proforma.labour_items?.map((item) => (
            <li key={item.id}>
              {item.description} - {item.quantity} × {item.unit_price} ={" "}
              {item.total}
            </li>
          ))}
        </ul>

        <h3 className="mt-4 font-semibold">Spare Items</h3>
        <ul className="list-disc ml-6">
          {proforma.spare_items?.map((item) => (
            <li key={item.id}>
              {item.description} - {item.quantity} × {item.unit_price} ={" "}
              {item.total}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ViewProformaModal;
