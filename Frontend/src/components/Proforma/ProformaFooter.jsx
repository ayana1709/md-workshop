function ProformaFooter({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
      {/* Delivery Time */}
      <div className="flex flex-col">
        <label className="block font-semibold text-gray-700 mb-1">
          Delivery Time / የመላኪያ ጊዜ
        </label>
        <input
          type="text"
          name="deliveryTime"
          value={formData.deliveryTime}
          onChange={handleChange}
          placeholder="e.g. Within 3 days / ለምሳሌ፡ በ3 ቀናት ውስጥ"
          className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
        />
      </div>

      {/* Prepared By */}
      <div className="flex flex-col">
        <label className="block font-semibold text-gray-700 mb-1">
          Prepared By / የዘጋጀው
        </label>
        <input
          type="text"
          name="preparedBy"
          value={formData.preparedBy}
          onChange={handleChange}
          placeholder="e.g. John Doe / ለምሳሌ፡ ጆን ዶ"
          className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
        />
      </div>

      {/* Notes */}
      <div className="md:col-span-2 flex flex-col">
        <label className="block font-semibold text-gray-700 mb-1">
          Notes / ማስታወሻ
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Payment should be made upon confirmation. / ለምሳሌ፡ ክፍያ ከማረጋገጫ በኋላ ይደርስ"
          className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md resize-none"
        ></textarea>
      </div>
    </div>
  );
}

export default ProformaFooter;
