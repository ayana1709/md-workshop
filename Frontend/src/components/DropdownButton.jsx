import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";
import { useStores } from "../contexts/storeContext";

function DropdownButton({
  id,
  job_id,
  handlePrint,
  handleDelete,
  handlePrintsummary,
  type,
  onClose,
}) {
  const { setIsModalOpen, setType, setSelectedRepairId, setIsStatusModalOpen } =
    useStores();

  const navigate = useNavigate();

  const handleNavigation = async (option, id) => {
    if (option === "send to payment") {
      try {
        const { data: repair } = await api.get(`/repairs/${id}`);
        if (!repair) return Swal.fire("Error", "Repair not found.", "error");
        if (repair.status?.toLowerCase() !== "completed") {
          return Swal.fire(
            "Cannot Proceed",
            "Repair must be completed before sending to payment.",
            "warning"
          );
        }
        navigate(`/send-to-payment/${id}`);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to check repair status.", "error");
      }
      return;
    }

    const routes = {
      Task: `/description/${job_id}`,
      View: `/viewrepair/${id}`,
      Edit: `/edit-${type}/${id}`,
      Delete: `/delete/${id}`,
      "Proceed to workorder": `/add-to-work-order/${id}`,
      "Out Source": `/out-source/${id}`,
      "addd to jobmanagemnt": `/addd-to-jobmanagemnt/${id}`,
    };

    if (routes[option]) navigate(routes[option]);
  };

  const options = [
    "Task",
    "View",
    "Edit",
    "Delete",
    "Proceed to workorder",
    "send to payment",
    "Print job Card",
    "job Summary",
    // "change status",
  ];

  return (
    <div className="bg-gray-200 rounded-md border border-green-300 shadow-md py-1">
      {/* optional close row */}
      <div className="flex justify-end px-2 py-1">
        <button
          onClick={onClose}
          className="text-red-500 text-xs font-semibold hover:underline"
        >
          X
        </button>
      </div>

      {options.map((option, index) => (
        <button
          key={option}
          className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${
            index !== options.length - 1 ? "border-b border-gray-200" : ""
          }`}
          onClick={() => {
            if (option === "Delete") {
              setIsModalOpen(true);
              setType(type);
              setSelectedRepairId(id);
              onClose();
            } else if (option === "change status") {
              setIsStatusModalOpen(true);
              setSelectedRepairId(id);
              onClose();
            } else if (option === "job Summary") {
              handlePrintsummary(id);
              onClose();
            } else if (option === "Print job Card") {
              handlePrint(id);
              onClose();
            } else {
              handleNavigation(option, id);
              onClose();
            }
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default DropdownButton;
