import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ButtonOperation from "../ButtonOperation";

const ItemOutList = () => {
  const [itemsOut, setItemsOut] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const dropdownRef = useRef(null);

  const filteredItems = itemsOut.filter(
    (item) =>
      (item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (plateNumber === "" ||
        (item.plate_number &&
          String(item.plate_number)
            .toLowerCase()
            .trim()
            .includes(plateNumber.toLowerCase().trim()))) &&
      (startDate === "" || new Date(item.date_out) >= new Date(startDate)) &&
      (endDate === "" || new Date(item.date_out) <= new Date(endDate))
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayeditems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const headers = [
    "id",
    "code",
    "description",
    "partNumber",
    "plate_number",
    "brand",
    "model",
    "condition",
    "requestquantity",
    "unitPrice",
    "totalPrice",
    "requestedby",
    "date_out",
  ];

  const flattenedData = displayeditems.flatMap((repair) => {
    let spareDetails = [];

    try {
      // Parse sparedetails if it's a valid JSON string
      spareDetails = repair.sparedetails ? JSON.parse(repair.sparedetails) : [];
    } catch (error) {
      console.error("Error parsing sparedetails:", error);
      spareDetails = [];
    }

    return spareDetails.map((detail) => ({
      id: repair.id,
      code: detail.code,
      description: detail.description,
      partNumber: detail.partNumber,
      plate_number: repair.plate_number,
      brand: detail.brand,
      model: detail.model,
      condition: detail.condition,
      requestquantity: detail.requestquantity,
      unitPrice: detail.unitPrice,
      totalPrice: detail.totalPrice,
      requestedby: detail.requestedby,
      date_out: detail.date_out,
      status: repair.status,
    }));
  });

  useEffect(() => {
    const fetchItemsOut = async () => {
      try {
        const response = await api.get("/items/out-of-stock");
        setItemsOut(response.data.items);
      } catch (error) {
        console.error("Error fetching item out records:", error);
        toast.error("Failed to fetch item out records");
      }
    };
    fetchItemsOut();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg">
      <h2 className="uppercase tracking-wider text-green-500 text-xl font-bold text-left mb-6">
        Item Out List / ከመከማቻ የወጡ እቃ ዝርዝር
      </h2>
      <div className="flex justify-between items-center mb-4">
        <div className="w-full flex gap-2">
          <div
            className={`laptop:w-[30%] overflow-hidden ${
              selectedRows > 0 ? "desktop:w-[11%]" : "desktop:w-[12%]"
            }`}
          >
            <select
              className="w-full border-2 dark:bg-gray-800 border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded px-4 py-2 rounded-md cursor-pointer transition-all duration-300"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>{`View ${num}`}</option>
              ))}
            </select>
          </div>
          {selectedRows > 0 ? (
            <button className="bg-red-500 hover:bg-red-800 text-white px-4 py-2 rounded-md border-none transition-all duration-500">
              Delete
            </button>
          ) : (
            <>
              <div className="desktop:w-[18%]">
                <input
                  type="text"
                  placeholder="Search by code or description..."
                  className="w-full border-2 dark:bg-gray-800 placeholder:dark:text-white border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-md px-4 py-2 cursor-pointer transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="desktop:w-[18%]">
                <input
                  type="text"
                  placeholder="Filter by Plate Number"
                  className="w-full border-2 dark:bg-gray-800 placeholder:dark:text-white border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-md px-4 py-2 cursor-pointer transition-all duration-300"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </div>
              <div className="desktop:w-[16%]">
                <input
                  type="date"
                  className="w-full border-2 dark:bg-gray-800 placeholder:dark:text-white border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-md px-4 py-2 cursor-pointer transition-all duration-300"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="desktop:w-[16%]">
                <input
                  type="date"
                  className="w-full border-2 dark:bg-gray-800 placeholder:dark:text-white border-green-500 focus:border-green-600 ring-0 outline-none focus:ring-0 focus:outline-none rounded-md px-4 py-2 cursor-pointer transition-all duration-300"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
          <div>
            <ButtonOperation
              tableData={displayeditems} // ✅ Pass transformed flat data
              headers={headers}
              filename="Item out List "
              headerMappings={headerMappings}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-fixed min-w-full table-auto w-full border-collapse border border-table-border overflow-x-auto">
          <thead className="bg-table-head border-table-border text-white text-xs">
            <tr className="border-table-border py-2">
              <th className="border border-table-border p-2 w-[40px] text-left overflow-hidden">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedRows.length === displayeditems.length}
                  className="focus:dark:bg-gray-600 ring-0 outline-none focus:ring-0 focus:border-none focus:outline-none dark:bg-gray-800 dark:text-gray-200 placeholder:dark:text-gray-200 dark:border-gray-400"
                />
              </th>
              <th className="border border-table-border p-2 w-[70px]">#</th>
              <th className="border border-table-border p-2 w-[80px]">Code</th>
              <th className="borde border-table-border r p-2 w-[100px]">
                Description
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Part Number
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Plate Number
              </th>
              <th className="border border-table-border p-2 w-[80px]">Brand</th>
              <th className="border border-table-border p-2 w-[80px]">Model</th>
              <th className="border border-table-border p-2 w-[90px]">
                Condition
              </th>
              <th className="border border-table-border p-2 w-[90px]">
                Quantity
              </th>
              <th className="border border-table-border p-2 w-[90px]">
                Unit Price
              </th>
              <th className="border border-table-border p-2 w-[90px]">
                Total Price
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Requested By
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Date Out
              </th>
              <th className="border border-table-border p-2 w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayeditems.length === 0 ? (
              <tr>
                <td colSpan="14" className="text-center py-4 text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              displayeditems.map((item) => (
                <tr
                  key={item.id}
                  className="border hover:bg-gray-100 hover:dark:bg-gray-600"
                >
                  <td className="border border-table-border px-2 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => toggleRowSelection(item.id)}
                      className="focus:dark:bg-gray-600 ring-0 outline-none focus:ring-0 focus:border-none focus:outline-none dark:bg-gray-800 dark:text-gray-200 placeholder:dark:text-gray-200 dark:border-gray-400"
                    />
                  </td>
                  <td className="px-4 border border-table-border py-3">
                    {item.id}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.code}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.partNumber}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.plate_number}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.brand}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.model}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.condition}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.requestquantity}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.unitPrice}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.totalPrice}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {item.requestedby}
                  </td>
                  <td className="px-4 py-3 border border-table-border">
                    {new Date(item.date_out).toLocaleDateString()}
                  </td>
                  <td className="border border-table-border border border-table-border px-2 py-3 relative">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="bg-blue-600 text-white px-2 py-1 rounded flex items-center hover:bg-blue-700 focus:ring focus:ring-blue-300"
                      >
                        Action <FiChevronDown className="ml-2" />
                      </button>
                      {dropdownOpen === item.id && (
                        <div className="absolute right-0 w-40 bg-white dark:bg-gray-800 dark:border-gray-600 border rounded-lg shadow-lg mt-1 z-50">
                          <button
                            onClick={() => handlePrint(item)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-600"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleView(item.id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 hover:dark:bg-gray-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          disabled={currentPage === 1}
          variant="contained"
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          variant="contained"
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ItemOutList;
