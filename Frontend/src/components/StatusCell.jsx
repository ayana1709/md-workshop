import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import api from "@/api";
import { toast } from "react-toastify";

const StatusCell = ({ repair }) => {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(repair.status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const res = await api.post(`/update-status/${repair.id}`, {
        status: newStatus,
      });
      setStatus(newStatus);
      toast.success(res.data.message || "Status updated");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    "not started": "bg-gray-400 text-white",
    started: "bg-blue-400 text-white",
    pending: "bg-yellow-400 text-black",
    "in progress": "bg-purple-400 text-white",
    completed: "bg-green-500 text-white",
  };

  return (
    <td className="px-2 border border-table-border relative">
      {editing ? (
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={loading}
          className="w-full p-1 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="not started">Not Started</option>
          <option value="started">Started</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      ) : (
        <div
          className={`text-center font-semibold py-1 rounded-md cursor-pointer ${
            statusStyles[status] || "bg-gray-300 text-black"
          }`}
          onClick={() => setEditing(true)}
        >
          {status} <FaEdit className="inline ml-1 text-xs" />
        </div>
      )}
    </td>
  );
};

export default StatusCell;
