// JobOrderHeader.jsx
import React from "react";
import logo from "../../images/aa.png";
import toyota from "../../images/toyota.png";

const JobOrderHeader = ({ printData }) => {
  return (
    <div>
      <div className="w-full">
        <img src={toyota} className="w-[20%] absolute right-2 top-[-60px]" />
        <h1 className="absolute top-20 right-16 text-xl font-extrabold text-black">
          TOYOTA
        </h1>
        <p className="absolute top-28 right-4 text-lg font-semibold text-black">
          Toyota Quality Service
        </p>
      </div>
      <div className="w-full flex items-start gap-4 text-center phone:p-[2px] btablet:p-[2px]">
        <img src={logo} className="w-[35%] h-12" />
        <div className="flex flex-col">
          <p className="text-dark-900 text-xl text-black">
            ስፒድ ሜትር ትራዲንግ ኃላ የተ የግል ማህበር
          </p>
          <p className="uppercase text-black">speed meter trading plc</p>
        </div>
      </div>
      <div className="flex gap-4">
        <p className="font-extrabold text-black">
          Tel:{" "}
          <span className="font-extrabold text-black">(+251) 989 999900</span>
        </p>
        <p className="font-extrabold text-black">
          Email:{" "}
          <span className="font-extrabold text-black">
            speedmetertradingplc@gmail.com
          </span>
        </p>
      </div>
      <div className="flex gap-4">
        <p className="font-extrabold text-black">
          sub city:{" "}
          <span className="font-extrabold text-black">Bole, Ethiopia</span>
        </p>
        <p className="font-extrabold text-black">
          House No: <span className="font-extrabold text-black">1701/01</span>
        </p>
        <p className="font-extrabold">
          <span className="font-extrabold text-black">
            Addis Ababa, Ethiopia
          </span>
        </p>
      </div>
      <div>
        <p className="font-extrabold text-black">
          Tin.No. <span className="font-extrabold text-black">0088187360</span>
        </p>
        <p className="font-extrabold text-black">
          Vat.Reg.No. <span className="font-extrabold">22938100010</span>
        </p>
      </div>
      <div className="absolute top-[110px] left-1/2 -translate-x-1/2">
        <h1 className="text-lg font-extrabold text-black">Service Job Card</h1>
        <h1 className="text-lg font-extrabold border-b border-b-gray-700 text-black">
          የመኪና መረከብያ ካርድ
        </h1>
      </div>
      <div className="mt-10 w-full flex flex-wrap gap-6">
        <div>
          <p className="text-black">
            Customer Name:
            <span className="text-center inline-block w-[150px] border-b border-gray-700 text-black">
              {printData?.customer_name || "N/A"}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Address:<span>________________________</span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Telephone:
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData?.mobile}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Model:
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData?.vehicles?.[0]?.model || ""}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Tin No:
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData.vehicles[0]?.tin}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Plate No:
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData.vehicles[0]?.plate_no}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Vin Number:
            <span className="text-center inline-block w-[150px] border-b border-gray-700 text-black">
              {printData.vehicles[0]?.vin}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Date in:
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData?.received_date}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            km:
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData.vehicles[0]?.km_reading}
            </span>
          </p>
        </div>
        <div>
          <p className="text-black">
            Price Estimation(ETB)
            <span className="text-center inline-block w-[150px] border-b border-b-gray-700 text-black">
              {printData.vehicles[0]?.estimated_price}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobOrderHeader;
