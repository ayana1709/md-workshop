import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";
import { FiEye, FiEdit, FiTrash2, FiSave, FiChevronDown } from "react-icons/fi";

const RequestedItemsTable = () => {
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
  const [itemsOut, setItemsOut] = useState([]);
  const [workDetails, setWorkDetails] = useState([]);
  const [rows, setRows] = useState(() => {
    const savedRows = localStorage.getItem("rows");
    return savedRows ? JSON.parse(savedRows) : [];
  });

  useEffect(() => {
    const fetchItemsOut = async () => {
      try {
        const response = await api.get("/requested-items");
        const filteredItems = response.data.filter(
          (item) => item.plate_number === plateNumber
        );
        setItemsOut(filteredItems);
      } catch (error) {
        console.error("Error fetching requested items:", error);
        setItemsOut([]);
      }
    };
    fetchItemsOut();
  }, [plateNumber]);
  useEffect(() => {
    localStorage.setItem("rows", JSON.stringify(rows));
  }, [rows]);
  const addRow = async (jobCardNo) => {
    try {
      const response = await api.get(`/spare-request?job_card_no=${jobCardNo}`);
      const existingWorkOrders = response.data.data || [];
      const allWorkDetails = existingWorkOrders.flatMap(
        (order) => order.spare_change
      );
      // Extract IDs from existing work details
      const allIds = allWorkDetails
        .map((w) => w.id)
        .filter((id) => Number.isFinite(id));
      const rowIds = rows.map((r) => r.id).filter((id) => Number.isFinite(id));

      // Find the maximum ID
      const maxWorkDetailId = Math.max(
        allIds.length > 0 ? Math.max(...allIds) : 0,
        rowIds.length > 0 ? Math.max(...rowIds) : 0
      );

      console.log("Max Work Detail ID:", maxWorkDetailId);

      // Create a new row with an incremented ID
      const newRow = {
        id: maxWorkDetailId + 1, // ✅ Increment the ID
        partnumber: "",
        requestquantity: "",
        condition: rows.length === 0 ? "new" : "",
        modal: "",
        brand: "",
        unitprice: "",
        totalprice: "",
      };

      // Update the state with the new row
      setRows((prevRows) => [...prevRows, newRow]);
    } catch (error) {
      console.error("Error fetching work details:", error);
      Swal.fire("Error!", "Failed to fetch work order details.", "error");
    }
  };
  useEffect(() => {
    const fetchItemsOut = async () => {
      try {
        const response = await api.get("/requested-items");
        // Ensure plate_number matches and structure data correctly
        const filteredItems = response.data.filter(
          (item) => item.plate_number === plateNumber
        );

        setItemsOut(filteredItems);
      } catch (error) {
        console.error("Error fetching items out records:", error);
        setItemsOut([]);
      }
    };
    fetchItemsOut();
  }, [plateNumber]);

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

  console.log(workDetails);
  useEffect(() => {
    const fetchWorkDetailsByJobCardNo = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/spare-request/job-card/${id}`);
        if (response.data && Array.isArray(response.data.spare_change)) {
          setWorkDetails(response.data.spare_change); // ✅ Store the merged work details
        }
      } catch (error) {
        console.error("Error fetching work details:", error);
        setWorkDetails([]);
      }
    };

    fetchWorkDetailsByJobCardNo();
  }, [id]);

  const handleView = (row) => {
    setViewData(row); // Store selected row data
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };
  const handleSubmit = async () => {
    const newWorkOrder = {
      job_card_no: id,
      plate_number: repair?.plate_no,
      customer_name: repair?.customer_name,
      repair_category: repair?.repair_category,
      spare_change: rows, // ✅ Newly added work details
    };
    try {
      const response = await api.post("/spare-changes", newWorkOrder);

      if (response.data && response.data.data) {
        console.log(
          "Newly added work details:",
          response.data.data.spare_change
        ); // Debugging

        // ✅ Update the state with backend-generated IDs
        setWorkDetails((prev) => [...prev, ...response.data.data.spare_change]);

        // ✅ Sync frontend `rows` with new IDs from backend
        setRows(response.data.data.spare_change);
      }

      Swal.fire({
        title: "Success!",
        text: "Work order has been successfully saved.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // ✅ Clear local storage
      // Reset input fields
      setRows([]);
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
          Spar Change
        </h2>
        <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
          {/* Job Card No */}

          <button
            onClick={addRow}
            className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
          >
            + Add Spare Change
          </button>
          <div className="overflow-x-auto">
            <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
              <thead className="bg-gray-700 text-white text-left text-sm">
                <tr>
                  <th className="border border-green-300 p-2 w-[40px]">ID</th>
                  <th className="border border-green-300 p-2 w-[100px]">
                    Item Name
                  </th>
                  <th className="border border-green-300 p-2 w-[80px]">
                    Part Number
                  </th>
                  <th className="border border-green-300 p-2 w-[100px]">
                    Brand
                  </th>
                  <th className="border border-green-300 p-2 w-[80px]">
                    Req Qty
                  </th>
                  <th className="border border-green-300 p-2 w-[70px]">
                    Condition
                  </th>
                  <th className="border border-green-300 p-2 w-[70px]">
                    unit price
                  </th>
                  <th className="border border-green-300 p-2 w-[100px]">
                    Total Price
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
                      className="border-t border-green-300 hover:bg-gray-50 hover:dark:bg-gray-600"
                    >
                      <td className="border border-green-300 p-2 text-center">
                        {index + 1}
                      </td>
                      {/* Model */}
                      <td className="border border-green-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.model
                        ) : (
                          <input
                            type="text"
                            value={
                              isEditing ? editValues.model : row.model || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "model", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Work Type */}
                      <td className="border border-green-300 p-2">
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
                            type="number"
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Brand  */}
                      <td className="border border-green-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.brand
                        ) : (
                          <input
                            type="text"
                            value={
                              isEditing ? editValues.brand : row.brand || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "brand", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* request quantity  */}
                      <td className="border border-green-300 p-2" key={row.id}>
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
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* condition */}
                      <td className="border border-green-300 p-2">
                        {isFetchedData && !isEditing ? (
                          row.condition
                        ) : (
                          <select
                            value={
                              isEditing
                                ? editValues.condition
                                : row.condition || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "condition", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          >
                            <option value="new">new </option>
                            <option value="used">used</option>
                          </select>
                        )}
                      </td>
                      {/* unit price   */}
                      <td className="border border-green-300 p-2" key={row.id}>
                        {isFetchedData && !isEditing ? (
                          row.unitprice
                        ) : (
                          <input
                            value={
                              isEditing
                                ? editValues.unitprice
                                : row.unitprice || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "unitprice", e.target.value)
                            }
                            type="number"
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>
                      {/* total price */}
                      <td className="border border-green-300 p-2" key={row.id}>
                        {isFetchedData && !isEditing ? (
                          row.totalprice
                        ) : (
                          <input
                            value={
                              isEditing
                                ? editValues.totalprice
                                : row.totalprice || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "totalprice", e.target.value)
                            }
                            type="number"
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
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

export default RequestedItemsTable;
