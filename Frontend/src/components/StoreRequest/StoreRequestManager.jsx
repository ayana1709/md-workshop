import React, { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Input from "@/components/StoreRequest/Input";
import Select from "@/components/StoreRequest/Select";

// Renamed from StoreIssueManager
const StoreRequestManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // Renamed state from issues to requests
  const [requests, setRequests] = useState([]); 
  const [errors, setErrors] = useState({}); 
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Changed endpoint from /store-issues to /store-requests
      const response = await api.get("/store-requests");
      setRequests(response.data.data || response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch store requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (requestId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Changed endpoint
        await api.delete(`/store-requests/${requestId}`);
        setRequests((prev) => prev.filter((request) => request.id !== requestId));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Store Request deleted successfully.",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete store request.",
        });
      }
    }
  };

  // Status logic is simplified: we only use the 'status' field from the migration
  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      filterStatus === "all" ||
      request.status === filterStatus; // Use the single 'status' field

    const matchesSearch =
      searchTerm === "" ||
      request.ref_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_department
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.requested_by?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Helper function for status badge color (simplified options)
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="grow px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Loading store requests...
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                📋 Store Request Manager
              </h2>
              <div className="flex gap-3">
                <Input
                  label="Search"
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ref No, Department, Requested By..."
                  className="max-w-md"
                />
                <Select
                  label="Filter by Status"
                  name="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  // Simplified status options based on the migration's 'status' enum
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                  className="w-[150px]"
                />
              </div>
            </div>

            <Link
              // Changed target link
              to="/store-request/create"
              className="inline-block px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Create New Store Request
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {filteredRequests.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  No store requests found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          S/N
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ref No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Request From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Requested By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Approved By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Approval Status
                        </th>
                        {/* Removed 'Received By' column */}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {filteredRequests.map((request, index) => {
                        const statusText = request.status;
                        return (
                          <tr
                            key={request.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              {request.ref_no}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(request.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {request.objective_for}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {/* Using the migration field 'requested_from' */}
                              {request.requested_from} 
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {request.requested_by}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {/* Using approved_name as the primary display */}
                              {request.approved_name || 'N/A'} 
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {/* Display status as a badge */}
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  statusText
                                )}`}
                              >
                                {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <select
                                className="block w-70 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white appearance-none"
                                onChange={(e) => {
                                  const action = e.target.value;
                                  if (action === "edit")
                                    // Changed link structure
                                    navigate(`/store-request/edit/${request.id}`);
                                  else if (action === "print")
                                    // Changed link structure
                                    navigate(`/store-request/print/${request.id}`);
                                  else if (action === "delete")
                                    handleDelete(request.id);
                                  e.target.value = ""; // Reset to default
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled hidden>
                                  Actions
                                </option>
                                <option value="edit">Edit</option>
                                <option value="print">Print Request</option>
                                <option value="delete">Delete</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreRequestManager;