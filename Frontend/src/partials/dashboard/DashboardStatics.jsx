import { GiMoneyStack } from "react-icons/gi";
import { FaCarAlt } from "react-icons/fa";
import { GiMechanicGarage } from "react-icons/gi";
import { FaClock } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";

import { IoArrowUpCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import { useStores } from "../../contexts/storeContext";

function DashboardStatics() {
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRepairs, setTotalRepairs] = useState(0);
  const [repairLoading, setRepairLoading] = useState(true);
  const [repairError, setRepairError] = useState(null);
  const { lowStock } = useStores();
  const [totalItemsOut, setTotalItemsOut] = useState(0);

  console.log(totalRepairs);

  useEffect(() => {
    const fetchTotalItems = async () => {
      try {
        const response = await api.get("/store-items/total");
        setTotalItems(response.data.total_items);
      } catch (err) {
        setError("Failed to fetch total items");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalItems();
  }, []);

  useEffect(() => {
    const fetchTotalRepairs = async () => {
      try {
        const response = await api.get("/total-repairs");
        setTotalRepairs(response.data.total_repairs);
      } catch (err) {
        setRepairError("Failed to fetch total repairs");
      } finally {
        setRepairLoading(false);
      }
    };

    fetchTotalRepairs();
  }, []);

  useEffect(() => {
    const fetchTotalItemsOut = async () => {
      try {
        const response = await api.get("/total-items-out");
        setTotalItemsOut(response.data.total_items_out);
      } catch (error) {
        console.error("Error fetching total items out:", error);
      }
    };

    fetchTotalItemsOut();
  }, []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6">
      {/* Done Vehicle */}
      <div
        onClick={() => navigate("/job-manager/repair")}
        className="cursor-pointer flex justify-between items-center gap-2 px-6 py-4 bg-[#d3e4e0] dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="relative w-[70px] h-[70px] rounded-full bg-[#00B074] bg-opacity-[0.15]">
          <FaCarAlt
            size={40}
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-[#00A389]"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="text-gray-700 text-lg font-bold dark:text-gray-200">
            {totalRepairs}
          </p>
          <p className="text-sm text-gray-900 font-semibold dark:text-gray-200">
            Repairs
          </p>
        </div>
      </div>

      {/* Material */}
      <div
        onClick={() => navigate("/inventory/total-items")}
        className="cursor-pointer flex justify-between items-center gap-2 px-6 py-4 bg-[#d7f23a] dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="relative w-[70px] h-[70px] rounded-full bg-[#00B074] bg-opacity-[0.15]">
          <GiMechanicGarage
            size={40}
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-[#00A389]"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="text-gray-600 text-lg font-bold dark:text-gray-200">
            {totalItems}
          </p>
          <p className="text-sm text-gray-900 font-semibold dark:text-gray-200">
            Store Items
          </p>
        </div>
      </div>

      {/* Appointment */}
      <div
        onClick={() => navigate("/inventory/out-of-store")}
        className="cursor-pointer flex justify-between items-center gap-4 px-6 py-4 bg-cyan-100 dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="relative w-[70px] h-[70px] rounded-full bg-[#00B074] bg-opacity-[0.15]">
          <FaClock
            size={40}
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-[#00A389]"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="text-[#464255] text-lg font-bold dark:text-gray-200">
            {lowStock}
          </p>
          <p className="text-sm text-gray-900 font-semibold dark:text-gray-200">
            Low Store
          </p>
        </div>
      </div>

      {/* Customer */}
      <div
        onClick={() => navigate("/inventory/low-store")}
        className="cursor-pointer flex justify-between items-center gap-4 px-6 py-4 bg-[#bab0ef] dark:bg-gray-800 rounded-lg shadow-md"
      >
        <div className="relative w-[70px] h-[70px] rounded-full bg-[#00B074] bg-opacity-[0.15]">
          <FaPeopleGroup
            size={40}
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-[#00A389]"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="text-gray-600 text-lg font-bold dark:text-gray-200">
            {totalItemsOut}
          </p>
          <p className="text-sm text-gray-900 font-semibold dark:text-gray-200">
            Out Of Store
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardStatics;
