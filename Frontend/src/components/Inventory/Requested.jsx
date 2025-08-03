import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Header from "../../partials/Header";
import api from "../../api";
import Sidebar from "../../partials/Sidebar";

const Requested = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const location = useLocation();

  const tabs = ["total-request-item-out", "pending-item-out", "canceled"];

  useLayoutEffect(() => {
    const currentPath = location.pathname.split("/")[2];
    const activeTabIndex = tabs.indexOf(currentPath);
    if (tabRefs.current[activeTabIndex]) {
      const activeTab = tabRefs.current[activeTabIndex];
      setIndicatorStyle({
        transform: `translateX(${activeTab.offsetLeft}px)`,
        width: `${activeTab.offsetWidth}px`,
      });
    }
  }, [location]);
  useEffect(() => {
    const fetchItemCount = async () => {
      try {
        const response = await api.get("/store-items/count");
        console.log(response);
        setTotalItems(response.data.totalItems); // Update the state with the total count
      } catch (error) {
        console.error("Error fetching item count:", error);
      }
    };

    fetchItemCount();
  }, []); // Empty dependency array ensures the request runs once on mount

  return (
    <div className="w-full flex h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative phone:w-[98%] tablet:w-[90%] laptop:w-[98%] mx-auto my-6 mt-4 shadow-md rounded-lg overflow-y-auto">
          {/* Tab Navigation */}
          <nav className="flex phone:flex-col tablet:flex-row rounded-t-xl overflow-hidden">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab}
                to={`/requested/${tab}`}
                ref={(el) => (tabRefs.current[index] = el)}
                className={({ isActive }) =>
                  `relative px-4 py-2 flex items-center phone:justify-left tablet:justify-center transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "bg-green-500 text-white text-black font-bold rounded-t-lg"
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-white"
                  }`
                }
              >
                {tab.replace("-", " ").toUpperCase()}({totalItems})
              </NavLink>
            ))}
          </nav>

          {/* Active Content */}
          <div className="phone:w-full mx-auto transition-all duration-500 phone:px-[4px] tablet:px-4 pb-4 bg-gray-300 dark:bg-gray-700 text-black rounded-b-lg shadow-md">
            <div className="pt-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requested;
