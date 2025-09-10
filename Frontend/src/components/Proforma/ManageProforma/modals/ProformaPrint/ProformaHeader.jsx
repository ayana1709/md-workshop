import React from "react";
import { useStores } from "@/contexts/storeContext";

function ProformaHeader({ proforma }) {
  const { companyData } = useStores();
  console.log("company Data:", companyData);
  console.log("proforma:", proforma);

  return (
    <div className="px-8 print:px-12">
      {/* Logo + Company Name */}
      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-md shadow-lg">
        <div className="flex items-center">
          {companyData?.logo && (
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/${
                companyData.logo
              }`}
              alt="Company Logo"
              className="h-16 object-contain mr-4"
            />
          )}
          <div>
            <h2 className="font-bold text-red-600 text-xl">
              {companyData?.name_am || "የኩባንያ ስም"}
            </h2>
            <h2 className="font-bold text-gray-800 text-xl uppercase">
              {companyData?.name_en || "Company Name"}
            </h2>
          </div>
        </div>
      </div>

      {/* Company & Customer Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 py-4 print:grid-cols-2">
        {/* Left */}
        <div className="space-y-2 text-left">
          <p className="font-semibold">
            Address / አድራሻ : {companyData?.address || "----"}
          </p>
          <p className="font-semibold">
            TIN Number / የታክስ ከፋይ መ.ቁ : {companyData?.tin || "----"}
          </p>
          <p className="font-semibold">
            VAT Registration Num / የግብር ክፋይ ት.እ.ታ ቁጥር :
            {companyData?.vat || "----"}
          </p>
        </div>

        {/* Right */}
        <div className="space-y-2 text-right">
          <p className="font-semibold">Date | ቀን : {proforma.date}</p>
          <p className="font-semibold">
            Ref No | መለኪያ ቁጥር : {proforma.ref_num}
          </p>
          <p className="font-semibold">
            Customer TIN | ተጠቃሚ TIN : {proforma.customer_tin || "----"}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="my-6 text-center">
        <h3 className="font-bold text-xl text-red-600 py-2 rounded-md bg-gray-100 inline-block px-6">
          የዋጋ ማቅረቢያ / PROFORMA INVOICE
        </h3>
      </div>

      {/* Customer Name */}
      <div className="mb-4 text-lg font-semibold">
        <p>To | ለ: {proforma.customer_name}</p>
      </div>
    </div>
  );
}

export default ProformaHeader;
