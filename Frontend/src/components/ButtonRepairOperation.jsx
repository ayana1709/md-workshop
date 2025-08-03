import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import logo from "../images/aa.png"; // Ensure this logo path is correct
import { IoMdArrowDropdown } from "react-icons/io";
import { TiDocumentAdd } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";
import { GrDocumentUpdate } from "react-icons/gr";

function ButtonRepairOperation({
  tableData,
  headers,
  filename,
  headerMappings,
}) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Company Information
  const companyInfo = {
    name: "SPEEDMETER TRADING PLC",
    phone: "+251 98 999 9900",
    address: "Sub City Bole Michael No 1701/01, Addis Ababa, Ethiopia",
    tin: "TIN: 123-456-789",
    logo: logo,
  };

  // Function to Export PDF
  const exportPDF = (title, data) => {
    const doc = new jsPDF({ orientation: "landscape" }); // Set landscape mode for wider tables
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add Company Logo & Header
    doc.addImage(companyInfo.logo, "PNG", pageWidth / 2 - 25, 10, 50, 20);
    doc.setFontSize(14);
    doc.text(companyInfo.name, pageWidth / 2, 35, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      `Phone: ${companyInfo.phone} | ${companyInfo.address}`,
      pageWidth / 2,
      45,
      { align: "center" }
    );
    doc.text(companyInfo.tin, pageWidth / 2, 55, { align: "center" });

    // Report Title
    doc.setFontSize(12);
    doc.text(title, 14, 70);

    // Convert headers
    const tableHeaders = [
      ...headers,
      "Plate Number", // Add Plate Number column
      "Condition", // Add Condition column
    ].map((key) => headerMappings[key] || key);

    // Convert data (Fix stringified arrays & Fetch plate numbers and conditions)
    const tableBody = tableData.map((row) =>
      headers
        .map((key) => {
          let value = row[key];

          // Parse stringified arrays
          if (
            typeof value === "string" &&
            value.startsWith("[") &&
            value.endsWith("]")
          ) {
            try {
              value = JSON.parse(value).join(", ");
            } catch {
              value = "Invalid Data";
            }
          }

          return value ?? "N/A";
        })
        .concat([
          extractPlateNumbers(row.vehicles), // Extract Plate Numbers
          extractConditions(row.vehicles), // Extract Conditions
        ])
    );

    // Generate Table
    doc.autoTable({
      startY: 80,
      head: [tableHeaders],
      body: tableBody,
      theme: "grid",
      tableWidth: "auto", // Ensures full width
      margin: { left: 10, right: 10 }, // Ensures no content is cut off
      styles: { fontSize: 10, overflow: "linebreak" }, // Ensure text wraps
      columnStyles: {
        0: { cellWidth: "auto" }, // Make columns adjust automatically
      },
    });

    // Footer
    doc.setFontSize(10);
    doc.text(
      `${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.address}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    doc.save(`${title}.pdf`);
  };

  // Helper function to extract plate numbers
  const extractPlateNumbers = (vehicles) => {
    if (!vehicles || vehicles.length === 0) return "N/A";
    return vehicles.map((v) => v.plate_no || "N/A").join(", ");
  };

  // Helper function to extract vehicle conditions
  const extractConditions = (vehicles) => {
    if (!vehicles || vehicles.length === 0) return "N/A";
    return vehicles.map((v) => v.condition || "N/A").join(", ");
  };

  // Handle PDF Export
  const handleExport = () => {
    if (tableData.length === 0) {
      alert("No data available for export.");
      return;
    }

    exportPDF(filename || "summary report", tableData);
  };

  // Export to Excel
  const exportToExcel = (title, data) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Error: Invalid or empty data provided for export.");
      return; // Exit function if data is not an array or is empty
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        "Customer Name": row.customer_name || "N/A",
        "Customer Type": row.customer_type || "N/A",
        Mobile: row.mobile || "N/A",
        "Created At": row.created_at || "N/A",
        "Estimated Date": row.estimated_date || "N/A",
        "Job Description": formatArray(row.job_description),
        "Customer Observation": formatArray(row.customer_observation),
        Priority: row.priority || "N/A",
        "Promise Date": row.promise_date || "N/A",
        "Received By": row.received_by || "N/A",
        "Received Date": row.received_date || "N/A",
        "Repair Category": formatArray(row.repair_category),
        "Selected Items": formatArray(row.selected_items),
        "Spare Change": formatArray(row.spare_change),
        Vehicles: formatVehicles(row.vehicles), // Fix applied here
        "Updated At": row.updated_at || "N/A",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Orders");

    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  // Helper function to format arrays as comma-separated strings
  const formatArray = (data) => {
    if (!data) return "N/A";
    if (
      typeof data === "string" &&
      data.startsWith("[") &&
      data.endsWith("]")
    ) {
      try {
        return JSON.parse(data).join(", ");
      } catch {
        return "Invalid Data";
      }
    }
    return Array.isArray(data) ? data.join(", ") : data;
  };

  // Helper function to convert vehicles array into a readable string
  const formatVehicles = (vehicles) => {
    if (!Array.isArray(vehicles) || vehicles.length === 0) return "N/A";
    return vehicles
      .map(
        (v) =>
          `Plate: ${v.plate_no || "N/A"}, Condition: ${v.condition || "N/A"}`
      )
      .join(" | "); // Separate each vehicle entry with " | "
  };

  // Print Table
  const printTable = () => {
    if (tableData.length === 0) {
      alert("No data available for printing.");
      return;
    }

    const printWindow = window.open("", "", "width=1000,height=700");

    // Exclude 'customer_observation' and 'job_description' from headers
    const filteredHeaders = headers.filter(
      (header) =>
        header !== "customer_observation" && header !== "job_description"
    );

    const tableHeaders = filteredHeaders
      .map(
        (header) =>
          `<th style="border: 1px solid black; padding: 2px;">${
            headerMappings[header] || header
          }</th>`
      )
      .join("");

    const tableRows = tableData
      .map((row) => {
        return `<tr>${filteredHeaders
          .map((key) => {
            let value = row[key];

            // Check if the value is a stringified array
            if (
              typeof value === "string" &&
              value.startsWith("[") &&
              value.endsWith("]")
            ) {
              try {
                value = JSON.parse(value).join(", ");
              } catch {
                value = "Invalid Data";
              }
            }

            return `<td style="border: 1px solid black; padding: 8px;">${
              value ?? "N/A"
            }</td>`;
          })
          .join("")}</tr>`;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${companyInfo.name} - Report</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { width: 90%; margin: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; position: fixed; bottom: 10px; width: 100%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${companyInfo.logo}" width="80" height="40" /><br>
              <strong>${companyInfo.name}</strong><br>
              ${companyInfo.phone} | ${companyInfo.address} <br>
              ${companyInfo.tin}
            </div>
            <table>
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="footer">
              <hr>
              <p>${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.address}</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  function handleImport() {
    navigate("/inventory/add-store");
  }

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false); // Close dropdown after selection
  };
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="phone:ml-6 tablet:ml-0 flex items-center phone:gap-2 tablet:gap-2">
      <button
        onClick={() => handleExport()}
        className="bg-blue-400 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-blue-500 transition-all duration-300"
      >
        PDF
      </button>
      <button
        onClick={() => exportToExcel(filename, tableData)}
        className="bg-orange-400 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-orange-500 transition-all duration-300"
      >
        Excel
      </button>
      <button
        onClick={printTable}
        className="bg-indigo-400 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-indigo-500 transition-all duration-all"
      >
        Print
      </button>
      {/* <div
        onClick={toggleDropdown}
        className="relative z-[99] hover:cursor-pointer flex items-center bg-green-500 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-green-600 transition-all duration-500"
      >
        <span>Import</span>
        <IoMdArrowDropdown size={25} />
        {isDropdownOpen && (
          <div className="absolute top-10 z-[9999999] right-2 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
            <ul className="text-gray-800">
              <li
                onClick={() => handleNavigation("/inventory/add-store")}
                className="text-md flex items-center gap-[4px] uppercase text-green-700 px-2 py-4 cursor-pointer transition-all duration-300"
              >
                <TiDocumentAdd size={25} />
                <span className="text-sm"> Add Repair</span>
              </li>
              <li
                onClick={() => handleNavigation("/inventory/update-store")}
                className="text-md flex items-center gap-[4px] uppercase text-blue-700 hover:bg-blue-100 px-2 py-4 cursor-pointer transition-all duration-300"
              >
                <GrDocumentUpdate size={18} />
                <span className="text-sm">Update Repair</span>
              </li>
            </ul>
          </div>
        )}
      </div> */}
    </div>
  );
}

export default ButtonRepairOperation;
