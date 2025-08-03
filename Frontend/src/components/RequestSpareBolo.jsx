import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";

const RequestSpareBolo = () => {
  const { id } = useParams(); // Get ID from URL params
  const location = useLocation();
  const navigate = useNavigate();

  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return; // Ensure ID is available before fetching

      try {
        const response = await api.get(`/bolo/${id}`); // ✅ Fixed URL syntax

        console.log("Fetched Bolo Data:", response.data); // Debugging

        if (response.data) {
          setRepair(response.data);
        } else {
          console.error("Unexpected data format:", response.data);
          setRepair(null);
        }
      } catch (error) {
        console.error("Error fetching Bolo details:", error);
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
      id: 1,
      code: "",
      date: "",
      description: "",
      partnumber: "",
      brand: "",
      modal: "",
      requestquantity: "",
      requestedby: "",
      condition: "new",
    },
  ]);
  const addRow = () => {
    const newId =
      rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1;

    setRows([
      ...rows,
      {
        id: newId, // Ensure ID is unique and incremented
        code: "",
        date: "",
        description: "",
        partnumber: "",
        brand: "",
        modal: "",
        requestquantity: "",
        requestedby: "",
        condition: "new",
      },
    ]);
  };

  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, [field]: value } // Update only the correct row
          : row
      )
    );
  };
  const deleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleSubmit = () => {
    // if (rows.some((row) => !row.workDescription)) {
    //   setError("Please provide a work description for all rows.");
    //   return;
    // }

    const newWorkOrder = {
      job_card_no: id,
      plate_number: repair?.plate_number,
      customer_name: repair?.customer_name,
      repair_category: repair?.vehicle_type,
      sparedetails: rows, // Array of work details
    };

    api
      .post("/spare-Request", newWorkOrder)
      .then(() => {
        Swal.fire({
          title: "Success!",
          text: "Work order has been successfully saved.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/job-manager/repair");
        });
      })
      .catch((error) => {
        console.error("Error:", error.response?.data || error.message);
        Swal.fire({
          title: "Error!",
          text: "Failed to save the work order. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="absolute left-2 top-6 z-[99999]">
          <BackButton />
        </div>
        {/* Site Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 phone:px-2 tablet:px-8 py-8 w-full max-w-9xl mx-auto overflow-hidden">
            <div className="p-4 phone:px-2 tablet:px-6 bg-white border rounded-md overflow-hidden">
              <div className="border border-blue-500 phone:px-2 tablet:px-6 py-4 rounded-md">
                <h2 className="phone:text-sm tablet:text-xl font-bold mb-6 text-left uppercase text-blue-700 tracking-wider">
                  Request Spare Change From Bolo
                </h2>

                {/* Job Card No */}
                <div className="grid phone:grid-cols-1 tablet:grid-cols-2 phone:gap-2 tablet:gap-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Job Card No
                    </label>
                    <input
                      type="text"
                      value={id || ""}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                    />
                  </div>

                  {/* Plate Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      value={repair?.plate_number || ""}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={repair?.customer_name || ""}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                    />
                  </div>

                  {/* Repair Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      vehicle Type
                    </label>
                    <input
                      type="text"
                      value={repair?.vehicle_type || ""}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                    />
                  </div>
                </div>
                <button
                  onClick={addRow}
                  className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
                >
                  + Add New Spare
                </button>
                <div className="overflow-x-auto">
                  <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
                    <thead className="bg-gray-100 text-gray-600 text-left text-sm">
                      <tr className="">
                        <th className="border p-2 w-[40px]">#</th>
                        <th className="border p-2 w-[80px]">Code</th>
                        <th className="border p-2 w-[170px]">Date</th>
                        <th className="border p-2 w-[150px]"> Description</th>
                        <th className="border p-2 w-[150px]">Part Number</th>
                        <th className="border p-2 w-[150px]">Brand</th>
                        <th className="border p-2 w-[150px]">Model</th>
                        <th className="border p-2 w-[150px]">
                          Request Quantity
                        </th>
                        <th className="border p-2 w-[180px]">Requested By </th>
                        <th className="border p-2 w-[150px]">Condition </th>
                        <th className="border p-2 w-[100px]">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="border p-2 text-center">{row.id}</td>
                          {/* code */}
                          <td className="border p-2">
                            <input
                              type="text"
                              value={row.code}
                              onChange={(e) =>
                                handleChange(row.id, "code", e.target.value)
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            ></input>
                          </td>
                          {/* Date */}
                          <td className="border p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                handleChange(row.id, "date", e.target.value)
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            ></input>
                          </td>
                          {/*  description */}
                          <td className="border p-2">
                            <input
                              value={row.description}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          {/*  part Number */}
                          <td className="border p-2">
                            <input
                              type="number"
                              value={row.partnumber}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  "partnumber",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          {/*  Brand  */}
                          <td className="border p-2">
                            <input
                              value={row.brand}
                              onChange={(e) =>
                                handleChange(row.id, "brand", e.target.value)
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          {/*  model */}
                          <td className="border p-2">
                            <input
                              value={row.modal}
                              onChange={(e) =>
                                handleChange(row.id, "modal", e.target.value)
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          {/*  Request Quantity  */}
                          <td className="border p-2">
                            <input
                              type="number"
                              value={row.requestquantity}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  "requestquantity",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                          {/* Assign To */}
                          <td className="border p-2">
                            <select
                              value={row.requestedby}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  "requestedby",
                                  e.target.value
                                )
                              }
                              className="text-sm w-full border rounded px-2 py-2"
                            >
                              <option value="">Select Employee</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.full_name}>
                                  {emp.full_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/*  condition  */}
                          <td className="border p-2">
                            <select
                              value={row.condition}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  "condition",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded px-2 py-1"
                            >
                              <option value="new">New</option>
                              <option value="used">Used</option>
                            </select>
                          </td>
                          <td className="border p-2 text-left">
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
                <div className="phone:text-center tablet:text-right">
                  <button
                    onClick={handleSubmit}
                    className="px-12 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md mt-6 transition duration-300 shadow-md shadow-gray-500/90 focus:shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestSpareBolo;
