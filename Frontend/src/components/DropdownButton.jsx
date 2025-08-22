import React, { useEffect, useRef } from "react";
import { FaRegWindowClose } from "react-icons/fa";
import { useStores } from "../contexts/storeContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";
import DescriptionModal from "./DescriptionModal";

function DropdownButton({
  item,
  id,
  job_id,
  handlePrint,
  handleDelete,
  handlePrintsummary,
  type,
}) {
  const {
    setDropdownOpen,
    setIsModalOpen,
    setType,
    setSelectedRepairId,
    setIsStatusModalOpen,
  } = useStores();

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] =
    React.useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // ✅ Don’t close dropdown if clicking inside modal
      const modal = document.querySelector("#description-modal");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!modal || !modal.contains(event.target))
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [setDropdownOpen]);

  const handleNavigation = async (option, id) => {
    if (option === "send to payment") {
      try {
        const response = await api.get(`/repairs/${id}`);
        const repair = response.data;

        if (!repair) {
          Swal.fire("Error", "Repair not found.", "error");
          return;
        }

        if (repair.status?.toLowerCase() !== "completed") {
          Swal.fire(
            "Cannot Proceed",
            "Repair must be completed before sending to payment.",
            "warning"
          );
          return;
        }

        navigate(`/send-to-payment/${id}`);
      } catch (error) {
        console.error("Error fetching repair:", error);
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

    if (routes[option]) {
      navigate(routes[option]);
    }
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute pt-6 z-[999999999] right-2 top-32 -translate-y-1/2 mt-2 w-48 bg-white border border-green-300 rounded-md shadow-md"
      >
        <div
          onClick={() => setDropdownOpen(null)}
          className="cursor-pointer relative"
        >
          <FaRegWindowClose
            color="#ef4444"
            className="absolute right-4 -top-2"
            size={20}
          />
        </div>

        {[
          "Task",
          "View",
          "Edit",
          "Delete",
          "Proceed to workorder",
          "send to payment",
          "Print job Card",
          "Print Summary",
          "change status",
        ].map((option, index, arr) => (
          <button
            key={index}
            className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 ${
              index !== arr.length - 1
                ? "border-b border-gray-200"
                : "border-t border-gray-200"
            }`}
            onClick={() => {
              if (option === "Delete") {
                setIsModalOpen(true);
                setType(type);
                setSelectedRepairId(id);
                setDropdownOpen(null);
              } else if (option === "change status") {
                setIsStatusModalOpen(true);
                setSelectedRepairId(id);
                setDropdownOpen(null);
              } else if (option === "Print Summary") {
                handlePrintsummary(id);
                setDropdownOpen(null);
              } else if (option === "Print job Card") {
                handlePrint(id);
                setDropdownOpen(null);
              } else {
                handleNavigation(option, id);
                setDropdownOpen(null);
              }
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 🔥 Place modal here so it actually renders */}
    </>
  );
}

export default DropdownButton;
