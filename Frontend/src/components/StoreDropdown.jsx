import { FaRegWindowClose } from "react-icons/fa";
import { useStores } from "../contexts/storeContext";
import { useNavigate } from "react-router-dom";

function StoredropDown({ item, id }) {
  const { setDropdownOpen } = useStores();
  const navigate = useNavigate();
  const handleNavigation = (option, id) => {
    const routes = {
      View: `/viewrepair/${id}`,
      Edit: `/edit-repair/${id}`,
      Delete: `/delete/${id}`,
    };

    if (routes[option]) {
      navigate(routes[option]);
    }
  };
  return (
    <div className="absolute pt-6 z-[999999999] right-2 top-20 -translate-y-1/2 mt-2 w-48 bg-white border border-green-300 rounded-md shadow-md">
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
      {["View", "Edit", "Delete"].map((option, index, arr) => (
        <button
          key={index}
          className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200
          ${
            index !== arr.length - 1
              ? "border-b border-gray-200"
              : "border-t border-gray-200"
          }
        `}
          onClick={() => {
            if (option === "Delete") {
              handleDeleteClick(item.id, "repair");
            } else if (option === "Print") {
              handlePrint(item.id);
            } else {
              handleNavigation(option, id);
            }
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default StoredropDown;
