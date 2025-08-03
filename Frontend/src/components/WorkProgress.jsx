import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";
import { motion } from "framer-motion";
import { Slider } from "@mui/material";
const WorkProgress = () => {
  const { id } = useParams(); // Get ID from URL params
  const location = useLocation();
  const navigate = useNavigate();
  // const [progress, setProgress] = useState(50);
  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(repair);

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/view-work/${id}`);
        if (response.data) {
          setRepair(response.data);

          // If work details exist, populate the table
          if (response.data.work_details) {
            setRows(
              response.data.work_details.map((item) => ({
                ...item,
                Progress: item.Progress || 50, // Default to 50 if undefined
              }))
            );
          }
        } else {
          setRepair(null);
        }
      } catch (error) {
        console.error("Error fetching repair details:", error);
        setRepair(null);
      }
    };

    fetchRepairById();
  }, [id]);

  const { plateNumber, customerName, jobTitle } = location.state || {};
  const [employee_id, setemployee_id] = useState("");
  const [repairs, setRepairs] = useState([]);
  const [employees, setEmployees] = useState([]);
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
  const [rows, setRows] = useState([
    {
      id: repair?.id,
      workDescription: "",
      code: repair?.id,
      AssignTo: "",
      TimeIn: "",
      TimeOut: "",
      status: "Pending",
      Progress: 50,
      Remark: "",
    },
  ]);
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        code: "",
        workDescription: "",
        AssignTo: "",
        EstimationTime: "",
        totalcost: "",
        TimeIn: "",
        TimeOut: "",
        Remark: "",
        status: "Pending",
      },
    ]);
  };

  console.log(rows);
  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleProgressChange = (id, newValue) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, Progress: newValue } : row
      )
    );
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    if (rows.some((row) => !row.workDescription)) {
      setError("Please provide a work description for all rows.");
      return;
    }

    const workProgressData = {
      job_card_no: id,
      plate_number: repair?.plate_number,
      customer_name: repair?.customer_name,
      repair_category: repair?.repair_category,
      work_details: rows, // Array of work details
    };

    try {
      await api.post("/work-progress", workProgressData);
      Swal.fire({
        title: "Success!",
        text: "Work progress has been successfully saved.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/check/${id}/work-progress`);
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Swal.fire({
        title: "Error!",
        text: "Failed to save the work progress. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

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

        <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-10 m-auto rounded-md">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <h2 className="uppercase tracking-wider text-blue-700 phone:text-md tablet:text-xl font-bold text-left mb-6">
              Check Work Progress
            </h2>
            <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
              {/* Job Card No */}
              <div className="grid phone:grid-cols-1 tablet:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Job Card No
                  </label>
                  <input
                    type="text"
                    value={id || ""}
                    disabled
                    className="mt-1 block dark:bg-gray-800 dark:text-white placeholder:dark:text-white w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Plate Number */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={repair?.plate_number || ""}
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

                {/* Repair Category */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Repair Category
                  </label>
                  <input
                    type="text"
                    value={repair?.repair_category || ""}
                    disabled
                    className="mt-1 block dark:bg-gray-800 dark:text-white w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <div className="overflow-x-auto phone:mt-20 tablet:mt-0">
                <table className="table-fixed min-w-full table-auto w-full border-collapse border border-table-border overflow-x-auto">
                  <thead className="bg-table-head text-white text-left text-sm">
                    <tr className="">
                      <th className="border border-table-border p-2 w-[40px]">
                        #
                      </th>
                      <th className="border border-table-border p-2 w-[80px]">
                        Code
                      </th>
                      <th className="border border-table-border p-2 w-[150px]">
                        Work Description
                      </th>
                      <th className="border border-table-border p-2  w-[150px]">
                        Assign To{" "}
                      </th>
                      <th className="border border-table-border p-2  w-[210px]">
                        Time In{" "}
                      </th>
                      <th className="border border-table-border p-2 w-[210px]">
                        Time Out{" "}
                      </th>
                      <th className="border border-table-border p-2 w-[120px]">
                        Status
                      </th>
                      <th className="border border-table-border p-2 w-[200px]">
                        Progress
                      </th>
                      <th className="border border-table-border p-2 w-[100px]">
                        Remark
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows?.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-t border-table-border dark:bg-gray-800 hover:bg-gray-50 hover:dark:bg-gray-600 transition"
                      >
                        <td className="border border-table-border p-2 w-1/6 text-center dark:text-gray-200">
                          {index + 1}
                        </td>
                        {/* code */}
                        <td className="border border-table-border p-2 w-1/3">
                          <input
                            type="text"
                            value={row?.code}
                            onChange={(e) =>
                              handleChange(row.id, "code", e.target.value)
                            }
                            disabled
                            rows="2"
                            className="w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border border-gray-300 rounded px-2 py-1"
                          ></input>
                        </td>
                        {/* work description */}
                        <td className="border border-table-border p-2 w-1/2">
                          <input
                            value={row?.workDescription}
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                "workDescription",
                                e.target.value
                              )
                            }
                            disabled
                            rows="2"
                            className="w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>

                        {/* Assign To */}
                        <td className="border border-table-border p-2 w-1/2">
                          <select
                            value={row.AssignTo}
                            onChange={(e) =>
                              handleChange(row.id, "AssignTo", e.target.value)
                            }
                            className="text-xs w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border rounded px-2 py-1 border-gray-300"
                          >
                            <option value="" className="text-xs">
                              Select Employee
                            </option>
                            {employees.map((emp) => (
                              <option
                                key={emp.id}
                                value={emp.full_name}
                                className="text-sm"
                              >
                                {emp.full_name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="border border-table-border p-2 w-1/4">
                          <input
                            type="datetime-local"
                            value={row.TimeIn}
                            onChange={(e) =>
                              handleChange(row.id, "TimeIn", e.target.value)
                            }
                            disabled
                            className="w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border border-table-border p-2 w-1/4">
                          <input
                            type="datetime-local"
                            value={row.TimeOut}
                            onChange={(e) =>
                              handleChange(row.id, "TimeOut", e.target.value)
                            }
                            disabled
                            className="w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border border-table-border p-2 w-1/4">
                          <select
                            value={row.status}
                            onChange={(e) =>
                              handleChange(row.id, "status", e.target.value)
                            }
                            className="w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border rounded px-2 py-2 border-gray-300"
                          >
                            <option value="notstarted">Not Started</option>
                            <option value="started">Started</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="border border-table-border p-2 w-1/4">
                          <div className="w-full dark:bg-gray-80 max-w-lg flex items-center gap-4">
                            <span className="text-gray-700 dark:text-gray-200 font-semibold">
                              {row.Progress}%
                            </span>
                            <Slider
                              value={row.Progress}
                              onChange={(_, newValue) =>
                                handleProgressChange(row.id, newValue)
                              }
                              min={1}
                              max={100}
                              sx={{ color: "#3b82f6" }}
                            />
                          </div>
                        </td>
                        <td className="border border-table-border p-2 w-1/4">
                          <input
                            value={row.Remark}
                            onChange={(e) =>
                              handleChange(row.id, "Remark", e.target.value)
                            }
                            rows="2"
                            className="w-full dark:bg-gray-800 placeholder:dark:text-gray-200 dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}
              <div className="col-span-2 text-right">
                <button
                  onClick={handleSubmit}
                  className="tracking-wider bg-blue-600 hover:bg-blue-800 text-white px-10 py-2 rounded-md mt-6 transition duration-300 focus:shadow-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkProgress;
