import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import api from "../api";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ButtonOperation from "./ButtonOperation";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { MdTableView } from "react-icons/md";
import { useStores } from "../contexts/storeContext";
import { MdOutlineDateRange } from "react-icons/md";
import PrintJobOrder from "./PrintJobOrder";
import DropdownButton from "./DropdownButton";
import ButtonRepairOperation from "./ButtonRepairOperation";
import { RiDeleteBin6Line } from "react-icons/ri";
const JobOrderList = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [imageModal, setImageModal] = useState({ open: false, src: null });

  console.log(selectedRows);

  const {
    setIsModalOpen,
    setSelectedRepairId,
    setType,
    repairs,
    setRepairs,
    printData,
    setPrintData,
    dropdownOpen,
    setDropdownOpen,
    handleDelete,
    isStatusModalOpen,
    setIsStatusModalOpen,
  } = useStores();
  console.log(dropdownOpen);

  const [showPrintModal, setShowPrintModal] = useState(false);

  const headers = [
    "job_id",
    "customer_name",
    "mobile",
    "types_of_jobs",
    "product_name",
    "serial_code",
    "estimated_date",
    "received_date",
    "promise_date",
    "status",
  ];

  const headerMappings = {
    job_id: "Job ID",
    customer_name: "Customer Name",
    mobile: "Mobile",
    types_of_jobs: "Type of Job",
    product_name: "Product Name",
    serial_code: "Serial Code",
    estimated_date: "Est. Duration",
    received_date: "Start Date",
    promise_date: "End Date",
    status: "Status",
  };

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.get("/repairs");
        console.log(response);
        const repairs = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        // Sort in ascending order by `id`
        repairs.sort((a, b) => a.id - b.id);
        setRepairs(repairs);
      } catch (error) {
        console.error("Error fetching repair registrations:", error);
        setRepairs([]);
      }
    };
    fetchRepairs();
  }, [selectedRows]);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleFilter = () => {
    let filteredRepairs = repairs;
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
      View: `/viewrepair/${id}`,
      Edit: `/edit-repair/${id}`,
      Delete: `/delete/${id}`,
      "Add to Work": `/add-to-work-order/${id}`,
      "Request Spare": `/request-spare/${id}`,
    };

    if (routes[option]) {
      navigate(routes[option]);
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await api.get(`/repairs/${id}`);
      setPrintData(response.data);
      console.log(response.data);
      navigate(`/print`);
    } catch (error) {
      console.error("Error fetching repair data:", error);
      alert("Failed to fetch data for printing.");
    }
  };

  const handlePrintsummary = (jobId) => {
    if (!jobId) {
      alert("No job ID available for this repair.");
      return;
    }
    navigate(`/print-summary/${jobId}`);
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
      const response = await api.delete("/repairs", {
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

  const statusStyles = {
    "not started": "bg-red-900 text-white",
    started: "bg-yellow-500 text-white",
    "in progress": "bg-blue-500 text-white",
    pending: "bg-orange-500 text-white",
    completed: "bg-green-500 text-white",
  };

  return (
    <div className="relative z-0 p-6 bg-white dark:bg-gray-700 shadow-lg rounded-lg dark:text-white">
      <div className="w-full flex phone:flex-col laptop:flex-row gap-4 justify-start phone:mt-12 desktop:mt-0 mb-4">
        {selectedRows.length > 0 ? (
          <div className="flex gap-2 items-center overflow-hidden">
            <button
              onClick={() =>
                navigate("/bulk-add-to-work-order", {
                  state: { selectedRows },
                })
              }
              className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-green-500 transition-all duration-500"
            >
              Add to Work
            </button>

            <button
              className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-blue-500 transition-all duration-500"
              onClick={() => handleAction("Pending")}
            >
              Request Spare
            </button>
            <button
              className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-red-500 transition-all duration-500"
              onClick={() => deleteSelectedRows(selectedRows)}
            >
              Delete
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <div className="laptop:w-[30%] desktop:w-[10%] overflow-hidden">
                <select
                  className="w-full text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-700 hover:cursor-pointer px-2 py-2 overflow-hidden border-2 border-green-500 focus:border-green-600 focus:ring-0 focus:outline-none ring-0 outline-none rounded-md transition-all duration-300"
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
                  onBlur={(e) =>
                    (e.target.type = e.target.value ? "date" : "text")
                  } // Keep text type if empty
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
                  onBlur={(e) =>
                    (e.target.type = e.target.value ? "date" : "text")
                  }
                  className="placeholder:dark:text-white dark:bg-gray-800 placeholder:text-sm w-full border-2 border-green-500 focus:border-green-600 focus:cursor-pointer ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg px-2 py-2 transition-all duration-300"
                  placeholder="Select End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="desktop:w-[10%] px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 dark:bg-green-700 hover:cursor-pointer hover:shadow-md transition-all duration-300">
                <button onClick={handleFilter} className="w-full text-white">
                  Filter
                </button>
              </div>
              <div className="desktop:w-[15%] border-2 border-green-500 flex items-center px-2 rounded-lg dark:bg-gray-800 overflow-hidden">
                <FiSearch className="text-gray-600 dark:text-white" />
                <input
                  type="text"
                  className="w-full dark:bg-transparent placeholder:dark:text-white border-none focus:ring-0 focus:outline-none ml-2 rounded-md"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="absolute z-[9999999] mx-auto phone:top-2 phone:right-6 tablet:top-6 desktop:right-6">
              <ButtonRepairOperation
                tableData={repairs}
                headers={headers}
                filename="repair"
                headerMappings={headerMappings}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto phone:mt-20 tablet:mt-0">
        <table className="min-w-[900px] w-full table-fixed border-collapse border border-table-border">
          <thead className="bg-table-head text-white text-left text-sm font-extrabold uppercase tracking-wide shadow-sm">
            <tr>
              <th className="border border-table-border px-2 py-3 w-[40px] text-center">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedRows.length === displayedRepairs.length}
                  className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-900"
                />
              </th>
              <th className="border border-table-border px-2 py-3 w-[70px]">
                Job ID
              </th>
              <th className="border border-table-border px-2 py-3 w-[130px]">
                Customer
              </th>
              <th className="border border-table-border px-2 py-3 w-[120px]">
                Mobile
              </th>
              <th className="border border-table-border px-2 py-3 w-[130px]">
                Job Type
              </th>
              <th className="border border-table-border px-2 py-3 w-[130px]">
                Product
              </th>
              <th className="border border-table-border px-2 py-3 w-[130px]">
                Serial Code
              </th>
              <th className="border border-table-border px-2 py-3 w-[90px]">
                Duration
              </th>
              <th className="border border-table-border px-2 py-3 w-[110px]">
                Start Date
              </th>
              <th className="border border-table-border px-2 py-3 w-[110px]">
                End Date
              </th>
              <th className="border border-table-border px-2 py-3 w-[100px]">
                Status
              </th>
              <th className="border border-table-border px-2 py-3 w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedRepairs.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-4 text-white">
                  No data available
                </td>
              </tr>
            ) : (
              displayedRepairs.map((repair) => (
                <tr
                  key={repair.id}
                  className="border border-table-border hover:bg-gray-100 hover:dark:bg-gray-600 transition"
                >
                  <td className="text-center border border-table-border px-2 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(repair.id)}
                      onChange={() => toggleRowSelection(repair.id)}
                      className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-400"
                    />
                  </td>

                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.job_id?.toString().padStart(4, "0")}
                  </td>

                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.customer_name}
                  >
                    {repair.customer_name}
                  </td>

                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[120px]"
                    title={repair.mobile}
                  >
                    {repair.mobile}
                  </td>

                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.types_of_jobs}
                  >
                    {repair.types_of_jobs || "-"}
                  </td>

                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.product_name}
                  >
                    {repair.product_name || "-"}
                  </td>

                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.serial_code}
                  >
                    {repair.serial_code || "-"}
                  </td>

                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.estimated_date
                      ? repair.estimated_date > 30
                        ? `${Math.floor(repair.estimated_date / 30)} Month(s)`
                        : `${repair.estimated_date} Days`
                      : "-"}
                  </td>

                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.received_date}
                  </td>

                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.promise_date || "-"}
                  </td>

                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${
                        statusStyles[repair.status] || "bg-gray-200 text-black"
                      }`}
                    >
                      {repair.status}
                    </span>
                  </td>

                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    <button
                      onClick={() => setDropdownOpen(repair.id)}
                      className="bg-blue-700 text-white text-xs px-2 py-1 rounded-sm flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Action <FiChevronDown className="ml-1" />
                    </button>
                    {dropdownOpen === repair.id && (
                      <DropdownButton
                        repair={repair}
                        id={repair.id}
                        type="repair"
                        handlePrint={handlePrint}
                        handleDelete={handleDelete}
                        handlePrintsummary={() => handlePrintsummary(repair.id)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {imageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full mx-4">
            <img
              src={imageModal.src}
              alt="Full View"
              className="w-full h-auto object-contain rounded-md"
            />
            <button
              onClick={() => setImageModal({ open: false, src: null })}
              className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

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

export default JobOrderList;
