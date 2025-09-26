import React from "react";
import { useStores } from "@/contexts/storeContext";

function ProformaHeader({ proforma }) {
  const { companyData } = useStores();

  return (
    <div className="px-8 print:px-12">
      {/* Header: Logo + Company Names + Company Details */}
      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-md shadow-lg">
        {/* Logo */}
        {companyData?.logo && (
          <div className="flex-shrink-0">
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/${
                companyData.logo
              }`}
              alt="Company Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
        )}

        {/* Company Names */}
        <div className="flex-1 ml-4">
          <h2 className="font-bold text-red-600 text-xl">
            {companyData?.name_am || "የኩባንያ ስም"}
          </h2>
          <h2 className="font-bold text-gray-800 text-xl uppercase">
            {companyData?.name_en || "Company Name"}
          </h2>
        </div>

        {/* Company Details (Right Aligned) */}
        <div className="text-sm text-right font-medium text-gray-700 space-y-1">
          <p>Address / አድራሻ : {companyData?.address || "----"}</p>
          <p>TIN Number / የታክስ ከፋይ መ.ቁ : {companyData?.tin || "----"}</p>
          <p>
            VAT Reg. Num / የግብር ክፋይ ት.እ.ታ ቁጥር : {companyData?.vat || "----"}
          </p>
        </div>
      </div>

      {/* Title + Right Side Info */}
      <div className="flex justify-between items-center my-6">
        {/* Title */}
        <h3 className="font-bold text-xl text-red-600 py-2 px-6 rounded-md bg-gray-100">
          የዋጋ ማቅረቢያ / PROFORMA INVOICE
        </h3>

        {/* Right Side Small Info */}
        <div className="text-sm text-right text-gray-800 space-y-1">
          <p>Date | ቀን : {proforma.date}</p>
          <p>Ref No | መለኪያ ቁጥር : {proforma.ref_num}</p>
          <p>Customer TIN | ተጠቃሚ TIN : {proforma.customer_tin || "----"}</p>
        </div>
      </div>

      {/* Customer Name */}
      <div className="mb-4 text-lg font-semibold">
        <p>To | ለ: {proforma.customer_name}</p>
      </div>
    </div>
  );
}

export default ProformaHeader;
