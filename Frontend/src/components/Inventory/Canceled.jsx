import React, { useState, useEffect, useRef } from "react";
import api from "../../api"; // ✅ Import API configuration
import { Button, MenuItem, Select, TextField } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const Canceled = () => {
  const printRef = useRef(null);
  const [canceledRequests, setCanceledRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /////////////////////////////////////////////////////////////
  const [isPrinting, setIsPrinting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  console.log(canceledRequests);

  useEffect(() => {
    if (isPrinting) {
      handlePrint();
    }
  }, [isPrinting]); // Runs when isPrinting changes

  // ✅ Fetch canceled requests from API
  const fetchCanceledRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/canceled-requests");
      setCanceledRequests(response.data);
    } catch (error) {
      setError("Error fetching canceled requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch data when component mounts
  useEffect(() => {
    fetchCanceledRequests();
  }, []);

  useEffect(() => {
    if (!Array.isArray(canceledRequests)) {
      console.error("canceledRequests is not an array:", canceledRequests);
      return;
    }

    let result = canceledRequests.filter((request) => {
      // ✅ Search filter (checks part_number, description, brand, model)
      const matchesSearch =
        request.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.model?.toLowerCase().includes(searchTerm.toLowerCase());

      // ✅ Date range filter
      const requestDate = new Date(request.created_at);
      const withinDateRange =
        (!startDate || requestDate >= new Date(startDate)) &&
        (!endDate || requestDate <= new Date(endDate));

      return matchesSearch && withinDateRange;
    });

    setFilteredItems(result);
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, canceledRequests]);

  const handleExportPDF = () => {
    if (!printRef.current) {
      console.error("❌ printRef is not attached!");
      return;
    }

    const doc = new jsPDF();

    // Company Header with Logo
    doc.setFontSize(14);
    const logo = "/images/aa.png"; // Path to your logo image
    const logoWidth = 50; // Smaller width for the logo
    const logoHeight = 18; // Smaller height for the logo

    // Calculate the X position to center the logo
    const logoX = (doc.internal.pageSize.width - logoWidth) / 2;
    doc.addImage(logo, "PNG", logoX, 5, logoWidth, logoHeight); // Add logo at the top center

    doc.text("Speed Meter Trading PLC", 105, 35, { align: "center" });
    doc.setFontSize(8);
    doc.text(
      "Sub City Bole Michael No 1701/01, Addis Ababa, Ethiopia",
      105,
      28,
      { align: "center" }
    );
    doc.text("+251 98 999 9900 | TIN: 123-456-789", 105, 40, {
      align: "center",
    });

    // Extract table data
    const table = printRef.current;

    // Shorten the headers (customize these abbreviations as needed)
    const headers = [...table.querySelectorAll("th")].map((th) => {
      switch (th.innerText.trim()) {
        case "Part Number":
          return "Part #";
        case "Quantity":
          return "Qty";
        case "Unit Price":
          return "Price";
        case "Description":
          return "Desc";
        // Add more cases as needed
        default:
          return th.innerText.trim();
      }
    });

    const rows = [...table.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.innerText)
    );

    // Create the PDF Table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 45, // Position below company header
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255 }, // Dark blue header
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray alternating rows
    });

    // Save the PDF
    doc.save("store-items.pdf");
  };

  const handleExportExcel = () => {
    if (!printRef.current) {
      console.error("❌ printRef is not attached!");
      return;
    }

    // Get the table element
    const table = printRef.current;

    // Create a workbook
    const wb = XLSX.utils.book_new();

    // Extract table headers and rows
    const headers = [...table.querySelectorAll("th")].map((th) => {
      return th.innerText.trim();
    });

    const rows = [...table.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.innerText.trim())
    );

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");

    // Export the workbook as an Excel file
    XLSX.writeFile(wb, "store-items.xlsx");
  };
  const handlePrint = () => {
    setIsPrinting(true);

    if (!printRef.current) {
      console.error("❌ printRef is not  attached!");
      return;
    }

    // Clone the table
    const tableClone = printRef.current.cloneNode(true);

    // Remove unwanted columns (Checkbox & Action)
    const headers = tableClone.querySelectorAll("th");
    const rows = tableClone.querySelectorAll("tr");

    if (headers.length > 0) {
      headers[0].remove();
      headers[headers.length - 1].remove();
    }

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 0) {
        cells[0].remove();
        cells[cells.length - 1].remove();
      }
    });

    // Remove dropdown buttons
    const targetColumns = ["Part Number", "Quantity", "Unit Price"];
    headers.forEach((header, index) => {
      if (targetColumns.includes(header.textContent.trim())) {
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells[index]) {
            const dropdownButton = cells[index].querySelector("button");
            if (dropdownButton) {
              dropdownButton.parentNode.removeChild(dropdownButton);
            }
          }
        });
      }
    });

    // Create a hidden iframe for printing
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "absolute";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "none";
    document.body.appendChild(printIframe);

    const iframeDoc =
      printIframe.contentDocument || printIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
              <html>
              <head>
                <title>Print Store Items</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                  th { background-color: #f4f4f4; }
                </style>
              </head>
              <body>
                <div style="text-align: center; margin-bottom: 20px;">
                  <img id="print-logo" src="/images/aa.png" alt="Company Logo" style="width: 150px;" />
                  <h2>Speed Meter Trading PLC</h2>
                  <p>+251 98 999 9900</p>
                  <p>Sub City Bole Michael No 1701/01, Addis Ababa, Ethiopia</p>
                  <p>TIN: 123-456-789</p>
                </div>
                ${tableClone.outerHTML}
              </body>
              </html>
            `);
    iframeDoc.close();

    const printWindow = printIframe.contentWindow;
    const printLogo = printWindow.document.getElementById("print-logo");

    // Ensure the image is loaded before printing
    printLogo.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    // Detect when printing is finished
    const printFinished = () => {
      setIsPrinting(false);
      window.removeEventListener("afterprint", printFinished);
      printWindow.removeEventListener("afterprint", printFinished);

      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 1000);
    };

    // Use modern print event listener
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia("print");
      mediaQueryList.addEventListener("change", (e) => {
        if (!e.matches) printFinished();
      });
    }

    // Attach event listeners for print close detection
    window.addEventListener("afterprint", printFinished);
    printWindow.addEventListener("afterprint", printFinished);
  };
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="relative container mx-auto my-4 bg-white dark:bg-gray-800 p-6 rounded-md">
      <h2 className="text-xl font-semibold mb-4 text-blue-500 uppercase tracking-wider">
        Canceled Requests
      </h2>
      <div className="desktop:w-[45%] ">
        <div className="absolute top-16 flex flex-wrap gap-2">
          <Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value)}
            size="small"
            sx={{
              backgroundColor: "#4765d4", // Darker blue background
              color: "white", // White text
              borderRadius: "5px", // Rounded corners
              border: "none", // Removes border
              boxShadow: "none", // Removes shadow
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // Ensure no border
              },
              "&:hover": {
                backgroundColor: "#172554", // Even darker blue on hover
              },
              "&.Mui-focused": {
                backgroundColor: "#1e40af", // Slightly lighter when focused
              },
            }}
          >
            {[5, 10, 20, 50].map((num) => (
              <MenuItem key={num} value={num}>
                {`${num} per page`}
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{
              "& label": {
                color: "#6b7280", // Gray-500 for label
              },
              "& label.Mui-focused": {
                color: "#6b7280", // Keep label gray-500 when focused
              },
              "& .MuiOutlinedInput-root": {
                color: "#6b7280", // Gray-500 input text color
                "& fieldset": {
                  borderColor: "#2563eb", // Blue border (light & dark mode)
                },
                "&:hover fieldset": {
                  borderColor: "#2563eb", // Keep blue on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2563eb", // Keep blue when focused
                },
              },
              "& .MuiInputBase-input": {
                color: "#6b7280", // Gray-500 input text
                "&::placeholder": {
                  color: "#6b7280", // Gray-500 placeholder
                  opacity: 1,
                },
              },
            }}
          />

          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{
              "& label": {
                color: "#6b7280", // Gray-500 for label
              },
              "& label.Mui-focused": {
                color: "#6b7280", // Keep label gray-500 when focused
              },
              "& .MuiOutlinedInput-root": {
                color: "#6b7280", // Gray-500 input text color
                "& fieldset": {
                  borderColor: "#2563eb", // Blue border (light & dark mode)
                },
                "&:hover fieldset": {
                  borderColor: "#2563eb", // Keep blue on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2563eb", // Keep blue when focused
                },
              },
              "& .MuiInputBase-input": {
                color: "#6b7280", // Gray-500 input text
                "&::placeholder": {
                  color: "#6b7280", // Gray-500 placeholder
                  opacity: 1,
                },
              },
            }}
          />
          <TextField
            label="Search Part Number"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px", // Default rounded corners
                transition: "border-radius 0.3s ease, border-color 0.3s ease", // Smooth transition
                "& fieldset": {
                  borderColor: "#3B82F6", // Tailwind's blue-500 color
                },
                "&:hover fieldset": {
                  borderColor: "#2563EB", // Darker blue on hover (blue-600)
                },
                "&.Mui-focused fieldset": {
                  borderColor: "transparent", // Blue border when focused
                  borderRadius: "12px", // More rounded corners when focused
                },
              },
              "& .MuiInputLabel-root": {
                color: "#9CA3AF", // Tailwind's gray-400 color for label
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#9CA3AF", // Keeps label gray-400 when focused
                backgroundColor: "white",
              },
            }}
          />
        </div>
        <div className="absolute right-8 top-14 flex gap-2 items-center">
          <Button
            variant="contained"
            onClick={() => {
              setIsPrinting(true); // This triggers useEffect
            }}
          >
            Print
          </Button>

          <Button variant="contained" onClick={handleExportPDF}>
            PDF
          </Button>
          <Button variant="contained" onClick={handleExportExcel}>
            Excel
          </Button>
        </div>
      </div>
      <div ref={printRef} className="my-16">
        <table className="min-w-full table-auto border-collapse border border-table-border">
          <thead>
            <tr className="text-white">
              <th className="border border-table-border px-4 py-2 bg-table-head">
                ID
              </th>
              <th className="border border-table-border px-4 py-2 bg-table-head">
                Description
              </th>
              <th className="border border-table-border px-4 py-2 bg-table-head">
                Brand
              </th>
              <th className="border border-table-border px-4 py-2 bg-table-head">
                Model
              </th>
              <th className="border border-table-border px-4 py-2 bg-table-head">
                Part Number
              </th>
              <th className="border borderborder-table-border px-4 py-2 bg-table-head">
                Req.by
              </th>
              <th className="border border-table-border px-4 py-2 bg-table-head">
                Quantity
              </th>
              <th className="border border-table-border px-4 py-2 bg-table-head">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className="text-gray-800 dark:text-white">
                <td className="border px-4 py-2">{item.id}</td>
                <td className="border px-4 py-2">
                  {item.description || "N/A"}
                </td>
                <td className="border px-4 py-2">{item.brand || "N/A"}</td>
                <td className="border px-4 py-2">{item.model || "N/A"}</td>
                <td className="border px-4 py-2">
                  {item.part_number || "N/A"}
                </td>
                <td className="border px-4 py-2">{item.request_by || "N/A"}</td>
                <td className="border px-4 py-2">
                  {item.request_quantity || "N/A"}
                </td>
                <td className="text-center border px-4 py-2 ">
                  <span className="px-4 py-1 bg-red-500 text-white rounded-sm">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
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

export default Canceled;
