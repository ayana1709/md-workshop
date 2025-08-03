// VehicleConditionTable.jsx
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const VehicleConditionTable = ({ printData }) => {
  return (
    <div>
      <table className="mt-4 w-[30%] border-collapse border border-gray-700 text-left text-xs mb-4">
        <thead>
          <tr className="border-gray-700">
            <th className="border border-gray-700 p-1 w-[80%] text-black font-extrabold">
              Condition of Vehicle
            </th>
            <th className="border border-gray-700 p-1 w-[10%]"> </th>
          </tr>
        </thead>
        <tbody className="border-gray-700 text-black">
          {[
            "Fuel",
            "Wind shield Glass",
            "Battery",
            "Radiator Cup",
            "Engine Oil Cup",
            "Wiper Jar",
            "Antena",
            "Front Grill",
            "Head Light L.s",
            "Mirror View R.S",
            "Parking L.S",
            "Parking R.S",
            "Door Glass F.R L.s",
            "Door Glass F.R R.s",
            "Door Glass R.R L.s",
            "Door Glass R.R R.s",
            "Finder Sinal Lh",
            "Finder Sinal Rh",
            "Asray",
            "Floor mat",
            "Lighter",
            "Mirror View inside",
            "Mirror View L.h",
            "Mirror View R.h",
            "Radio & Knob",
            "Tape Recorder and CD",
          ].map((item, index) => (
            <tr key={index} className="border-gray-200">
              <td className="border border-gray-700 p-1">{item}</td>
              <td className="border border-gray-700 p-1 text-center">
                {item === "Fuel" ? (
                  <span className="text-dark-800 font-semibold text-black">
                    {printData?.selected_items?.find((fuel) =>
                      ["1", "0", "2/3", "1/3", "1/2", "1/4"].includes(fuel)
                    ) || "N/A"}
                  </span>
                ) : printData?.selected_items?.includes(item) ? (
                  <FaCheckCircle className="text-green-500" size={16} />
                ) : (
                  <span className="text-red-700 text-xl">x</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleConditionTable;
