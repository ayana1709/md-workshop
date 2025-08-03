import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";

const AddJobmanagemnt = () => {
  const { id } = useParams(); // Get ID from URL params
  const location = useLocation();
  const navigate = useNavigate();

  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  console.log(repair);

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return; // Ensure ID is available before fetching

      try {
        const response = await api.get(`/repairs/${id}`); // ✅ Corrected URL

        console.log("Fetched Repair Data:", response.data); // Debugging

        if (response.data) {
          // Check if response contains expected fields
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

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await api.get(`/work-orders`);
        setWorkRows(response.data.work_details); // Load saved work orders
      } catch (error) {
        console.error("Error fetching work orders:", error);
      }
    };

    const fetchSpareRequests = async () => {
      try {
        const response = await api.get(`/spare-requests`);
        setSpareRows(response.data.sparedetails); // Load saved spare requests
      } catch (error) {
        console.error("Error fetching spare requests:", error);
      }
    };

    if (id) {
      fetchWorkOrders();
      fetchSpareRequests();
    }
  }, [id]);

  const [workRows, setWorkRows] = useState([
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

  const [spareRows, setSpareRows] = useState([
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

  // ✅ Function to handle changes in Work Order Table
  const handleWorkChange = (id, field, value) => {
    setWorkRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // ✅ Function to handle changes in Spare Request Table
  const handleSpareChange = (id, field, value) => {
    setSpareRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // ✅ Function to add a new row in Work Order Table
  const addWorkRow = () => {
    setWorkRows([
      ...workRows,
      {
        id: workRows.length + 1,
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
  };

  // ✅ Function to add a new row in Spare Request Table
  const addSpareRow = () => {
    setSpareRows([
      ...spareRows,
      {
        id: spareRows.length + 1,
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

  const deleteWorkRow = async (id) => {
    try {
      await api.delete(`/work-orders/${id}`);
      setWorkRows((prevRows) => prevRows.filter((row) => row.id !== id)); // Remove from UI
      Swal.fire("Deleted!", "The work order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting work order:", error);
      Swal.fire("Error!", "Failed to delete work order.", "error");
    }
  };

  const deleteSpareRow = async (id) => {
    try {
      await api.delete(`/spare-requests/${id}`);
      setSpareRows((prevRows) => prevRows.filter((row) => row.id !== id)); // Remove from UI
      Swal.fire("Deleted!", "The spare request has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting spare request:", error);
      Swal.fire("Error!", "Failed to delete spare request.", "error");
    }
  };

  const handleWorkSubmit = () => {
    // if (workRows.some((row) => !row.workDescription)) {
    //   setError("Please provide a work description for all rows.");
    //   return;
    // }

    const newWorkOrder = {
      job_card_no: id,
      plate_number: repair?.plate_no,
      customer_name: repair?.customer_name,
      repair_category: repair?.repair_category,
      work_details: workRows, // Work order details
    };

    api
      .post("/work-orders", newWorkOrder)
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

  const handleSpareSubmit = () => {
    const newSpareRequest = {
      job_card_no: id,
      plate_number: repair?.plate_no,
      customer_name: repair?.customer_name,
      repair_category: repair?.repair_category,
      sparedetails: spareRows, // Spare request details
    };

    api
      .post("/spare-Request", newSpareRequest)
      .then(() => {
        Swal.fire({
          title: "Success!",
          text: "Spare request has been successfully saved.",
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
          text: "Failed to save the spare request. Please try again.",
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
              <div className="grid phone:grid-cols-1 tablet:grid-cols-2 gap-4">
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

                {/* Plate Number */}
                <div className="mb-4">
                  <label className="block dark:text-gray-200 text-sm font-medium text-gray-700">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    value={repair?.plate_no || ""}
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
              <button
                onClick={addWorkRow}
                className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
              >
                + Add New Work
              </button>
              <div className="overflow-x-auto">
                <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
                  <thead className="bg-green-700 text-white text-left text-sm">
                    <tr className="">
                      <th className="border border-green-300 p-2 w-[40px]">
                        #
                      </th>
                      <th className="border border-green-300 p-2 w-[80px]">
                        Types of work
                      </th>
                      <th className="border border-green-300 p-2 w-[80px]">
                        {" "}
                        Description
                      </th>
                      <th className="border border-green-300 p-2 w-[70px]">
                        Est.Time
                      </th>
                      <th className="border border-green-300 p-2 w-[70px]">
                        Est.Cost
                      </th>
                      <th className="border border-green-300 p-2 w-[70px]">
                        Assign To{" "}
                      </th>
                      <th className="border border-green-300 p-2 w-[100px]">
                        Time In{" "}
                      </th>
                      <th className="border border-green-300 p-2 w-[100px]">
                        Time Out{" "}
                      </th>
                      <th className="border border-green-300 p-2 w-[80px]">
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
                    {workRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-green-300 hover:bg-gray-50 dark:bg-gray-800 dark:bg-gray-600 transition"
                      >
                        <td className="border border-green-300 p-2 w-1/6 text-center">
                          {row.id}
                        </td>
                        {/* Types of Jobs  */}
                        <td className="border border-green-300 p-2 w-1/3">
                          <select
                            value={row.code}
                            onChange={(e) =>
                              handleWorkChange(row.id, "code", e.target.value)
                            }
                            className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-2 border-gray-300"
                          >
                            <option value="General Services">GN</option>
                            <option value="Mechanical">MC</option>
                            <option value="Pending">EL</option>
                            <option value="Body"> BD</option>
                            <option value="Diagonstices">DS</option>
                          </select>
                        </td>
                        {/* work description */}
                        <td className="border border-green-300 p-2 w-1/2">
                          <input
                            value={row.workDescription}
                            onChange={(e) =>
                              handleWorkChange(
                                row.id,
                                "workDescription",
                                e.target.value
                              )
                            }
                            rows="2"
                            className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        {/* estimation time  */}
                        <td className="border border-green-300 p-2 w-1/4">
                          <input
                            type="text"
                            value={row.EstimationTime}
                            onChange={(e) =>
                              handleWorkChange(
                                row.id,
                                "EstimationTime",
                                e.target.value
                              )
                            }
                            className="no-spinner w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        {/* estimation cost  */}
                        <td className="border border-green-300 p-2 w-1/4">
                          <input
                            type="number"
                            value={row.totalcost}
                            onChange={(e) =>
                              handleWorkChange(
                                row.id,
                                "totalcost",
                                e.target.value
                              )
                            }
                            className="no-spinner w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>

                        {/* Assign To */}
                        <td className="border border-green-300 p-2 w-1/2">
                          <select
                            value={row.AssignTo}
                            onChange={(e) =>
                              handleWorkChange(
                                row.id,
                                "AssignTo",
                                e.target.value
                              )
                            }
                            className="text-xs w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-1 border-gray-300"
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
                          {/* <input
                            type="text"
                            value={row.AssignTo}
                            onChange={(e) =>
                              handleWorkChange(row.id, "AssignTo", e.target.value)
                            }
                            rows="2"
                            className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border border-gray-300 rounded px-2 py-1"
                          ></input>{" "}
                          */}
                        </td>

                        <td className="border border-green-300 p-2 w-1/4">
                          <input
                            type="datetime-local"
                            value={row.TimeIn}
                            onChange={(e) =>
                              handleWorkChange(row.id, "TimeIn", e.target.value)
                            }
                            className="w-full border dark:bg-gray-800 dark:text-white placeholder:dark:text-white rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border border-green-300 p-2 w-1/4">
                          <input
                            type="datetime-local"
                            value={row.TimeOut}
                            onChange={(e) =>
                              handleWorkChange(
                                row.id,
                                "TimeOut",
                                e.target.value
                              )
                            }
                            className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border border-green-300 p-2 w-1/4">
                          <select
                            value={row.status}
                            onChange={(e) =>
                              handleWorkChange(row.id, "status", e.target.value)
                            }
                            className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-2 border-gray-300"
                          >
                            <option value="notstarted">Not Started</option>
                            <option value="started">Started</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="border border-green-300 p-2 w-1/4">
                          <input
                            value={row.Remark}
                            onChange={(e) =>
                              handleWorkChange(row.id, "Remark", e.target.value)
                            }
                            rows="2"
                            className="w-full dark:bg-gray-800 dark:text-white placeholder:dark:text-white border rounded px-2 py-1 border-gray-300"
                          />
                        </td>
                        <td className="border border-green-300 p-2 w-1/4 text-left">
                          <button
                            onClick={() => deleteWorkRow(row.id)}
                            className="uppercase text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Delete
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
                  onClick={handleWorkSubmit}
                  className="tracking-wider bg-blue-600 hover:bg-blue-800 text-white px-10 py-2 rounded-md mt-6 transition duration-300 focus:shadow-sm"
                >
                  Submit Work Order
                </button>
              </div>
            </div>
          </div>

          {/* spare Request  */}
          <div className="px-4 phone:px-2 tablet:px-8 py-8 w-full max-w-9xl mx-auto overflow-hidden">
            <div className="p-4 phone:px-2 tablet:px-6 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md overflow-hidden">
              <div className="border border-blue-500 phone:px-2 tablet:px-6 py-4 rounded-md">
                <h2 className="phone:text-sm tablet:text-xl font-bold mb-6 text-left uppercase text-blue-700 tracking-wider">
                  Request Spare Change
                </h2>

                {/* Job Card No */}

                <button
                  onClick={addSpareRow}
                  className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
                >
                  + Add New Spare
                </button>
                <div className="overflow-x-auto">
                  <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
                    <thead className="bg-table-head text-white text-left text-sm">
                      <tr className="">
                        <th className="border border-table-border p-2 w-[40px]">
                          #
                        </th>
                        <th className="border border-table-border p-2 w-[80px]">
                          Code
                        </th>
                        <th className="border border-table-border p-2 w-[170px]">
                          Date
                        </th>
                        <th className="border border-table-border p-2 w-[150px]">
                          {" "}
                          Description
                        </th>
                        <th className="border border-table-border p-2 w-[150px]">
                          Part Number
                        </th>
                        <th className="border border-table-border p-2 w-[150px]">
                          Brand
                        </th>
                        <th className="border border-table-border p-2 w-[150px]">
                          Model
                        </th>
                        <th className="border border-table-border p-2 w-[150px]">
                          Req Qty
                        </th>
                        <th className="border border-table-border p-2 w-[180px]">
                          Requested By{" "}
                        </th>
                        <th className="border border-table-border p-2 w-[150px]">
                          Condition{" "}
                        </th>
                        <th className="border border-table-border p-2 w-[100px]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {spareRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-table-border hover:bg-gray-50 hover:dark:bg-gray-600 transition"
                        >
                          <td className="border border-table-border p-2 text-center">
                            {row.id}
                          </td>
                          {/* code */}
                          <td className="border border-table-border p-2">
                            <input
                              type="text"
                              value={row.code}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "code",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            ></input>
                          </td>
                          {/* Date */}
                          <td className="border border-table-border p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "date",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            ></input>
                          </td>
                          {/*  description */}
                          <td className="border border-table-border p-2">
                            <input
                              value={row.description}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            />
                          </td>
                          {/*  part Number */}
                          <td className="border border-table-border p-2">
                            <input
                              type="number"
                              value={row.partnumber}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "partnumber",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="no-spinner w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            />
                          </td>
                          {/*  Brand  */}
                          <td className="border border-table-border p-2">
                            <input
                              value={row.brand}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "brand",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            />
                          </td>
                          {/*  model */}
                          <td className="border border-table-border p-2">
                            <input
                              value={row.modal}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "modal",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            />
                          </td>
                          {/*  Request Quantity  */}
                          <td className="border border-table-border p-2">
                            <input
                              type="number"
                              value={row.requestquantity}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "requestquantity",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="no-spinner w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            />
                          </td>
                          {/* Assign To */}
                          <td className="border border-table-border p-2">
                            <input
                              value={row.requestedby}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "requestedby",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            />
                          </td>
                          {/*  condition  */}
                          <td className="border border-table-border p-2">
                            <select
                              value={row.condition}
                              onChange={(e) =>
                                handleSpareChange(
                                  row.id,
                                  "condition",
                                  e.target.value
                                )
                              }
                              className="w-full dark:bg-gray-800 placeholder:dark:text-white dark:text-white border rounded px-2 py-1"
                            >
                              <option value="new">New</option>
                              <option value="used">Used</option>
                            </select>
                          </td>
                          <td className="border border-table-border p-2 text-left">
                            <button
                              onClick={() => deleteSpareRow(row.id)}
                              className="uppercase text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Delete
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
                    onClick={handleSpareSubmit}
                    className="px-12 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md mt-6 transition duration-300 shadow-md shadow-gray-500/90 focus:shadow-sm"
                  >
                    Submit Spare Request
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

export default AddJobmanagemnt;
