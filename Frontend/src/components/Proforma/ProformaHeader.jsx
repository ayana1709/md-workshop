import api from "@/api"; // your axios wrapper

function ProformaHeader({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobIdBlur = async () => {
    if (!formData.jobId) return;

    try {
      const res = await api.get(`repairs/basic/${formData.jobId}`);
      const { customer_name, plate_no, vehicle_type } = res.data;

      setFormData((prev) => ({
        ...prev,
        customerName: customer_name,
        plateNo: plate_no,
        vehicleType: vehicle_type,
      }));
    } catch (error) {
      console.error("Failed to fetch job info:", error);
      alert("Job ID not found. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Job ID (Optional)
        </label>
        <input
          type="text"
          name="jobId"
          value={formData.jobId}
          onChange={handleChange}
          onBlur={handleJobIdBlur}
          placeholder="Enter Job ID to auto-fill"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          placeholder="e.g. Abebe Kebede"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Plate No
        </label>
        <input
          type="text"
          name="plateNo"
          value={formData.plateNo}
          onChange={handleChange}
          placeholder="e.g. 3A 45678"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type of Car
        </label>
        <input
          type="text"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          placeholder="e.g. Toyota Hilux"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>
    </div>
  );
}

export default ProformaHeader;
