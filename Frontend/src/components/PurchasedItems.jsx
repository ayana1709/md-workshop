import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import api from "../api";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ButtonOperation from "./ButtonOperation";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ButtonItemOperation from "./ButtonItemOperation";
import DropdownButton from "./DropdownButton";
import { useStores } from "../contexts/storeContext";
import StoredropDown from "./StoreDropdown";
import { FaRegWindowClose } from "react-icons/fa";

const TotalItem = () => {
  const [items, setItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchItem, setSearchItem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const { dropdownOpen, setDropdownOpen } = useStores();
  const [selectedRows, setSelectedRows] = useState([]);
  console.log(items);
  const headers = [
    "id",
    "code",
    "description",
    "partNumber",
    "brand",
    "model",
    "condition",
    "unitPrice",
    "totalPrice",
  ];

  const headerMappings = {
    id: "Job ID",
    code: "Code",
    description: "Description",
    partNumber: "Part Number",
    brand: "Brand",
    model: "Model",
    condition: "Status",
    unitPrice: "Unit Price",
    totalPrice: "Total Price",
  };
  // console.log(items);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/purchase-items"); // Fetch data from backend
        setItems(response.data); // Ensure the response structure matches
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
      "Add to Sale": `/add-to-work-order/${id}`,
      "Add to Item Out": `/request-spare/${id}`,
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
  const handleViewHistory = (repairCode) => {
    navigate(`/history/${repairCode}`); // Navigate to history page
  };

  // Toggle selection of a row
  const toggleRowSelection = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle selection of all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === displayeditems.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayeditems.map((repair) => repair.id));
    }
  };
  const deleteSelectedRows = async () => {
    if (selectedRows.length === 0) return alert("No rows selected");

    try {
      const response = await api.delete("/repairs", {
        data: { repair_ids: selectedRows },
        headers: { "Content-Type": "application/json" },
      });

      console.log(response.data.message); // Log success message
      setSelectedRows([]); // Clear selection
    } catch (error) {
      console.error("Error deleting repairs:", error);

      // Ensure `error.response.data` exists before accessing message
      // alert(error.response?.data?.message || "Failed to delete repairs");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
      <h2 className="uppercase tracking-wider text-green-600 text-xl font-bold text-left mb-6">
        Purchase List/የግዢ ዝርዝር
      </h2>
      <div className="w-full flex phone:flex-col laptop:flex-row gap-4 justify-start phone:mt-12 desktop:mt-0 mb-4">
        <div className="laptop:w-[20%] desktop:w-[7%] overflow-hidden">
          <select
            className="w-full text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-700 focus:ring-0 focus:outline-none ring-0 outline-none hover:cursor-pointer px-2 py-2 overflow-hidden border-2 border-green-500 focus:border-green-600 rounded-md transition-all duration-300"
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

        {selectedRows.length > 0 ? (
          <div className="flex gap-2 items-center overflow-hidden">
            <button className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-green-500 transition-all duration-500">
              Item Out
            </button>
            <button className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-orange-500 transition-all duration-500">
              Request Purchase
            </button>
            <button className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-blue-500 transition-all duration-500">
              Edit
            </button>
            <button className="border-none text-white hover:bg-green-800 px-4 py-2 rounded-md bg-red-500 transition-all duration-500">
              Delete
            </button>
          </div>
        ) : (
          <>
            <div className="desktop:w-[10%]">
              <input
                type="date"
                className="w-full dark:bg-gray-800 dark:text-white border-2 border-green-500 ring-0 focus:border-green-600 focus:ring-0 focus:outline-none rounded-lg px-2 py-2 overflow-hidden"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="desktop:w-[10%]">
              <input
                type="date"
                className="w-full dark:bg-gray-800 dark:text-white border-2 border-green-500 focus:ring-0 focus:outline-none focus:border-green-600 rounded-lg px-2 py-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="desktop:w-[7%] border border-green-500 ring-0 hover:shadow-md focus:border-green-600 bg-green-500 hover:bg-green-600 rounded-md tansition-all duration-300">
              <button
                onClick={handleFilter}
                className="w-full text-white tracking-wider px-4 py-2 rounded-lg"
              >
                Filter
              </button>
            </div>
            <div className="desktop:w-[10%] border-2 border-green-500 dark:bg-gray-800 ring-0 focus:border-green-600 flex items-center px-2 rounded-lg overflow-hidden">
              <FiSearch className="text-gray-600 dark:text-white" />
              <input
                type="text"
                className="w-full bg-transparent placeholder:dark:text-white border-none focus:ring-0 focus:outline-none ml-2 rounded-md"
                placeholder="Search..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
            </div>

            <div className="desktop:w-[45%]">
              <ButtonItemOperation
                tableData={displayeditems}
                headers={headers}
                filename="Total  Items In the Store "
                headerMappings={headerMappings}
                path="purchase/add-purchase"
              />
            </div>
          </>
        )}
      </div>

      <div className="overflow-x-auto phone:mt-20 tablet:mt-0">
        <table className="w-full border border-table-border rounded-lg shadow-md">
          <thead className="bg-table-head text-white text-sm">
            <tr className="text-left border-table-border py-2">
              <th className="border border-table-border p-2 w-[50px] overflow-hidden">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedRows.length === displayeditems.length}
                  className="focus:dark:bg-gray-600 ring-0 outline-none focus:ring-0 focus:border-none focus:outline-none dark:bg-gray-800 dark:text-gray-200 placeholder:dark:text-gray-200 dark:border-gray-400"
                />
              </th>
              <th className="border border-table-border p-2 w-[70px]">#</th>
              <th className="border border-table-border p-2 w-[130px]">Code</th>
              <th className="border border-table-border p-2 w-[220px]">
                Description
              </th>
              <th className="borde border-table-borderr p-2 w-[160px]">
                Part Number
              </th>
              <th className="border border-table-border p-2 w-[130px]">
                Brand
              </th>
              <th className="border border-table-border p-2 w-[140px]">
                Model
              </th>
              <th className="border border-table-border p-2 w-[110px]">
                Quantity
              </th>

              <th className="border border-table-border p-2 w-[90px]">
                U.Price
              </th>
              <th className="border border-table-border p-2 w-[140px]">
                Total Price
              </th>
              <th className="border border-table-border p-2 w-[140px]">
                Status
              </th>

              <th className="border border-table-border p-2 w-[90px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayeditems.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              displayeditems.map((repair) => (
                <tr
                  key={repair.id}
                  className="relative text-sm border border-table-border hover:shadow-sm hover:shadow-gray-300 hover:bg-gray-100 hover:dark:bg-gray-600 hover:cursor-pointer transition-all"
                >
                  <td className="border border-table-border px-2 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(repair.id)}
                      onChange={() => toggleRowSelection(repair.id)}
                      className="focus:dark:bg-gray-600 ring-0 outline-none focus:ring-0 focus:border-none focus:outline-none dark:bg-gray-800 dark:text-gray-200 placeholder:dark:text-gray-200 dark:border-gray-400"
                    />
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.id}
                  </td>
                  <td className="border border-table-border px-4 py-3 font-medium">
                    {repair.code}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.description}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.part_number}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.brand}
                  </td>
                  <td className="border border-table-border px-4 py-3">
                    {repair.model || "N/A"}
                  </td>
                  <td
                    className={`border border-table-border px-4 py-3 ${
                      repair.quantity === 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {repair.quantity}
                  </td>
                  <td className="border border-table-border px-4 py-3 ">
                    {repair.unit_price || "N/A"}
                  </td>
                  <td className="border border-table-border px-4 py-3 ">
                    {repair.total_price || "N/A"}
                  </td>

                  <td className="border border-table-border px-2 py-1">
                    <div
                      className={`${
                        repair.quantity > 0 ? "bg-green-500" : "bg-red-500"
                      } px-2 py-[3px] rounded-md text-center`}
                    >
                      {repair.quantity > 0
                        ? "Available"
                        : "Not Available" || ""}
                    </div>
                  </td>

                  <td className="border border-table-border px-4 py-3 relative">
                    <button
                      onClick={() => setDropdownOpen(repair.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      Action <FiChevronDown className="ml-2" />
                    </button>

                    {dropdownOpen === repair.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg z-10">
                        {[
                          {
                            label: "View History",
                            action: () => handleViewHistory(repair.code),
                          },
                          {
                            label: "Delete",
                            action: () => handleDeleteClick(repair.id),
                          },
                          {
                            label: "Edit",
                            action: () => handleDeleteClick(repair.id),
                          },
                        ].map((item, index) => (
                          <>
                            <button
                              key={index}
                              className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-200 hover:dark:bg-gray-600"
                              onClick={() => {
                                item.action(); // Execute the option action
                                toggleDropdown(null); // Close dropdown after selection
                              }}
                            >
                              {item.label}
                            </button>
                            <div
                              onClick={() => {
                                toggleDropdown(null); // Close dropdown after selection
                              }}
                              className="absolute right-2 top-2"
                            >
                              <FaRegWindowClose
                                size={20}
                                className="text-red-500 dark:text-red-700"
                              />
                            </div>
                          </>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
            {/* Custom Delete Confirmation Modal */}
            {/* <ConfirmDeleteModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleDelete}
            /> */}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-2 bg-gray-300 dark:bg-green-700 dark:text-white text-gray-700 rounded ${
            currentPage === 1
              ? "opacity-50 dark:opacity-100 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700 dark:text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-4 py-2 bg-gray-300 dark:bg-green-700 dark:text-white text-gray-700 rounded ${
            currentPage === totalPages
              ? "opacity-50 dark:opacity-100 cursor-not-allowed"
              : "hover:bg-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TotalItem;
