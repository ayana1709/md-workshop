import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import api from "../api";
import { Navigate, useNavigate } from "react-router-dom";
import ButtonOperation from "./ButtonOperation";
import { FaRegWindowClose } from "react-icons/fa";
import { useStores } from "../contexts/storeContext";
import DropdownButton from "./DropdownButton";
import { RiDeleteBin6Line } from "react-icons/ri";
const WheelAlignemntList = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  console.log(selectedRows);
  const {
    setIsModalOpen,
    setSelectedRepairId,
    setType,
    wheel,
    setWheel,
    dropdownOpen,
    setDropdownOpen,
  } = useStores();

  const headers = [
    "id",
    "customer_name",
    "customer_type",
    "professional",
    "date",
    "checked_date",
    "work_description",
    "result",
    "checked_by",
  ];

  const headerMappings = {
    id: "Job ID",
    customer_name: "Customer Name",
    customer_type: "Customer Type",
    professional: "Professional",
    date: "Date",
    checked_date: "Checked Date",
    work_description: "Work Description",
    result: "Result",
    checked_by: "Checked By",
  };

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.get("/wheel-list");
        setWheel(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching repair registrations:", error);
        setWheel([]);
      }
    };
    fetchRepairs();
  }, [selectedRows]);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleFilter = () => {
    let filteredRepairs = wheel;
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
  const handleNavigation = (option, id) => {
    const routes = {
      View: `/view-wheel/${id}`,
      Edit: `/edit-wheel/${id}`,
      Delete: `/delete/${id}`,
      "Add to Work": `/add-to-work-order-wheel/${id}`,
      "Change Status": `/change-status/${id}`,
      "Print Summary": `/print-summary/${id}`,
      "Work Progress": `/work-progress/${id}`,
      "Request Spare": `/request-spare-wheel/${id}`,
    };

    if (routes[option]) {
      navigate(routes[option]);
    }
  };
  const jobTypes = [{ name: "Repair", route: "/step-1" }];
  const handleDeleteClick = (id, type) => {
    console.log(id);
    setSelectedRepairId(id); // Store the ID of the repair to delete
    setIsModalOpen(true); // Open the delete confirmation modal
    setType(type);
  };

  // Toggle selection of a row
  const toggleRowSelection = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle selection of all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === displayedRepairs.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedRepairs.map((repair) => repair.id));
    }
  };
  const deleteSelectedRows = async () => {
    if (selectedRows.length === 0) return alert("No rows selected");

    try {
      const response = await api.delete("/wheels", {
        data: { repair_ids: selectedRows },
        headers: { "Content-Type": "application/json" },
      });

      console.log(response.data.message); // Log success message
      setSelectedRows([]); // Clear selection
    } catch (error) {
      console.error("Error deleting repairs:", error);

      // Ensure `error.response.data` exists before accessing message
      // alert(error.response?.data?.message || "Failed to delete repairs");
    }
  };
  return (
    <div className="relative z-0 p-6 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
      {selectedRows.length > 0 ? (
        <div className="absolute -top-[20px] py-2">
          <div
            onClick={() => deleteSelectedRows(selectedRows)}
            className="group cursor-pointer hover:bg-gray-500 px-2 py-2 rounded-full inline-block transition-all duration-300"
          >
            <RiDeleteBin6Line
              size={20}
              className="text-gray-200 transition-all duration-500"
            />
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="w-full flex phone:flex-col laptop:flex-row gap-4 justify-start phone:mt-12 desktop:mt-0 mb-4">
        <div className="laptop:w-[30%] desktop:w-[10%] overflow-hidden">
          <select
            className="w-full text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-700 hover:cursor-pointer border-2 border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none px-2 py-2 overflow-hidden border border-blue-500 rounded-md transition-all duration-300"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num} className="text-sm dark:text-white">
                View{num}
              </option>
            ))}
          </select>
        </div>

        <div className="desktop:w-[14%] relative">
          <input
            type="text" // Use text input to prevent default placeholder
            onFocus={(e) => (e.target.type = "date")} // Change to date on focus
            onBlur={(e) => (e.target.type = e.target.value ? "date" : "text")} // Keep text type if empty
            className="dark:bg-gray-800 dark:text-white placeholder:dark:text-white placeholder:text-sm w-full border-2 border-green-500 focus:border-green-600 focus:cursor-pointer ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2 transition-all duration-300"
            placeholder="Select Start Date" // Custom placeholder
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="desktop:w-[14%] relative">
          <input
            type="text"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = e.target.value ? "date" : "text")}
            className="dark:bg-gray-800 dark:text-white placeholder:dark:text-white placeholder:text-sm w-full border-2 border-green-500 focus:border-green-600 focus:cursor-pointer ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2 transition-all duration-300"
            placeholder="Select End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="desktop:w-[10%] px-4 py-2 rounded-lg border-2 border-green-600 bg-green-500 hover:bg-green-600 hover:shadow-md transition-all duration-300">
          <button onClick={handleFilter} className="w-full text-white">
            Filter
          </button>
        </div>
        <div className="desktop:w-[15%] border-2 border-green-500 dark:bg-gray-800 flex items-center px-2 rounded-lg overflow-hidden transition-all">
          <FiSearch className="text-gray-600 dark:text-white" />
          <input
            type="text"
            className="w-full dark:bg-transparent placeholder:dark:text-white border-none focus:ring-0 focus:outline-none ml-2 rounded-md"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="absolute mx-auto phone:top-2 phone:right-6 tablet:top-6 desktop:right-2">
          <ButtonOperation
            tableData={wheel}
            headers={headers}
            filename="wheel Alignement Report"
            headerMappings={headerMappings}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-fixed min-w-full table-auto w-full border-collapse border border-table-border overflow-x-auto">
          <thead className="bg-table-head text-white text-left text-sm">
            <tr>
              <th className="border border-table-border p-2 w-[40px] overflow-hidden">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedRows.length === displayedRepairs.length}
                  className="focus:dark:bg-gray-600 ring-0 outline-none focus:ring-0 focus:border-none focus:outline-none dark:bg-gray-800 dark:text-gray-200 placeholder:dark:text-gray-200 dark:border-gray-400"
                />
              </th>
              <th className="border border-table-border p-2 w-[60px]">
                Job ID
              </th>
              <th className="border border-table-border p-2 w-[140px]">
                Customer Name
              </th>
              <th className="border border-table-border p-2 w-[150px]">
                Customer Type
              </th>
              <th className="border border-table-border p-2 w-[150px]">
                Plate Number
              </th>
              <th className="border border-table-border p-2 w-[150px]">
                Recieved Date
              </th>
              <th className="border border-table-border p-2 w-[120px]">
                Checked Date
              </th>
              <th className="border border-table-border p-2 w-[140px]">
                Work Description
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Result
              </th>
              <th className="border border-table-border p-2 w-[110px]">
                Checked By
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedRepairs.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              displayedRepairs.map((repair) => (
                <tr
                  key={repair.id}
                  className="relative text-sm border border-table-border hover:shadow-sm hover:shadow-gray-300 hover:bg-gray-100 hover:dark:bg-gray-600 hover:cursor-pointer transition-all"
                >
                  <td className="border border-table-border px-2 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(repair.id)}
                      onChange={() => toggleRowSelection(repair.id)}
                      className="focus:dark:bg-gray-600 ring-0 outline-none focus:ring-0 focus:border-none focus:outline-none dark:bg-gray-800 dark:text-gray-200 placeholder:dark:text-gray-200 dark:border-gray-400"
                    />
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.job_id.toString().padStart(4, "0")}
                  </td>
                  <td className="border border-table-border px-4 py-3 font-medium">
                    {repair.customer_name}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.customer_type}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.professional}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.date}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.checked_date}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.work_description}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.result}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.checked_by}
                  </td>

                  <td className="px-[4px] py-3">
                    <button
                      onClick={() => toggleDropdown(repair.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      Action <FiChevronDown className="ml-2" />
                    </button>
                    {dropdownOpen === repair.id && (
                      <div className="absolute pt-10 z-1 right-2 top-[55%] -translate-y-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md z-10">
                        <div
                          onClick={() => toggleDropdown(repair.id)}
                          className="cursor-pointer  relative z-100"
                        >
                          <FaRegWindowClose
                            color="#ef4444"
                            className="absolute right-4 -top-2"
                            size={20}
                          />
                        </div>

                        {[
                          "View",
                          "Edit",
                          "Delete",
                          "Add to Work",
                          "Request Spare",
                        ].map((option, index, arr) => (
                          <button
                            key={index}
                            className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200
                                                 ${
                                                   index !== arr.length - 1
                                                     ? "border-b border-gray-200"
                                                     : "border-t border-gray-200"
                                                 }
                                               `}
                            onClick={() => {
                              if (option === "Delete") {
                                handleDeleteClick(repair.id, "wheel");
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Previous
        </button>
        <span className="phone:text-sm tablet:text-lg text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WheelAlignemntList;
