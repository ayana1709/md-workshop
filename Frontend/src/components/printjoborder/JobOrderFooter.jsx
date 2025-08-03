// JobOrderFooter.jsx
import React from "react";
import { IoMdArrowDropright } from "react-icons/io";

const JobOrderFooter = () => {
  return (
    <div>
      <div className="w-full flex justify-center items-center h-64 gap-4 print:h-auto">
        {/* Left Side - Instructions */}
        <div className="w-1/2 bg-gray-100 p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
          <h1 className="text-center text-lg font-extrabold text-black mb-3 leading-snug">
            ወደ ኩባንያችን አንኳን በሰላም መጡ
            <br /> አባክዎን ያንብቡና ይፈርሙ
          </h1>

          <ul className="space-y-1 text-sm text-black">
            {[
              "ከላይ የተጠቀሱት ጥገናዎች አንዲሰሩ ፈቃድ ሰጥቻለሁ፡፡",
              "አባክዎን ንብረትዎን ያስረክቡ፣ላልተረከብነው ንብረት ኃላፊነት አንወስድም፡፡",
              "ተሽከርካሪው ፍተሻ ካርድ በማድረግ ከግቢ ውጪ ስነዳ ካዩ ለፍተሻ መሆኑን አናሳዉቃለን፡፡",
              "መኪናዉን ጨርሰን ካሳዎቅን አና ካልዎሰዱ በቀን 1000 ብር የምናስከፍል መሆኑን በትህትና አናሳዉቃለን፡፡",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <IoMdArrowDropright className="text-blue-600 mt-1" />
                <p className="text-gray-800">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side - Signature Section */}
        <div className="w-1/2 bg-white p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
          <h2 className="text-lg font-extrabold text-black mb-4 text-center">
            ስምምነት
          </h2>
          <div className="text-[15px] space-y-4 text-black font-semibold">
            {["Full Name", "Customer Signature", "Receptionist Signature"].map(
              (label, index) => (
                <p
                  key={index}
                  className="border-b border-gray-500 pb-1 whitespace-nowrap"
                >
                  {label}
                  {/* <span className="inline-block w-[70%] border-b border-dashed border-black ml-2 align-middle"></span> */}
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderFooter;
