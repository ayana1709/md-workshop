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
import DescriptionModal from "./DescriptionModal";
import StatusCell from "./StatusCell";
const JobOrderList = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [imageModal, setImageModal] = useState({ open: false, src: null });
  // const [dropdownDirection, setDropdownDirection] = React.useState("down");
  const [dropdownOpen, setDropdownOpen] = React.useState(null); // id or null
  const [dropdownDirection, setDropdownDirection] = React.useState("down"); // "up" | "down"
  const btnRefs = React.useRef({}); // id -> button element
  const menuRefs = React.useRef({}); // id -> menu element
  const [popupImage, setPopupImage] = useState(null);
  // console.log(selectedRows);

  const {
    setIsModalOpen,
    setSelectedRepairId,
    setType,
    repairs,
    setRepairs,
    printData,
    setPrintData,
    // dropdownOpen,
    // setDropdownOpen,
    handleDelete,
    isStatusModalOpen,
    setIsStatusModalOpen,
  } = useStores();
  // console.log(dropdownOpen);

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
        // repairs.sort((a, b) => a.id - b.id);
        setRepairs(repairs);
      } catch (error) {
        console.error("Error fetching repair registrations:", error);
        setRepairs([]);
      }
    };
    fetchRepairs();
  }, [selectedRows]);

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

  // at the top of JobOrderList component

  const toggleDropdown = (id, e) => {
    if (dropdownOpen === id) {
      setDropdownOpen(null);
      return;
    }
    const btn = btnRefs.current[id] ?? e?.currentTarget;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedMenuHeight = 280; // fallback before we can measure
      setDropdownDirection(
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow
          ? "up"
          : "down"
      );
    }
    setDropdownOpen(id);
  };

  // Re-evaluate once the menu is actually mounted (accurate height)
  React.useLayoutEffect(() => {
    if (!dropdownOpen) return;
    const btn = btnRefs.current[dropdownOpen];
    const menu = menuRefs.current[dropdownOpen];
    if (!btn || !menu) return;

    const menuHeight = menu.offsetHeight;

    // Mobile breakpoint (sm: 640px)
    if (window.innerWidth < 640) {
      setDropdownDirection("down"); // always down on mobile
      return;
    }

    const btnRect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - btnRect.bottom;
    const spaceAbove = btnRect.top;

    const dir =
      spaceBelow < menuHeight && spaceAbove > spaceBelow ? "up" : "down";
    setDropdownDirection(dir);
  }, [dropdownOpen]);

  // Close on outside click (no change needed)
  React.useEffect(() => {
    const onDown = (e) => {
      if (!dropdownOpen) return;
      const btn = btnRefs.current[dropdownOpen];
      const menu = menuRefs.current[dropdownOpen];
      if (btn?.contains(e.target) || menu?.contains(e.target)) return;
      setDropdownOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropdownOpen]);

  // Recompute on scroll/resize
  React.useEffect(() => {
    const recompute = () => {
      if (!dropdownOpen) return;
      const btn = btnRefs.current[dropdownOpen];
      const menu = menuRefs.current[dropdownOpen];
      if (!btn) return;

      // Always down on mobile
      if (window.innerWidth < 640) {
        setDropdownDirection("down");
        return;
      }

      const rect = btn.getBoundingClientRect();
      const menuHeight = menu?.offsetHeight ?? 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const dir =
        spaceBelow < menuHeight && spaceAbove > spaceBelow ? "up" : "down";
      setDropdownDirection(dir);
    };

    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [dropdownOpen]);

  return (
    <div className="relative z-0 p-6 bg-white dark:bg-gray-700 shadow-lg rounded-lg dark:text-white">
      <div className="flex flex-col laptop:flex-row gap-4 mb-4">
        {selectedRows.length > 0 ? (
          // Bulk Action Buttons
          <div className="flex gap-2 items-center">
            <button
              onClick={() =>
                navigate("/bulk-add-to-work-order", {
                  state: { selectedRows },
                })
              }
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Add to Work
            </button>
            <button
              onClick={() => handleAction("Pending")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Request Spare
            </button>
            <button
              onClick={() => deleteSelectedRows(selectedRows)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        ) : (
          // Filters & Search
          <div className="w-full space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            {/* Items per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="w-full sm:w-auto px-2 py-2 border-2 border-green-500 rounded-md dark:bg-gray-800 dark:text-white transition"
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  View {num}
                </option>
              ))}
            </select>

            {/* Start Date */}
            <input
              type="text"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = e.target.value ? "date" : "text")}
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto px-2 py-2 border-2 border-green-500 rounded-lg dark:bg-gray-800 dark:text-white placeholder:dark:text-white transition"
            />

            {/* End Date */}
            <input
              type="text"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = e.target.value ? "date" : "text")}
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-auto px-2 py-2 border-2 border-green-500 rounded-lg dark:bg-gray-800 dark:text-white placeholder:dark:text-white transition"
            />

            {/* Filter Button */}
            <button
              onClick={handleFilter}
              className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Filter
            </button>

            {/* Search */}
            <div className="flex items-center w-full sm:w-auto px-2 border-2 border-green-500 rounded-lg dark:bg-gray-800">
              <FiSearch className="text-gray-600 dark:text-white" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 dark:bg-transparent border-none focus:ring-0 placeholder:dark:text-white"
              />
            </div>

            {/* Export / Actions */}
            <ButtonRepairOperation
              tableData={repairs}
              headers={headers}
              filename="repair"
              headerMappings={headerMappings}
              className="w-full sm:w-auto"
            />
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

              {/* New Image Column */}
              <th className="border border-table-border px-2 py-3 w-[60px] text-center">
                Image
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
                <td colSpan="13" className="text-center py-4 text-white">
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

                  {/* Image Cell */}
                  <td className="border border-table-border px-2 py-3 text-center">
                    <img
                      src={
                        repair.image
                          ? `${import.meta.env.VITE_API_URL}/storage/${
                              repair.image
                            }`
                          : `${
                              import.meta.env.VITE_API_URL
                            }/storage/repair_images/default.jpg`
                      }
                      alt="repair"
                      className="w-10 h-10 object-cover rounded-md cursor-pointer mx-auto"
                      onClick={() =>
                        setPopupImage(
                          repair.image
                            ? `${import.meta.env.VITE_API_URL}/storage/${
                                repair.image
                              }`
                            : `${
                                import.meta.env.VITE_API_URL
                              }/storage/repair_images/default.jpg`
                        )
                      }
                    />
                  </td>

                  {/* Job ID */}
                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.job_id?.toString().padStart(4, "0")}
                  </td>

                  {/* Customer */}
                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.customer_name}
                  >
                    {repair.customer_name}
                  </td>

                  {/* Mobile */}
                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[120px]"
                    title={repair.mobile}
                  >
                    {repair.mobile}
                  </td>

                  {/* Job Type */}
                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.types_of_jobs}
                  >
                    {repair.types_of_jobs || "-"}
                  </td>

                  {/* Product */}
                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.product_name}
                  >
                    {repair.product_name || "-"}
                  </td>

                  {/* Serial Code */}
                  <td
                    className="border border-table-border px-2 py-3 text-sm truncate max-w-[130px]"
                    title={repair.serial_code}
                  >
                    {repair.serial_code || "-"}
                  </td>

                  {/* Duration */}
                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.estimated_date
                      ? repair.estimated_date > 30
                        ? `${Math.floor(repair.estimated_date / 30)} Month(s)`
                        : `${repair.estimated_date} Days`
                      : "-"}
                  </td>

                  {/* Start Date */}
                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.received_date}
                  </td>

                  {/* End Date */}
                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    {repair.promise_date || "-"}
                  </td>

                  {/* Status */}
                  <td className="border border-table-border px-2 py-3 text-sm text-center">
                    <StatusCell repair={repair} />
                  </td>

                  {/* Actions */}
                  <td className="border border-table-border px-2 py-3 text-sm text-center relative">
                    <div className="relative inline-block w-full">
                      <button
                        ref={(el) => (btnRefs.current[repair.id] = el)}
                        onClick={(e) => toggleDropdown(repair.id, e)}
                        className="bg-blue-700 text-white text-xs px-2 py-1 rounded-md flex flex-wrap items-center justify-center w-full sm:w-auto"
                      >
                        Action
                        <FiChevronDown className="ml-1" />
                      </button>

                      {dropdownOpen === repair.id && (
                        <div
                          ref={(el) => (menuRefs.current[repair.id] = el)}
                          className={`absolute bg-white border rounded-md shadow-lg z-50
                          ${
                            dropdownDirection === "down"
                              ? "top-full mt-1"
                              : "bottom-full mb-1"
                          }
                          right-0 sm:left-auto`}
                          style={{
                            minWidth: "8rem",
                            maxWidth: "90vw",
                            maxHeight: "250px",
                            overflowY: "auto",
                          }}
                        >
                          <DropdownButton
                            id={repair.id}
                            job_id={repair.job_id}
                            type="repair"
                            handlePrint={handlePrint}
                            handleDelete={handleDelete}
                            handlePrintsummary={() =>
                              handlePrintsummary(repair.id)
                            }
                            onClose={() => setDropdownOpen(null)}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Image Popup Modal */}
        {popupImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setPopupImage(null)}
          >
            <div className="relative">
              <img
                src={popupImage}
                alt="popup"
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
              />
              <button
                onClick={() => setPopupImage(null)}
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
    </div>
  );
};

export default JobOrderList;
