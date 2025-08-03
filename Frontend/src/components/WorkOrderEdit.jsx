import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";

const WorkOrderEdit = () => {
  const { id } = useParams(); // Get ID from URL params
  const location = useLocation();
  const navigate = useNavigate();

  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { plateNumber, customerName, jobTitle } = location.state || {};
  const [employee_id, setemployee_id] = useState("");
  const [repairs, setRepairs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    job_card_no: repair?.id || "",
    plate_number: repair?.plate_number || "",
    customer_name: repair?.customer_name || "",
    repair_category: repair?.repair_category || "",
  });

  const [rows, setRows] = useState([
    {
      id: 1,
      workDescription: "",
      code: "",
      AssignTo: "",
      EstimationTime: "",
      unit: "",
      totalcost: "",
      TimeIn: "",
      TimeOut: "",
      Remark: "",
      status: "Pending",
    },
  ]);
  console.log(rows);

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return; // Ensure ID is available before fetching

      try {
        const response = await api.get(`/view-work/${id}`);
        console.log("Fetched Repair Data:", response.data); // Debugging

        setRepair(response.data); // Store the fetched repair object
        setFormData(response.data);

        // Deep copy to ensure React tracks updates
        const workDetailsCopy = response.data.work_details.map((item) => ({
          ...item,
        }));
        setRows(workDetailsCopy);
      } catch (error) {
        console.error("Error fetching repair details:", error);
        setRepair(null);
      }
    };

    fetchRepairById();
  }, [id]); // Run only when `id` changes

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

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        code: "",
        workDescription: "",
        AssignTo: "",
        EstimationTime: "",
        unit: "",
        totalcost: "",
        TimeIn: "",
        TimeOut: "",
        Remark: "",
        status: "Pending",
      },
    ]);
  };
  const handleChange = (id, field, value) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              totalcost:
                field === "EstimationTime"
                  ? Number(value) * Number(row.unit)
                  : field === "unit"
                  ? Number(value) * Number(row.EstimationTime)
                  : row.totalcost,
            }
          : row
      );

      return [...updatedRows]; // Ensure a new array reference
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    if (rows.some((row) => !row.workDescription)) {
      setError("Please provide a work description for all rows.");
      return;
    }

    const updatedWorkOrder = {
      job_card_no: formData?.id,
      plate_number: formData?.plate_number,
      customer_name: formData?.customer_name,
      repair_category: formData?.repair_category,
      work_details: rows, // Array of work details
    };

    try {
      const response = await api.put(`/update-work/${id}`, updatedWorkOrder);
      Swal.fire({
        title: "Success!",
        text: "Work order has been successfully updated.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/job-manager/repair");
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Swal.fire({
        title: "Error!",
        text: "Failed to update the work order. Please try again.",
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
        {/* Site Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow bg-white w-[95%] mt-10 m-auto rounded-md">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <h2 className="uppercase tracking-wider text-blue-700 phone:text-md tablet:text-xl font-bold text-left mb-6">
              Add to Work Order
            </h2>
            <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
              {/* Job Card No */}
              <div className="grid phone:grid-cols-1 tablet:grid-cols-2 gap-4">
                {/* Job Card No (Always Read-Only) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Card No
                  </label>
                  <input
                    type="text"
                    value={formData.job_card_no}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Plate Number (Editable) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    name="plate_number"
                    value={formData.plate_number}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Customer Name (Editable) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Repair Category (Editable) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Repair Category
                  </label>
                  <input
                    type="text"
                    name="repair_category"
                    value={formData.repair_category}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <button
                onClick={addRow}
                className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
              >
                + Add New Work
              </button>
              <div className="overflow-x-auto">
                <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
                  <thead className="bg-gray-100 text-gray-600 text-left text-sm">
                    <tr className="">
                      <th className="border p-2 w-[40px]">#</th>
                      <th className="border p-2 w-[80px]">Code</th>
                      <th className="border p-2 w-[150px]">Work Description</th>
                      <th className="border p-2 w-[150px]">Assign To </th>
                      <th className="border p-2 w-[150px]">E.Time</th>
                      <th className="border p-2 w-[150px]">Unit</th>
                      <th className="border p-2 w-[150px]">T.cost</th>
                      <th className="border p-2 w-[210px]">Time In </th>
                      <th className="border p-2 w-[210px]">Time Out </th>
                      <th className="border p-2 w-[100px]">Status</th>
                      <th className="border p-2 w-[100px]">Remark</th>
                      <th className="border p-2 w-[100px]">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="border p-2 w-1/6 text-center">
                          {row.id}
                        </td>
                        {/* code */}
                        <td className="border p-2 w-1/3">
                          <input
                            type="text"
                            value={row.code}
                            onChange={(e) =>
                              handleChange(row.id, "code", e.target.value)
                            }
                            rows="2"
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          ></input>
                        </td>
                        {/* work description */}
                        <td className="border p-2">
                          <input
                            type="text"
                            value={row.workDescription}
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                "workDescription",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        {/* Assign To */}
                        <td className="border p-2 w-1/2">
                          <select
                            value={row.AssignTo}
                            onChange={(e) =>
                              handleChange(row.id, "AssignTo", e.target.value)
                            }
                            className="text-xs w-full border rounded px-2 py-1 border-gray-300"
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
                        <td className="border p-2">
                          <input
                            type="number"
                            value={row.EstimationTime}
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                "EstimationTime",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>

                        <td className="border p-2">
                          <input
                            type="number"
                            value={row.unit}
                            onChange={(e) =>
                              handleChange(row.id, "unit", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>

                        <td className="border p-2 w-1/4">
                          <input
                            type="number"
                            value={row.totalcost}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-200 border-gray-300"
                          />
                        </td>

                        <td className="border p-2 w-1/4">
                          <input
                            type="datetime-local"
                            value={row.TimeIn}
                            onChange={(e) =>
                              handleChange(row.id, "TimeIn", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border p-2 w-1/4">
                          <input
                            type="datetime-local"
                            value={row.TimeOut}
                            onChange={(e) =>
                              handleChange(row.id, "TimeOut", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border p-2 w-1/4">
                          <select
                            value={row.status}
                            onChange={(e) =>
                              handleChange(row.id, "status", e.target.value)
                            }
                            className="w-full border rounded px-2 py-2 border-gray-300"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="border p-2 w-1/4">
                          <input
                            value={row.Remark}
                            onChange={(e) =>
                              handleChange(row.id, "Remark", e.target.value)
                            }
                            rows="2"
                            className="w-full border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border p-2 w-1/4 text-left">
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="uppercase text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            delete
                          </button>
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

export default WorkOrderEdit;
