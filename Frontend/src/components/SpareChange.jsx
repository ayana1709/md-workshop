import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";
import { FiEye, FiEdit, FiTrash2, FiSave, FiChevronDown } from "react-icons/fi";

const SpareChange = () => {
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
  const [rows, setRows] = useState(() => {
    const savedRows = localStorage.getItem("rows");
    return savedRows ? JSON.parse(savedRows) : [];
  });

  useEffect(() => {
    localStorage.setItem("rows", JSON.stringify(rows));
  }, [rows]);

  // Check if a row is empty
  const isRowEmpty = (row) => {
    return (
      !row.itemname?.trim() &&
      !row.partnumber?.trim() &&
      !row.requestquantity?.toString().trim() &&
      !row.brand?.trim() &&
      !row.unitprice?.toString().trim()
    );
  };

  const addRow = async (jobCardNo) => {
    // ✅ Prevent adding if last row is unfilled
    if (rows.length > 0 && isRowEmpty(rows[rows.length - 1])) {
      Swal.fire(
        "Warning",
        "Please complete the last row before adding a new one.",
        "warning"
      );
      return;
    }

    try {
      const response = await api.get(`/spare-changes?job_card_no=${jobCardNo}`);
      const existingWorkOrders = response.data.data || [];
      const allWorkDetails = existingWorkOrders.flatMap(
        (order) => order.spare_change
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
        itemname: "",
        partnumber: "",
        requestquantity: "",
        brand: "",
        condition: rows.length === 0 ? "new" : "",
        unitprice: "",
        totalprice: "0.00",
      };

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
  useEffect(() => {
    const fetchWorkDetailsByJobCardNo = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/spare-changes/job-card/${id}`);

        if (response.data && Array.isArray(response.data.spare_change)) {
          setWorkDetails(response.data.spare_change);
        } else {
          console.warn(
            "No valid spare_change data returned. Keeping existing data."
          );
          // ❌ Don't clear the data here — API might have returned null or something unexpected
        }
      } catch (error) {
        console.error("Error fetching work details:", error);
        // ❌ Don't clear data on error either
        // setWorkDetails([]); ← Remove or comment this out
      }
    };

    // Initial fetch
    fetchWorkDetailsByJobCardNo();

    // Set up interval
    const interval = setInterval(fetchWorkDetailsByJobCardNo, 5000); // 1 second

    // Cleanup
    return () => clearInterval(interval);
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
      plate_number: repair?.product_name,
      customer_name: repair?.customer_name,
      repair_category: repair?.serial_code,
      spare_change: rows,
    };

    try {
      const response = await api.post("/spare-changes", newWorkOrder);

      if (response.data && response.data.data) {
        console.log(
          "Newly added Spare Change :",
          response.data.data.spare_change
        ); // Debugging

        setWorkDetails((prev) => [...prev, ...response.data.data.spare_change]);

        // ✅ Sync frontend `rows` with new IDs from backend
        setRows(response.data.data.spare_change);
      }

      Swal.fire({
        title: "Success!",
        text: "Spare Change has been successfully saved.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // ✅ Clear local storage
      // Reset input fields
      setRows([]);
      localStorage.removeItem("rows");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Swal.fire({
        title: "Error!",
        text: "Failed to save the Spare Change. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This Spare details  will be removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log("Attempting to delete row:", row); // Debugging

          await deleteFromDB(row.id); // Call delete function

          setWorkDetails((prev) => prev.filter((item) => item.id !== row.id)); // Remove from state

          Swal.fire("Deleted!", "Spare Change has been deleted.", "success");
        } catch (error) {
          console.error("Delete failed:", error); // Log error
          Swal.fire("Error", "Failed to delete Spare Change.", "error");
        }
      }
    });
  };

  const deleteFromDB = async (workDetailId) => {
    try {
      console.log("Deleting Spare Change with ID:", workDetailId); // Debugging

      const response = await api.delete(`spare-changes/${workDetailId}`);

      if (response.status === 200 || response.status === 204) {
        console.log("Delete successful!");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(
        "Error deleting Spare Change :",
        error.response?.data || error.message
      );
      Swal.fire(
        "Error",
        "Failed to delete Spare Chnage . Please try again.",
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
      console.log("Updating spare detail with ID:", editingRow);
      console.log("Payload:", editValues);

      // Only send the fields Laravel expects
      const payload = {
        itemname: editValues.itemname || null,
        partnumber: editValues.partnumber || null,
        requestquantity: editValues.requestquantity || null,
        brand: editValues.brand || null,
        condition: editValues.condition || null,
        unitprice: editValues.unitprice || null,
        totalprice: editValues.totalprice || null,
      };

      const { data } = await api.put(`/spare-changes/${editingRow}`, payload);

      // Update UI optimistically
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === editingRow ? { ...row, ...payload } : row
        )
      );

      setEditingRow(null);
      setEditValues({});

      Swal.fire({
        title: "Success!",
        text: data?.message || "Spare part updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error(
        "Error updating spare:",
        error.response?.data || error.message
      );

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to update spare part. Please check your inputs.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // const handleChange = (id, field, value) => {
  //   if (editingRow === id) {
  //     setEditValues((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));
  //   } else {
  //     setRows((prevRows) =>
  //       prevRows.map((row) =>
  //         row.id === id ? { ...row, [field]: value } : row
  //       )
  //     );
  //   }
  // };
  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // Auto recalculate totalprice if unitprice or requestquantity changes
          const quantity =
            parseFloat(
              field === "requestquantity" ? value : row.requestquantity
            ) || 0;

          const unitPrice =
            parseFloat(field === "unitprice" ? value : row.unitprice) || 0;

          // Store as string with two decimals
          updatedRow.totalprice = (quantity * unitPrice).toFixed(2);

          return updatedRow;
        }
        return row;
      })
    );

    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-10 m-auto rounded-md">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h2 className="uppercase tracking-wider text-blue-700 phone:text-md tablet:text-xl font-bold text-center mb-6">
          Spare Change
        </h2>
        <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
          {/* Job Card No */}

          <button
            onClick={addRow}
            className="mt-4 mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
          >
            + Add New Spare
          </button>
          <div className="overflow-x-auto">
            <table className="table-fixed min-w-full table-auto w-full border-collapse border border-gray-800 overflow-x-auto">
              <thead className="bg-gray-800 text-white text-left text-sm">
                <tr>
                  <th className="border-2 border-gray-300 p-2 w-[40px]">ID</th>
                  <th className="border-2 border-gray-300 p-2 w-[100px]">
                    Item Name
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[80px]">
                    Part Number
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[100px]">
                    Brand
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[80px]">Qty</th>

                  <th className="border-2 border-gray-300 p-2 w-[70px]">
                    Condition
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[70px]">
                    Unit price
                  </th>

                  <th className="border-2 border-gray-300 p-2 w-[100px]">
                    Total Price
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
                      className="border-t border-gray-300 hover:bg-gray-50 hover:dark:bg-gray-600"
                    >
                      <td className="border-2 border-gray-300 p-2 text-center font-medium ">
                        {index + 1}
                      </td>
                      {/* Model */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
                        {isFetchedData && !isEditing ? (
                          row.itemname
                        ) : (
                          <input
                            type="text"
                            value={
                              isEditing
                                ? editValues.itemname
                                : row.itemname || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "itemname", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Work Type */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
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
                            className="no-spinner w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Brand  */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
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
                      <td
                        className="border-2 border-gray-300 p-2 font-medium"
                        key={row.id}
                      >
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
                            className="no-spinner w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>
                      {/* Assign to  */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
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
                      {/*  unit price  */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
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
                            className=" no-spinner w-full border-gray-300 rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>
                      {/*  Total price  */}

                      {/* Total Price */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
                        {row.totalprice || "0.00"}
                      </td>

                      {/* Actions - Dropdown Menu */}
                      <td className="border-2 border-gray-300 p-2 text-left relative font-medium">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === index ? null : index
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center space-x-1 relative dark:bg-gray-800 dark:text-gray-200"
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
                                className="flex items-center px-4 py-2 text-green-600 hover:bg-gray-100 w-full"
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

export default SpareChange;
