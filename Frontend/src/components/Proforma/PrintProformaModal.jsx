import React from "react";

function PrintProformaModal({ proforma, open, onClose }) {
  if (!open || !proforma) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-3/4 max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        <div id="print-section">
          <h2 className="text-xl font-bold mb-4">
            Proforma #{proforma.id} (Print)
          </h2>
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
        </div>

        <button
          onClick={handlePrint}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Print Now
        </button>
      </div>
    </div>
  );
}

export default PrintProformaModal;
