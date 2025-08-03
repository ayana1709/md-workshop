import React, { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

import { FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import ButtonOperation from "./ButtonOperation";
import { FaRegWindowClose } from "react-icons/fa";
import { useStores } from "../contexts/storeContext";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
const PendingWork = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    setIsModalOpen,
    setSelectedRepairId,
    setType,
    work,
    setWork,
    isModalOpen,

    handleDelete,
    type,
  } = useStores();

  const headers = [
    "id",
    "customer_name",
    "plate_number",
    "repair_category",
    "work_details",
  ];

  const headerMappings = {
    id: "Job ID",
    customer_name: "Customer Name",
    plate_number: "Plate Number",
    repair_category: "Repair Category",
    work_details: "Work Details",
  };

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.get("/post-drive-tests");
        setWork(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching post-drive tests:", error);
        setWork([]);
      }
    };
    fetchRepairs();
  }, []);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleFilter = () => {
    let filteredRepairs = work;
    if (startDate && endDate) {
      filteredRepairs = filteredRepairs.filter((repair) => {
        const repairDate = new Date(repair.received_date);
        return (
          repairDate >= new Date(startDate) && repairDate <= new Date(endDate)
        );
      });
    }
    if (searchTerm) {
      filteredRepairs = filteredRepairs.filter((repair) =>
        repair.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredRepairs;
  };

  const filteredRepairs = handleFilter();
  const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedRepairs = filteredRepairs.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const navigate = useNavigate();
  const handleNavigation = (option, repairId) => {
    const routes = {
      "View test Drive": `/view-test-drive/${repairId}`,
      Delete: `/delete/${repairId}`,
      "Print test Drive": `/print-test-drive/${repairId}`,
    };

    if (routes[option]) {
      navigate(routes[option]);
    }
  };
  const handleDeleteClick = (id, type) => {
    console.log(id);
    setSelectedRepairId(id); // Store the ID of the repair to delete
    setIsModalOpen(true); // Open the delete confirmation modal
    setType(type);
  };
  return (
    <>
      <div></div>
      <div className="relative z-0 flex h-screen overflow-hidden mr-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {/* Sidebar */}

        {/* Content Area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Site Header */}

          <main className="mt-6 grow">
            <div className="relative w-[98%] m-auto p-6 bg-white dark:bg-gray-700 dark:text-white shadow-lg rounded-lg">
              <div className="w-full flex phone:flex-col laptop:flex-row gap-4 justify-start phone:mt-12 desktop:mt-0 mb-4">
                <div className="laptop:w-[30%] desktop:w-[10%] overflow-hidden">
                  <select
                    className="w-full text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-700 hover:cursor-pointer px-2 py-2 overflow-hidden border-2 border-green-500 focus:border-green-600 focus:ring-0 focus:outline-none ring-0 outline-none rounded-md transition-all duration-300"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  >
                    {[5, 10, 20, 50].map((num) => (
                      <option
                        key={num}
                        value={num}
                        className="text-sm dark:text-white"
                      >
                        View{num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="desktop:w-[14%] relative">
                  <input
                    type="text" // Use text input to prevent default placeholder
                    onFocus={(e) => (e.target.type = "date")} // Change to date on focus
                    onBlur={(e) =>
                      (e.target.type = e.target.value ? "date" : "text")
                    } // Keep text type if empty
                    className="placeholder:text-sm w-full border-2 placeholder:dark:text-white dark:bg-gray-800 border-green-500 focus:border-green-600 focus:cursor-pointer ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2 transition-all duration-300"
                    placeholder="Select Start Date" // Custom placeholder
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="desktop:w-[14%] relative">
                  <input
                    type="text"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) =>
                      (e.target.type = e.target.value ? "date" : "text")
                    }
                    className="placeholder:text-sm w-full border-2 placeholder:dark:text-white dark:bg-gray-800 border-green-500 focus:border-green-600 focus:cursor-pointer ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2 transition-all duration-300"
                    placeholder="Select End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="desktop:w-[10%] px-4 py-2 rounded-lg border-2 border-green-500 bg-green-500 dark:bg-green-600 hover:bg-green-600 hover:cursor-pointer hover:shadow-md transition-all duration-300">
                  <button onClick={handleFilter} className="w-full text-white">
                    Filter
                  </button>
                </div>
                <div className="desktop:w-[15%] border-2 border-green-500 dark:bg-gray-800 flex items-center px-2 rounded-lg overflow-hidden">
                  <FiSearch className="text-gray-600 dark:text-white" />
                  <input
                    type="text"
                    className="placeholder:dark:text-white w-full bg-transparent border-none focus:ring-0 focus:outline-none ml-2 rounded-md"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="absolute z-[9999999] mx-auto phone:top-2 phone:right-6 tablet:top-6 desktop:right-6">
                  <ButtonOperation
                    tableData={work}
                    headers={headers}
                    filename="Repairs Report"
                    headerMappings={headerMappings}
                  />
                </div>
              </div>

              <div className="overflow-x-auto phone:mt-20 tablet:mt-0">
                <table className="table-fixed min-w-full table-auto w-full border-collapse border border-table-border overflow-x-auto">
                  <thead className="bg-table-head text-white text-left text-sm">
                    <tr>
                      <th className="border border-table-border p-2 w-[120px]">
                        Job Card No
                      </th>
                      <th className="border border-table-border p-2 w-[140px]">
                        Customer Name
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Plate Number
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Checked By
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Checked Date
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Post-test Observation
                      </th>
                      <th className="border border-table-border p-2 w-[130px]">
                        Recommendation
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Final Approval
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRepairs.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center p-4">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      displayedRepairs.map((repair) => (
                        <tr
                          key={repair.id}
                          className="border-b border-b-table-border"
                        >
                          <td className="border border-table-border p-2">
                            {repair.job_card_no}
                          </td>
                          <td className="border border-table-border p-2">
                            {repair.customer_name}
                          </td>
                          <td className="border border-table-border p-2">
                            {repair.plate_number}
                          </td>
                          <td className="border border-table-border p-2">
                            {repair.checked_by}
                          </td>
                          <td className="border border-table-border p-2">
                            {repair.checked_date}
                          </td>
                          <td className="border border-table-border p-2">
                            {repair.post_test_observation}
                          </td>
                          <td className="border p-2">
                            {repair.recommendation}
                          </td>
                          <td className="border p-2">
                            {repair.technician_final_approval}
                          </td>
                          <td className="px-[2px] py-3">
                            <button
                              onClick={() => toggleDropdown(repair.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                            >
                              Action <FiChevronDown className="ml-2" />
                            </button>
                            {dropdownOpen === repair.id && (
                              <div className="absolute pt-8 z-1 right-2 top-[55%] -translate-y-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md z-10">
                                <div
                                  onClick={() => toggleDropdown(repair.id)}
                                  className="cursor-pointer relative z-100"
                                >
                                  <FaRegWindowClose
                                    color="#ef4444"
                                    className="absolute right-4 -top-0"
                                    size={20}
                                  />
                                </div>

                                {[
                                  "View test Drive",
                                  "Print test Drive",
                                  "Delete",
                                ].map((option, index, arr) => (
                                  <button
                                    key={index}
                                    className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200
                                                                          ${
                                                                            index !==
                                                                            arr.length -
                                                                              1
                                                                              ? "border-b border-gray-200"
                                                                              : "border-t border-gray-200"
                                                                          }
                                                                        `}
                                    onClick={() => {
                                      if (option === "Delete") {
                                        handleDeleteClick(repair.id, "bolo");
                                      } else {
                                        handleNavigation(option, repair.id);
                                      }
                                    }}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={`px-4 py-2 bg-gray-300 dark:bg-green-500 dark:text-white text-gray-700 rounded ${
                    currentPage === 1
                      ? "opacity-50 dark:opacity-100 cursor-not-allowed"
                      : "hover:bg-gray-400"
                  }`}
                >
                  Previous
                </button>
                <span className="phone:text-xs tablet:text-md text-gray-700 dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={`px-4 py-2 bg-gray-300 text-gray-700 dark:bg-green-500 dark:text-white rounded ${
                    currentPage === totalPages
                      ? "opacity-50 dark:opacity-100 cursor-not-allowed"
                      : "hover:bg-gray-400"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PendingWork;
