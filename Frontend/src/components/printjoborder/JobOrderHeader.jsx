import React from "react";
import { useStores } from "@/contexts/storeContext";

const JobOrderHeader = ({ printData }) => {
  const { companyData } = useStores();

  const logoUrl = companyData?.logo
    ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
    : "/logo.png";

  return (
    <div className="w-full flex items-start gap-6 border-b border-gray-300 pb-4 mb-6 text-sm text-black">
      {/* Column 1: Logo */}
      <div className="w-1/4 flex justify-center items-center">
        <img
          src={logoUrl}
          alt="Company Logo"
          className="h-[90px] object-contain"
        />
      </div>

      {/* Column 2: Company Names and Contact */}
      <div className="w-1/3 flex flex-col justify-center space-y-1">
        <h2 className="text-lg font-bold leading-tight">
          {companyData?.name_am || "የኩባንያ ስም (AM)"}
        </h2>
        <h3 className="uppercase font-semibold tracking-wide text-gray-700">
          {companyData?.name_en || "COMPANY NAME (EN)"}
        </h3>
        <div className="pt-2 space-y-1 text-sm">
          <p>
            <span className="font-semibold">Tel:</span>{" "}
            {companyData?.phone || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {companyData?.email || "N/A"}
          </p>
        </div>
      </div>

      {/* Column 3: Address and Registration */}
      <div className="w-1/3 flex flex-col justify-center space-y-1 text-sm">
        <p>
          <span className="font-semibold">Address:</span>{" "}
          {companyData?.address || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Sub City:</span>{" "}
          {companyData?.sub_city || "-"}
        </p>
        <p>
          <span className="font-semibold">House No:</span>{" "}
          {companyData?.house_no || "-"}
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
