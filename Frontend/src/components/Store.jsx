import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import api from "../api";
import AddStore from "./AddStore";
import { useStores } from "../contexts/storeContext";
import EditItem from "./EditItem";
import EditFieldModal from "./EditFieldModal";
import ItemDetail from "./ItemDetail";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ItemOutModal from "./ItemOutModal";
import { toast } from "react-toastify"; // Import toast for error handling

const Store = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRefs = useRef([]);
  const location = useLocation();

  // State to hold the counts for all tabs
  const [counts, setCounts] = useState({
    "total-items": 0,
    "out-of-store": 0,
    "low-store": 0,
  });

  const {
    showModal,
    showEditModal,
    setShowEditModal,
    selectedField,
    selectedItem,
    setSelectedField,
    setItems,
    showDetailModal,
    setShowDetailModal,
    isItemModalOpen,
    itemOutData,
  } = useStores();

  const tabs = ["total-items", "out-of-store", "low-store"];

  // 1. Fetch ALL counts when the component mounts
const fetchAllCounts = async () => {
    try {
      const response = await api.get("/item/stats"); 
      const data = response.data;
      setCounts({
        "total-items": data.total_items || 0,
        "out-of-store": data.out_of_stock || 0,
        "low-store": data.low_stock || 0,
      });
    } catch (error) {
      console.error("Error fetching inventory counts:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllCounts();
  }, []);

  // Pro Tip: Listen for a custom event to refresh stats without complex prop drilling
  useEffect(() => {
    window.addEventListener("refreshInventoryStats", fetchAllCounts);
    return () => window.removeEventListener("refreshInventoryStats", fetchAllCounts);
  }, []);


  useLayoutEffect(() => {
    const currentPath = location.pathname.split("/")[2];
    const activeTabIndex = tabs.indexOf(currentPath);
    if (tabRefs.current[activeTabIndex]) {
      // The logic for setting indicatorStyle goes here if you re-implement it.
    }
  }, [location]);

  return (
    <div className="relative z-[9] w-full flex h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900">
      {/* Modal Overlays (Kept as is) */}
      <div className="">{showModal ? <AddStore /> : ""}</div>
      <div className="">{showEditModal ? <EditItem /> : ""}</div>
      <div className="">{showDetailModal ? <ItemDetail /> : ""}</div>
      {selectedField && selectedItem && (
        <div className="absolute top-0 z-[99]">
          <EditFieldModal
            item={selectedItem}
            field={selectedField}
            onClose={() => setSelectedField("")}
            setItems={setItems}
          />
        </div>
      )}
      {isItemModalOpen ? (
        <div className="absolute w-full h-full z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
          <ConfirmDeleteModal />
        </div>
      ) : (
        ""
      )}
      {itemOutData ? (
        <div className="absolute w-full h-full z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
          <ItemOutModal />
        </div>
      ) : (
        ""
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="relative z-[9] flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative z-[9] phone:w-[98%] tablet:w-[90%] laptop:w-[98%] mx-auto my-6 mt-4 shadow-md rounded-lg overflow-y-auto">
          {/* Tab Navigation (UPDATED HERE) */}
          <nav className="flex phone:flex-col tablet:flex-row rounded-t-xl overflow-hidden">
            {tabs.map((tab, index) => (
              <NavLink
                key={tab}
                to={`/inventory/${tab}`}
                ref={(el) => (tabRefs.current[index] = el)}
                className={({ isActive }) =>
                  `relative px-4 py-2 flex items-center phone:justify-left tablet:justify-center transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "bg-green-500 text-white text-black font-bold rounded-t-lg"
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-white"
                  }`
                }
              >
                {/* 2. Display Label and Count */}
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