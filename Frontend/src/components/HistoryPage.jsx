import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import logo from "../images/aa.png"; // Ensure this logo path is correct

import { NavLink, useLocation } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

const History = ({ headers }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const location = useLocation();
  const [historyData, setHistoryData] = useState([]);
  const tabs = ["total-items", "out-of-store", "low-store"];

  const formatDetails = (details) => {
    try {
      const data = JSON.parse(details);
      if (data.old && data.new) {
        const changes = Object.keys(data.new).reduce((acc, key) => {
          if (data.old[key] !== data.new[key]) {
            acc.push(`${key}: ${data.old[key] || "N/A"} → ${data.new[key]}`);
          }
          return acc;
        }, []);
        return changes.length > 0 ? changes.join(", ") : "No changes";
      }
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch (error) {
      console.error("Error parsing details:", error);
      return "Invalid Data";
    }
  };
  const companyInfo = {
    name: "SPEEDMETER TRADING PLC",
    phone: "+251 98 999 9900",
    address: "Sub City Bole Michael No 1701/01, Addis Ababa, Ethiopia",
    tin: "TIN: 123-456-789",
    logo: logo,
  };
  useLayoutEffect(() => {
    const currentPath = location.pathname.split("/")[2];
    const activeTabIndex = tabs.indexOf(currentPath);
    if (tabRefs.current[activeTabIndex]) {
      const activeTab = tabRefs.current[activeTabIndex];
      setIndicatorStyle({
        transform: `translateX(${activeTab.offsetLeft}px)`,
        width: `${activeTab.offsetWidth}px`,
      });
    }
  }, [location]);

  useEffect(() => {
    if (code) {
      const fetchHistory = async () => {
        try {
          const response = await api.get(`/items/history/${code}`);
          setHistoryData(response.data.history);
        } catch (error) {
          console.error("Error fetching history:", error);
          toast.error("Failed to fetch item history.");
        }
      };
      fetchHistory();
    }
  }, [code]);

  // Print History Function
  const printTable = () => {
    if (historyData.length === 0) {
      alert("No data available for printing.");
      return;
    }

    const printWindow = window.open("", "", "width=900,height=700");

    const tableHeaders = `
      <tr>
        <th style="border: 1px solid black; padding: 8px;">Date</th>
        <th style="border: 1px solid black; padding: 8px;">Action</th>
        <th style="border: 1px solid black; padding: 8px;">Details</th>
        <th style="border: 1px solid black; padding: 8px;">Performed By</th>
      </tr>
    `;

    const tableRows = historyData
      .map((entry) => {
        const formattedDate = new Date(entry.created_at).toLocaleString();
        const details = formatDetails(entry.details);
        let performedBy = "Admin";

        try {
          const parsedDetails = JSON.parse(entry.details);
          performedBy =
            parsedDetails.new?.requested_by ||
            parsedDetails.requested_by ||
            "Admin";
        } catch {
          performedBy = "Invalid Data";
        }

        return `
          <tr>
            <td style="border: 1px solid black; padding: 8px;">${formattedDate}</td>
            <td style="border: 1px solid black; padding: 8px;">${entry.action}</td>
            <td style="border: 1px solid black; padding: 8px;">${details}</td>
            <td style="border: 1px solid black; padding: 8px;">${performedBy}</td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${companyInfo.name} - Item History Report</title>
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
              <h2>${companyInfo.name}</h2>
              <p>${companyInfo.phone} | ${companyInfo.address} <br>
              TIN: ${companyInfo.tin}</p>
              <hr>
              <h3>Item History Report</h3>
            </div>
            <table>
              <thead>${tableHeaders}</thead>
              <tbody>${tableRows}</tbody>
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

  return (
    <div className="w-full flex h-screen overflow-y-auto bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative phone:w-[98%] tablet:w-[90%] laptop:w-[98%] mx-auto my-6 mt-4 shadow-md rounded-lg overflow-y-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center px-6 py-4 bg-white rounded-t-lg shadow">
            <h1 className="text-xl font-bold">Item History for Code: {code}</h1>
            <div>
              <button
                onClick={printTable}
                className="px-4 py-2 bg-green-600 text-white rounded mr-2"
              >
                Print History
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Back
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Details</th>
                  <th className="border p-2">Performed By</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((entry, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="border p-2">{entry.action}</td>
                      <td className="border p-2">
                        {formatDetails(entry.details)}
                      </td>
                      <td className="border p-2">
                        {(() => {
                          try {
                            const parsedDetails = JSON.parse(entry.details);
                            return (
                              parsedDetails.new?.requested_by ||
                              parsedDetails.requested_by ||
                              "Admin"
                            );
                          } catch {
                            return "Invalid Data";
                          }
                        })()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No history available for this item.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
