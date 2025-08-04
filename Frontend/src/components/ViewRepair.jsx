import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";
import logo from "./../images/aa.png";
import toyota from "./../images/toyota.png";
import car from "./../images/car.png";
import meter from "./../images/meter.png";
import { IoMdArrowDropright } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa"; // Import check icon
import { useLocation, useNavigate } from "react-router-dom";

import React, { useRef } from "react";

import JobOrderHeader from "./printjoborder/JobOrderHeader";
import VehicleConditionTable from "./printjoborder/VehicleConditionTable";
import JobDetailsRightSection from "./printjoborder/JobDetailsRightSection";
import JobOrderFooter from "./printjoborder/JobOrderFooter";

export default function ViewRepair() {
  const { id } = useParams();
  const [printData, setprintData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(printData);

  useEffect(() => {
    const fetchRepairDetails = async () => {
      try {
        const response = await api.get(`/repairs/${id}`);
        if (response.data) {
          setprintData(response.data);
        } else {
          throw new Error("Invalid data received");
        }
      } catch (error) {
        console.error("Error fetching repair details", error);
        setError("Failed to fetch repair details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairDetails();
  }, [id]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-lg font-semibold">Loading...</p>
    );
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600 text-lg">{error}</p>;
  }

  if (!printData) {
    return (
      <p className="text-center mt-10 text-lg">No repair data available.</p>
    );
  }

  return (
    <div className="relative p-[2px] px-2 pl-6 border border-black w-[1000px] mx-auto text-sm">
      <JobOrderHeader printData={printData} />
      {/* <VehicleConditionTable printData={printData} /> */}
      <JobDetailsRightSection printData={printData} />
      <JobOrderFooter />
    </div>
  );
}
