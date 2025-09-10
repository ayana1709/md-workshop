import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ProformaHeader from "./ProformaPrint/ProformaHeader";
import ProformaTable from "./ProformaPrint/ProformaTable";
import ProformaFooter from "./ProformaPrint/ProformaFooter";

function ProformaPrint({ proforma, open, onClose }) {
  if (!open || !proforma) return null;

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // ✅ v3 API
    documentTitle: `Proforma-${proforma?.id || ""}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        color: black;
      }
      .no-print {
        display: none !important;
      }
      .print-container {
        all: unset;
        display: block;
        width: 100%;
      }

      /* ===== Table Styles for Print ===== */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        font-size: 11px;
      }
      th, td {
        border: 1px solid black;
        padding: 6px;
      }
      th {
        background-color: #e5e7eb !important; /* Tailwind gray-200 */
        font-weight: bold;
        text-align: center;
      }
      td {
        text-align: left;
      }

      /* Align totals/footer to the right */
      .totals-row td {
        font-weight: bold;
        text-align: right !important;
      }
    `,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-[900px] max-h-[95vh] overflow-y-auto rounded-lg shadow-lg p-8 relative print-container">
        {/* Print Section */}
        <div ref={componentRef} className="font-sans text-sm text-black">
          <ProformaHeader proforma={proforma} />
          <ProformaTable proforma={proforma} />
          <ProformaFooter proforma={proforma} />
        </div>

        {/* Bottom Buttons (hidden in print) */}
        <div className="flex justify-center gap-4 mt-6 no-print">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProformaPrint;
