import React from "react";
import { IoMdArrowDropright } from "react-icons/io";

const JobOrderFooter = () => {
  return (
    <div className="mt-6 w-full">
      <div className="w-full flex justify-between items-start h-auto gap-6 print:h-auto">
        {/* Left Side - Amharic Workshop Welcome Note */}
        <div className="w-1/2 bg-gray-100 p-4 rounded-md border text-[11px] leading-relaxed text-black shadow-sm">
          <h1 className="text-center text-[13px] font-extrabold mb-3 leading-snug">
            ውድ ደንበኞቻችን
          </h1>

          <p className="mb-3">
            መርጠውን ሲለመጡ በጣም እናመሰግናለን። በአገልግሎታችን ላይ ሲጠቀሙ ከሚከተሉት መመሪያዎች ጋር እባኮትን
            ይጠብቁ፦
          </p>

          <ul className="space-y-2 text-[11px]">
            {[
              "ለጥገና ያስረከቡትን ንብረት መረከቢያ ወረቀት መያዝዎን ያረጋግጡ።",
              "ለጥገና የሚያስፈልጉ መለዋወጫዎችን በተጠየቁ ጊዜ በፍጥነት በማቅረብ ይተባበሩን።",
              "ያስረከቡትን ንብረት ጥገናው እንዲሁ ባለቀ ጊዜ እናሳውቃለን። በቀጠሮ በመገኘት ንብረቶን መረከብ ይኖርቦታል።",
              "ጥገናው እንዳለቀ የመጀመሪያ ጊዜ መረከብ እንዲፈጸም ይጠይቃል።",
              "ንብረቶን በጊዜው ባልተረከቡ ከሆነ፣ ለቆየበት ጊዜ ተጨማሪ ኪፊያ ይከፍላሉ።",
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
        <div className="w-1/2 bg-white p-3 rounded-lg shadow-md h-full flex flex-col justify-center">
          <h2 className="text-base font-bold text-black mb-3 text-center">
            ስምምነት / Agreement
          </h2>
          <div className="text-xs space-y-3 text-black font-medium">
            {[
              " Customer Full Name| ተረካቢ ሙሉ ስም",
              "ፊርማ / Signature",
              " Receptionist Full Name | አስረካቢ ሙሉ ስም",
              "ፊርማ / Signature",
            ].map((label, index) => (
              <p
                key={index}
                className="border-b border-gray-500 pb-1 whitespace-nowrap"
              >
                {label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderFooter;
