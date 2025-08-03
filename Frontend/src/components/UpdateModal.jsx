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
            <option value="Delivered">Delivered</option>
            <option value="Returned">Returned</option>
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
