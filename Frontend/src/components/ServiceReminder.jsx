import React, { useEffect, useState } from "react";
import api from "../api";

const ServiceReminder = ({ plateNumber }) => {
  const [reminderData, setReminderData] = useState({
    reminders: [],
    approved_by: "",
    customer_name: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plateNumber) return;

    const fetchReminder = async () => {
      try {
        const response = await api.get(
          `/service-reminders/plate/${plateNumber}`
        );
        if (response.data) {
          setReminderData(response.data);
        } else {
          setReminderData({
            reminders: [],
            approved_by: "",
            customer_name: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch service reminder:", err);
        setReminderData({
          reminders: [],
          approved_by: "",
          customer_name: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, [plateNumber]);

  if (loading)
    return <div className="text-center">Loading Service Reminder...</div>;

  return (
    <div className="max-w-full mx-auto p-8 bg-gray-100 rounded-2xl shadow-md border border-gray-200 text-sm sm:text-base print:border-none print:shadow-none print:p-2">
      <h2 className="text-xl font-semibold text-center mb-4 border-b pb-2">
        Service Reminder
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {reminderData.reminders.length === 0 ? (
          <div className="text-gray-500 italic">
            No service reminders found.
          </div>
        ) : (
          reminderData.reminders.map((reminder, index) => (
            <div key={index} className="flex items-center">
              <span className="font-medium w-40">
                {reminder.name || "N/A"}:
              </span>
              <span className="p-2">Next </span>
              <span>{reminder.km || "N/A"}</span>Km
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-28 font-medium">Approved by:</span>
            <span className="flex-1 border-b border-black h-6">
              {reminderData.approved_by || ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 font-medium">Signature:</span>
            <div className="flex-1 border-b border-black h-6" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-32 font-medium">Customer name:</span>
            <span className="flex-1 border-b border-black h-6">
              {reminderData.customer_name || ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 font-medium">Signature:</span>
            <div className="flex-1 border-b border-black h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceReminder;
