import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Swal from "sweetalert2";

const defaultReminders = [
  { name: "Oil Change", km: "" },
  { name: "Oil Filter Change", km: "" },
  { name: "Belt Change", km: "" },
  { name: "Gasket Change", km: "" },
];

const ServiceReminderForm = () => {
  const { id } = useParams();
  const [reminders, setReminders] = useState(defaultReminders);
  const [repair, setRepair] = useState(null);
  const [approvedBy, setApprovedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchRepairById = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/repairs/${id}`);
        if (response.data) {
          setRepair(response.data);
        }
      } catch (error) {
        console.error("Error fetching repair details:", error);
        setRepair(null);
      }
    };
    fetchRepairById();
  }, [id]);

  const handleReminderChange = (index, field, value) => {
    const updated = [...reminders];
    updated[index][field] = value;
    setReminders(updated);
  };

  const addReminder = () => {
    setReminders([{ name: "", km: "" }, ...reminders]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!repair) return;

      const payload = {
        job_card_id: repair.job_id,
        customer_name: repair.customer_name,
        plate_number: repair.plate_no,
        reminders: reminders, // ✅ FIXED name to match backend
        approved_by: approvedBy,
      };

      await api.post("/service-reminders", payload);

      Swal.fire({
        icon: "success",
        title: "Service Reminder Submitted!",
        text: "The service reminders were successfully saved.",
        confirmButtonColor: "#3085d6",
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting service reminders:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong while submitting the form.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-2 sm:px-6 py-8 bg-white min-h-screen">
      <div className="w-full max-w-8xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="border rounded-md border-blue-500 py-6 px-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-700">
              🛠️ Service Reminder Form
            </h2>
            <button
              onClick={addReminder}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              + Add Reminder
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Vehicle & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  value={repair?.customer_name || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Job Card No
                </label>
                <input
                  value={repair?.job_id || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  value={repair?.plate_no || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold"
                />
              </div>
            </div>

            {/* Approved By Input */}
            <div className="mb-6">
              <label className="block font-bold text-gray-700 mb-1">
                Approved By
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Enter approver's name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md font-bold"
                required
              />
            </div>

            {/* Reminder Inputs */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                🔔 Service Reminders
              </h3>
              {reminders.map((reminder, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-100 p-4 rounded-lg border border-blue-300"
                >
                  <input
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded-md font-bold w-full"
                    value={reminder.name}
                    onChange={(e) =>
                      handleReminderChange(index, "name", e.target.value)
                    }
                    placeholder="Reminder name"
                    required
                  />
                  <input
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded-md font-bold w-full"
                    value={reminder.km}
                    onChange={(e) =>
                      handleReminderChange(index, "km", e.target.value)
                    }
                    placeholder="Next XX km"
                    required
                  />
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-lg font-bold text-white rounded-xl transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit Service Reminders"}
              </button>
            </div>

            {submitted && (
              <div className="mt-6 bg-green-100 text-green-800 font-bold p-4 rounded-lg shadow">
                ✅ Service reminders submitted successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceReminderForm;
