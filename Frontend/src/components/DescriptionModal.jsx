/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";
import PrintableJobPage from "./PrintableJobPage";
import { useReactToPrint } from "react-to-print";

const DescriptionPage = ({}) => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Job info
  const [jobInfo, setJobInfo] = useState({
    jobId: "",
    customer_name: "",
    mobile: "",
    product_name: "",
  });

  // Data states
  const [tasks, setTasks] = useState([]);
  const [spares, setSpares] = useState([]);
  const [otherCost, setOtherCost] = useState("");
  const [status, setStatus] = useState("not started");
  const [progress, setProgress] = useState(0);
  const [labourStatus, setLabourStatus] = useState("not started");

  // For inline editing
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingSpareIndex, setEditingSpareIndex] = useState(null);
  const [newTask, setNewTask] = useState(null);
  const [newSpare, setNewSpare] = useState(null);

  // Fetch job details on mount
  // Job Info
  useEffect(() => {
    const fetchJobInfo = async () => {
      try {
        const response = await api.get(`/repairs/job/${id}`);
        const job = response.data;
        setJobInfo({
          jobId: job.jobId || id,
          customer_name: job.customer_name || "",
          mobile: job.mobile || "",
          product_name: job.product_name || "",
        });
      } catch (error) {
        console.error("Error fetching job info:", error);
        Swal.fire("Error", "Failed to fetch job info", "error");
      }
    };

    if (id) fetchJobInfo();
  }, [id]);

  // Tasks, Spares, Other Cost, Status
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/repairsdetail/${id}`);
        const job = response.data;

        setTasks(job.tasks || []);
        setSpares(job.spares || []);
        setOtherCost(job.other_cost || "");
        setStatus(job.status || "not started");
        setProgress(job.progress || 0);
        setLabourStatus(job.labour_status || "not started");
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching job details:", error);
          Swal.fire("Error", "Failed to fetch job details", "error");
        }
      }
    };

    if (id) fetchJobDetails();
  }, [id]);

  const printRef = useRef();
  const [applyVAT, setApplyVAT] = useState(false);
  const VAT_RATE = 0.15; // 15% for example

  const handlePrint = useReactToPrint({
    contentRef: printRef, // ✅ new API
  });
  // Compute totals
  const totalTaskCost = tasks.reduce(
    (sum, t) => sum + parseFloat(t.cost || 0),
    0
  );
  const totalSpareCost = spares.reduce(
    (sum, s) => sum + parseFloat(s.cost || 0),
    0
  );
  const subTotal = totalTaskCost + totalSpareCost + parseFloat(otherCost || 0);
  const totalVAT = applyVAT ? subTotal * VAT_RATE : 0;
  const totalCost = subTotal + totalVAT;
  // const totalCost = totalTaskCost + totalSpareCost + parseFloat(otherCost || 0);

  // General update function to sync with backend
  const saveToBackend = async (updatedData = {}) => {
    try {
      const subTotal =
        (updatedData.tasks ?? tasks).reduce(
          (sum, t) => sum + parseFloat(t.cost || 0),
          0
        ) +
        (updatedData.spares ?? spares).reduce(
          (sum, s) => sum + parseFloat(s.cost || 0),
          0
        ) +
        parseFloat(updatedData.other_cost || 0);

      const vatApplied = updatedData.vat_applied ?? applyVAT;
      const vatAmount = vatApplied ? subTotal * VAT_RATE : 0;
      const grandTotal = subTotal + vatAmount;

      const payload = {
        job_id: jobInfo.jobId,
        tasks: updatedData.tasks ?? tasks,
        spares: updatedData.spares ?? spares,
        other_cost: parseFloat(updatedData.other_cost || 0),
        vat_applied: vatApplied,
        vat_amount: vatAmount,
        total_cost: grandTotal,

        progress: updatedData.progress ?? progress,
      };

      await api.put(`/repairsdetail/${jobInfo.jobId}`, payload);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update data", "error");
    }
  };

  // Tasks
  const handleTaskUpdate = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
    saveToBackend({ tasks: updated });
  };

  const handleTaskDelete = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
    saveToBackend({ tasks: updated });
  };

  const handleNewTaskSave = () => {
    if (newTask) {
      const updated = [...tasks, newTask];
      setTasks(updated);
      setNewTask(null);
      saveToBackend({ tasks: updated });
    }
  };

  // Spares
  const handleSpareUpdate = (index, field, value) => {
    const updated = [...spares];
    updated[index][field] = value;
    setSpares(updated);
    saveToBackend({ spares: updated });
  };

  const handleSpareDelete = (index) => {
    const updated = spares.filter((_, i) => i !== index);
    setSpares(updated);
    saveToBackend({ spares: updated });
  };

  const handleNewSpareSave = () => {
    if (newSpare) {
      const updated = [...spares, newSpare];
      setSpares(updated);
      setNewSpare(null);
      saveToBackend({ spares: updated });
    }
  };

  // Other & Status updates
  // const handleOtherCostChange = (value) => {
  //   setOtherCost(value);
  //   saveToBackend({ otherCost: value });
  // };

  const handleProgressChange = (value) => {
    setProgress(value);
    saveToBackend({ progress: value });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    saveToBackend({ status: value });
  };

  // Update labour status
  // const handleLabourStatusChange = (value) => {
  //   setLabourStatus(value);
  //   saveToBackend({ labour_status: value });
  // };

  const handleOtherCostChange = (value) => {
    setOtherCost(value);
  };

  const handleSave = async () => {
    try {
      const payload = {
        job_id: jobInfo.jobId,
        tasks,
        spares,
        other_cost: parseFloat(otherCost || ""),
        vat_applied: applyVAT, // use applyVAT state
        vat_amount: totalVAT, // computed VAT
        total_cost: totalCost, // computed Grand Total
        status,
        // labour_status: labourStatus, // uncomment if you want to save it
        progress,
      };

      await api.put(`/repairsdetail/${jobInfo.jobId}`, payload);

      Swal.fire("Success", "Job saved successfully", "success");
    } catch (error) {
      console.error("Error while saving:", error.response?.data || error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to save job data",
        "error"
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="absolute z-[999] top-6 left-2">
          <BackButton />
        </div>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="max-w-6xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              Task & Spare Details
            </h2>

            {/* Job Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="font-medium">Job ID:</label>
                <p className="p-2 bg-gray-100 rounded">{jobInfo.jobId}</p>
              </div>
              <div>
                <label className="font-medium">Customer Name:</label>
                <p className="p-2 bg-gray-100 rounded">
                  {jobInfo.customer_name}
                </p>
              </div>
              <div>
                <label className="font-medium">Mobile:</label>
                <p className="p-2 bg-gray-100 rounded">{jobInfo.mobile}</p>
              </div>
              <div>
                <label className="font-medium">Product Name:</label>
                <p className="p-2 bg-gray-100 rounded">
                  {jobInfo.product_name}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <label className="font-medium text-gray-700">Progress:</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => handleProgressChange(e.target.value)}
                  className="flex-1"
                />
                <span className="font-semibold">{progress}%</span>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800">Tasks</h2>
                <button
                  onClick={() =>
                    setNewTask({ name: "", cost: "", status: "not started" })
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  + Add Task
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-300 text-gray-900 text-xs uppercase">
                    <tr>
                      <th className="p-3 w-[45%]">Task Name</th>
                      <th className="p-3 w-[20%]">Cost</th>
                      <th className="p-3 w-[20%]">Status</th>
                      <th className="p-3 w-[20%]">Assign To</th>

                      <th className="p-3 w-[15%] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 flex items-center gap-2">
                          {/* Numbering */}
                          <span className="font-semibold text-gray-600">
                            {i + 1}.
                          </span>

                          {/* Task Name */}
                          {editingTaskIndex === i ? (
                            <input
                              value={task.name}
                              onChange={(e) =>
                                handleTaskUpdate(i, "name", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm"
                              placeholder="Enter task name"
                            />
                          ) : (
                            <span>{task.name}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {editingTaskIndex === i ? (
                            <input
                              type="number"
                              value={task.cost}
                              onChange={(e) =>
                                handleTaskUpdate(i, "cost", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm"
                              // placeholder="0.00"
                            />
                          ) : (
                            <span>{task.cost}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingTaskIndex === i ? (
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleTaskUpdate(i, "status", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="not started">Not Started</option>
                              <option value="started">Started</option>
                              <option value="pending">Pending</option>
                              <option value="in progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          ) : (
                            <span
                              className={`capitalize px-2 py-1 rounded-full text-white text-xs font-medium ${
                                task.status === "not started"
                                  ? "bg-gray-400"
                                  : task.status === "started"
                                  ? "bg-blue-500"
                                  : task.status === "pending"
                                  ? "bg-yellow-500"
                                  : task.status === "in progress"
                                  ? "bg-indigo-500"
                                  : task.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            >
                              {task.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingTaskIndex === i ? (
                            <input
                              type="text"
                              value={task.assign_to}
                              onChange={(e) =>
                                handleTaskUpdate(i, "assign_to", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm"
                              placeholder="enter a name"
                            />
                          ) : (
                            <span>{task.assign_to}</span>
                          )}
                        </td>

                        <td className="p-3 flex justify-center gap-2">
                          {editingTaskIndex === i ? (
                            <button
                              onClick={() => setEditingTaskIndex(null)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                            >
                              Save
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingTaskIndex(i)}
                                className="px-2 py-1 text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleTaskDelete(i)}
                                className="px-2 py-1 text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}

                    {newTask && (
                      <tr className="bg-gray-50">
                        <td className="p-3">
                          <input
                            value={newTask.name}
                            onChange={(e) =>
                              setNewTask({ ...newTask, name: e.target.value })
                            }
                            className="p-2 border rounded-md w-full text-sm"
                            placeholder="Enter task name"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={newTask.cost}
                            onChange={(e) =>
                              setNewTask({ ...newTask, cost: e.target.value })
                            }
                            className="p-2 border rounded-md w-full text-sm no-spinner"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={newTask.status}
                            onChange={(e) =>
                              setNewTask({ ...newTask, status: e.target.value })
                            }
                            className="p-2 border rounded-md w-full text-sm"
                          >
                            <option>not started</option>
                            <option>started</option>
                            <option>pending</option>
                            <option>in progress</option>
                            <option>completed</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={newTask.assign_to}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                assign_to: e.target.value,
                              })
                            }
                            className="p-2 border rounded-md w-full text-sm"
                            placeholder=" "
                          />
                        </td>
                        <td className="p-3 flex justify-center gap-2">
                          <button
                            onClick={handleNewTaskSave}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setNewTask(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-xs"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-right font-medium text-gray-700">
                Total Task Cost:{" "}
                <span className="text-green-600">{totalTaskCost}</span>
              </p>
            </div>

            {/* Spares Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800">Spares</h2>
                <button
                  onClick={() => setNewSpare({ name: "", cost: "" })}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  + Add Spare
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-300 text-gray-900 text-xs uppercase">
                    <tr>
                      <th className="p-3 w-[60%]">Spare Name</th>
                      <th className="p-3 w-[25%]">Cost</th>

                      <th className="p-3 w-[15%] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {spares.map((spare, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-semibold text-gray-600">
                            {i + 1}.
                          </span>
                          {editingSpareIndex === i ? (
                            <input
                              value={spare.name}
                              onChange={(e) =>
                                handleSpareUpdate(i, "name", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm"
                              placeholder="Enter spare name"
                            />
                          ) : (
                            <span>{spare.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingSpareIndex === i ? (
                            <input
                              type="number"
                              value={spare.cost}
                              onChange={(e) =>
                                handleSpareUpdate(i, "cost", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm"
                              placeholder="0.00"
                            />
                          ) : (
                            <span>{spare.cost}</span>
                          )}
                        </td>
                        <td className="p-3 flex justify-center gap-2">
                          {editingSpareIndex === i ? (
                            <button
                              onClick={() => setEditingSpareIndex(null)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                            >
                              Save
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingSpareIndex(i)}
                                className="px-2 py-1 text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSpareDelete(i)}
                                className="px-2 py-1 text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}

                    {newSpare && (
                      <tr className="bg-gray-50">
                        <td className="p-3">
                          <input
                            value={newSpare.name}
                            onChange={(e) =>
                              setNewSpare({ ...newSpare, name: e.target.value })
                            }
                            className="p-2 border rounded-md w-full text-sm"
                            placeholder="Enter spare name"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={newSpare.cost}
                            onChange={(e) =>
                              setNewSpare({ ...newSpare, cost: e.target.value })
                            }
                            className="p-2 border rounded-md w-full text-sm no-spinner"
                            // placeholder="0.00"
                          />
                        </td>
                        <td className="p-3 flex justify-center gap-2">
                          <button
                            onClick={handleNewSpareSave}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setNewSpare(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-xs"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-right font-medium text-gray-700">
                Total Spare Cost:{" "}
                <span className="text-green-600">{totalSpareCost}</span>
              </p>
            </div>

            {/* Other Costs & Status */}
            <div className="mb-6">
              <label className="font-medium">Other Cost:</label>
              <input
                type="number"
                value={otherCost}
                onChange={(e) => handleOtherCostChange(e.target.value)}
                className="w-full p-2 border rounded no-spinner"
              />
            </div>

            {/* VAT Section */}
            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="vat"
                checked={applyVAT}
                onChange={(e) => setApplyVAT(e.target.checked)}
                className="w-4 h-4"
              />
              <label
                htmlFor="vat"
                className="text-sm font-medium text-gray-700"
              >
                Apply VAT ({VAT_RATE * 100}%)
              </label>
            </div>

            {/* Totals */}
            <div className="mb-6">
              <label className="font-medium">
                Subtotal (Tasks + Spares + Other):
              </label>
              <p className="p-2 bg-gray-100 rounded">{subTotal.toFixed(2)}</p>
            </div>

            {applyVAT && (
              <div className="mb-6">
                <label className="font-medium">Total VAT:</label>
                <p className="p-2 bg-gray-100 rounded">{totalVAT.toFixed(2)}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="font-medium">Grand Total:</label>
              <p className="p-2 bg-gray-100 rounded">{totalCost.toFixed(2)}</p>
            </div>

            <div style={{ display: "none" }}>
              <PrintableJobPage
                ref={printRef}
                jobInfo={jobInfo}
                tasks={tasks}
                spares={spares}
                otherCost={otherCost}
                status={status}
                totalCost={totalCost}
                totalvat={totalVAT}
              />
            </div>

            {/* Buttons */}
            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-yellow-600 text-white rounded"
              >
                Print
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DescriptionPage;
