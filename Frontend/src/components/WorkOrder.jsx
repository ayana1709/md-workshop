import { useState, useRef, useLayoutEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import TabNav from "./TabNav";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useStores } from "../contexts/storeContext";
import BackButton from "./BackButton";

const WorkOrder = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const location = useLocation();
  const { isModalOpen, setIsModalOpen, handleDelete, type } = useStores();
  const tabs = ["work-order-list", "Test_drive", "out-source"];
  return (
    <div
      className={`relative z-0 w-full flex h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900`}
    >
      {isModalOpen ? (
        <div className="absolute w-full h-full z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ">
          <ConfirmDeleteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => handleDelete(selectedId, type)}
          />
        </div>
      ) : (
        ""
      )}
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="relative z-0 flex flex-col flex-1 overflow-hidden">
        {/* <div className="absolute top-2 z-[999]">
          <BackButton />
        </div> */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative z-0 phone:w-[98%] tablet:w-[90%] laptop:w-[98%] mx-auto my-6 mt-4 shadow-md rounded-lg overflow-y-auto">
          {/* Tab Navigation */}
          <nav className="flex phone:flex-col tablet:flex-row rounded-t-xl overflow-hidden">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab}
                to={`/work/${tab}`}
                ref={(el) => (tabRefs.current[index] = el)}
                className={({ isActive }) =>
                  `relative px-4 py-2 flex items-center phone:justify-left tablet:justify-center transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "bg-green-500 text-white text-black font-bold rounded-t-lg"
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-white "
                  }`
                }
              >
                {tab.replace("-", " ").toUpperCase()}
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

export default WorkOrder;
