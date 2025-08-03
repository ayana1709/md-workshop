import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import api from "../api";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ButtonOperation from "./ButtonOperation";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const UpdateStore = () => {
  const [editedData, setEditedData] = useState({});
  const [items, setItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchItem, setSearchItem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  console.log(editedData);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/store-items"); // Adjust the endpoint as needed
        setItems(response.data.items); // Assuming API returns { items: [...] }
      } catch (error) {
        console.error("Error fetching store items:", error);
        toast.error("Failed to fetch store items");
      }
    };

    fetchItems();
  }, []);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  // Instant search for 'code'
  useEffect(() => {
    if (searchItem) {
      setFilteredItems(
        items.filter((item) =>
          item.code.toLowerCase().includes(searchItem.toLowerCase())
        )
      );
    } else {
      setFilteredItems(items);
    }
  }, [searchItem, items]); // Re-run when searchItem or items change

  const handleFilter = () => {
    let filteredData = items;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Ensure full-day inclusion

      filteredData = filteredData.filter((item) => {
        const receivedDate = new Date(item.created_at);
        return receivedDate >= start && receivedDate <= end;
      });
    }

    console.log("Filtered Data:", filteredData); // Log the filtered items
    setFilteredItems(filteredData);
  };

  // const filteredItems = handleFilter();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayeditems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const navigate = useNavigate();
  const handleNavigation = (option, id) => {
    const routes = {
      View: `/viewrepair/${id}`,
      Edit: `/edit-repair/${id}`,
      Delete: `/delete/${id}`,
      "Add to Work": `/add-to-work-order/${id}`,
      "Request Spare": `/request-spare/${id}`,
    };

    if (routes[option]) {
      navigate(routes[option]);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedRepairId(id); // Store the ID of the repair to delete
    setIsModalOpen(true); // Open the delete confirmation modal
  };

  const handleDelete = async () => {
    if (!selectedRepairId) return;

    try {
      const response = await api.delete(`/items/${selectedRepairId}`);
      toast.success(response.data.message);

      // Refresh list after deletion
      setItems((previtems) =>
        previtems.filter((repair) => repair.id !== selectedRepairId)
      );

      setIsModalOpen(false); // Close modal after deletion
      setSelectedRepairId(null);
    } catch (error) {
      toast.error("Error deleting repair:", error.response?.data || error);
    }
  };

  const handleSaveAll = async () => {
    if (Object.keys(editedData).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      // Convert editedData to an array of objects
      const updatePayload = {
        items: Object.entries(editedData).map(([id, fields]) => ({
          id, // Each item will have an 'id' field
          ...fields, // Spread the fields to include the updated values
        })),
      };

      // Send a bulk update request to Laravel API
      const response = await api.put("/store-items/bulk-update", updatePayload);

      if (response.status === 200) {
        toast.success("All changes saved successfully!");

        // Update local state with new values from editedData
        setItems((prevItems) =>
          prevItems.map((item) =>
            editedData[item.id] ? { ...item, ...editedData[item.id] } : item
          )
        );

        setEditedData({}); // Clear edited data after saving
        navigate("/inventory/total-items");
      } else {
        // Handle any unexpected responses
        toast.error("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Error updating items:", error);
      toast.error("Failed to save changes.");
    }
  };

  return (
    <div className="relative p-6 bg-white shadow-lg rounded-lg">
      <div className="w-full flex phone:flex-col laptop:flex-row gap-4 justify-start phone:mt-12 desktop:mt-0 mb-4">
        <div className="laptop:w-[30%] desktop:w-[10%] overflow-hidden">
          <select
            className="w-full text-sm bg-white text-gray-700 hover:cursor-pointer px-2 py-2 overflow-hidden border-3 border-green-700 focus:border-green-700 ring-0 focus:ring-0 outline-none focus:outlne-none rounded-md transition-all duration-300"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num} className="text-sm">
                View{num}
              </option>
            ))}
          </select>
        </div>

        <div className="desktop:w-[14%]">
          <input
            type="date"
            className="w-full border-3 border-green-700 rounded-lg px-2 py-2 focus:border-green-700 ring-0 focus:ring-0 outline-none focus:outline-none overflow-hidden"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="desktop:w-[14%]">
          <input
            type="date"
            className="w-full border-3 border-green-700 rounded-lg px-2 py-2 ring-0 focus:ring-0 focus:border-green-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="desktop:w-[10%]">
          <button
            onClick={handleFilter}
            className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            Filter
          </button>
        </div>
        <div className="desktop:w-[15%] border-3 border-green-700 flex items-center bg-gray-200 px-2 rounded-lg shadow-md overflow-hidden">
          <FiSearch className="text-gray-600" />
          <input
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none ml-2 rounded-md"
            placeholder="Search..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
          />
        </div>
        <div className="absolute mx-auto phone:top-2 phone:right-6 tablet:top-6 desktop:right-2">
          {/*
           */}
          <ButtonOperation tableData={displayeditems} />
        </div>
      </div>

      <div className="overflow-x-auto phone:mt-20 tablet:mt-0 overflow-hidden">
        <table className="w-full border border-table-border rounded-t-lg shadow-md">
          <thead className="bg-table-head border border-table-border text-white text-sm">
            <tr className="border border-table-border">
              {[
                "#",
                "Code",
                "part Number",
                "Description",
                "Quantity",
                "Brand",
                "Model",
                "Condition",
                "location",
                "Unit Price",
                "Total Price",

                "Action",
              ].map((header, index) => (
                <th
                  key={index}
                  className="text-sm px-4 py-3 border border-table-border text-left font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayeditems.length === 0 ? (
              <tr className="border border-table-border">
                <td colSpan="11" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              displayeditems.map((repair) => (
                <tr
                  key={repair.id}
                  className="border border-table-border hover:bg-white"
                >
                  <td className="px-4 py-3">{repair.id}</td>

                  {/* Editable Fields */}
                  {[
                    "code",
                    "partNumber",
                    "description",
                    "quantity",
                    "brand",
                    "model",
                    "condition",
                    "location",
                    "unitPrice",
                    "totalPrice",
                  ].map((key) => (
                    <td
                      key={key}
                      className="border border-table-border px-[4px] py-3"
                    >
                      <input
                        type="text"
                        className="w-full bg-transparent border focus:border-2 border-table-border ring-0 focus:ring-0 focus:border-green-700 rounded-[4px] outline-none focus:outline-none px-2 py-1 transition-all duration-300"
                        defaultValue={repair[key] || ""}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [repair.id]: {
                              ...prev[repair.id],
                              [key]: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                  ))}

                  {/* Action Button */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleAction(repair.id)}
                      className="bg-red-700 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Next
        </button>
      </div>
      <button
        onClick={handleSaveAll}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save All Changes
      </button>
    </div>
  );
};

export default UpdateStore;
