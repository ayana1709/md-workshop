import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import Swal from "sweetalert2";

import api from "@/api";

const ActionDropdown = ({ row, onDelete }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ use jobId instead of job_id
  const jobId = row.original.jobId;

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded inline-flex items-center gap-1"
      >
        Action <FaChevronDown className="text-xs" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-md z-20">
          <div className="flex justify-end px-2 py-1 border-b">
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          </div>

          <button
            onClick={() => {
              navigate(`/payments/${jobId}`);
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
          >
            View
          </button>

          <button
            onClick={() => {
              navigate(`/payments/edit/${jobId}`);
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
          >
            Edit
          </button>

          <button
            onClick={async () => {
              await onDelete(jobId); // ✅ Calls deleteRow with correct jobId
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
          >
            Delete
          </button>

          <button
            onClick={() => {
              navigate(`/payments/attachment/${jobId}`);
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
          >
            Print Attachment
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
