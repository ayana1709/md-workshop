import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import api from "../api";
import { useStores } from "../contexts/storeContext";
import { toast } from "react-toastify";

const Store = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRefs = useRef([]);
  const location = useLocation();

  const [counts, setCounts] = useState({
    "total-items": 0,
    "out-of-store": 0,
    "low-store": 0,
    available: 0,
  });

  const tabs = ["total-items", "available", "out-of-store", "low-store"];

  const fetchCounts = useCallback(async () => {
    try {
      const response = await api.get("/item/stats");
      const data = response.data;

      setCounts({
        "total-items": data.total_items || 0,
        available: data.available || 0,
        "out-of-store": data.out_of_stock || 0,
        "low-store": data.low_stock || 0,
      });
    } catch (error) {
      console.error("Error fetching inventory counts:", error);
      toast.error("Failed to load inventory counts.");
    }
  }, []);

  // Fetch counts on mount AND whenever the location (tab) changes
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, location.pathname]);

  useLayoutEffect(() => {
    const currentTab = location.pathname.split("/")[2];
    const activeTabIndex = tabs.indexOf(currentTab);
    if (tabRefs.current[activeTabIndex]) {
      // Optional: you can add indicator animation here
    }
  }, [location.pathname]);

  return (
    <div className="relative z-[9] w-full flex h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative z-[9] flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative z-[9] phone:w-[98%] tablet:w-[90%] laptop:w-[98%] mx-auto my-6 mt-4 shadow-md rounded-lg overflow-y-auto">
          {/* Tabs */}
          <nav className="flex phone:flex-col tablet:flex-row rounded-t-xl overflow-hidden">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab}
                to={`/inventory/${tab}`}
                ref={(el) => (tabRefs.current[index] = el)}
                className={({ isActive }) =>
                  `relative px-4 py-2 flex items-center phone:justify-left tablet:justify-center transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "bg-green-500 text-white font-bold rounded-t-lg"
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-white"
                  }`
                }
              >
                {tab.replace("-", " ").toUpperCase()}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-black text-lg font-bold dark:bg-gray-700 dark:text-white">
                  {counts[tab]}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Active Content */}
          <div className="relative z-[9] phone:w-full mx-auto transition-all duration-500 phone:px-[4px] tablet:px-4 pb-4 bg-gray-300 dark:bg-gray-700 text-black rounded-b-lg shadow-md">
            <div className="relative z-[9] pt-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
