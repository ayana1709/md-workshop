import React, { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Input from "@/components/StoreIssue/Input";
import Select from "@/components/StoreIssue/Select";
import ItemTable from "@/components/StoreIssue/ItemTable";

const StoreIssueManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [errors, setErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get("/store-issues");
      setIssues(response.data.data || response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch store issues.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleDelete = async (issueId) => {
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
        await api.delete(`/store-issues/${issueId}`);
        setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Store Issue deleted successfully.",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete store issue.",
        });
      }
    }
  };

  const updateStatus = async (issueId, statusField, newStatus) => {
    try {
      await api.patch(`/store-issues/${issueId}`, {
        [statusField]: newStatus,
      });

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, [statusField]: newStatus } : issue
        )
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${statusField
          .replace("_", " ")
          .toUpperCase()} status updated successfully.`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status.",
      });
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus =
      filterStatus === "all" ||
      issue.requested_status === filterStatus ||
      issue.approved_status === filterStatus ||
      issue.issued_status === filterStatus ||
      issue.delivered_status === filterStatus;

    const matchesSearch =
      searchTerm === "" ||
      issue.ref_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.requested_department
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      issue.requested_by?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="grow px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Loading store issues...
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
                📋 Store Issue Manager
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
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "issued", label: "Issued" },
                    { value: "delivered", label: "Delivered" },
                  ]}
                  className="w-[150px]"
                />
              </div>
            </div>

            <Link
              to="/store-issue/create"
              className="inline-block px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Create New Store Issue
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              {filteredIssues.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  No store issues found matching your filters.
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
                          Store From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Requested By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Approved By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Received By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Statuses
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {filteredIssues.map((issue,index) => (
                        <tr
                          key={issue.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td>
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {issue.ref_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(issue.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {issue.objective_for}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {issue.store_branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {issue.requested_by}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {issue.approved_by}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {issue.received_by}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative">
                              <select
                                className="block w-70 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                                value={issue.current_status}
                                onChange={(e) =>
                                  handleStatusChange(issue.id, e.target.value)
                                }
                              >
                                {[
                                  {
                                    value: issue.requested_status,
                                    label: issue.requested_status,
                                  },
                                  {
                                    value: issue.approved_status,
                                    label: issue.approved_status,
                                  },
                                  {
                                    value: issue.issued_status,
                                    label: issue.issued_status,
                                  },
                                  {
                                    value: issue.delivered_status,
                                    label: issue.delivered_status,
                                  },
                                ].map((status) => (
                                  <option
                                    key={status.value}
                                    value={status.value}
                                    className={getStatusColor(status.value)}
                                  >
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <select
                              className="block w-70 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                              onChange={(e) => {
                                const action = e.target.value;
                                if (action === "edit")
                                  navigate(`/store-issue/edit/${issue.id}`);
                                else if (action === "view")
                                  navigate(`/store-issue/view/${issue.id}`);
                                else if (action === "print")
                                  navigate(`/store-issue/print/${issue.id}`);
                                else if (action === "delete")
                                  handleDelete(issue.id);
                                e.target.value = ""; // Reset to default
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled hidden className="text-gray-900 text-lg ">
                                Actions
                              </option>
                              <option value="edit" className="text-yellow-600 text-lg">Edit</option>
                              <option value="view" className="text-gray-600 text-lg">View Details</option>
                              <option value="print" className="text-blue-600 text-lg">Print Store Issue</option>
                              <option value="delete" className="text-red-600 text-lg">
                                Delete
                              </option>
                            </select>
                          </td>
                        </tr>
                      ))}
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

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
    case "issued":
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "rejected":
    case "not_approved":
    case "not_issued":
    case "not_delivered":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

export default StoreIssueManager;
