import React from "react";
import { IoMdArrowDropright } from "react-icons/io";

const JobOrderFooter = () => {
  return (
    <div className="mt-6 w-full">
      <div className="w-full flex justify-between items-start h-auto gap-6 print:h-auto">
        {/* Left Side - Amharic Workshop Welcome Note */}
        <div className="w-1/2 bg-gray-100 p-4 rounded-md border text-[11px] leading-relaxed text-black shadow-sm">
          <h1 className="text-center text-[13px] font-extrabold mb-3 leading-snug">
            ወደ እኛ የመጡትን በከበር እንመርታለን። <br />
            እባኮትን የእቃውን አገልግሎት ደንብ ያንብቡና ያረጋግጡ።
          </h1>

          <ul className="space-y-2 text-[11px]">
            {[
              "ከላይ የተጠቀሱት አገልግሎቶችን በፈቃድ እንዲደርሱ እስማማለሁ።",
              "እባኮትን ልዩ ንብረቶችን ከመኪናው ያወጡ፤ ላልተዘጋጀ ነገር ኃላፊነት አናውም።",
              "ለፍተሻ መኪናውን ከግቢ ውጭ ማሽከርከር እንችላለን።",
              "አገልግሎቱ ከተጠናቀቀ በኋላ በዕለት 1000 ብር የእንቅስቃሴ ክፍያ ይጨምራል።",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <IoMdArrowDropright
                  className="text-blue-600 mt-[2px]"
                  size={12}
                />
                <p className="text-gray-800">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side - Signature Section */}
        <div className="w-1/2 bg-white border p-4 rounded-md shadow-sm text-black">
          <h2 className="text-center text-[13px] font-bold mb-3">የስምምነት ክፍል</h2>
          <div className="space-y-5 text-[12px] font-medium">
            {["ሙሉ ስም / Full Name", "የደንበኛ ፊርማ", "የተቀባይ ፊርማ"].map(
              (label, index) => (
                <div key={index}>
                  <p className="mb-1">{label}</p>
                  <div className="border-b border-gray-600 w-full h-5" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderFooter;
