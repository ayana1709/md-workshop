import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ProformaHeader from "./ProformaPrint/ProformaHeader";
import ProformaTable from "./ProformaPrint/ProformaTable";
import ProformaFooter from "./ProformaPrint/ProformaFooter";
import PrintHeader from "@/components/PrintHeader";

function ProformaPrint({ proforma, open, onClose }) {
  if (!open || !proforma) return null;

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // ✅ ReactToPrint v3 API
    documentTitle: `Proforma_company-${proforma?.ref_num || ""}`,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-30 print:bg-transparent print:inset-auto">
      <div className="bg-white w-auto max-h-[95vh] overflow-y-auto rounded-md shadow-lg p-6 relative print:p-0 print:shadow-none print:rounded-none print:overflow-visible">
        {/* Printable Section */}
        <div
          ref={componentRef}
          className="print-area text-black font-sans bg-white w-[210mm] mx-auto overflow-visible print:w-full"
          style={{ pageBreakInside: "avoid" }}
        >
          <PrintHeader />

          <ProformaHeader proforma={proforma} />

          <ProformaTable proforma={proforma} />

          <ProformaFooter proforma={proforma} />
        </div>

        {/* Buttons (hidden on print) */}
        <div className="flex justify-center gap-4 mt-4 no-print">
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProformaPrint;
