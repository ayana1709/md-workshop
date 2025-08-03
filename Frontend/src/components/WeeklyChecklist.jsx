import React, { useEffect, useState } from "react";
import moment from "moment";
import { FiMoreVertical } from "react-icons/fi";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import Sidebar from "../partials/Sidebar";
import api from "@/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

function WeeklyChecklist() {
  const [progressData, setProgressData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(moment());
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get("/daily-progress");
        setProgressData(res.data);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };
    fetchProgress();
  }, []);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      setLoading(true);
      const startOfWeek = currentWeek.clone().startOf("isoWeek");
      const endOfWeek = currentWeek.clone().endOf("isoWeek");

      const grouped = {};
      const jobIds = new Set();

      // 1️⃣ First group by jobId from progressData
      progressData.forEach((entry) => {
        const entryDate = moment(entry.date);
        if (entryDate.isBetween(startOfWeek, endOfWeek, undefined, "[]")) {
          const weekday = entryDate.format("ddd");
          const jobId = String(entry.job_card_no).padStart(4, "0");
          jobIds.add(jobId);

          if (!grouped[jobId]) {
            grouped[jobId] = {
              jobId,
              days: {},
              // Default placeholders (to be overridden)
              testDrive: entry.test_drive ?? false,
              driverStatus: "pending",
              checkedBy: "pending",
              approvedBy: "pending",
              receivedDate: "pending",
            };
            weekdays.forEach((day) => {
              grouped[jobId].days[day] = "-";
            });
          }

          grouped[jobId].days[weekday] = `${entry.average_progress}%`;
        }
      });

      try {
        // 2️⃣ First fetch delivery status and patch
        const deliveryRes = await api.post("/job-delivery-status/batch", {
          job_ids: Array.from(jobIds),
        });
        const deliveryMap = deliveryRes.data;

        Object.keys(grouped).forEach((jobId) => {
          const delivery = deliveryMap[jobId];
          if (delivery) {
            grouped[jobId].driverStatus = delivery.driver_status || "pending";
            grouped[jobId].checkedBy = delivery.checked_by || "pending";
            grouped[jobId].approvedBy = delivery.approved_by || "pending";
            grouped[jobId].receivedDate = delivery.received_date || "pending";
          }
        });

        // 3️⃣ Then fetch repairs and test drive
        const [repairRes, testRes] = await Promise.all([
          api.post("/repairs/job/batch", { job_ids: Array.from(jobIds) }),
          api.post("/post-drive-tests/job/batch", {
            job_ids: Array.from(jobIds),
          }),
        ]);

        const repairs = repairRes.data;
        const testDrives = testRes.data;

        Object.keys(grouped).forEach((jobId) => {
          const repair = repairs[jobId] || {};
          const testDrive = testDrives[jobId] || {};

          grouped[jobId] = {
            ...grouped[jobId],
            plateNum: repair.plate_no || "pending",
            startDate: repair.start_date || "pending",
            endDate: repair.end_date || "pending",
            status: repair.status || "Pending",
            testDriveStatus: testDrive.technician_final_approval || "Pending",
          };
        });

        setWeeklyData(Object.values(grouped));
      } catch (err) {
        console.error("Failed to fetch weekly data:", err);
      }

      setLoading(false);
    };

    if (progressData.length > 0) fetchWeeklyData();
  }, [progressData, currentWeek]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const getColor = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) return "text-gray-500";
    if (num < 40) return "text-red-600 font-bold";
    if (num < 80) return "text-yellow-500 font-bold";
    return "text-green-600 font-bold";
  };

  const getStatusColor = (status) => {
    const lower = (status || "").toLowerCase();
    if (lower.includes("pending")) return "text-yellow-500 font-semibold";
    if (lower.includes("in progress")) return "text-blue-500 font-semibold";
    if (lower.includes("complete")) return "text-green-600 font-semibold";
    return "text-gray-600";
  };

  const exportToExcel = (data) => {
    const worksheetData = data.map((entry) => ({
      "Job ID": entry.jobId,
      "Plate Num": entry.plateNum,
      "Start Date": entry.startDate,
      "End Date": entry.endDate,
      Mon: entry.days["Mon"],
      Tue: entry.days["Tue"],
      Wed: entry.days["Wed"],
      Thu: entry.days["Thu"],
      Fri: entry.days["Fri"],
      Sat: entry.days["Sat"],
      Status: entry.status,
      "Test Drive": entry.testDrive ? "✅" : "❌",
      "Driver Status": entry.driverStatus,
      "Checked By": entry.checkedBy,
      "Approved By": entry.approvedBy,
      "Received Date": entry.receivedDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WeeklyChecklist");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      blob,
      `WeeklyChecklist_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();
    const tableColumn = [
      "Job ID",
      "Plate",
      "Start",
      "End",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Status",
      "Drive",
      "Driver",
      "Checked",
      "Approved",
      "Date",
    ];

    const tableRows = data.map((entry) => [
      entry.jobId,
      entry.plateNum,
      entry.startDate,
      entry.endDate,
      entry.days["Mon"],
      entry.days["Tue"],
      entry.days["Wed"],
      entry.days["Thu"],
      entry.days["Fri"],
      entry.days["Sat"],
      entry.status,
      entry.testDrive ? "✅" : "❌",
      entry.driverStatus,
      entry.checkedBy,
      entry.approvedBy,
      entry.receivedDate,
    ]);

    doc.text("Weekly Job Checklist", 14, 15);
    doc.autoTable({ startY: 20, head: [tableColumn], body: tableRows });
    doc.save(`WeeklyChecklist_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleSaveModal = async (updatedFields) => {
    // 🚫 Block update if test drive not passed
    if (
      !selectedEntry.testDriveStatus ||
      selectedEntry.testDriveStatus.toLowerCase() !== "pass"
    ) {
      alert(
        "You cannot update this job until the test drive is marked as 'Pass'."
      );
      return;
    }

    try {
      const updated = { ...selectedEntry, ...updatedFields };
      await api.put(`/job-delivery-status/${selectedEntry.jobId}`, updated);

      setWeeklyData((prev) =>
        prev.map((item) =>
          item.jobId === selectedEntry.jobId
            ? { ...item, ...updatedFields }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Update failed. Please try again.");
    }
  };

  const UpdateModal = ({ isOpen, onClose, entry, onSave }) => {
    const [form, setForm] = useState({
      driverStatus: entry?.driverStatus || "",
      checkedBy: entry?.checkedBy || "",
      approvedBy: entry?.approvedBy || "",
      receivedDate: entry?.receivedDate || "",
    });

    useEffect(() => {
      if (entry) {
        setForm({
          driverStatus: entry.driverStatus || "",
          checkedBy: entry.checkedBy || "",
          approvedBy: entry.approvedBy || "",
          receivedDate: entry.receivedDate || "",
        });
      }
    }, [entry]);

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
      onSave(form);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md space-y-4 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Update Job Info
          </h2>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Delivery Status
            </label>
            <select
              name="driverStatus"
              value={form.driverStatus}
              onChange={handleChange}
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select</option>
              <option value="Pending">Pending</option>
              <option value="Waiting ">Waiting</option>
              <option value="Delivered">Delivered</option>
            </select>

            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Checked By
            </label>
            <input
              name="checkedBy"
              value={form.checkedBy}
              onChange={handleChange}
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            />

            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Approved By
            </label>
            <input
              name="approvedBy"
              value={form.approvedBy}
              onChange={handleChange}
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            />

            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Received Date
            </label>
            <input
              type="date"
              name="receivedDate"
              value={form.receivedDate}
              onChange={handleChange}
              className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
  const ViewModal = ({ isOpen, onClose, entry }) => {
    if (!isOpen || !entry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-lg space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Job Details - #{entry.jobId}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Plate Number:
              </strong>
              <p className="text-gray-800 dark:text-white">{entry.plateNum}</p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Start Date:
              </strong>
              <p className="text-gray-800 dark:text-white">{entry.startDate}</p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                End Date:
              </strong>
              <p className="text-gray-800 dark:text-white">{entry.endDate}</p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Received Date:
              </strong>
              <p className="text-gray-800 dark:text-white">
                {entry.receivedDate}
              </p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Status:
              </strong>
              <p className="text-gray-800 dark:text-white">{entry.status}</p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Test Drive:
              </strong>
              <p className="text-gray-800 dark:text-white">
                {entry.testDriveStatus}
              </p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Delivery Status:
              </strong>
              <p className="text-gray-800 dark:text-white">
                {entry.driverStatus}
              </p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Checked By:
              </strong>
              <p className="text-gray-800 dark:text-white">{entry.checkedBy}</p>
            </div>
            <div>
              <strong className="block text-gray-600 dark:text-gray-300">
                Approved By:
              </strong>
              <p className="text-gray-800 dark:text-white">
                {entry.approvedBy}
              </p>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 dark:bg-gray-800 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            Weekly Job Checklist:{" "}
            {currentWeek.startOf("isoWeek").format("YYYY-MM-DD")} to{" "}
            {currentWeek.endOf("isoWeek").format("YYYY-MM-DD")}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentWeek((prev) => prev.clone().subtract(1, "week"))
              }
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              ⬅ Previous
            </button>
            <button
              onClick={() =>
                setCurrentWeek((prev) => prev.clone().add(1, "week"))
              }
              className="bg-gray-600 text-white px-3 py-1 rounded"
            >
              Next ➡
            </button>
            <button
              onClick={() => exportToPDF(weeklyData)}
              className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2"
            >
              <FaFilePdf /> PDF
            </button>
            <button
              onClick={() => exportToExcel(weeklyData)}
              className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2"
            >
              <FaFileExcel /> Excel
            </button>
          </div>
        </div>
        <UpdateModal
          isOpen={showModal}
          entry={selectedEntry}
          onClose={() => setShowModal(false)}
          onSave={handleSaveModal}
        />
        <ViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          entry={selectedEntry}
        />

        {loading ? (
          <div className="text-center text-lg text-gray-500 dark:text-gray-300 mt-10">
            Loading weekly checklist...
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-700">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-600 text-white">
                <tr>
                  <th rowSpan="2" className="border px-3 py-2">
                    Job ID
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Plate Num
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Start Date
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    End Date
                  </th>
                  <th
                    colSpan={6}
                    className="border px-3 py-2 text-center border-l-4 border-blue-600"
                  >
                    <div className="underline">Days of Week</div>
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Status
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Test Drive
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Delivery Status
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Checked By
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Approved By
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Received Date
                  </th>
                  <th rowSpan="2" className="border px-3 py-2">
                    Action
                  </th>
                </tr>
                <tr>
                  {weekdays.map((day) => (
                    <th
                      key={day}
                      className="border px-3 py-2 border-l-2 border-blue-400"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-4">
                      No data for this week.
                    </td>
                  </tr>
                ) : (
                  weeklyData.map((entry) => (
                    <tr
                      key={entry.jobId}
                      className="hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <td className="border px-2 py-2">{entry.jobId}</td>
                      <td className="border px-2 py-2">{entry.plateNum}</td>
                      <td className="border px-2 py-2">{entry.startDate}</td>
                      <td className="border px-2 py-2">{entry.endDate}</td>
                      {weekdays.map((day) => (
                        <td
                          key={day}
                          className={`border px-2 py-2 text-center ${getColor(
                            entry.days[day]
                          )}`}
                        >
                          {entry.days[day]}
                        </td>
                      ))}
                      <td
                        className={`border px-2 py-2 ${getStatusColor(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </td>
                      <td className="border px-2 py-2 text-center">
                        {entry.testDriveStatus === "Pass" ? (
                          <span className="text-green-600 font-bold">
                            passed
                          </span>
                        ) : entry.testDriveStatus === "Fail" ? (
                          <span className="text-red-600 font-bold">Failed</span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>

                      <td className="border px-2 py-2">{entry.driverStatus}</td>
                      <td className="border px-2 py-2">{entry.checkedBy}</td>
                      <td className="border px-2 py-2">{entry.approvedBy}</td>
                      <td className="border px-2 py-2">{entry.receivedDate}</td>
                      <td className="border px-2 py-2 relative">
                        <button
                          onClick={() => toggleDropdown(entry.jobId)}
                          className="bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1"
                        >
                          Action <FiMoreVertical />
                        </button>

                        {openDropdown === entry.jobId && (
                          <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow-md z-10">
                            <button
                              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowViewModal(true);
                                setOpenDropdown(null);
                              }}
                            >
                              View
                            </button>

                            <button
                              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowModal(true);
                                setOpenDropdown(null);
                              }}
                            >
                              Update Info
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyChecklist;
