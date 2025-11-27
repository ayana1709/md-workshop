import { GiMechanicGarage } from "react-icons/gi";
import { FaCarAlt, FaClock } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdInventory2 } from "react-icons/md"; // New icon for total quantity
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";

function DashboardStatics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_items: 0,
    total_quantity: 0,
    low_stock: 0,
    out_of_stock: 0,
    totalRepairs: 0,
  });

  useEffect(() => {
    // Fetch your backend dashboard stats
    api.get("/items/stats").then((res) => {
      setStats((prev) => ({
        ...prev,
        total_items: res.data.total_items,
        total_quantity: res.data.total_quantity,
        low_stock: res.data.low_stock,
        out_of_stock: res.data.out_of_stock,
      }));
    });

    // Fetch total repairs separately
    api.get("/total-repairs").then((res) => {
      setStats((prev) => ({ ...prev, totalRepairs: res.data || 0 }));
    });
  }, []);

  const cardData = [
    {
      label: "Repairs",
      value: stats.totalRepairs,
      icon: <FaCarAlt size={40} className="text-green-600" />,
      bg: "from-green-100 to-green-200",
      click: () => navigate("/job-manager/repair"),
    },
    {
      label: "Store Items",
      value: stats.total_items,
      icon: <GiMechanicGarage size={40} className="text-blue-600" />,
      bg: "from-blue-100 to-blue-200",
      click: () => navigate("/inventory/total-items"),
    },
    {
      label: "Total Quantity",
      value: stats.total_quantity,
      icon: <MdInventory2 size={40} className="text-teal-600" />,
      bg: "from-teal-100 to-teal-200",
      click: () => navigate("/inventory/total-items"),
    },
    {
      label: "Low Stock",
      value: stats.low_stock,
      icon: <FaClock size={40} className="text-yellow-600" />,
      bg: "from-yellow-100 to-yellow-200",
      click: () => navigate("/inventory/low-store"),
    },
    {
      label: "Out Of Stock",
      value: stats.out_of_stock,
      icon: <FaPeopleGroup size={40} className="text-purple-600" />,
      bg: "from-purple-100 to-purple-200",
      click: () => navigate("/inventory/out-of-store"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-6">
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
            <div className="flex flex-col items-end">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {card.value}
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardStatics;
