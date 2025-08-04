import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";
import { FiEye, FiEdit, FiTrash2, FiSave, FiChevronDown } from "react-icons/fi";

const OutSource = () => {
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
  const [rows, setRows] = useState(() => {
    const savedRows = localStorage.getItem("rows");
    return savedRows ? JSON.parse(savedRows) : [];
  });

  useEffect(() => {
    localStorage.setItem("rows", JSON.stringify(rows));
  }, [rows]);

  const isOutsourceRowEmpty = (row) => {
    return (
      !row.partnumber?.trim() &&
      !row.requestquantity?.toString().trim() &&
      !row.modal?.trim() &&
      !row.brand?.trim() &&
      !row.description?.trim()
    );
  };

  const addRow = async (jobCardNo) => {
    // ✅ Prevent adding if last row is unfilled
    if (rows.length > 0 && isOutsourceRowEmpty(rows[rows.length - 1])) {
      Swal.fire(
        "Warning",
        "Please complete the last row before adding a new one.",
        "warning"
      );
      return;
    }

    try {
      const response = await api.get(`/outsource?job_card_no=${jobCardNo}`);
      const existingWorkOrders = response.data.data || [];
      const allWorkDetails = existingWorkOrders.flatMap(
        (order) => order.outsourcedetails
      );

      const allIds = allWorkDetails
        .map((w) => w.id)
        .filter((id) => Number.isFinite(id));
      const rowIds = rows.map((r) => r.id).filter((id) => Number.isFinite(id));

      const maxWorkDetailId = Math.max(
        allIds.length > 0 ? Math.max(...allIds) : 0,
        rowIds.length > 0 ? Math.max(...rowIds) : 0
      );

      const newRow = {
        id: maxWorkDetailId + 1,
        partnumber: "",
        requestquantity: "",
        modal: "",
        brand: "",
        description: "",
      };

      setRows((prevRows) => [...prevRows, newRow]);
    } catch (error) {
      console.error("Error fetching work details:", error);
      Swal.fire("Error!", "Failed to fetch work order details.", "error");
    }
  };

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return; // Ensure ID is available before fetching

      try {
        const response = await api.get(`/repairs/${id}`); // ✅ Corrected URL

        console.log("Fetched Repair Data:", response.data);

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
  const [workDetails, setWorkDetails] = useState([]);
  console.log(workDetails);
  useEffect(() => {
    const fetchWorkDetailsByJobCardNo = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/outsource/job-card/${id}`);

        if (response.data && Array.isArray(response.data.outsourcedetails)) {
          setWorkDetails(response.data.outsourcedetails);
        } else {
          console.warn(
            "Invalid or empty outsourcedetails received, keeping old data."
          );
          // Do NOT clear the existing data here
        }
      } catch (error) {
        console.error("Error fetching work details:", error);
      }
    };

    // Initial fetch
    fetchWorkDetailsByJobCardNo();

    // Refresh every 5 seconds (5000ms)
    const interval = setInterval(fetchWorkDetailsByJobCardNo, 10000);

    // Cleanup on unmount or id change
    return () => clearInterval(interval);
  }, [id]);

  const handleView = (row) => {
    setViewData(row); // Store selected row data
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    // if (rows.some((row) => !row.requestquantity)) {
    //   setError("Please provide a work description for all rows.");
    //   return;
    // }
    const newWorkOrder = {
      job_card_no: id,
      plate_number: repair?.product_name,
      customer_name: repair?.customer_name,
      repair_category: repair?.serial_code,
      outsourcedetails: rows, // Newly added work details
    };
    try {
      const response = await api.post("/outsource", newWorkOrder);

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

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This work detail will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setWorkDetails((prev) => prev.filter((item) => item.id !== row.id)); // Optimistic update

    try {
      await deleteFromDB(row.id);
      Swal.fire("Deleted!", "Work detail has been deleted.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete work detail.", "error");
      setWorkDetails((prev) => [...prev, row]); // Rollback if error
    }
  };

  const deleteFromDB = async (workDetailId) => {
    try {
      console.log("Deleting work detail with ID:", workDetailId); // Debugging

      const response = await api.delete(`outsource/${workDetailId}`);

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

  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEditValues({ ...row });
  };

  const handleSave = async () => {
    try {
      await api.put(`/outsource-details/${editingRow}`, editValues);

      // Update UI
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === editingRow ? editValues : row))
      );

      setEditingRow(null);
      setEditValues({});
      Swal.fire(
        "Success!",
        "Outsource detail updated successfully.",
        "success"
      );
    } catch (error) {
      console.error("Error updating outsource detail:", error);
      Swal.fire("Error!", "Failed to update outsource detail.", "error");
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
  return (
    <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-10 m-auto rounded-md">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h2 className="uppercase tracking-wider text-blue-700 phone:text-md tablet:text-xl font-bold text-center mb-6">
          Other Service
        </h2>
        <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
          {/* Job Card No */}

          <button
            onClick={addRow}
            className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
          >
            + Add Outsource
          </button>
          <div className="overflow-x-auto">
            <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
              <thead className="bg-gray-800 text-white text-left text-sm">
                <tr>
                  <th className="border-2 border-gray-300 p-2 w-[40px]">#</th>
                  <th className="border-2 border-gray-300 p-2 w-[140px]">
                    Description
                  </th>

                  <th className="border-2 border-gray-300 p-2 w-[70px]">
                    Time In
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[100px]">
                    Time Out
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[80px]">
                    Type
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[80px]">
                    Total Cost
                  </th>

                  <th className="border-2 border-gray-300 p-2 w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {[...workDetails, ...rows].map((row, index) => {
                  const isFetchedData = workDetails.some(
                    (workRow) => workRow.id === row.id
                  );
                  const isEditing = editingRow === row.id;

                  return (
                    <tr
                      key={`${row.id}-${index}`}
                      className="border-t border-gray-300 hover:bg-gray-50"
                    >
                      <td className="border-2 border-gray-300 p-2 text-center">
                        {index + 1}
                      </td>
                      {/* Description*/}
                      <td className="border-2 border-gray-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.description
                        ) : (
                          <input
                            type="text"
                            value={
                              isEditing
                                ? editValues.description
                                : row.description || ""
                            }
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        )}
                      </td>

                      {/* Time In */}
                      <td className="border-2 border-gray-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.modal
                        ) : (
                          <input
                            type="datetime-local"
                            value={
                              isEditing ? editValues.modal : row.modal || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "modal", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        )}
                      </td>

                      {/*Time Out  */}
                      <td className="border-2 border-gray-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.brand
                        ) : (
                          <input
                            type="datetime-local"
                            value={
                              isEditing ? editValues.brand : row.brand || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "brand", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        )}
                      </td>
                      {/* Type */}
                      <td className="border-2 border-gray-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.partnumber
                        ) : (
                          <input
                            value={
                              isEditing
                                ? editValues.partnumber
                                : row.partnumber || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "partnumber", e.target.value)
                            }
                            type="text"
                            className="w-full border rounded px-2 py-1"
                          />
                        )}
                      </td>

                      {/* Total Cost   */}
                      <td className="border-2 border-gray-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.requestquantity
                        ) : (
                          <input
                            value={
                              isEditing
                                ? editValues.requestquantity
                                : row.requestquantity || ""
                            }
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                "requestquantity",
                                e.target.value
                              )
                            }
                            type="number"
                            className=" no-spinner w-full border rounded px-2 py-1"
                          />
                        )}
                      </td>

                      {/* Actions - Dropdown Menu */}
                      <td className="border-2 border-gray-300 p-2 text-left relative">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === index ? null : index
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center space-x-1 relative"
                        >
                          Action <FiChevronDown size={18} />
                        </button>

                        {dropdownOpen === index && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                            <button
                              onClick={() => handleView(row)}
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                            >
                              <FiEye className="mr-2" /> View
                            </button>

                            {editingRow === row.id ? (
                              <button
                                onClick={handleSave}
                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 w-full"
                              >
                                <FiSave className="mr-2" /> Save
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(row)}
                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <FiEdit className="mr-2" /> Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(row)}
                              className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                            >
                              <FiTrash2 className="mr-2" /> Delete
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
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                {/* Close Button (X) in the top-right */}
                <button
                  onClick={() => setViewData(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                >
                  ✖
                </button>

                <h2 className="text-lg font-bold mb-4 text-center">
                  Work Details
                </h2>

                {/* Display all work details dynamically */}
                <div className="space-y-2">
                  {Object.entries(viewData).map(([key, value]) => (
                    <p key={key}>
                      <strong className="capitalize">
                        {key.replace(/_/g, " ")}:
                      </strong>{" "}
                      {value || "N/A"}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
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
  );
};

export default OutSource;
