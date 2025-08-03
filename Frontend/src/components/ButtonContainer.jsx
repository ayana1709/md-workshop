import { useState } from "react";
import { FiSearch } from "react-icons/fi";

function ButtonContainer() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const handleFilter = () => {
    let filteredRepairs = repairs;
    if (startDate && endDate) {
      filteredRepairs = filteredRepairs.filter((repair) => {
        const repairDate = new Date(repair.received_date);
        return (
          repairDate >= new Date(startDate) && repairDate <= new Date(endDate)
        );
      });
    }
    if (searchTerm) {
      filteredRepairs = filteredRepairs.filter((repair) =>
        repair.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredRepairs;
  };
  return (
    <div className="flex flex-wrap gap-3 justify-start mb-4">
      <select
        className="bg-white text-gray-700 px-2 py-2 rounded-lg shadow-md border border-gray-300"
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
      >
        {[5, 10, 20, 50].map((num) => (
          <option key={num} value={num}>
            View {num}
          </option>
        ))}
      </select>
      <button
        onClick={() => navigate("/step-1")}
        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
      >
        Add New Job
      </button>
      <input
        type="date"
        className="border rounded-lg px-2 py-2 shadow-md"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        className="border rounded-lg px-2 py-2 shadow-md"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button
        onClick={handleFilter}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600"
      >
        Filter
      </button>
      <div className="flex items-center bg-gray-200 px-3 py-2 rounded-lg shadow-md">
        <FiSearch className="text-gray-600" />
        <input
          type="text"
          className="bg-transparent border-none focus:outline-none ml-2"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}

export default ButtonContainer;
