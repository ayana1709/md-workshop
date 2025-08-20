import { GiMoneyStack, GiMechanicGarage } from "react-icons/gi";
import { FaCarAlt, FaClock } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";
import { useStores } from "../../contexts/storeContext";

function DashboardStatics() {
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(0);
  const [repairStatusCounts, setRepairStatusCounts] = useState({});
  const { lowStock } = useStores();
  const [totalItemsOut, setTotalItemsOut] = useState(0);

  useEffect(() => {
    api
      .get("/store-items/total")
      .then((res) => setTotalItems(res.data.total_items));
    api
      .get("/total-repairs")
      .then((res) => setRepairStatusCounts(res.data.data || {}));
    api
      .get("/total-items-out")
      .then((res) => setTotalItemsOut(res.data.total_items_out));
  }, []);

  const totalRepairsCount = Object.values(repairStatusCounts).reduce(
    (acc, val) => acc + val,
    0
  );

  const cardData = [
    {
      label: "Repairs",
      value: repairStatusCounts,
      icon: <FaCarAlt size={40} className="text-green-600" />,
      bg: "from-green-100 to-green-200",
      click: () => navigate("/job-manager/repair"),
      isStatusCard: true,
    },
    {
      label: "Store Items",
      value: totalItems,
      icon: <GiMechanicGarage size={40} className="text-blue-600" />,
      bg: "from-blue-100 to-blue-200",
      click: () => navigate("/inventory/total-items"),
    },
    {
      label: "Low Store",
      value: lowStock,
      icon: <FaClock size={40} className="text-yellow-600" />,
      bg: "from-yellow-100 to-yellow-200",
      click: () => navigate("/inventory/out-of-store"),
    },
    {
      label: "Out Of Store",
      value: totalItemsOut,
      icon: <FaPeopleGroup size={40} className="text-purple-600" />,
      bg: "from-purple-100 to-purple-200",
      click: () => navigate("/inventory/low-store"),
    },
  ];

  const statusColors = {
    "not started": "bg-red-500",
    "in progress": "bg-yellow-500",
    completed: "bg-green-500",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6">
      {cardData.map((card, idx) => (
        <div
          key={idx}
          onClick={card.click}
          className={`cursor-pointer flex flex-col justify-between p-5 rounded-xl bg-gradient-to-br ${card.bg} dark:from-gray-800 dark:to-gray-700 shadow-md transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-gray-400/30`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="relative w-[70px] h-[70px] rounded-full flex items-center justify-center bg-white/60 dark:bg-gray-900/40 shadow-inner">
              {card.icon}
            </div>

            {/* Card title with total count */}
            <div className="flex flex-col items-end">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {card.isStatusCard ? totalRepairsCount : card.value}
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.label}
              </p>
            </div>
          </div>

          {/* Status badges for Repairs */}
          {/* {card.isStatusCard && (
            <div className="flex space-x-2 mt-1 justify-end flex-wrap">
              {Object.entries(card.value).map(([status, count], idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                    statusColors[status] || "bg-gray-400"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                </div>
              ))}
            </div>
          )} */}
        </div>
      ))}
    </div>
  );
}

export default DashboardStatics;
