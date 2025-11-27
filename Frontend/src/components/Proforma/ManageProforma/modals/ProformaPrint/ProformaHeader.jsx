import React from "react";
import { useStores } from "@/contexts/storeContext";
import PrintHeader from "@/components/PrintHeader";

function ProformaHeader({ proforma }) {
  const { companyData } = useStores();

  return (
    <div className="w-full">
      {/* Company Header */}

      {/* Top Row: Date + Title + Ref */}
      <div className="flex justify-between items-center mt-1 px-2">
        {/* Left: Empty / can add logo later */}
        <div className="flex-1"></div>

        {/* Center: Title */}
        <div className="flex flex-col text-center flex-1">
          <h2 className="text-[20px] font-bold mt-[1px] leading-tight">
            የዋጋ ማቅረቢያ ደረሰኝ
          </h2>
          <h1 className="text-[22px] font-extrabold underline underline-offset-4 leading-tight">
            Proforma Invoice
          </h1>
        </div>

        {/* Right: Date + Ref */}
        <div className="flex flex-col items-end text-[14px] font-medium flex-1">
          <p>
            Date / ቀን:{" "}
            <span className="underline underline-offset-2 decoration-1 ml-1">
              {proforma.date || "_____"}
            </span>
          </p>
          <p>
            Ref. No / መ.ቁ:{" "}
            <span className="underline underline-offset-2 decoration-1 ml-1">
              {proforma.ref_num || "_____"}
            </span>
          </p>
        </div>
      </div>

      {/* Customer Name */}
      <div className="mb-1 text-[16px] font-semibold px-2 mt-2">
        To / ለ:{" "}
        <span className="underline underline-offset-2 decoration-1">
          {proforma.customer_name || "_____"}
        </span>
      </div>
    </div>
  );
}

export default ProformaHeader;
