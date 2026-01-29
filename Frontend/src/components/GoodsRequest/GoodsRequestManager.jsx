import React, { useState, useEffect, useCallback } from "react";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";

import {
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDateFormatter } from "../DateFormat/useDateFormatter";

const GoodsRequestManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();
  const { formatGCDate, formatEthioDate } = useDateFormatter();

  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const getPublicUrl = (path) => {
    if (!path) return null;
    return `${baseURL.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
  };

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/goods-requests?page=${page}`);
      const fetchedRequests = response.data.data || [];

      const requestsWithUrls = fetchedRequests.map((request) => {
        const itemsWithUrls = (request.requested_items || []).map((item) => ({
          ...item,
          image_url: item.image ? getPublicUrl(item.image) : null,
        }));

        return {
          ...request,
          requested_items: itemsWithUrls,
          gregorian_date: request.date ? request.date.split("T")[0] : null, // <-- here
          ethio_date: request.date,
        };
      });

      setRequests({
        ...response.data,
        data: requestsWithUrls,
      });
      setCurrentPage(response.data.current_page || 1);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Failed to load Goods requests.", "error");
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
        await api.delete(`/goods-requests/${id}`);
        setRequests((prev) => ({
          ...prev,
          data: prev.data.filter((request) => request.id !== id),
        }));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Goods request deleted successfully.",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message || "Failed to delete Goods request.",
        });
      }
    }
  };
const getStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return (
        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Pending
        </span>
      );
    
    case 'approved':
      return (
        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Approved
        </span>
      );
    
    case 'rejected':
      return (
        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Rejected
        </span>
      );
    
    case 'in_stock':
      return (
        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          In Stock
        </span>
      );
    
    case 'issued':
      return (
        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          Issued
        </span>
      );
    
    default:
      return (
        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Unknown
        </span>
      );
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
        Loading Goods Requests...
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              📦 Goods Requests
            </h1>
            <button
              onClick={() => navigate("/goods-request/create")}
              className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-150 text-sm sm:text-base"
            >
              + New Request
            </button>
          </div>

          <div className="bg-white shadow rounded-lg dark:bg-gray-800 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-center w-10"></th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Ref No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Requested By
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Department
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Objective
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Priority
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {requests.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      No Goods requests found.
                    </td>
                  </tr>
                ) : (
                  requests.data.map((request) => (
                    <React.Fragment key={request.id}>
                      <tr className="hover:bg-gray-50 transition duration-150 dark:hover:bg-gray-700">
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => toggleRow(request.id)}
                            className="p-1"
                          >
                            {expandedRows[request.id] ? (
                              <ChevronUpIcon className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                          {request.ref_no}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className="font-medium text-gray-700 dark:text-gray-300 text-sm"
                              title="Gregorian Calendar"
                            >
                              {formatGCDate(request.date)}
                            </span>
                            <span
                              className="text-xs text-indigo-600 dark:text-indigo-400"
                              title="Ethiopian Calendar"
                            >
                              {formatEthioDate(request.ethio_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white text-sm whitespace-nowrap">
                          {request.requested_by}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white text-sm whitespace-nowrap">
                          {request.requested_department}
                        </td>
                        <td
                          className="px-3 py-2 text-gray-900 dark:text-gray-300 text-sm max-w-[200px] truncate"
                          title={request.objective_for}
                        >
                          {request.objective_for}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          {getPriorityBadge(request.priority)}
                        </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                          {getStatusBadge(request.status)}
                        </td>  
                        <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium relative z-10">
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(request.id)}
                              onMouseOver={() => toggleRow(request.id)}
                              className="inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 whitespace-nowrap relative z-0"
                              aria-expanded={openDropdownId === request.id}
                            >
                              Actions
                              <ChevronDownIcon
                                className="-mr-1 ml-1 h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>

                            {openDropdownId === request.id && (
                              <div
                                className="origin-top-right absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1000] dark:bg-gray-700 dark:ring-gray-600"
                                style={{ position: "fixed" }}
                                onMouseLeave={() => setOpenDropdownId(null)}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      navigate(
                                        `/goods-request/edit/${request.id}`
                                      );
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                  >
                                    <PencilSquareIcon className="h-3.5 w-3.5 mr-2" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(
                                        `/goods-request/print/${request.id}`
                                      );
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                  >
                                    <EyeIcon className="h-3.5 w-3.5 mr-2" />
                                    Print
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(request.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5 mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row for Items */}
                      {expandedRows[request.id] && (
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <td
                            colSpan="8"
                            className="p-0 border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="p-3 border-l-4 border-indigo-500 z-0">
                              <h4 className="text-sm font-bold mb-2 text-indigo-700 dark:text-indigo-400">
                                Requested Items
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border rounded overflow-hidden dark:divide-gray-700 dark:border-gray-700">
                                  <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                      <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        Item Name
                                      </th>
                                      <th className="px-3 py-1.5 text-center text-xs font-medium text-gray-600 w-16 dark:text-gray-300 whitespace-nowrap">
                                        Qty
                                      </th>
                                      <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-600 w-16 dark:text-gray-300 whitespace-nowrap">
                                        Unit
                                      </th>
                                      <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        Remark
                                      </th>
                                      <th className="px-3 py-1.5 text-center text-xs font-medium text-gray-600 w-20 dark:text-gray-300 whitespace-nowrap">
                                        Image
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
                                    {request.requested_items.length > 0 ? (
                                      request.requested_items.map(
                                        (item, itemIndex) => (
                                          <tr key={itemIndex}>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                              {item.item_name}
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-900 dark:text-white">
                                              {item.quantity}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                              {item.unit}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                                              {item.remark || "—"}
                                            </td>
                                            <td className="px-3 py-2 text-center">
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
                                                    className="h-7 w-7 object-cover rounded"
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
                                          className="text-center py-2 text-gray-500 dark:text-gray-400"
                                        >
                                          No items listed for this request.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
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
              <div className="px-3 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === requests.last_page}
                    className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Next
                  </button>
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
            className="absolute top-3 right-3 text-white p-1.5 bg-gray-700/50 rounded-full hover:bg-gray-700 transition duration-150"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GoodsRequestManager;
