import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";

import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ButtonOperation from "./../ButtonOperation";
import ConfirmDeleteModal from "./../ConfirmDeleteModal";
import api from "../../api";

const TotalRequest = () => {
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
  const [selectedRows, setSelectedRows] = useState([]);
  console.log(selectedRows);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayeditems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const headers = [
    "id",
    "code",
    "date",
    "description",
    "partnumber",
    "brand",
    "modal",
    "plate_number",
    "requestquantity",
    "requestedby",
    "condition",
    "unitprice",
    "totalprice",
    "status",
  ];

  const flattenedData = displayeditems.flatMap(
    (repair) =>
      repair.sparedetails?.map((detail) => ({
        id: repair.id,
        code: detail.code,
        date: detail.date,
        description: detail.description,
        partnumber: detail.partnumber,
        brand: detail.brand,
        modal: detail.modal,
        plate_number: repair.plate_number,
        requestquantity: detail.requestquantity,
        requestedby: detail.requestedby,
        condition: detail.condition,
        unitprice: detail.unitPrice, // Ensure key name matches headerMappings
        totalprice: detail.totalPrice, // Ensure key name matches headerMappings
        status: repair.status,
      })) || []
  );

  const headerMappings = {
    id: "Job ID",
    code: "Code",
    date: "Date",
    description: "Description",
    partnumber: "Part Number",
    brand: "Brand",
    modal: "Model",
    plate_number: "Plate Number",
    requestquantity: "Request Quantity",
    requestedby: "Requested By",
    condition: "Condition",
    unitPrice: "Unit Price",
    totalPrice: "Total Price",
    status: "Status",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch spare requests (incoming requests)
        const spareResponse = await api.get("/spare-Request");
        let spareItems = Array.isArray(spareResponse.data.data)
          ? spareResponse.data.data
          : [];

        // Filter items to only include those with status "Pending"
        spareItems = spareItems.filter((item) => item.status === "Item Out");

        // Fetch store items (which contain unit price)
        const storeResponse = await api.get("/store-items");
        const storeItems = Array.isArray(storeResponse.data.items)
          ? storeResponse.data.items
          : [];

        // Create a map of unit prices based on the item code
        const storeItemsMap = storeItems.reduce((acc, item) => {
          acc[item.code] = item.unitPrice; // Store unit price by code
          return acc;
        }, {});

        // Merge unit prices into spare details and calculate total price
        const updatedSpareItems = spareItems.map((item) => ({
          ...item,
          sparedetails: item.sparedetails?.map((detail) => {
            const unitPrice = storeItemsMap[detail.code] || 0; // Get unit price
            const totalPrice = detail.requestquantity * unitPrice; // Calculate total price

            return {
              ...detail,
              unitPrice,
              totalPrice, // Add total price
            };
          }),
        }));

        setItems(updatedSpareItems);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await api.patch(`/spare-requests/${id}/status`, {
        status: newStatus,
      });
      toast.success(response.data.message);

      // Update the status in the frontend
      setItems((prevItems) =>
        prevItems.map((repair) =>
          repair.id === id ? { ...repair, status: newStatus } : repair
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks inside the dropdown
      if (
        dropdownOpen !== null &&
        !event.target.closest(".dropdown-container")
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => (prev === id ? null : id)); // Toggle open/close
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

  return (
    <div className="relative p-6 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
      <div className="w-full flex phone:flex-col laptop:flex-row gap-4 justify-start phone:mt-12 desktop:mt-0 mb-4">
        <div className="laptop:w-[30%] desktop:w-[10%] overflow-hidden">
          <select
            className="w-full text-sm bg-white text-gray-700 hover:cursor-pointer hover:bg-blue-100 hover:opacity-95 px-2 py-2 overflow-hidden border border-blue-500 rounded-md transition-all duration-300"
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

        <div className="desktop:w-[12%]">
          <input
            type="date"
            className="w-full border border-blue-500 rounded-lg px-2 py-2 overflow-hidden"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="desktop:w-[12%]">
          <input
            type="date"
            className="w-full border border-blue-500 rounded-lg px-2 py-2"
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
        <div className="desktop:w-[12%] border border-blue-500 flex items-center bg-gray-200 px-2 rounded-lg shadow-md overflow-hidden">
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
          <ButtonOperation
            tableData={flattenedData} // ✅ Pass transformed flat
            data
            headers={headers}
            filename="Total Request Item Out "
            headerMappings={headerMappings}
          />
        </div>
      </div>

      <div className="overflow-x-auto phone:mt-20 tablet:mt-0">
        <table className="w-full border border-table-border rounded-lg shadow-md">
          <thead className="bg-table-head text-gray-700 text-xs">
            <tr>
              {[
                "#",
                "Code",
                "Date",
                "Description",
                "PartNumber",
                "Brand",
                "Model",
                "Plate Number",
                "Requested Qty",
                "Requested By",
                "Condition",
                "Unit Price",
                "Total Price",
                "Status",
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
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              displayeditems.map((repair) =>
                repair.sparedetails && repair.sparedetails.length > 0 ? (
                  repair.sparedetails.map((detail, index) => (
                    <tr
                      key={`${repair.id}-${index}`}
                      className="border border-table-border"
                    >
                      <td className="border border-table-border px-4 py-2">
                        {detail.id}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.code}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.date}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.description}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.partnumber}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.brand}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.modal}
                      </td>
                      {/* Display the Plate Number only once per repair */}
                      {index === 0 && (
                        <td
                          rowSpan={repair.sparedetails.length}
                          className="border border-table-border px-4 py-2 text-center font-semibold"
                        >
                          {repair.plate_number}
                        </td>
                      )}
                      <td className="border border-table-border px-4 py-2">
                        {detail.requestquantity}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.requestedby}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.condition}
                      </td>
                      <td className="border border-table-border px-4 py-2">
                        {detail.unitPrice}
                      </td>
                      <td className="border border-table-border px-4 py-2 font-semibold text-green-600">
                        {detail.totalPrice}
                      </td>

                      <td
                        className={`border border-table-border px-4 py-2 font-semibold 
    ${
      repair.status === "Pending"
        ? "text-yellow-500"
        : repair.status === "Item Out"
        ? "text-green-500"
        : "text-red-500"
    }`}
                      >
                        {repair.status}
                      </td>
                      <td className="px-4 py-3 relative dropdown-container">
                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown from closing immediately
                            toggleDropdown(repair.id);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded flex items-center hover:bg-blue-700 transition-all duration-200"
                        >
                          Action <FiChevronDown className="ml-2" />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen === repair.id && (
                          <div
                            className="absolute w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg z-50 dropdown-menu transition-all duration-200"
                            style={{
                              top: "100%",
                              left: "0",
                              minWidth: "160px",
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {[
                              { label: "Add to Pending", status: "Pending" },
                              {
                                label: "Cancel The Request",
                                status: "Canceled",
                              },
                              { label: "Add to Item Out", status: "Item Out" },
                            ].map((option, index) => (
                              <button
                                key={index}
                                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 hover:text-blue-600 transition-all duration-150"
                                onClick={() => {
                                  updateStatus(repair.id, option.status);
                                  setDropdownOpen(null); // Close dropdown after selection
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={repair.id} className="border border-table-border">
                    <td className="border border-table-border px-4 py-2 text-center font-semibold">
                      {repair.plate_number}
                    </td>
                    <td
                      colSpan="6"
                      className="border border-table-border px-4 py-2 text-gray-500 text-center"
                    >
                      No spare details available
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-4 py-2 bg-table-border dark:bg-green-700 dark:text-white text-gray-700 rounded ${
            currentPage === 1
              ? "opacity-50 dark:opacity-100 cursor-not-allowed"
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
          className={`px-4 py-2 bg-table-border dark:bg-green-700 dark:text-white text-gray-700 rounded ${
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

export default TotalRequest;
