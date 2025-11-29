import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";
import { FiEye, FiEdit, FiTrash2, FiSave, FiChevronDown } from "react-icons/fi";
import RequestSpare from "./RequestSpare";
import TestDrive from "./TestDrive";
import OutSource from "./OutSource";
import RequestedItemsTable from "./RequestedItemsTable";
import SpareChange from "./SpareChange";
import ServiceReminderForm from "./ServiceReminderForm";
import TestDriveResult from "./TestDriveResult";

const AddToWorkOrder = () => {
  const { id } = useParams(); // Get ID from URL params
  const location = useLocation();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const { plateNumber, customerName, jobTitle } = location.state || {};
  const [employee_id, setemployee_id] = useState("");
  const [repairs, setRepairs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [workDetails, setWorkDetails] = useState([]);
  const [isAddingRow, setIsAddingRow] = useState(false);

  const [rows, setRows] = useState(() => {
    const savedRows = localStorage.getItem("rows");
    return savedRows ? JSON.parse(savedRows) : [];
  });

  useEffect(() => {
    localStorage.setItem("rows", JSON.stringify(rows));
  }, [rows]);

  const isRowEmpty = (row) => {
    return (
      !row.workDescription?.trim() &&
      !row.AssignTo?.trim() &&
      !row.EstimationTime?.toString().trim() &&
      !row.totalcost?.toString().trim() &&
      !row.TimeIn?.trim() &&
      !row.TimeOut?.trim() &&
      !row.Remark?.trim()
    );
  };

  const addRow = async (jobCardNo) => {
    if (isAddingRow) {
      Swal.fire("Please wait!", "Still adding the previous row...", "warning");
      return;
    }

    if (rows.length > 0 && isRowEmpty(rows[rows.length - 1])) {
      Swal.fire(
        "Warning!",
        "Please complete the last row before adding a new one.",
        "warning"
      );
      return;
    }

    setIsAddingRow(true); // 🚀 lock the button

    try {
      const response = await api.get(`/work-orders?job_card_no=${jobCardNo}`);
      const existingWorkOrders = response.data.data || [];
      const allWorkDetails = existingWorkOrders.flatMap(
        (order) => order.work_details
      );

      const maxWorkDetailId = Math.max(
        allWorkDetails.length > 0
          ? Math.max(...allWorkDetails.map((w) => w.id))
          : 0,
        rows.length > 0 ? Math.max(...rows.map((r) => r.id)) : 0
      );

      const newRow = {
        id: maxWorkDetailId + 1,
        code: "GS",
        workDescription: "",
        AssignTo: "",
        EstimationTime: "",
        totalcost: "",
        TimeIn: "",
        TimeOut: "",
        Remark: "",
        status: rows.length === 0 ? "Pending" : "",
        progress: 0,
      };

      setRows((prevRows) => [...prevRows, newRow]);
    } catch (error) {
      console.error("Error fetching work details:", error);
      Swal.fire("Error!", "Failed to fetch work order details.", "error");
    } finally {
      setIsAddingRow(false); // ✅ unlock the button
    }
  };

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return; // Ensure ID is available before fetching
      try {
        const response = await api.get(`/repairs/basic/${id}`); // ✅ Corrected URL
        console.log("Fetched Repair Data:", response.data); // Debugging
        if (response.data) {
          setRepair(response.data);
        } else {
          console.error("Unexpected data format:", response.data);
          setRepair(null);
        }
      } catch (error) {
        console.error("Error fetching repair details:", error);
        setRepair(null);
      }
    };
    fetchRepairById();
  }, [id]);

  // Fetch employees from the backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employees-list");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);
  // console.log("workDetails:", workDetails);
  useEffect(() => {
    const fetchWorkDetailsByJobCardNo = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/work-orders/job-card/${id}`);

        // Only update state if valid array is returned
        if (response.data && Array.isArray(response.data.work_details)) {
          setWorkDetails(response.data.work_details);
        } else {
          console.warn(
            "No valid work details returned, keeping previous data."
          );
          // Don't clear data if server just returns null or bad format
        }
      } catch (error) {
        console.error("Error fetching work details:", error);
        // Optional: show error message, but don't clear the data
        // setWorkDetails([]); ← Comment this out to keep old data
      }
    };

    fetchWorkDetailsByJobCardNo();
    const interval = setInterval(fetchWorkDetailsByJobCardNo, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!workDetails || workDetails.length === 0 || !id) return;

    const statusCounts = workDetails.reduce((acc, item) => {
      const status = item.status?.toLowerCase() || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const total = workDetails.length;
    const completed = statusCounts["completed"] || 0;
    const pending = statusCounts["pending"] || 0;
    const started = statusCounts["started"] || 0;

    let newStatus = "";

    if (completed === total) {
      newStatus = "completed";
    } else if (pending > started) {
      newStatus = "pending";
    } else if (started > 0) {
      newStatus = "started";
    } else {
      newStatus = "not started";
    }

    updateRepairStatus(id, newStatus); // <--- this triggers the backend PATCH
  }, [workDetails, id]);

  const handleViewA = (row) => {
    setViewData(row); // Store selected row data
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    const newWorkOrder = {
      job_card_no: id,
      plate_number: repair?.product_name,
      customer_name: repair?.customer_name,
      repair_category: repair?.serial_code,
      work_details: rows, // Newly added work details
    };

    try {
      const response = await api.post("/work-orders", newWorkOrder);
      if (response.data && response.data.work_details) {
        console.log("Newly added work details:", response.data.work_details); // Debugging
        // Update state with both old and new work details
        setWorkDetails((prev) => [...prev, ...response.data.work_details]);
      }

      Swal.fire({
        title: "Success!",
        text: "Work order has been successfully saved.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Reset input fields
      setRows([]);
      localStorage.removeItem("rows");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Swal.fire({
        title: "Error!",
        text: "Failed to save the work order. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  //handle delete
  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This work detail will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log("Attempting to delete row:", row); // Debugging

          await deleteFromDB(row.id); // Call delete function

          setWorkDetails((prev) => prev.filter((item) => item.id !== row.id)); // Remove from state

          Swal.fire("Deleted!", "Work detail has been deleted.", "success");
        } catch (error) {
          console.error("Delete failed:", error); // Log error
          Swal.fire("Error", "Failed to delete work detail.", "error");
        }
      }
    });
  };

  const deleteFromDB = async (workDetailId) => {
    try {
      console.log("Deleting work detail with ID:", workDetailId); // Debugging

      const response = await api.delete(`/work-details/${workDetailId}`);

      if (response.status === 200 || response.status === 204) {
        console.log("Delete successful!");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(
        "Error deleting work detail:",
        error.response?.data || error.message
      );
      Swal.fire(
        "Error",
        "Failed to delete work detail. Please try again.",
        "error"
      );
      throw error; // Ensure error propagates
    }
  };
  const handleNavigate = () => {
    navigate(`/test-drive/${id}`);
  };

  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEditValues({ ...row });
  };

  const handleSave = async () => {
    try {
      await api.put(`/work-details/${editingRow}`, editValues);

      // Update UI optimistically
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === editingRow ? editValues : row))
      );

      setEditingRow(null);
      setEditValues({});
      Swal.fire("Success!", "Work detail updated successfully.", "success");
    } catch (error) {
      console.error("Error updating work detail:", error);
      Swal.fire("Error!", "Failed to update work detail.", "error");
    }
  };

  const handleChange = (id, field, value) => {
    if (editingRow === id) {
      setEditValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, [field]: value } : row
        )
      );
    }
  };

  const getStatusSummary = () => {
    const summary = {};
    workDetails.forEach((item) => {
      const status = item.status || "Unknown";
      summary[status] = (summary[status] || 0) + 1;
    });
    return summary;
  };

  const updateRepairStatus = async (repairId, newStatus) => {
    try {
      await api.patch(`/repairs/${repairId}`, {
        status: newStatus,
      });
      console.log(`Updated repair status to: ${newStatus}`);
    } catch (error) {
      console.error("Failed to update repair status:", error);
    }
  };
  // const getAverageProgress = () => {
  //   const allProgressValues = [...workDetails, ...rows]
  //     .map((item) => item.progress)
  //     .filter((value) => typeof value === "number");

  //   if (allProgressValues.length === 0) return 0;

  //   const total = allProgressValues.reduce((acc, curr) => acc + curr, 0);
  //   return Math.round(total / allProgressValues.length);
  // };
  const [averageProgress, setAverageProgress] = useState(0);

  useEffect(() => {
    const fetchAverage = async () => {
      try {
        const res = await api.get(`/work-orders/${id}/average-progress`);
        setAverageProgress(res.data.average_progress || 0);
      } catch (err) {
        console.error("Failed to fetch average progress", err);
      }
    };

    fetchAverage();
  }, [id]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="absolute top-6 left-2 z-[99999]">
          <BackButton />
        </div>
        {/* Site Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-2 m-auto rounded-md">
          <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-4 m-auto rounded-md">
            <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
              <div className="grid phone:grid-cols-1 tablet:grid-cols-2 gap-4">
                {/* Job Card No */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Job Card No
                  </label>
                  <input
                    type="text"
                    value={id || ""}
                    disabled
                    className="mt-1 block dark:bg-gray-800 dark:text-white w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Customer Name */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={repair?.customer_name || ""}
                    disabled
                    className="mt-1 block dark:bg-gray-800 dark:text-white w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={repair?.product_name || ""}
                    disabled
                    className="mt-1 block dark:bg-gray-800 dark:text-white w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Serial Code */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Serial Code
                  </label>
                  <input
                    type="text"
                    value={repair?.serial_code || ""}
                    disabled
                    className="mt-1 block dark:bg-gray-800 dark:text-white w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
            </div>
          </main>

          <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-10 m-auto rounded-md">
            <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
              <h2 className="uppercase tracking-wider text-blue-700 phone:text-md tablet:text-xl font-bold text-center mb-6">
                Add to Labour Work Order
              </h2>

              {/* ✅ Status Summary */}

              <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
                {/* Job Card No */}
                <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                  {/* ➕ Add WorkOrder Button */}
                  {/* 🔄 Average Progress Display */}
                  {/* <div className="flex items-center gap-4"> */}

                  <button
                    onClick={addRow}
                    disabled={isAddingRow}
                    className={`px-4 py-2 rounded text-white ${
                      isAddingRow
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {isAddingRow ? "Adding..." : "+ Add New WorkOrder"}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Average Progress:
                    </span>
                    <div className="relative w-40 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full text-xs text-white font-semibold flex items-center justify-center"
                        style={{ width: `${averageProgress}%` }}
                      >
                        {averageProgress}%
                      </div>
                    </div>
                  </div>

                  {/* </div> */}

                  {/* 📊 Status Summary */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(getStatusSummary()).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className={`px-3 py-1 rounded-full text-sm font-medium shadow-md
          ${
            status === "Started"
              ? "bg-purple-400 text-purple-900"
              : status === "Pending"
              ? "bg-yellow-300 text-yellow-900"
              : "bg-gray-300 text-gray-800"
          }`}
                        >
                          {status}: {count}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto scroll-smooth rounded-md border border-gray-300 shadow-sm px-2 sm:px-4">
                  <table className="min-w-[700px] w-full max-w-screen-lg mx-auto table-auto border-collapse text-sm">
                    <thead className="bg-gray-800 text-white sticky top-0 z-10">
                      <tr>
                        {[
                          "#",
                          "Types of Work",
                          "W.Description",
                          "Est.Time",
                          "Est. Cost",
                          "Assign To",
                          "Time In / Out",
                          "Status",
                          "Progress",
                          "Remark",
                          "Actions",
                        ].map((header, i) => (
                          <th
                            key={i}
                            className="border-2 border-gray-400 px-2 sm:px-3 py-2 font-medium text-center min-w-[120px] text-[11px] sm:text-xs md:text-sm"
                          >
                            {header === "Time In / Out" ? (
                              <div className="flex flex-col text-[10px] sm:text-xs">
                                <span className="border-b border-gray-500 pb-0.5">
                                  Time In
                                </span>
                                <span className="pt-0.5">Time Out</span>
                              </div>
                            ) : (
                              header
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...workDetails, ...rows].map((row, index) => {
                        const isFetchedData = workDetails.some(
                          (w) => w.id === row.id
                        );
                        const isEditing = editingRow === row.id;

                        return (
                          <tr
                            key={`${row.id}-${index}`}
                            className="hover:bg-gray-100 border-t border-gray-300"
                          >
                            {/* # */}
                            <td className="border-2 border-gray-300 px-2 py-1 text-center font-medium">
                              {index + 1}
                            </td>

                            {/* Work Type */}
                            <td className="border-2 border-gray-300 px-2 py-1 font-medium">
                              {isFetchedData && !isEditing ? (
                                row.code
                              ) : (
                                <select
                                  value={
                                    isEditing ? editValues.code : row.code || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(row.id, "code", e.target.value)
                                  }
                                  className="w-full border-2 border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="GS">GS</option>
                                  <option value="MC">MC</option>
                                  <option value="EL">EL</option>
                                  <option value="BD">BD</option>
                                  <option value="DS">DS</option>
                                </select>
                              )}
                            </td>

                            {/* Work Description */}
                            <td className="border-2 border-gray-300 px-2 py-1 font-medium align-top w-[200px] max-w-[200px]">
                              {isFetchedData && !isEditing ? (
                                <div className="break-words whitespace-pre-wrap">
                                  {row.workDescription}
                                </div>
                              ) : (
                                <textarea
                                  value={
                                    isEditing
                                      ? editValues.workDescription
                                      : row.workDescription || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      row.id,
                                      "workDescription",
                                      e.target.value
                                    )
                                  }
                                  className="w-full resize-none overflow-y-hidden border border-gray-300 rounded px-2 py-1 font-medium leading-snug"
                                  rows={1}
                                  onInput={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                  }}
                                />
                              )}
                            </td>

                            {/* Est.Time */}
                            <td className="border-2 border-gray-300 px-2 py-1 text-center">
                              {isFetchedData && !isEditing ? (
                                row.EstimationTime
                              ) : (
                                <input
                                  value={
                                    isEditing
                                      ? editValues.EstimationTime
                                      : row.EstimationTime || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      row.id,
                                      "EstimationTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded px-2 py-1 font-medium"
                                />
                              )}
                            </td>

                            {/* Est. Cost */}
                            <td className="border-2 border-gray-300 px-2 py-1 text-center">
                              {isFetchedData && !isEditing ? (
                                row.totalcost
                              ) : (
                                <input
                                  type="number"
                                  value={
                                    isEditing
                                      ? editValues.totalcost
                                      : row.totalcost || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      row.id,
                                      "totalcost",
                                      e.target.value
                                    )
                                  }
                                  className="no-spinner w-full border border-gray-300 rounded px-2 py-1"
                                />
                              )}
                            </td>

                            {/* Assign To */}
                            <td className="border-2 border-gray-300 px-2 py-1">
                              {isFetchedData && !isEditing ? (
                                row.AssignTo || "N/A"
                              ) : (
                                <input
                                  type="text"
                                  value={
                                    isEditing
                                      ? editValues.AssignTo
                                      : row.AssignTo || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      row.id,
                                      "AssignTo",
                                      e.target.value
                                    )
                                  }
                                  className="no-spinner w-full border border-gray-300 rounded px-2 py-1"
                                />
                              )}
                            </td>

                            {/* Time In / Out */}
                            <td className="border-2 border-gray-300 px-2 py-1">
                              {isFetchedData && !isEditing ? (
                                <div className="text-center text-xs">
                                  <div className="border-b border-gray-400 pb-1">
                                    {row.TimeIn}
                                  </div>
                                  <div className="pt-1">{row.TimeOut}</div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <input
                                    type="datetime-local"
                                    value={
                                      isEditing
                                        ? editValues.TimeIn
                                        : row.TimeIn || ""
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        row.id,
                                        "TimeIn",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border-2 border-gray-300 rounded px-2 py-0.5 text-xs"
                                  />
                                  <input
                                    type="datetime-local"
                                    value={
                                      isEditing
                                        ? editValues.TimeOut
                                        : row.TimeOut || ""
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        row.id,
                                        "TimeOut",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-0.5 text-xs"
                                  />
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="border-2 border-gray-300 px-2 py-1">
                              {isFetchedData && !isEditing ? (
                                <span
                                  className={`px-2 py-1 rounded text-sm font-semibold
        ${
          row.status === "Completed"
            ? "bg-green-100 text-green-700"
            : row.status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : row.status === "In Progress"
            ? "bg-blue-100 text-blue-700"
            : row.status === "Started"
            ? "bg-purple-100 text-purple-700"
            : row.status === "notstarted"
            ? "bg-gray-100 text-gray-700"
            : "bg-red-100 text-red-700"
        }
      `}
                                >
                                  {row.status}
                                </span>
                              ) : (
                                <select
                                  value={
                                    isEditing
                                      ? editValues.status
                                      : row.status || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      row.id,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border-2 border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="notstarted">
                                    Not Started
                                  </option>
                                  <option value="Started">Started</option>
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">
                                    In Progress
                                  </option>
                                  <option value="Completed">Completed</option>
                                </select>
                              )}
                            </td>

                            <td className="border-2 border-gray-300 px-2 py-1 text-center w-36">
                              {isFetchedData && !isEditing ? (
                                <div className="relative w-full bg-gray-200 rounded-full h-4">
                                  <div
                                    className="bg-green-500 h-4 rounded-full text-xs text-white font-semibold flex items-center justify-center"
                                    style={{ width: `${row.progress || 0}%` }}
                                  >
                                    {row.progress || 0}%
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={
                                      isEditing
                                        ? editValues.progress
                                        : row.progress || 0
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        row.id,
                                        "progress",
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                    className="w-full"
                                  />
                                  <span className="w-10 text-xs text-gray-700">
                                    {isEditing
                                      ? editValues.progress
                                      : row.progress || 0}
                                    %
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Remark */}
                            <td className="border-2 border-gray-300 px-2 py-1">
                              {isFetchedData && !isEditing ? (
                                row.Remark
                              ) : (
                                <input
                                  value={
                                    isEditing
                                      ? editValues.Remark
                                      : row.Remark || ""
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      row.id,
                                      "Remark",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded px-2 py-1"
                                />
                              )}
                            </td>

                            {/* Actions */}
                            <td className="border-2 border-gray-300 px-2 py-1 relative">
                              <button
                                onClick={() =>
                                  setDropdownOpen(
                                    dropdownOpen === index ? null : index
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
                              >
                                Action <FiChevronDown size={16} />
                              </button>

                              {dropdownOpen === index && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-md z-20">
                                  <button
                                    onClick={() => handleViewA(row)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                                  >
                                    <FiEye className="inline mr-1" /> View
                                  </button>
                                  {isEditing ? (
                                    <button
                                      onClick={handleSave}
                                      className="w-full text-left px-3 py-2 text-green-600 hover:bg-gray-100 text-sm"
                                    >
                                      <FiSave className="inline mr-1" /> Save
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleEdit(row)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                                    >
                                      <FiEdit className="inline mr-1" /> Edit
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(row)}
                                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 text-sm"
                                  >
                                    <FiTrash2 className="inline mr-1" /> Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {viewData && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50 transition-all duration-300">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative animate-fadeInScale">
                      {/* Close Button */}
                      <button
                        onClick={() => setViewData(null)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                      >
                        ✖
                      </button>

                      <h2 className="text-xl font-bold mb-5 text-center text-gray-800">
                        📄 Work Details
                      </h2>

                      {/* Display work details */}
                      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                        {Object.entries(viewData).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex gap-2 text-sm items-start"
                          >
                            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-md capitalize whitespace-nowrap">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-700 break-words">
                              {value || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="text-red-500 text-sm mb-4">{error}</div>
                )}
                <div className="col-span-2 text-right">
                  <button
                    onClick={handleSubmit}
                    className="tracking-wider bg-green-600 hover:bg-green-800 text-white px-10 py-2 rounded-md mt-6 transition duration-300 focus:shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </main>
          <RequestSpare />
          <SpareChange />

          <OutSource />
        </main>
      </div>
    </div>
  );
};

export default AddToWorkOrder;
