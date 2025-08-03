// PrintJobOrder.jsx
import React, { useEffect, useRef } from "react";
import { useStores } from "../contexts/storeContext";
import { useNavigate } from "react-router-dom";
import JobOrderHeader from "./printjoborder/JobOrderHeader";
import VehicleConditionTable from "./printjoborder/VehicleConditionTable";
import JobDetailsRightSection from "./printjoborder/JobDetailsRightSection";
import JobOrderFooter from "./printjoborder/JobOrderFooter";

const PrintJobOrder = () => {
  const { printData } = useStores();
  const navigate = useNavigate();
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (!hasPrinted.current) {
      hasPrinted.current = true;
      window.print();
    }

    const handlePrintComplete = () => {
      setTimeout(() => {
        navigate("/job-manager/repair");
      }, 200);
    };

    window.addEventListener("afterprint", handlePrintComplete);
    window.addEventListener("focus", handlePrintComplete);

    return () => {
      window.removeEventListener("afterprint", handlePrintComplete);
      window.removeEventListener("focus", handlePrintComplete);
    };
  }, [navigate]);

  return (
    <div className="relative p-[2px] px-2 pl-6 border border-black w-[1000px] mx-auto text-sm">
      <JobOrderHeader printData={printData} />
      <VehicleConditionTable printData={printData} />
      <JobDetailsRightSection printData={printData} />
      <JobOrderFooter />
    </div>
  );
};

export default PrintJobOrder;
