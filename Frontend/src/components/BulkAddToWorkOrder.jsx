import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";

const BulkAddToWorkOrder = () => {
  //   const { id } = useParams(); // Get ID from URL params
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRows = location.state?.selectedRows || [];
  const [repairs, setRepairs] = useState([]);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workDetails, setWorkDetails] = useState({});

  //   console.log(repairs);
  console.log(selectedRows);
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const responses = await Promise.all(
          selectedRows.map((id) => api.get(`/repairs/${id}`))
        );
        setRepairs(responses.map((res) => res.data));
      } catch (error) {
        console.error("Error fetching repair details:", error);
      }
    };

    if (selectedRows.length > 0) {
      fetchRepairs();
    }
  }, [selectedRows]);
  const { plateNumber, customerName, jobTitle } = location.state || {};
  const [employee_id, setemployee_id] = useState("");
  //   const [repairs, setRepairs] = useState([]);
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
      id: 1,
      workDescription: "",
      code: "",
      AssignTo: "",
      EstimationTime: "",
      totalcost: "",
      TimeIn: "",
      TimeOut: "",
      Remark: "",
      status: "Pending",
    },
  ]);
  const addRow = (repairId) => {
    setWorkDetails((prevDetails) => ({
      ...prevDetails,
      [repairId]: [
        ...(prevDetails[repairId] || []),
        {
          id: (prevDetails[repairId]?.length || 0) + 1,
          workDescription: "",
          code: "",
          AssignTo: "",
          EstimationTime: "",
          totalcost: "",
          TimeIn: "",
          TimeOut: "",
          Remark: "",
          status: "Pending",
        },
      ],
    }));
  };

  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value, // Update the changed field
              // totalcost:
              //   field === "EstimationTime"
              //     ? Number(value) * Number(row.unit) // Update totalcost when EstimationTime changes
              //     : field === "unit"
              //     ? Number(value) * Number(row.EstimationTime) // Update totalcost when unit changes
              //     : row.totalcost, // Keep totalcost unchanged if other fields are updated
            }
          : row
      )
    );
  };

  const handleWorkDetailChange = (repairId, rowId, field, value) => {
    setWorkDetails((prevDetails) => ({
      ...prevDetails,
      [repairId]:
        prevDetails[repairId]?.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row
        ) || [],
    }));
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSubmit = () => {
    const newWorkOrders = repairs.map((repair) => ({
      job_card_no: repair.id,
      plate_number: repair.plate_no,
      customer_name: repair.customer_name,
      repair_category: Array.isArray(repair.repair_category)
        ? repair.repair_category.join(", ") // Convert array to a comma-separated string
        : repair.repair_category,
      work_details: workDetails[repair.id] || [],
    }));

    console.log(newWorkOrders);

    api
      .post("/bulk-work-order", { work_orders: newWorkOrders })
      .then(() => {
        Swal.fire("Success", "Work orders saved.", "success").then(() => {
          navigate("/job-manager/repair");
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire("Error", "Failed to save work orders.", "error");
      });
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
              Add to Work Order
            </h2>
            <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
              {/* Job Card No */}

              <div className="overflow-x-auto">
                {repairs.map((repair) => (
                  <div
                    key={repair.id}
                    className="border rounded-sm p-4 mb-6 overflow-x-auto"
                  >
                    <div className="flex gap-4">
                      <h3 className="text-lg font-bold text-blue-700 border rounded-sm p-2 py-[2px]">
                        Job Order: {repair.id}
                      </h3>
                      <p className="border rounded-sm p-2 py-[2px]">
                        Plate Number: {repair.plate_no}
                      </p>
                      <p className="border rounded-sm p-2 py-[2px]">
                        Customer Name: {repair.customer_name}
                      </p>
                      <p className="border rounded-sm p-2 py-[2px]">
                        Repair Category: {repair.repair_category}
                      </p>
                    </div>

                    <button
                      onClick={() => addRow(repair.id)}
                      className="mt-2 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      + Add New Work
                    </button>

                    <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
                      <thead className="bg-green-700 text-white text-left text-sm">
                        <tr className="">
                          <th className="border border-green-300 p-2 w-[40px]">
                            #
                          </th>
                          <th className="border border-green-300 p-2 w-[80px]">
                            Code
                          </th>
                          <th className="border border-green-300 p-2 w-[150px]">
                            {" "}
                            Description
                          </th>
                          <th className="border border-green-300 p-2 w-[150px]">
                            Est.Time
                          </th>
                          <th className="border border-green-300 p-2 w-[150px]">
                            Est.Cost
                          </th>
                          <th className="border border-green-300 p-2 w-[150px]">
                            Assign To{" "}
                          </th>
                          <th className="border border-green-300 p-2 w-[210px]">
                            Time In{" "}
                          </th>
                          <th className="border border-green-300 p-2 w-[210px]">
                            Time Out{" "}
                          </th>
                          <th className="border border-green-300 p-2 w-[100px]">
                            Status
                          </th>
                          <th className="border border-green-300 p-2 w-[100px]">
                            Remark
                          </th>
                          <th className="border border-green-300 p-2 w-[100px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(workDetails[repair.id] || []).map((row) => (
                          <tr key={row.id} className="border">
                            <td className="border p-2">{row.id}</td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={row.code}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "code",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={row.workDescription}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "workDescription",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="number"
                                value={row.EstimationTime}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "EstimationTime",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="number"
                                value={row.totalcost}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "totalcost",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={row.AssignTo}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "AssignTo",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="datetime-local"
                                value={row.TimeIn}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "TimeIn",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="datetime-local"
                                value={row.TimeOut}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "TimeOut",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <select
                                value={row.status}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Started">Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={row.Remark}
                                onChange={(e) =>
                                  handleWorkDetailChange(
                                    repair.id,
                                    row.id,
                                    "Remark",
                                    e.target.value
                                  )
                                }
                                className="border dark:bg-gray-800 dark:text-white placeholder:dark:text-white p-1 w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <button
                                onClick={() =>
                                  setWorkDetails((prev) => ({
                                    ...prev,
                                    [repair.id]: prev[repair.id].filter(
                                      (r) => r.id !== row.id
                                    ),
                                  }))
                                }
                                className="bg-red-500 text-white px-2 py-1 rounded"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
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

export default BulkAddToWorkOrder;
