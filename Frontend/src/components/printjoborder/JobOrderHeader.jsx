import React from "react";
import { useStores } from "@/contexts/storeContext";

const JobOrderHeader = ({ printData }) => {
  const { companyData } = useStores();

  const logoUrl = companyData?.logo
    ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
    : "/logo.png";

  return (
    <div className="w-full border-b border-gray-300 pb-4 mb-6 text-black">
      {/* Top Row: Logos + Company Name */}
      <div className="flex items-center justify-between">
        {/* Left Logo */}
        <img
          src={logoUrl}
          alt="Company Logo Left"
          className="h-[110px] w-auto object-contain"
        />

        {/* Company Names (Center) */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-extrabold leading-tight">
            {companyData?.name_am || "የኩባንያ ስም (AM)"}
          </h2>
          <h3 className="uppercase font-bold tracking-wider text-gray-700 text-lg">
            {companyData?.name_en || "COMPANY NAME (EN)"}
          </h3>
        </div>

        {/* Right Logo */}
        <img
          src={logoUrl}
          alt="Company Logo Right"
          className="h-[110px] w-auto object-contain"
        />
      </div>

      {/* Bottom Info Row */}
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 mt-3 text-sm text-gray-800">
        <p>
          <span className="font-semibold">Tel:</span>{" "}
          {companyData?.phone || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Email:</span>{" "}
          {companyData?.email || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Address:</span>{" "}
          {companyData?.address || "N/A"}
        </p>

        <p>
          <span className="font-semibold">Tin No:</span>{" "}
          {companyData?.tin || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Vat Reg No:</span>{" "}
          {companyData?.vat_reg_no || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default JobOrderHeader;
