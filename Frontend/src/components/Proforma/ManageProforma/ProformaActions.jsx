import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

function ProformaActions({ row, onView, onPrint, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const { ref_num } = row.original; // ✅ Use ref_num instead of job_id
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-cyan-700 text-white font-medium shadow-sm hover:bg-cyan-600 transition"
      >
        Actions <ChevronDown size={18} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-50"
          style={{ minWidth: "8rem" }}
        >
          <button
            onClick={() => {
              setOpen(false);
              onView(ref_num);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            View
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onPrint(ref_num); // ✅ changed to ref_num
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Print
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onEdit(ref_num); // ✅ changed to ref_num
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete(ref_num); // ✅ changed to ref_num
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ProformaActions;
