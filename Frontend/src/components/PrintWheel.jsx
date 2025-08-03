import React, { useEffect, useState } from "react";
import { useStores } from "../contexts/storeContext";
import logo from "./../images/aa.png";
import toyota from "./../images/toyota.png";
import car from "./../images/car.png";
import meter from "./../images/meter.png";
import { IoMdArrowDropright } from "react-icons/io";

import { FaCheckCircle } from "react-icons/fa"; // Import check icon
import { useLocation, useNavigate } from "react-router-dom";
const PrintWheel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wheelData } = useStores(); // Access WheelwheelData from the location state
  console.log(wheelData);
  useEffect(() => {
    const handleAfterPrint = () => {
      // Navigate back to job-order-list after printing or canceling
      navigate("/job-manager/wheel-alignment-list");
    };

    // Add event listener for afterprint
    window.addEventListener("afterprint", handleAfterPrint);

    // Trigger print with delay to ensure content is rendered
    setTimeout(() => {
      window.print();
    }, 100); // Delay for page rendering before triggering print

    // Clean up event listener when the component unmounts
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [navigate]);

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-GB"); // Formats as DD/MM/YYYY
  };

  return (
    <div className="flex flex-col items-center p-5">
      <div
        // ref={receiptRef}
        className="w-[90%] mx-auto p-6 rounded-lg border"
      >
        {/* Header */}
        <div className="w-full relative text-center border-b py-10">
          <div className="text-center">
            <img
              src={logo}
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-center w-[20%]"
            />
            <p className="w-full absolute top-14 left-1/2 -translate-x-1/2 text-center uppercase tracking-wider font-semibold">
              Wheel registration receipt
            </p>
          </div>
        </div>
        <div className="max-w-[90%] mx-auto flex justify-between px-6 py-4 my-2 border rounded-sm">
          <div>
            <p>Date:{getFormattedDate()}</p>
          </div>
          <div>Receipt Number:______________</div>
        </div>

        {/* Customer & Vehicle Details */}
        <div className="max-w-[90%] mx-auto grid grid-cols-2 gap-2 my-2 py-2 border px-4 py-2">
          <div>
            <h3 className="inline-block text-left my-2 border-b border-b-gray-800 font-semibold text-gray-700 text-xl">
              Customer Details
            </h3>
            <div className="flex flex-col gap-2">
              <div>
                <p className="">
                  <strong>
                    Customer Name:{" "}
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.customer_name}
                    </span>
                  </strong>{" "}
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    Customer Type:
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.customer_type}
                    </span>
                  </strong>{" "}
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    Phone Number:
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.mobile}
                    </span>
                  </strong>{" "}
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    TIN Number:{" "}
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.tin_number}
                    </span>
                  </strong>{" "}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="inline-block text-left my-2 border-b border-b-gray-800 font-semibold text-gray-700 text-xl">
              Vehicle Details
            </h3>
            <div className="flex flex-col gap-2">
              <div>
                <p>
                  <strong>
                    Job Card Number:{""}
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.job_card_no}
                    </span>
                  </strong>{" "}
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    Checked Date:{" "}
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.checked_date}
                    </span>
                  </strong>{" "}
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    Work Description:{""}
                    <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                      {wheelData?.work_description}
                    </span>
                  </strong>{" "}
                </p>
              </div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Inspection Details */}
        <div className="max-w-[90%] mx-auto mt-4 text-sm border px-4 py-2">
          <h3 className="font-semibold text-gray-700 text-xl tracking-wider border-b border-b-gray-800 inline-block pb-[2px] mb-2">
            Wheel Details
          </h3>
          <div className="flex flex-col gap-2">
            <p>
              <strong>
                Result:{" "}
                <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                  {wheelData?.result}
                </span>
              </strong>{" "}
            </p>
            <p>
              <strong>
                Checked By:{" "}
                <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                  {wheelData?.checked_by}
                </span>
              </strong>{" "}
            </p>
            <p>
              <strong>
                Total Payment:{" "}
                <span className="border-b border-b-gray-800 pb-[2px] text-sm">
                  {wheelData?.total_amount}
                </span>
              </strong>{" "}
            </p>
          </div>
        </div>

        {/* Signature & Footer */}
        <div className="relative mt-5 text-center border-t pt-3">
          <p className="text-left text-sm text-gray-600 italic">
            Authorized Signature_________________
          </p>
          <p className="absolute right-2 -top-2 text-gray-700 mt-6">
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintWheel;
