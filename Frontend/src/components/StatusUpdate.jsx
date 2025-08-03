import { useState } from "react";
import axios from "axios";
import api from "../api";
import { useStores } from "../contexts/storeContext";
import { toast } from "react-toastify";
import { FaRegWindowClose } from "react-icons/fa";

const StatusUpdate = ({ repairId, currentStatus }) => {
  const {
    isStatusModalOpen,
    setIsStatusModalOpen,
    handleDelete,
    selectedRepairId,
    type,
  } = useStores();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log(status);

  const handleChangeStatus = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/update-status/${selectedRepairId}`, // Use full API URL if needed
        { status }
      );

      toast.success(response.data.message); // Show success message
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black bg-opacity-50">
      {" "}
      <div className="absolute w-1/2 h-1/2 z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white shadow-md rounded-lg">
        <div
          onClick={() => setIsStatusModalOpen(false)}
          className="absolute top-2 right-4"
        >
          <FaRegWindowClose
            size={30}
            className="text-red-500 cursor-pointer hover:text-red-700 transition-all duration-300"
          />
        </div>
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800">
              Select Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border rounded-md border-blue-600 ring-0 outline-none focus:border focus:border-gray-200"
            >
              <option value="not started" className="text-gray-600">
                Not Started
              </option>
              <option value="started" className="text-gray-600">
                Started
              </option>
              <option value="pending" className="text-gray-600">
                Pending
              </option>
              <option value="in progress" className="text-gray-600">
                In Progress
              </option>
              <option value="completed" className="text-gray-600">
                Completed
              </option>
            </select>
          </div>

          <button
            onClick={handleChangeStatus}
            className={`px-4 py-2 rounded-md text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition`}
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdate;
