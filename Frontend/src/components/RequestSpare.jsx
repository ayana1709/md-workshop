import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Swal from "sweetalert2";
import BackButton from "./BackButton";
import { FiEye, FiEdit, FiTrash2, FiSave, FiChevronDown } from "react-icons/fi";

const RequestSpare = () => {
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
  const [workDetails, setWorkDetails] = useState([]);

  // console.log(rows);

  useEffect(() => {
    localStorage.setItem("rows", JSON.stringify(rows));
  }, [rows]);
  const addRow = async (jobCardNo) => {
    // Check if the last row is empty
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];

      // You can customize this to check only the fields you care about
      const isEmpty =
        !lastRow.itemname?.trim() &&
        !lastRow.partnumber?.trim() &&
        !lastRow.model?.trim() &&
        !lastRow.requestquantity?.toString().trim() &&
        !lastRow.requestedby?.trim();

      if (isEmpty) {
        Swal.fire(
          "Warning!",
          "Please fill the last row before adding a new one.",
          "warning"
        );
        return;
      }
    }

    try {
      const response = await api.get(`/spare-request?job_card_no=${jobCardNo}`);
      const existingWorkOrders = response.data.data || [];
      const allWorkDetails = existingWorkOrders.flatMap(
        (order) => order.sparedetails
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
        brand: "",
        model: "",
        // condition: "",
        description: "",
        requestquantity: "",
        requestedby: "",
        status: "Requested",
      };

      setRows((prevRows) => [...prevRows, newRow]);
    } catch (error) {
      console.error("Error fetching work details:", error);
      Swal.fire("Error!", "Failed to fetch work order details.", "error");
    }
  };

  ///for know its not showing
  useEffect(() => {
    if (!plateNumber) return;

    const fetchItemsOut = async () => {
      try {
        const response = await api.get("/requested-items");

        const filteredItems = response.data.filter(
          (item) => item.plate_number === plateNumber
        );

        setItemsOut(filteredItems);
      } catch (error) {
        console.error("Error fetching items out records:", error);
        setItemsOut([]);
      }
    };
    fetchItemsOut(); // Initial fetch on mount
    const interval = setInterval(fetchItemsOut, 5000); // Fetch every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [plateNumber]);

  // cheackcustomer information
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

  const visibleFields = [
    "itemname",
    "partnumber",
    "brand",
    "model",
    // "condition",
    "description",
    "requestquantity",
    "requestedby",
    "status",
    "unit_price",
    "totalprice",
  ];

  // fetch list of work detail

  useEffect(() => {
    if (!id) return;

    const fetchWorkDetailsByJobCardNo = async () => {
      try {
        const response = await api.get(`/spare-request/job-card/${id}`);

        if (response.data && Array.isArray(response.data.sparedetails)) {
          setWorkDetails(response.data.sparedetails);
        }
      } catch (error) {
        console.error("Error fetching spare details:", error);
        setWorkDetails([]);
      }
    };
    // Fetch initially
    fetchWorkDetailsByJobCardNo();
    // Set interval to fetch every 10 seconds
    const interval = setInterval(fetchWorkDetailsByJobCardNo, 10000); // 10000 ms = 10 seconds
    // Cleanup on unmount or when id changes
    return () => clearInterval(interval);
  }, [id]);

  const handleView = (row) => {
    setViewData(row); // Store selected row data
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleDelete = async (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This Spare Request  will be removed!",
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

          Swal.fire(
            "Deleted!",
            "Requested spare  has been deleted.",
            "success"
          );
        } catch (error) {
          console.error("Delete failed:", error); // Log error
          Swal.fire("Error", "Failed to delete Request Spare .", "error");
        }
      }
    });
  };

  const deleteFromDB = async (workDetailId) => {
    try {
      console.log("Deleting work detail with ID:", workDetailId); // Debugging

      const response = await api.delete(`spare-details/${workDetailId}`);

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
      console.log("Updating spare detail with ID:", editingRow);
      console.log("Payload:", editValues); // ✅ Debugging

      await api.put(`/spare-details/${editingRow}`, editValues);

      // Update UI optimistically
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === editingRow ? editValues : row))
      );

      setEditingRow(null);
      setEditValues({});
      Swal.fire("Success!", "Spare part updated successfully.", "success");
    } catch (error) {
      console.error(
        "Error updating spare:",
        error.response?.data || error.message
      );
      Swal.fire("Error!", "Failed to update spare part.", "error");
    }
  };

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

          updatedRow.totalprice = quantity * unitPrice;

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

  const handleSubmit = async () => {
    const newWorkOrder = {
      job_card_no: id,
      plate_number: repair?.product_name,
      customer_name: repair?.customer_name,
      repair_category: repair?.serial_code,
      sparedetails: rows, // ✅ Newly added work details
    };

    try {
      const response = await api.post("/spare-request", newWorkOrder);

      if (response.data && response.data.data) {
        console.log(
          "Newly added Spare Request :",
          response.data.data.sparedetails
        ); // Debugging

        // ✅ Update the state with backend-generated IDs
        setWorkDetails((prev) => [...prev, ...response.data.data.sparedetails]);

        // ✅ Sync frontend `rows` with new IDs from backend
        setRows(response.data.data.sparedetails);
      }

      Swal.fire({
        title: "Success!",
        text: "Spare Request  has been successfully saved.",
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
        text: "Failed to save the Spare Request . Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  // import { useEffect, useRef } from "react";

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setDropdownOpen(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  return (
    <main className="grow bg-white dark:bg-gray-800 w-[95%] mt-10 m-auto rounded-md">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h2 className="uppercase tracking-wider text-blue-700 phone:text-md tablet:text-xl font-bold text-center mb-6">
          Spare Request
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
            <table className="table-fixed min-w-full border-collapse border-2 border-gray-800 overflow-x-auto">
              <thead className="bg-gray-800 text-white text-left text-sm font-medium">
                <tr>
                  <th className="border-2 border-gray-300 p-2 w-[40px] font-medium">
                    ID
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[100px] font-medium">
                    Item Name
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[80px] font-medium">
                    Part Number
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[100px] font-medium">
                    Brand
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[100px] font-medium">
                    Model
                  </th>
                  {/* <th className="border-2 border-gray-300 p-2 w-[100px] font-medium">
                    Item Description
                  </th> */}
                  <th className="border-2 border-gray-300 p-2 w-[70px] font-medium">
                    Req Qty
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[70px] font-medium">
                    Req By
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[70px] font-medium">
                    Status
                  </th>
                  <th className="border-2 border-gray-300 p-2 w-[100px] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="font-semimedium text-sm">
                {[...workDetails, ...rows].map((row, index) => {
                  const isFetchedData = workDetails.some(
                    (workRow) => workRow.id === row.id
                  );
                  const isEditing = editingRow === row.id;
                  return (
                    <tr
                      key={`${row.id}-${index}`}
                      className="border-t-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-300"
                    >
                      <td className="border-2 border-gray-300 p-2 text-center font-medium">
                        {index + 1}
                      </td>

                      {/* item name */}
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

                      {/* Part Number */}
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
                            className=" no-spinner w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Brand */}
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
                      {/* model */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
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
                      {/* Description */}
                      {/* <td className="border-2 border-gray-300 p-2 font-medium">
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
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td> */}

                      {/* Request Quantity */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
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
                            className="  no-spinner w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Requested By */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
                        {isFetchedData && !isEditing ? (
                          row.requestedby || "N/A"
                        ) : (
                          <input
                            value={
                              isEditing
                                ? editValues.requestedby
                                : row.requestedby || ""
                            }
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                "requestedby",
                                e.target.value
                              )
                            }
                            type="text"
                            className="  no-spinner w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td>

                      {/* Condition */}
                      <td className="border-2 border-gray-300 p-2 font-medium">
                        {isFetchedData && !isEditing ? (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              row.condition === "Not Requested"
                                ? "bg-gray-200 text-gray-700"
                                : row.condition === "Requested"
                                ? "bg-yellow-100 text-yellow-800 animate-pulse"
                                : row.condition === "Approved"
                                ? "bg-green-100 text-green-800"
                                : row.condition === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : row.condition === "Recieved"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-300 text-gray-900"
                            }`}
                          >
                            {row.condition || "N/A"}
                          </span>
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
                            <option value="Not Requested">Not Requested</option>
                            <option value="Requested">Requested</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Recieved">Recieved</option>
                          </select>
                        )}
                      </td>

                      {/* status */}
                      {/* <td className="border-2 border-gray-300 p-2 font-medium">
                        {isFetchedData && !isEditing ? (
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-semibold
        ${
          row.status === "Available"
            ? "bg-green-100 text-green-700"
            : row.status === "Insufficient"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }
      `}
                          >
                            {row.status || "N/A"}
                          </span>
                        ) : (
                          <input
                            type="text"
                            disabled
                            value={
                              isEditing ? editValues.status : row.status || ""
                            }
                            onChange={(e) =>
                              handleChange(row.id, "status", e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                          />
                        )}
                      </td> */}

                      {/* Actions */}

                      {/* <ActionCell row={row} index={index} />
                       */}

                      <td className="relative border-2 border-gray-200 dark:border-gray-700 p-3 text-left font-medium">
                        <div
                          className="inline-block relative"
                          ref={dropdownRef}
                        >
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === index ? null : index
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-200 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                          >
                            Action <FiChevronDown size={18} />
                          </button>

                          {dropdownOpen === index && (
                            <div className="absolute top-full left-0 mt-2 w-34 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 animate-fade-in">
                              <button
                                onClick={() => handleView(row)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 w-full"
                              >
                                <FiEye size={16} /> View
                              </button>

                              {editingRow === row.id ? (
                                <button
                                  onClick={handleSave}
                                  className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                                >
                                  <FiSave size={16} /> Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="flex items-center gap-2 px-4 py-2 text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                                >
                                  <FiEdit size={16} /> Edit
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(row)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                              >
                                <FiTrash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {viewData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 animate-fade-in">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md relative overflow-y-auto max-h-[90vh] transition-all transform scale-100">
                {/* Close Button */}
                <button
                  onClick={() => setViewData(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition duration-200 text-xl font-bold"
                  aria-label="Close"
                >
                  ✖
                </button>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
                  📋 Spare Details
                </h2>

                {/* Dynamic content */}
                <div className="space-y-4 text-gray-700 dark:text-gray-200">
                  {visibleFields.map((key) => (
                    <div key={key} className="flex justify-between items-start">
                      <span className="font-medium capitalize text-gray-600 dark:text-gray-300">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="text-right font-semibold text-blue-600 dark:text-blue-400 break-all">
                        {viewData[key] || "N/A"}
                      </span>
                    </div>
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

export default RequestSpare;
