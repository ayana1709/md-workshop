// JobDetailsRightSection.jsx
import React, { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import car from "../../images/car.png";

const baseURL = import.meta.env.VITE_API_URL;

const JobDetailsRightSection = ({ printData }) => {
  const [popupSrc, setPopupSrc] = useState(null);

  const customerLength = Math.min(
    5,
    printData?.customer_observation?.length || 0
  );
  const jobLength = Math.min(5, printData?.job_description?.length || 0);
  const spareLength = Math.min(5, printData?.spare_change?.length || 0);

  const totalJobPrice = printData?.job_description?.reduce(
    (acc, curr) => acc + (parseFloat(curr?.price) || 0),
    0
  );

  const totalSparePrice = printData?.spare_change?.reduce(
    (acc, curr) => acc + (parseFloat(curr?.total_price) || 0),
    0
  );

  return (
    <div className="absolute top-[310px] right-6 w-[65%] text-[10px]">
      <h1 className="text-base font-bold text-center mb-2">
        Type Of Job To Be Performed
      </h1>

      {/* Upper Table: Customer Observation & Job To Be Done */}
      <div className="flex gap-1 w-full mb-2">
        <div className="w-1/2">
          <h2 className="text-[10px] font-bold mb-1">Customer Observation</h2>
          <table className="w-full border border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-600 p-1">Observation</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: customerLength }).map((_, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1 align-top">
                    {printData?.customer_observation?.[index] || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-1/2">
          <h2 className="text-[10px] font-bold mb-1">Jobs To Be Done</h2>
          <table className="w-full border border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-600 p-1">Job Description</th>
                <th className="border border-gray-600 p-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: jobLength }).map((_, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1 align-top">
                    {printData?.job_description?.[index]?.task || ""}
                  </td>
                  <td className="border border-gray-400 p-1 text-right align-top">
                    {printData?.job_description?.[index]?.price || "0.00"}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-400 p-1 text-right font-semibold">
                  Total
                </td>
                <td className="border border-gray-400 p-1 text-right font-semibold">
                  {totalJobPrice.toFixed(2)} ETB
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Spare Change Table */}
      <div className="mb-2">
        <h2 className="text-[10px] font-bold mb-1">Spare Change</h2>
        <table className="w-full border border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-600 p-1">Item</th>
              <th className="border border-gray-600 p-1">Part #</th>
              <th className="border border-gray-600 p-1">Qty</th>
              <th className="border border-gray-600 p-1">Unit</th>
              <th className="border border-gray-600 p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: spareLength }).map((_, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-1">
                  {printData?.spare_change?.[index]?.item || ""}
                </td>
                <td className="border border-gray-400 p-1">
                  {printData?.spare_change?.[index]?.part_number || ""}
                </td>
                <td className="border border-gray-400 p-1">
                  {printData?.spare_change?.[index]?.qty || 0}
                </td>
                <td className="border border-gray-400 p-1">
                  {printData?.spare_change?.[index]?.unit_price || 0}
                </td>
                <td className="border border-gray-400 p-1 text-right">
                  {printData?.spare_change?.[index]?.total_price || 0} ETB
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={4}
                className="border border-gray-400 p-1 text-right font-semibold"
              >
                Total
              </td>
              <td className="border border-gray-400 p-1 text-right font-semibold">
                {totalSparePrice.toFixed(2)} ETB
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Car Images */}
      <div className="flex justify-center flex-wrap gap-3 mt-4">
        {["front", "back", "left", "right"].map((dir) => {
          const imagePath = printData?.car_images?.[`car_image_${dir}`];
          const src = imagePath ? `${baseURL}${imagePath}` : car;

          return (
            <div
              key={dir}
              className="flex flex-col items-center w-[150px] cursor-pointer"
              onClick={() => setPopupSrc(src)}
            >
              <img
                src={src}
                alt={`${dir} view`}
                className="w-[140px] h-[100px] object-cover border border-gray-300 rounded"
              />
              <p className="mt-1 text-[11px] font-medium capitalize text-black">
                {dir} View
              </p>
            </div>
          );
        })}
      </div>

      {/* Image Modal */}
      {popupSrc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={() => setPopupSrc(null)}
        >
          <img
            src={popupSrc}
            alt="Full Preview"
            className="max-w-[90%] max-h-[90%] rounded shadow-xl"
          />
        </div>
      )}

      {/* Welcome Section */}
      <div className="mt-4 text-[12px] leading-snug">
        <h1 className="text-center font-bold mb-2 text-black text-[14px]">
          Welcome to Our Company
          <br />
          Please Read and Sign
        </h1>
        <ul className="space-y-1 pl-2">
          <li className="flex items-start">
            <IoMdArrowDropright size={14} className="mt-[2px]" />
            <p className="ml-2">
              1000 ETB/day parking fee applies after service is complete.
            </p>
          </li>
          <li className="flex items-start">
            <IoMdArrowDropright size={14} className="mt-[2px]" />
            <p className="ml-2">
              Remove valuables from vehicle. We’re not responsible unless
              received by hand.
            </p>
          </li>
          <li className="flex items-start">
            <IoMdArrowDropright size={14} className="mt-[2px]" />
            <p className="ml-2">
              You permit test driving outside with our card.
            </p>
          </li>
          <li className="flex items-start">
            <IoMdArrowDropright size={14} className="mt-[2px]" />
            <p className="ml-2">
              Your signature confirms approval of listed services.
            </p>
          </li>
        </ul>
        <h3 className="text-center font-bold mt-3 text-[12px]">
          Thank you for making us your first choice.
        </h3>
      </div>
    </div>
  );
};

export default JobDetailsRightSection;
