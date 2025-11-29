import React from "react";
import { useStores } from "@/contexts/storeContext";

function ProformaFooter({ proforma }) {
  const { companyData } = useStores();

  return (
    <div className="mt-3 border border-black rounded-md text-[13px] font-sans leading-tight print:mt-2">
      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-x-4 px-3 py-3">
        <div className="space-y-2">
          <p className="flex items-center">
            <strong className="w-40 font-semibold text-[13px]">
              ይህ ዋጋ ማቅረቢያ የሚያገለግለው ለ / Validity Date:
            </strong>
            <span className="flex-1 border-b border-black px-1">
              {proforma.validity_date || "-----"} ቀን ነው / Days only
            </span>
          </p>
          <p className="flex items-center">
            <strong className="w-40 font-semibold text-[13px]">
              የመረከቢያ ቀን / Delivery Date:
            </strong>
            <span className="flex-1 border-b border-black px-1">
              {proforma.delivery_date || ""}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="flex items-center">
            <strong className="w-40 font-semibold text-[13px]">
              ያዘጋጀው / Prepared By:
            </strong>
            <span className="flex-1 border-b border-black px-1">
              {proforma.prepared_by || ""}
            </span>
          </p>
          <p className="flex items-center">
            <strong className="w-40 font-semibold text-[13px]">
              የክፍያ ሁነታ / Payment Type:
            </strong>
            <span className="flex-1 border-b border-black px-1">
              {proforma.paymenttype || ""}
            </span>
          </p>
          <p className="flex items-center h-[35px]">
            <strong className="w-40 font-semibold text-[13px]">
              ፊርማ / Signature:
            </strong>
            <span className="flex-1 border-b border-black px-1"></span>
          </p>
        </div>
      </div>

      {/* Thank You Message */}
      <div className="border-t border-black text-center py-3 leading-tight">
        <p className="text-[13px] font-semibold italic">
          ስለመረጡን እናመሰግናለን! / Thanks for choosing us!
        </p>
      </div>
    </div>
  );
}

export default ProformaFooter;
