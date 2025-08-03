import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { Button, MenuItem, Select, TextField } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
const TotalIncoming = () => {
  const printRef = useRef(null);
  const [spareRequests, setSpareRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [isPrinting, setIsPrinting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // console.log(itemsOut);
  useEffect(() => {
    if (isPrinting) {
      handlePrint();
    }
  }, [isPrinting]); // Runs when isPrinting changes

  console.log(spareRequests);

  // ✅ Fetch spare requests from the API
  const fetchSpareRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/spare-requests");
      console.log("API Response:", response.data);

      // 🔹 Check if the response is an object with a "data" key
      if (response.data && Array.isArray(response.data.data)) {
        setSpareRequests(response.data.data); // ✅ Extract the array
      } else {
        console.error("Expected an array but got:", typeof response.data);
        setSpareRequests([]); // ❌ Fallback to an empty array
      }
    } catch (error) {
      setError("Error fetching data");
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Run fetchSpareRequests on component mount
  useEffect(() => {
    fetchSpareRequests();
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleItemOut = async (request) => {
    try {
      // ✅ Ensure 'sparedetails' is parsed correctly
      let parsedSparedetails = [];
      if (typeof request.sparedetails === "string") {
        parsedSparedetails = JSON.parse(request.sparedetails);
      } else {
        parsedSparedetails = request.sparedetails || [];
      }

      // ✅ Make sure each sparedetail has an 'id' from the `items` table
      const updatedSparedetails = parsedSparedetails.map((detail, index) => {
        if (!detail.id) {
          console.warn(`⚠️ Missing 'id' in sparedetails[${index}]`, detail);
        }
        return {
          ...detail,
          id: request.id, // ⚠️ Ensure we use `item_id` from `items` table
        };
      });

      // ✅ Construct final request payload
      const requestData = {
        job_card_no: request.job_card_no,
        plate_number: request.plate_number,
        customer_name: request.customer_name,
        repair_category: request.repair_category,
        sparedetails: updatedSparedetails,
      };

      console.log(
        "🚀 Sending Item Out Request:",
        JSON.stringify(requestData, null, 2)
      );

      // ✅ Send request to API
      const response = await api.post("/request-item-out", requestData);
      console.log("✅ Item Out Request Response:", response.data);

      // ✅ Refresh spare request list
      fetchSpareRequests();

      // ✅ Show success message
      toast.success("Item request processed successfully!");
    } catch (error) {
      console.error(
        "❌ Error submitting item out request:",
        error.response?.data || error
      );

      // ✅ Log detailed error response
      if (error.response) {
        console.error(
          "📌 Server Response:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      // ✅ Display meaningful error messages
      const errorMessage =
        error.response?.data?.message || "Failed to submit item out request.";
      toast.error(errorMessage);
    }
  };

  const handleAddToPending = async (request) => {
    try {
      const requestData = {
        id: request.id, // ✅ Include the ID
        job_card_no: request.job_card_no,
        plate_number: request.plate_number,
        customer_name: request.customer_name,
        repair_category: request.repair_category,
        sparedetails: request.sparedetails,
      };
  
      console.log("Sending Pending Request:", requestData);
  
      const response = await api.post("/pending-requested-item", requestData);
      console.log("Pending Request Response:", response.data);
  
      // ✅ Remove the spare request from UI after successful operation
      setSpareRequests((prevRequests) =>
        prevRequests.filter((r) => r.id !== request.id)
      );
  
      toast.success("Item successfully added to Pending Requests!");
    } catch (error) {
      console.error(
        "Error adding item to pending:",
        error.response?.data || error
      );
      toast.error("Failed to add item to pending.");
    }
  };
  

  const handleCancel = async (id) => {
    try {
      await api.post(`/cancel-request/${id}`);
      fetchSpareRequests(); // ✅ Refresh list after canceling
      toast.success("Item successfully canceled!");
    } catch (error) {
      console.error("Error canceling request:", error.response?.data || error);
      toast.error("Failed to cancel request.");
    }
  };
  useEffect(() => {
    if (!Array.isArray(spareRequests)) {
      console.error("spareRequests is not an array:", spareRequests);
      return;
    }

    let result = spareRequests.filter((request) => {
      let spareDetails = [];

      // Ensure sparedetails is an array, if not try parsing it
      if (Array.isArray(request.sparedetails)) {
        spareDetails = request.sparedetails;
      } else {
        try {
          spareDetails = request.sparedetails;
        } catch (error) {
          console.error("Error parsing sparedetails:", error);
        }
      }

      const matchesSearch = spareDetails.some((detail) =>
        detail.partnumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const requestDate = new Date(request.created_at);
      const withinDateRange =
        (!startDate || requestDate >= new Date(startDate)) &&
        (!endDate || requestDate <= new Date(endDate));

      return matchesSearch && withinDateRange;
    });

    setFilteredItems(result);
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, spareRequests]);


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

  console.log(paginatedItems);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="relative z-[9] container mx-auto my-4 p-6 bg-white dark:bg-gray-800 rounded-md">
      <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider text-blue-500">
        Spare Requests
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
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-16">No spare request available</div>
        ) : (
          <>
          <table className="min-w-full table-auto border-collapse border border-table-border">
            <thead>
              <tr className="text-white">
                <th className="border-table-border px-4 py-2 bg-table-head">
                  ID
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Description
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Part Number
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Model
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Quantity
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Status
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Unit Price
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Total Price
                </th>
                <th className="border-table-border px-4 py-2 bg-table-head">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((request) => {
              const spareDetails = request.sparedetails;

              return (
                <tr
                  key={request.id}
                  className="text-gray-700 dark:text-white hover:dark:bg-gray-600"
                >
                  <td className="border px-4 py-2">{request.id}</td>
                  <td className="border px-4 py-2">
                    {spareDetails[0]?.itemname || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {spareDetails[0]?.partnumber || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {spareDetails[0]?.model || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {spareDetails[0]?.requestquantity || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                   <p className={`${spareDetails[0]?.status==="Available"?"bg-green-500":"bg-red-500"} px-3 p-1 text-white rounded-md`}> {spareDetails[0]?.status || "N/A"}</p>
                  </td>
                  <td className="border px-4 py-2">
                    {spareDetails[0]?.unit_price || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {spareDetails[0]?.unit_price *
                      spareDetails[0]?.requestquantity || "N/A"}
                  </td>
                  <td className="border px-2 py-2 relative">
                    <button
                      className="text-white bg-blue-600 px-4 py-1 rounded-sm"
                      onClick={() => toggleDropdown(request.id)}
                    >
                      Action
                    </button>

                    {openDropdown === request.id && (
                      <div className="absolute z-[999] right-0 mt-2 w-40 bg-white border border-gray-300 shadow-lg rounded-md dark:bg-gray-800 dark:text-white ">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                          onClick={() => handleItemOut(request)}
                        >
                          Item Out
                        </button>
                        <button
                          onClick={() => handleAddToPending(request)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                        >
                          Add to Pending
                        </button>
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
        </>
      )}
    </div>
    </div>
  );
};

export default TotalIncoming;
