import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { MdCarRepair } from "react-icons/md";
import { FaCarCrash } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";
import { FaCarOn } from "react-icons/fa6";

const TypesOfJobs = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Job types and their respective routes
  const jobTypes = [
    {
      name: "Repair",
      route: "/step-1",
      color: "bg-amber-600",
      shadow: "shadow-amber-700",
      icon: <MdCarRepair size={35} color="#7c2d12" />,
      iconBg: "bg-amber-500",
    },
    {
      name: "Bolo",
      route: "/bolo",
      color: "bg-cyan-600",
      shadow: "shadow-cyan-700",
      icon: <FaCarCrash size={35} color="#155e75" />,
      iconBg: "bg-cyan-500",
    },
    {
      name: "Inspection",
      route: "/inspection",
      color: "bg-emerald-600",
      shadow: "shadow-emerald-700",
      icon: <FaCarOn size={35} color="#065f46" />,
      iconBg: "bg-emerald-500",
    },
    {
      name: "Wheel Alignment",
      route: "/wheel-alignment",
      color: "bg-slate-600",
      shadow: "shadow-slate-700",
      icon: <GiCarWheel size={35} color="#1e293b" />,
      iconBg: "bg-slate-500",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-hidden overflow-x-hidden">
        {/* Site Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="h-screen h-[90%] overflow-y-auto">
          <div className="phone:w-full relative h-full flex justify-center items-center bg-gray-100 dark:bg-gray-900">
            <div className="w-[90%] m-auto absolute h-[95%] mtab:w-[70%] laptop:w-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="uppercase tracking-wider text-2xl font-bold text-center text-gray-700 mb-6 dark:text-gray-200">
                Select Job Type
              </h2>
              <ul className="flex flex-col phone:gap-4 laptop:gap-8">
                {jobTypes.map((job) => (
                  <li
                    key={job.name}
                    onClick={() => navigate(job.route)}
                    className={`cursor-pointer flex items-center gap-4 w-full px-4 phone:py-1 laptop:py-2 phone:pl-2 mtab:pl-6 ${job.color} hover:shadow-xl hover:transform hover:scale-105 focus:scale-100 focus:shadow-none hover:-translate-y-[9%] text-left text-white rounded-md transition-all duration-300 will-change-transform`}
                  >
                    <div className={`p-3 rounded-full ${job.iconBg}`}>
                      {job.icon}
                    </div>
                    <span className="phone:text-md mtab:text-2xl">
                      {job.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TypesOfJobs;
