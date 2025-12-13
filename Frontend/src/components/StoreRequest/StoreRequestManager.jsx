import React, { useState, useEffect, useCallback } from "react";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
// Added EyeIcon and ensured ChevronDownIcon is present
import {
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const StoreRequestManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  // 1. NEW STATE for dropdown visibility
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();

  // Get base URL for Image Construction
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const getPublicUrl = (path) => {
    if (!path) return null;
    return `${baseURL.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
  };

  // Helper to format a standard Gregorian Date (YYYY-MM-DD) to DD/MM/YYYY
  const formatGCDate = (gregorianDate) => {
    if (!gregorianDate) return "N/A";
    try {
      // FIX: Strip time component first
      const dateOnlyString = gregorianDate.split("T")[0];
      const dateParts = dateOnlyString.split("-");

      if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
      return dateOnlyString;
    } catch (e) {
      return "Date Error";
    }
  };

  // Placeholder for Ethiopian Date Conversion.
  const convertToEthio = (gregorianDate) => {
    if (!gregorianDate) return "N/A";
    try {
      // FIX: Strip time component first
      const dateOnlyString = gregorianDate.split("T")[0];

      // Mock return for now (replace YYYY with YYYY-7 to illustrate)
      const year = new Date(dateOnlyString).getFullYear() - 7;
      const month = (new Date(dateOnlyString).getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const day = new Date(dateOnlyString)
        .getDate()
        .toString()
        .padStart(2, "0");

      return `${day}/${month}/${year}`;
    } catch (e) {
      return "N/A";
    }
  };

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/store-requests?page=${page}`);
      const fetchedRequests = response.data.data || [];

      const requestsWithUrls = fetchedRequests.map((request) => {
        const itemsWithUrls = (request.requested_items || []).map((item) => ({
          ...item,
          image_url: item.image ? getPublicUrl(item.image) : null,
        }));

        return {
          ...request,
          requested_items: itemsWithUrls,
          ethio_date: convertToEthio(request.date),
        };
      });

      setRequests({
        ...response.data,
        data: requestsWithUrls,
      });
      setCurrentPage(response.data.current_page || 1);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Failed to load store requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (requests.last_page && newPage >= 1 && newPage <= requests.last_page) {
      setCurrentPage(newPage);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 2. NEW FUNCTION to toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdownId((prevId) => (prevId === id ? null : id));
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Urgent
          </span>
        );
      case 2:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            High
          </span>
        );
      case 3:
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Normal
          </span>
        );
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the request and its associated images.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/store-requests/${id}`);
        setRequests((prev) => ({
          ...prev,
          data: prev.data.filter((request) => request.id !== id),
        }));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Store request deleted successfully.",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message || "Failed to delete store request.",
        });
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl dark:bg-gray-900 dark:text-white">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading Store Requests...
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            📦 Store Requests Dashboard
          </h1>

          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/store-request/create")}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition duration-150"
            >
              + New Request
            </button>
          </div>

          <div className="bg-white shadow-xl rounded-lg dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-center w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Ref No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Date (GC / Ethio)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Objective
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {requests.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      No store requests found.
                    </td>
                  </tr>
                ) : (
                  requests.data.map((request) => (
                    <React.Fragment key={request.id}>
                      <tr className="hover:bg-gray-50 transition duration-150 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => toggleRow(request.id)}>
                            {expandedRows[request.id] ? (
                              <ChevronUpIcon className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                          {request.ref_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col">
                            <span
                              className="font-medium text-gray-700 dark:text-gray-300"
                              title="Gregorian Calendar"
                            >
                              {formatGCDate(request.date)}
                            </span>
                            <span
                              className="text-xs text-indigo-600 dark:text-indigo-400"
                              title="Ethiopian Calendar"
                            >
                              {request.ethio_date}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                          {request.requested_by}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                          {request.requested_department}
                        </td>
                        <td
                          className="px-6 py-4 truncate max-w-xs text-gray-900 dark:text-gray-300"
                          title={request.objective_for}
                        >
                          {request.objective_for}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getPriorityBadge(request.priority)}
                        </td>

                        {/* 3. UPDATED ACTIONS CELL WITH DROPDOWN */}
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                          {/* The Dropdown Button is the trigger */}
                          <button
                            onClick={() => toggleDropdown(request.id)}
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            aria-expanded={openDropdownId === request.id}
                          >
                            Actions
                            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                          </button>

                          {/* Dropdown Menu - Positioned ABSOLUTELY relative to the TD (relative) */}
                          {openDropdownId === request.id && (
                            <div
                              // z-[100] is the highest z-index and should break through any normal stacking context
                              className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100] dark:bg-gray-700 dark:ring-gray-600"
                              onMouseLeave={() => setOpenDropdownId(null)}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    navigate(`/store-request/edit/${request.id}`);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                  <PencilSquareIcon className="h-4 w-4 mr-2 inline" /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/store-request/print/${request.id}`);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                  <EyeIcon className="h-4 w-4 mr-2 inline" /> Print
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(request.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600"
                                >
                                  <TrashIcon className="h-4 w-4 mr-2 inline" /> Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row for Items */}
                      {expandedRows[request.id] && (
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <td
                            colSpan="8"
                            className="p-0 border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="p-4 border-l-4 border-indigo-500">
                              <h4 className="text-md font-bold mb-3 text-indigo-700 dark:text-indigo-400">
                                Requested Items
                              </h4>
                              <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden dark:divide-gray-700 dark:border-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                  <tr>
                                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                      Item Name
                                    </th>
                                    <th className="px-6 py-2 text-center text-xs font-medium text-gray-600 w-20 dark:text-gray-300">
                                      Qty
                                    </th>
                                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-600 w-16 dark:text-gray-300">
                                      Unit
                                    </th>
                                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                      Remark
                                    </th>
                                    <th className="px-6 py-2 text-center text-xs font-medium text-gray-600 w-24 dark:text-gray-300">
                                      Image
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
                                  {request.requested_items.length > 0 ? (
                                    request.requested_items.map(
                                      (item, itemIndex) => (
                                        <tr key={itemIndex}>
                                          <td className="px-6 py-3 text-gray-900 dark:text-white">
                                            {item.item_name}
                                          </td>
                                          <td className="px-6 py-3 text-center text-gray-900 dark:text-white">
                                            {item.quantity}
                                          </td>
                                          <td className="px-6 py-3 text-gray-900 dark:text-white">
                                            {item.unit}
                                          </td>
                                          <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {item.remark || "—"}
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            {item.image_url ? (
                                              <button
                                                onClick={() =>
                                                  setPreviewImage(
                                                    item.image_url
                                                  )
                                                }
                                                className="p-1 border rounded hover:border-indigo-500 dark:border-gray-600 dark:hover:border-indigo-400"
                                              >
                                                <img
                                                  src={item.image_url}
                                                  alt={item.item_name}
                                                  className="h-8 w-8 object-cover rounded"
                                                />
                                              </button>
                                            ) : (
                                              <span className="text-gray-400 text-xs">
                                                No Image
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    )
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="5"
                                        className="text-center py-3 text-gray-500 dark:text-gray-400"
                                      >
                                        No items listed for this request.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {requests.last_page > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === requests.last_page}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * requests.per_page + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * requests.per_page +
                          requests.data.length}
                      </span>{" "}
                      of <span className="font-medium">{requests.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      {/* Simple Pagination Buttons */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <span>Previous</span>
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === requests.last_page}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <span>Next</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Item Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white p-2 bg-gray-700/50 rounded-full hover:bg-gray-700 transition duration-150"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreRequestManager;