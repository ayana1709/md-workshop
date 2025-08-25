/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";
import { Pencil } from "lucide-react"; // edit icon

const DescriptionPage = () => {
  const { id } = useParams();
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
  // Component states
  const [tasks, setTasks] = useState([]);
  const [spares, setSpares] = useState([]);
  const [newTask, setNewTask] = useState(null); // <-- add this
  const [newSpare, setNewSpare] = useState(null); // <-- optional
  const [otherCost, setOtherCost] = useState(0);
  const [status, setStatus] = useState("not started");
  const [progress, setProgress] = useState(0);
  const [labourStatus, setLabourStatus] = useState("not started");

  // For editing
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingSpareIndex, setEditingSpareIndex] = useState(null);
  // Add this function inside your component
  const handleTaskDelete = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSpareDelete = (index) => {
    setSpares(spares.filter((_, i) => i !== index));
  };

  // Load Job
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/repairs/${id}`);
        const job = response.data;

        setJobInfo({
          jobId: job.jobId || job.id || id,
          customer_name: job.customer_name || "",
          mobile: job.mobile || "",
          product_name: job.product_name || "",
        });

        setTasks(job.tasks || []);
        setSpares(job.spares || []);
        setOtherCost(job.otherCost || 0);
        setStatus(job.status || "not started");
        setProgress(job.progress || 0);
        setLabourStatus(job.labourStatus || "not started");
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching job:", error);
          Swal.fire("Error", "Failed to fetch job data", "error");
        }
      }
    };

    if (id) fetchJob();
  }, [id]);

  // Totals
  const totalTaskCost = tasks.reduce(
    (sum, t) => sum + (parseFloat(t.cost) || 0),
    0
  );
  const totalSpareCost = spares.reduce(
    (sum, s) => sum + (parseFloat(s.cost) || 0),
    0
  );
  const totalCost = totalTaskCost + totalSpareCost + parseFloat(otherCost || 0);

  // Save
  const handleSave = async () => {
    try {
      const payload = {
        jobId: jobInfo.jobId,
        customer_name: jobInfo.customer_name,
        mobile: jobInfo.mobile,
        product_name: jobInfo.product_name,
        tasks,
        spares,
        otherCost: parseFloat(otherCost) || 0,
        totalCost,
        labourStatus,
        status,
        progress: parseInt(progress) || 0,
      };

      let exists = true;
      try {
        await api.get(`/repairsdetail/${jobInfo.jobId}`);
      } catch (err) {
        if (err.response?.status === 404) exists = false;
        else throw err;
      }

      if (exists) {
        await api.put(`/repairsdetail/${jobInfo.jobId}`, payload);
      } else {
        await api.post(`/repairsdetail`, payload);
      }

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

  // Inline update for task/spare
  const handleTaskUpdate = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSpareUpdate = (index, field, value) => {
    const updated = [...spares];
    updated[index][field] = value;
    setSpares(updated);
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
          <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              Task Description
            </h2>

            {/* Job Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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
                  onChange={(e) => setProgress(e.target.value)}
                  className="flex-1"
                />
                <span className="font-semibold">{progress}%</span>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-800">Tasks</h2>
                <button
                  onClick={() =>
                    setNewTask({ name: "", cost: "", status: "not started" })
                  }
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm shadow-sm transition"
                >
                  + Add Task
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                    <tr>
                      <th className="p-3 w-[45%]">Task Name</th>
                      <th className="p-3 w-[20%]">Cost</th>
                      <th className="p-3 w-[20%]">Status</th>
                      <th className="p-3 w-[15%] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3">
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
                              placeholder="0.00"
                            />
                          ) : (
                            <span>${task.cost}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingTaskIndex === i ? (
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleTaskUpdate(i, "status", e.target.value)
                              }
                              className="p-2 border rounded-md w-full text-sm"
                            >
                              <option>not started</option>
                              <option>started</option>
                              <option>pending</option>
                              <option>in progress</option>
                              <option>completed</option>
                            </select>
                          ) : (
                            <span className="capitalize">{task.status}</span>
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

                    {/* New Task Row Form */}
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
                            className="p-2 border rounded-md w-full text-sm"
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
                        <td className="p-3 flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setTasks([...tasks, newTask]);
                              setNewTask(null);
                            }}
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
                <span className="text-green-600">${totalTaskCost}</span>
              </p>
            </div>

            {/* Other & Totals */}
            <div className="mb-6">
              <label className="font-medium">Other Cost:</label>
              <input
                type="number"
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-6">
              <label className="font-medium">Total Cost:</label>
              <p className="p-2 bg-gray-100 rounded">{totalCost}</p>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="font-medium">Overall Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option>not started</option>
                <option>started</option>
                <option>pending</option>
                <option>in progress</option>
                <option>completed</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => window.print()}
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
