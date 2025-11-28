import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { useStores } from "@/contexts/storeContext";
import api from "@/api";
import { toast } from "react-hot-toast";

function ButtonRepairOperation({
  tableData,
  headers,
  filename,
  headerMappings,
}) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { companyData } = useStores();

  const companyInfo = {
    name: companyData?.name_en || "Company Name",
    phone: companyData?.phone || "Phone",
    address: companyData?.address || "Address",
    tin: companyData?.tin ? `TIN: ${companyData.tin}` : "TIN: -",
    logo: companyData?.logo
      ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
      : "", // fallback image if needed
  };

  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    if (!companyInfo.logo) return;

    fetch(companyInfo.logo)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(() => setLogoBase64(null));
  }, [companyInfo.logo]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    if (tableData.length === 0) return alert("No data to export.");
    exportPDF(filename || "Summary Report", tableData);
  };

  const exportPDF = (title, data) => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", pageWidth / 2 - 25, 10, 50, 20);
    }

    doc.setFontSize(14);
    doc.text(companyData?.name_en || "Company Name", pageWidth / 2, 35, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      `Phone: ${companyData?.phone || "N/A"} | ${
        companyData?.address || "N/A"
      }`,
      pageWidth / 2,
      45,
      { align: "center" }
    );
    doc.text(
      companyData?.tin ? `TIN: ${companyData.tin}` : "",
      pageWidth / 2,
      55,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.text(title, 14, 70);

    const tableHeaders = [...headers].map((key) => headerMappings[key] || key);

    const tableBody = tableData.map((row) =>
      headers
        .map((key) => {
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
        .concat([
          extractPlateNumbers(row.vehicles),
          extractConditions(row.vehicles),
        ])
    );

    doc.autoTable({
      startY: 80,
      head: [tableHeaders],
      body: tableBody,
      theme: "grid",
      tableWidth: "auto",
      margin: { left: 10, right: 10 },
      styles: { fontSize: 10, overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: "auto" } },
    });

    doc.setFontSize(10);
    doc.text(
      `${companyData?.name_en || "Company Name"} | ${
        companyData?.phone || ""
      } | ${companyData?.address || ""}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
    doc.save(`${title}.pdf`);
  };

  const extractPlateNumbers = (vehicles) =>
    Array.isArray(vehicles) && vehicles.length
      ? vehicles.map((v) => v.plate_no || "N/A").join(", ")
      : "N/A";

  const extractConditions = (vehicles) =>
    Array.isArray(vehicles) && vehicles.length
      ? vehicles.map((v) => v.condition || "N/A").join(", ")
      : "N/A";

  const exportToExcel = (title, data) => {
    if (!Array.isArray(data) || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        "Customer Name": row.customer_name || "N/A",
        Mobile: row.mobile || "N/A",
        "Job Type": row.types_of_jobs || "N/A",
        Product: row.product_name || "N/A",
        "Serial Code ": row.serial_code || "N/A",
        Duration: row.estimated_date || "N/A",
        "Start Date": row.received_date || "N/A",
        "End Date": row.promise_date || "N/A",
        "Received By": row.received_by || "N/A",
        Status: row.status || "N/A",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Orders");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

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
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`repair/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === "success") {
        toast.success("Import successful!");
        window.location.reload(); // optional
      } else {
        toast.error("Import failed: " + (res.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Import Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Error uploading file. Please check your Excel format."
      );
    }
  };

  const formatVehicles = (vehicles) =>
    Array.isArray(vehicles)
      ? vehicles.map((v) => v.plate_no || "N/A").join(", ")
      : "N/A";

  const printTable = () => {
    if (tableData.length === 0) return alert("No data to print.");

    const filteredHeaders = headers.filter(
      (h) => h !== "customer_observation" && h !== "job_description"
    );

    const tableHeaders = filteredHeaders
      .map(
        (h) =>
          `<th style="border: 1px solid black; padding: 2px;">${
            headerMappings[h] || h
          }</th>`
      )
      .join("");

    const tableRows = tableData
      .map((row) => {
        return `<tr>${filteredHeaders
          .map((key) => {
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
            return `<td style="border: 1px solid black; padding: 8px;">${
              value ?? "N/A"
            }</td>`;
          })
          .join("")}</tr>`;
      })
      .join("");

    const win = window.open("", "", "width=1000,height=700");
    win.document.write(`
      <html>
        <head>
          <title>${companyInfo.name} - Report</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { width: 90%; margin: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            .header { margin-bottom: 20px; }
            .footer { font-size: 12px; position: fixed; bottom: 10px; width: 100%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${companyInfo.logo}" width="80" height="40" /><br />
              <strong>${companyInfo.name}</strong><br />
              ${companyInfo.phone} | ${companyInfo.address}<br />
              ${companyInfo.tin}
            </div>
            <table>
              <thead><tr>${tableHeaders}</tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
            <div class="footer">
              <hr />
              <p>${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.address}</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };
  const downloadTemplate = () => {
    const sample = [
      {
        "Customer Name": "",
        Mobile: "",
        "Job Type": "",
        Product: "",
        "Serial Code": "",
        Duration: "",
        "Start Date": "",
        "End Date": "",
        "Received By": "",
        Status: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "Repair_Import_Template.xlsx");
  };

  return (
    <div className="phone:ml-6 tablet:ml-0 flex items-center gap-2">
      <button
        onClick={() => document.getElementById("importExcel").click()}
        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
      >
        Import
      </button>

      <input
        id="importExcel"
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImportExcel}
      />

      <button
        onClick={handleExport}
        className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition"
      >
        PDF
      </button>
      <button
        onClick={() => exportToExcel(filename, tableData)}
        className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition"
      >
        Excel
      </button>
      <button
        onClick={printTable}
        className="bg-indigo-500 text-white px-3 py-2 rounded-md hover:bg-indigo-600 transition"
      >
        Print
      </button>
      <button
        onClick={downloadTemplate}
        className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition"
      >
        Template
      </button>

      <button
        onClick={() => navigate("/step-1")}
        className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition"
      >
        Create New Job
      </button>
    </div>
  );
}

export default ButtonRepairOperation;
