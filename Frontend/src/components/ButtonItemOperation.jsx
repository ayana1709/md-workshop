import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import logo from "../images/aa.png"; // Ensure this logo path is correct
import { IoMdArrowDropdown } from "react-icons/io";
import { TiDocumentAdd } from "react-icons/ti";
import { useEffect, useRef, useState } from "react";
import { GrDocumentUpdate } from "react-icons/gr";
import { useStores } from "../contexts/storeContext";

function ButtonItemOperation({
  tableData,
  headers,
  filename,
  headerMappings,
  path,
}) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { showModal, setShowModal } = useStores();

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
  function exportPDF(filename, data) {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

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
    doc.setFontSize(12);
    doc.text(title, 14, 70);

    let tableHeaders = headers.map((key) => headerMappings[key] || key);
    let tableBody = tableData.map((row) =>
      headers.map((key) => {
        let value = row[key];
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
    );

    // Execute extraction only when filename is 'repair'
    if (filename === "repair") {
      console.log(filename);
      tableBody = tableBody.map((row, index) => [
        ...row,
        extractPlateNumbers(tableData[index].vehicles),
        extractConditions(tableData[index].vehicles),
      ]);

      // Add last row summary for plate number and condition
      const lastRow = [
        ...new Array(headers.length).fill(""),
        extractPlateNumbers(tableData[tableData.length - 1].vehicles),
        extractConditions(tableData[tableData.length - 1].vehicles),
      ];
      if (filename === "repair") {
        tableBody.push(lastRow);
      }
    }

    doc.autoTable({
      startY: 80,
      head: [tableHeaders],
      body: tableBody,
      theme: "grid",
      tableWidth: "auto",
      margin: { left: 10, right: 10 },
      styles: { fontSize: 10, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: "auto" },
      },
    });

    doc.setFontSize(10);
    doc.text(
      `${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.address}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    doc.save(`${title}.pdf`);
  }

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
  const handleExport = (filename, tableData) => {
    if (tableData.length === 0) {
      alert("No data available for export.");
      return;
    }

    exportPDF(filename || "summary report", tableData);
  };

  // Export to Excel
  const exportToExcel = () => {
    if (tableData.length === 0) {
      alert("No data available for export.");
      return;
    }

    const formattedData = tableData.map((row) => ({
      ...row,
      repair_category: parseStringifiedArray(row.repair_category),
      customer_observation: parseStringifiedArray(row.customer_observation),
      job_description: parseStringifiedArray(row.job_description),
      spare_change: parseStringifiedArray(row.spare_change),
    }));

    // Helper function for parsing
    function parseStringifiedArray(value) {
      if (
        typeof value === "string" &&
        value.startsWith("[") &&
        value.endsWith("]")
      ) {
        try {
          return JSON.parse(value).join(", ");
        } catch {
          return "Invalid Data";
        }
      }
      return value ?? "N/A";
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename || "Report"}.xlsx`);
  };

  // Print Table
  const printTable = () => {
    if (tableData.length === 0) {
      alert("No data available for printing.");
      return;
    }

    const printWindow = window.open("", "", "width=900,height=700");

    const tableHeaders = headers
      .map(
        (header) =>
          `<th style="border: 1px solid black; padding: 2px;">${
            headerMappings[header] || header
          }</th>`
      )
      .join("");

    const tableRows = tableData
      .map((row) => {
        return `<tr>${headers
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
        onClick={() => handleExport(filename, tableData)}
        className="bg-blue-400 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-blue-500 transition-all duration-300"
      >
        PDF
      </button>
      <button
        onClick={exportToExcel}
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
      <button
        onClick={() => setShowModal(true)}
        className="bg-cyan-400 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-indigo-500 transition-all duration-all"
      >
        + Add Item
      </button>
      <button
        onClick={() => handleNavigation("/inventory/update-store")}
        className="bg-yellow-500 text-white phone:px-2 tablet:px-4 py-2 rounded-md hover:bg-indigo-500 transition-all duration-all"
      >
        + Update Item
      </button>
    </div>
  );
}

export default ButtonItemOperation;
