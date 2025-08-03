import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api";

function PredriveTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/view-work/${id}`);

        if (response.data) {
          setRepair(response.data);
        }
      } catch (error) {
        console.error("Error fetching repair details:", error);
      }
    };
    fetchRepairById();
  }, [id]);

  const defaultTests = [
    "Brake System",
    "Lights & Signals",
    "Steering Mechanism",
    "Tire Condition",
    "Fluid Levels",
  ];
  const [rows, setRows] = useState(
    defaultTests.map((desc, index) => ({
      id: index + 1,
      workDescription: desc,
      status: "Pending",
      remark: "",
    }))
  );
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        workDescription: "",
        status: "Pending",
        remark: "",
      },
    ]);
  };

  const handleStatusChange = (id, newStatus) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
    );
  };
  const handleChange = (id, field, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const getStatusElement = (status, id) => {
    const statusStyles = {
      Pass: "bg-green-500 text-white",
      Fail: "bg-red-500 text-white",
      Pending: "bg-yellow-500 text-white",
    };

    const statusIcons = {
      Pass: "✔️",
      Fail: "❌",
      Pending: "⏳",
    };

    return (
      <button
        className={`px-4 py-1 rounded ${statusStyles[status]}`}
        onClick={() => handleStatusChange(id, status)}
        disabled
      >
        {statusIcons[status]} {status}
      </button>
    );
  };
  const handleSubmit = async () => {
    if (!repair?.customer_name) {
      setError("Customer Name is required.");
      return;
    }

    const testData = {
      job_card_no: id,
      plate_number: repair?.plate_number,
      customer_name: repair?.customer_name,
      checked_by: document.querySelector("input[name='cheacked_by']").value,
      work_details: rows,
    };

    try {
      const response = await api.post("/pre-drive-tests", testData);
      Swal.fire({
        title: "Success!",
        text: "Pre-Drive Test saved.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate(`/test-drive/${id}/during-drive`));
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save test.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-blue-700 dark:text-gray-100 mb-4">
        Pre-Drive Inspection
      </h2>

      {/* Job Card No */}
      <div className="grid phone:grid-cols-1 tablet:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block dark:text-gray-100 text-sm font-medium text-gray-700">
            Job Card No
          </label>
          <input
            type="text"
            value={id || ""}
            disabled
            className="mt-1 dark:bg-gray-800 dark:text-white block w-full bg-gray-100 border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Cheacked By  */}
        <div className="mb-4">
          <label className="block dark:text-gray-100 text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            value={repair?.customer_name || ""}
            disabled
            className="mt-1 block w-full dark:bg-gray-800 dark:text-white bg-gray-100 border border-gray-300 rounded-md p-2"
          />
        </div>
        {/* Plate Number */}
        <div className="mb-4">
          <label className="block dark:text-gray-100 text-sm font-medium text-gray-700">
            Plate Number
          </label>
          <input
            type="text"
            value={repair?.plate_number || ""}
            disabled
            className="mt-1 block w-full dark:bg-gray-800 dark:text-white bg-gray-100 border border-gray-300 rounded-md p-2"
          />
        </div>
        {/* Cheacked Date  */}
        <div className="mb-4">
          <label className="block dark:text-gray-100 text-sm font-medium text-gray-700">
            Cheacked By
          </label>
          <input
            type="text"
            name="cheacked_by"
            required
            className="mt-1 block w-full dark:bg-gray-800 dark:text-white bg-gray-100 border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>
      <button
        onClick={addRow}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        + Add New Test
      </button>
      <table className="w-full border border-table-border border-table-border">
        <thead>
          <tr className="bg-table-head dark:bg-green-500 text-white dark:text-white">
            <th className="border border-table-border p-2">#</th>
            <th className="border border-table-border p-2">Test Description</th>
            <th className="border border-table-border p-2">Status</th>
            <th className="border border-table-border p-2">Comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border">
              <td className="border border-table-border p-2 text-center dark:text-white">
                {row.id}
              </td>
              <td className="border border-table-border p-2">
                <input
                  value={row.workDescription}
                  onChange={(e) =>
                    handleChange(row.id, "workDescription", e.target.value)
                  }
                  className="border p-1 w-full dark:bg-gray-800 dark:text-white"
                />
              </td>
              <td className="border border-table-border p-2 text-center">
                {row.status === "Pending"
                  ? ["Pass", "Fail", "Pending"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(row.id, status)}
                        className={`px-3 py-1 rounded mx-1 ${
                          status === "Pass"
                            ? "bg-green-500 text-white"
                            : status === "Fail"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {status}
                      </button>
                    ))
                  : getStatusElement(row.status, row.id)}
              </td>
              <td className="border border-table-border p-2">
                <input
                  value={row.remark}
                  onChange={(e) =>
                    setRows(
                      rows.map((r) =>
                        r.id === row.id ? { ...r, remark: e.target.value } : r
                      )
                    )
                  }
                  className="border p-1 w-full dark:bg-gray-800 dark:text-white"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
      >
        Submit Test
      </button>
    </div>
  );
}

export default PredriveTest;
