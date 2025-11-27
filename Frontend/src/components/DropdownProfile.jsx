import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Transition from "../utils/Transition";
import toast from "react-hot-toast";
import UserAvatar from "../images/ac.jpg";
import { useStores } from "@/contexts/storeContext";

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  const { companyData, setAdmin } = useStores();
  const navigate = useNavigate();

  const profileImage = companyData?.profile_image
    ? `${import.meta.env.VITE_API_URL}/storage/${companyData.profile_image}`
    : UserAvatar;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/");
  }, []);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (
        dropdownOpen &&
        dropdown.current &&
        !dropdown.current.contains(target) &&
        !trigger.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (dropdownOpen && keyCode === 27) setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const handleLogout = () => {
    localStorage.clear();
    setAdmin(false);
    toast.success("Logged out successfully!"); // ✅ Will now show
    navigate("/");
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex items-center group"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={profileImage}
          alt="User"
        />
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800">
            {companyData?.username || "Admin"}
          </span>
          <svg
            className="w-3 h-3 ml-1 fill-current text-gray-400"
            viewBox="0 0 12 12"
          >
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={dropdown}>
          <div className="py-2 px-3 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-800 dark:text-gray-100">
              {companyData?.username || "Admin"}
            </div>
          </div>
          <ul>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 py-2 px-3"
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;
