function ProformaFooter({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Delivery Time
        </label>
        <input
          type="text"
          name="deliveryTime"
          value={formData.deliveryTime}
          onChange={handleChange}
          placeholder="e.g. Within 3 days"
          className="w-full border px-3 py-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Prepared By
        </label>
        <input
          type="text"
          name="preparedBy"
          value={formData.preparedBy}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          className="w-full border px-3 py-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Payment should be made upon confirmation."
          className="w-full border px-3 py-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
    </div>
  );
}

export default ProformaFooter;
