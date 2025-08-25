import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import BackButton from "./BackButton";

const DescriptionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States
  const [jobId, setJobId] = useState(id || "");
  const [tasks, setTasks] = useState([{ name: "", cost: 0 }]);
  const [labourStatus, setLabourStatus] = useState("not started");
  const [spares, setSpares] = useState([{ name: "", cost: 0 }]);
  const [otherCost, setOtherCost] = useState(0);
  const [status, setStatus] = useState("not started");
  const [progress, setProgress] = useState(0);

  // Load Job
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/repairsdetail/${id}`);
        const job = response.data;

        setJobId(job.jobId || job.id || id);
        // make sure backend returns jobId
        setTasks(job.tasks || [{ name: "", cost: "" }]);
        setLabourStatus(job.labourStatus || "not started");
        setSpares(job.spares || [{ name: "", cost: "" }]);
        setOtherCost(job.other_cost || 0);
        setStatus(job.status || "not started");
        setProgress(job.progress || 0);
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn("No repair detail found yet, will create on save.");
        } else {
          console.error("Error fetching job:", error);
          Swal.fire("Error", "Failed to fetch job data", "error");
        }
      }
    };

    if (id) fetchJob();
  }, [id]);

  // Handlers
  const addTask = () => setTasks([...tasks, { name: "", cost: "" }]);
  const updateTask = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = field === "cost" ? parseFloat(value) || "" : value;
    setTasks(newTasks);
  };

  const addSpare = () => setSpares([...spares, { name: "", cost: "" }]);
  const updateSpare = (index, field, value) => {
    const newSpares = [...spares];
    newSpares[index][field] =
      field === "cost" ? parseFloat(value) || "" : value;
    setSpares(newSpares);
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      type === "task" ? addTask() : addSpare();
    }
  };

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
        jobId, // 👈 required for POST
        tasks: tasks.map((t) => ({
          name: t.name || "",
          cost: parseFloat(t.cost) || 0,
        })),
        spares: spares.map((s) => ({
          name: s.name || "",
          cost: parseFloat(s.cost) || 0,
        })),
        otherCost: parseFloat(otherCost) || 0,
        totalCost,
        labourStatus,
        status,
        progress: parseInt(progress) || 0,
      };

      console.log("Data to be sent:", payload);

      // check existence by trying GET
      let exists = true;
      try {
        await api.get(`/repairsdetail/${jobId}`);
      } catch (err) {
        if (err.response?.status === 404) exists = false;
        else throw err;
      }

      if (exists) {
        await api.put(`/repairsdetail/${jobId}`, payload);
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

  const handleClear = () => {
    setTasks([{ name: "", cost: "" }]);
    setSpares([{ name: "", cost: "" }]);
    setOtherCost(0);
    setStatus("not started");
    setLabourStatus("not started");
    setProgress(0);
  };
  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };
  const removeSpare = (index) => {
    setSpares(spares.filter((_, i) => i !== index));
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

            <div className="space-y-6">
              {/* 1. Job ID */}
              <div>
                <label className="font-medium text-gray-700">Job ID:</label>
                <input
                  type="text"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 2. Tasks */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="font-medium text-gray-700">Tasks:</label>
                  <button
                    type="button"
                    onClick={addTask}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                  >
                    + Add Row
                  </button>
                </div>
                <table className="w-full mt-2 border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 border">Task Name</th>
                      <th className="p-2 border">Cost</th>
                      <th className="p-2 border text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr key={index}>
                        <td className="border p-1 flex items-center gap-1">
                          <span className="text-gray-600">{index + 1}.</span>
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) =>
                              updateTask(index, "name", e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, "task")}
                            className="w-full p-1 border rounded"
                          />
                        </td>

                        <td className="border p-1">
                          <input
                            type="number"
                            value={task.cost}
                            onChange={(e) =>
                              updateTask(index, "cost", e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, "task")}
                            className="w-full p-1 border rounded no-spinner"
                          />
                        </td>

                        <td className="border p-1 text-center">
                          <button
                            onClick={() => removeTask(index)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-2 text-right font-medium text-gray-700">
                  Total Task Cost: {totalTaskCost}
                </p>
              </div>

              {/* 3. Labour Status */}
              <div>
                <label className="font-medium text-gray-700">
                  Labour Status:
                </label>
                <select
                  value={labourStatus}
                  onChange={(e) => setLabourStatus(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option>not started</option>
                  <option>started</option>
                  <option>pending</option>
                  <option>in progress</option>
                  <option>completed</option>
                </select>
              </div>

              {/* 4. Spares */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="font-medium text-gray-700">Spares:</label>
                  <button
                    type="button"
                    onClick={addSpare}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                  >
                    + Add Row
                  </button>
                </div>
                <table className="w-full mt-2 border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 border">Spare Name</th>
                      <th className="p-2 border">Cost</th>
                      <th className="p-2 border w-10">X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spares.map((spare, index) => (
                      <tr key={index}>
                        {/* Spare Name with number */}
                        <td className="border p-1 flex items-center gap-1">
                          <span className="text-gray-600">{index + 1}.</span>
                          <input
                            type="text"
                            value={spare.name}
                            onChange={(e) =>
                              updateSpare(index, "name", e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, "spare")}
                            className="w-full p-1 border rounded"
                          />
                        </td>

                        {/* Cost */}
                        <td className="border p-1">
                          <input
                            type="number"
                            value={spare.cost}
                            onChange={(e) =>
                              updateSpare(index, "cost", e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, "spare")}
                            className="w-full p-1 border rounded no-spinner"
                          />
                        </td>

                        {/* Remove button */}
                        <td className="border p-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeSpare(index)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-2 text-right font-medium text-gray-700">
                  Total Spare Cost: {totalSpareCost}
                </p>
              </div>

              {/* 5. Other Cost */}
              <div>
                <label className="font-medium text-gray-700">Other Cost:</label>
                <input
                  type="number"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md no-spinner"
                />
              </div>

              {/* 6. Total Cost */}
              <div>
                <label className="font-medium text-gray-700">Total Cost:</label>
                <input
                  type="number"
                  value={totalCost}
                  readOnly
                  className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                />
              </div>

              {/* 7. Overall Status */}
              <div>
                <label className="font-medium text-gray-700">
                  Overall Status:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option>not started</option>
                  <option>started</option>
                  <option>pending</option>
                  <option>in progress</option>
                  <option>completed</option>
                </select>
              </div>

              {/* 8. Progress */}
              <div>
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
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Clear
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Print
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Remove number spinners */}
      <style>
        {`
        .no-spinner::-webkit-inner-spin-button,
        .no-spinner::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinner {
          -moz-appearance: textfield;
        }

        @media print {
  body {
    background: #fff; /* Ensure white background */
    color: #000; /* Black text for printing */
  }

  /* Hide buttons and navigation */
  .no-print {
    display: none !important;
  }

  /* Table styling for print */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  table th, table td {
    border: 1px solid #000;
    padding: 0.5rem;
    font-size: 12pt;
  }

  /* Adjust layout for print */
  .print-container {
    padding: 1rem;
  }

  /* Avoid breaking tables across pages */
  table, tr, td, th {
    page-break-inside: avoid;
  }
}

      `}
      </style>
    </div>
  );
};

export default DescriptionPage;
