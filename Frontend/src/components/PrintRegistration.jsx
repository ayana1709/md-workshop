import React, { useEffect, useRef, useState } from "react";
import { useStores } from "../contexts/storeContext";
import logo from "./../images/aa.png";
import toyota from "./../images/toyota.png";
import car from "./../images/car.png";
import meter from "./../images/meter.png";
import { IoMdArrowDropright } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa"; // Import check icon
import { useLocation, useNavigate } from "react-router-dom";
import JobOrderHeader from "./printjoborder/JobOrderHeader";
import VehicleConditionTable from "./printjoborder/VehicleConditionTable";
import JobDetailsRightSection from "./printjoborder/JobDetailsRightSection";
import JobOrderFooter from "./printjoborder/JobOrderFooter";
const PrintRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { repairData } = location.state || {}; // Access repairData from the location state

  const hasPrinted = useRef(false);
  // console.log(repairData);
  useEffect(() => {
    const images = document.images;
    let loadedCount = 0;

    const checkAndPrint = () => {
      loadedCount++;
      if (loadedCount === images.length && !hasPrinted.current) {
        hasPrinted.current = true;
        setTimeout(() => window.print(), 100); // Give DOM a tick to finalize
      }
    };

    if (images.length === 0) {
      // No images, safe to print immediately
      window.print();
    } else {
      for (let i = 0; i < images.length; i++) {
        if (images[i].complete) {
          checkAndPrint();
        } else {
          images[i].addEventListener("load", checkAndPrint);
          images[i].addEventListener("error", checkAndPrint);
        }
      }
    }

    const handlePrintComplete = () => {
      navigate("/job-manager/repair");
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
      <JobOrderHeader printData={repairData} />
      <VehicleConditionTable printData={repairData} />
      <JobDetailsRightSection printData={repairData} />
      <JobOrderFooter />
    </div>
  );
};

export default PrintRegistration;
