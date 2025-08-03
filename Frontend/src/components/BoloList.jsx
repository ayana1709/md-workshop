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
const BoloList = () => {
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
    bolos,
    setBolos,
    dropdownOpen,
    setDropdownOpen,
    handleDelete,
  } = useStores();
  console.log(bolos);
  const headers = [
    "id",
    "customer_name",
    "plate_number",
    "condition",
    "vehicle_type",
    "issue_date",
    "expiry_date",
    "professional",
    "payment_total",
  ];

  const headerMappings = {
    id: "Job ID",
    customer_name: "Customer Name",
    plate_number: "Plate Number",
    condition: "condition",
    vehicle_type: "Vehicle Type",
    issue_date: "Issue Date",
    expiry_date: "Expiry Date",
    professional: "Professional",
    payment_total: "Payment Total",
  };

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.get("/bolo-list");
        setBolos(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching repair registrations:", error);
        setBolos([]);
      }
    };
    fetchRepairs();
  }, [selectedRows]);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleFilter = () => {
    let filteredRepairs = bolos;
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
      View: `/view-bolo/${id}`,
      Edit: `/edit-bolo/${id}`,
      Delete: `/delete/${id}`,
      "Add to Work": `/add-to-work-order-bolo/${id}`,
      "Request Spare": `/request-spare-bolo/${id}`,
    };

    if (routes[option]) {
      navigate(routes[option]);
    }
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
      const response = await api.delete("/bolos", {
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
            className="w-full text-sm bg-white text-gray-700 dark:bg-gray-800 dark:text-white hover:cursor-pointer px-2 py-2 overflow-hidden border-2 border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-md transition-all duration-300"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num} className="text-sm">
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
            className="placeholder:dark:text-white dark:bg-gray-800 placeholder:text-sm w-full border-2 border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2"
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
            className="placeholder:dark:text-white dark:bg-gray-800 placeholder:text-sm w-full border-2 border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2"
            placeholder="Select End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="desktop:w-[10%] px-4 py-2 rounded-lg border-2 border-green-700 hover:shadow-md bg-green-500 hover:bg-green-600 dark:bg-green-700 hover:cursor-pointer transition-all duration-300">
          <button onClick={handleFilter} className="w-full text-white">
            Filter
          </button>
        </div>
        <div className="desktop:w-[15%] border-2 border-green-500 focus:border-green-600 flex items-center px-2 rounded-lg shadow-md overflow-hidden">
          <FiSearch className="text-gray-600" />
          <input
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none ml-2 rounded-md"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="absolute mx-auto phone:top-2 phone:right-6 tablet:top-6 desktop:right-2">
          <ButtonOperation
            tableData={bolos}
            headers={headers}
            filename="Bollo Report"
            headerMappings={headerMappings}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-fixed min-w-full table-auto w-full border-collapse border border-table-border overflow-x-auto">
          <thead className="bg-table-head text-white text-left text-sm">
            <tr className="border-table-border">
              <th className="border border-table-border p-2 w-[50px] overflow-hidden">
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
                Plate Number
              </th>
              <th className="border border-table-border p-2 w-[150px]">
                Vehile Type
              </th>
              <th className="border border-table-border p-2 w-[150px]">
                Issue Date
              </th>
              <th className="border border-table-border p-2 w-[150px]">
                Expiry Date
              </th>
              <th className="border border-table-border p-2 w-[130px]">
                Professional
              </th>
              <th className="border border-table-border p-2 w-[120px]">
                Payment Total
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
                  className="relative border border-table-border hover:shadow-sm hover:shadow-gray-300 hover:bg-gray-100 hover:dark:bg-gray-600 hover:cursor-pointer transition-all"
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
                    {repair.plate_number}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.vehicle_type}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.issue_date}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.expiry_date}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.professional}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.payment_total}
                  </td>

                  <td className="px-[2px] py-3">
                    <button
                      onClick={() => toggleDropdown(repair.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      Action <FiChevronDown className="ml-2" />
                    </button>
                    {dropdownOpen === repair.id && (
                      <DropdownButton
                        repair={repair}
                        id={repair.id}
                        type="bolo"
                        // handlePrint={handlePrint}
                        handleDelete={handleDelete}
                        // handlePrintsummary={() =>
                        //   handlePrintsummary(repair.vehicles[0]?.plate_no)
                        // }
                      />
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
          className={`px-4 py-2 bg-gray-300 dark:bg-green-500 dark:text-white text-gray-700 rounded ${
            currentPage === 1
              ? "opacity-50 dark:opacity-100 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Previous
        </button>
        <span className="phone:text-sm tablet:text-lg dark:text-gray-200 text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-4 py-2 bg-gray-300 dark:bg-green-500 dark:text-white text-gray-700 rounded ${
            currentPage === totalPages
              ? "opacity-50 dark:opacity-100 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BoloList;
