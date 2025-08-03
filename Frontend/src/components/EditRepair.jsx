import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "./BackButton";
export default function EditRepair() {
  const { id } = useParams(); // Get ID from URL (for editing)
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([
    {
      plate_no: "",
      model: "",
      vin: "",
      tin: "",
      year: "",
      condition: "",
      km_reading: "",
      estimated_price: "",
    },
  ]);

  const [formData, setFormData] = useState({
    job_id: "",
    customer_name: "",
    customer_type: "",
    mobile: "",
    received_date: "",
    estimated_date: "",
    promise_date: "",
    priority: "",
    repair_category: [],
    customer_observation: ["1. "], // Default starts with "1. "
    spare_change: ["1. "], // Default starts with "1. "
    received_by: "",
    job_description: ["1. "],
  });

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        plate_no: "",
        model: "",
        vin: "",
        tin: "",
        year: "",
        condition: "",
        km_reading: "",
        estimated_price: "",
      },
    ]);
  };
  useEffect(() => {
    if (id) {
      const fetchRepair = async () => {
        try {
          const response = await api.get(`/repairs/${id}`);
          console.log(response);
          const data = response.data;
          console.log(data);

          // Update formData state
          setFormData({
            id: data.id,
            job_id: data.job_id.toString().padStart(4, "0") || "",
            customer_name: data.customer_name || "",
            customer_type: data.customer_type || "",
            mobile: data.mobile || "",
            received_date: data.received_date || "",
            estimated_date: data.estimated_date || "",
            promise_date: data.promise_date || "",
            priority: data.priority || "",
            repair_category: data.repair_category || [], // ✅ Setting repair_category as an array
            customer_observation: data.customer_observation || ["1. "],
            spare_change: data.spare_change || ["1. "],
            received_by: data.received_by || "",
            job_description: data.job_description || ["1. "],
            vehicles: data.vehicles,
          });

          // ✅ Directly update vehicles state
          setVehicles((prevVehicles) => {
            if (prevVehicles.length > 0) {
              return [
                {
                  ...prevVehicles[0], // Keep existing properties of the first vehicle
                  model: data.vehicles[0].model,
                  plate_no: data.vehicles[0].plate_no,
                  vin: data.vehicles[0].vin || "", // Add vin if available
                  tin: data.vehicles[0].tin || "", // Add vin if available
                  year: data.vehicles[0].year,
                  condition: data.vehicles[0].condition,
                  km_reading: data.vehicles[0].km_reading,
                  estimated_price: data.vehicles[0].estimated_price,
                },
                ...prevVehicles.slice(1), // Keep other vehicles unchanged
              ];
            } else {
              // If there are no vehicles, initialize with the fetched data
              return [
                {
                  model: data.model,
                  plate_no: data.plate_no,
                  vin: data.vin || "",
                  tin: data.tin || "",
                  year: data.year,
                  condition: data.condition,
                  km_reading: data.km_reading,
                  estimated_price: data.estimated_price,
                },
              ];
            }
          });
        } catch (error) {
          console.error("Error fetching repair data:", error);
        }
      };

      fetchRepair();
    }
  }, [id]); // ✅ Runs only when `id` changes

  const removeVehicle = (index) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };
  console.log(vehicles);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        repair_category: checked
          ? [...prevData.repair_category, value]
          : prevData.repair_category.filter((cat) => cat !== value),
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleVehicleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVehicles = vehicles.map((vehicle, i) =>
      i === index ? { ...vehicle, [name]: value } : vehicle
    );
    setVehicles(updatedVehicles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedRepairCategory = Array.isArray(formData.repair_category)
        ? formData.repair_category
        : formData.repair_category.split(",").map((item) => item.trim());

      const formattedCustomerObservation = Array.isArray(
        formData.customer_observation
      )
        ? formData.customer_observation
        : [formData.customer_observation];

      const formattedSpareChange = Array.isArray(formData.spare_change)
        ? formData.spare_change
        : [formData.spare_change];

      const formattedVehicles = vehicles.map((vehicle) => ({
        plate_no: vehicle.plate_no || "",
        model: vehicle.model || "",
        vin: vehicle.vin || "",
        tin: vehicle.tin || "",
        year: vehicle.year || "",
        condition: vehicle.condition || "",
        km_reading: vehicle.km_reading || "",
        estimated_price: vehicle.estimated_price || "",
      }));

      const payload = {
        ...formData,
        repair_category: formattedRepairCategory,
        customer_observation: formattedCustomerObservation,
        spare_change: formattedSpareChange,
        vehicles: formattedVehicles,
      };

      let response;
      if (id) {
        // UPDATE if id exists
        response = await api.put(`/repairs/${id}`, payload);
        toast.success("Repair job updated successfully!");
      } else {
        // CREATE new repair
        response = await api.post("/repairs", payload);
        toast.success("Repair job created successfully!");
      }

      setTimeout(() => navigate("/job-manager/repair"), 1000);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error);
      toast.error("Failed to submit form.");
    }
  };

  const placeholders = {
    plate_no: "የተሽከርካሪ መታወቂያ ቁጥር",
    model: "የተሽከርካሪ ሞዴል",
    tin: "የግብር መለያ ቁጥር",
    year: "የምርት አመት",
    km_reading: "የተሽከርካሪ ኪ.ሜ አንቀሳቃሴ",
    estimated_price: "የተገመተ የተሽከርካሪ ዋጋ",
  };

  const handleCustomerInfoChange = (index, e) => {
    const updatedInfo = [...formData.customer_observation];
    updatedInfo[index] = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      customer_observation: updatedInfo,
    }));
  };
  const handleCustomerInfoKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default behavior

      const updatedInfo = [...formData.customer_observation];
      const nextNumber = updatedInfo.length + 1; // Get the next numbered entry

      updatedInfo.splice(index + 1, 0, `${nextNumber}. `); // Insert new entry

      setFormData((prevData) => ({
        ...prevData,
        customer_observation: updatedInfo,
      }));
    }
  };

  const handleSpareChangeChange = (index, e) => {
    const updatedSpareChange = [...formData.spare_change];
    updatedSpareChange[index] = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      spare_change: updatedSpareChange,
    }));
  };

  const handleSpareChangeKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default behavior

      const updatedSpareChange = [...formData.spare_change];
      const nextNumber = updatedSpareChange.length + 1; // Generate next entry number

      updatedSpareChange.splice(index + 1, 0, `${nextNumber}. `); // Insert new numbered entry

      setFormData((prevData) => ({
        ...prevData,
        spare_change: updatedSpareChange,
      }));
    }
  };
  const handleJobDescriptionChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      job_description: e.target.value.split("\n"), // Store as an array of lines
    }));
  };

  const handleJobDescriptionKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default Enter behavior

      const updatedDescription = [...formData.job_description];
      const nextNumber = updatedDescription.length + 1; // Get next numbered entry
      updatedDescription.push(`${nextNumber}. `); // Append new numbered line

      setFormData((prevData) => ({
        ...prevData,
        job_description: updatedDescription,
      }));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="fixed top-4 left-[19%] z-[99999999]">
          <BackButton />
        </div>

        <main className="grow mt-6">
          <form
            onSubmit={handleSubmit}
            className="phone:w-[95%] tablet:max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg"
          >
            <h2 className="uppercase tracking-wide text-blue-700 phone:text-lg tablet:text-xl font-bold mb-4">
              Edit Registration Form
            </h2>
            <div className="grid phone:grid-cols-1 tablet:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="col-span-1 border border-blue-500 px-4 py-2 rounded-md overflow-hidden">
                <h3 className="font-semibold mb-4 text-blue-700">
                  Customer Details
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label>
                      Job Id <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="job_id"
                      value={formData.job_id}
                      onChange={handleChange}
                      placeholder="የደንበኛው ስም"
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label>
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="የደንበኛው ስም"
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label>
                      Customer Type<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="customer_type"
                      onChange={handleChange}
                      value={formData.customer_type}
                      placeholder="የደንበኛው አይነት"
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Regular">Regular</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label>
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="mobile"
                      onChange={handleChange}
                      value={formData.mobile}
                      placeholder="ስልክ ቁጥር"
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label>
                      Received Date/የተቀበሉበት ቀን{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="received_date"
                      onChange={handleChange}
                      value={formData.received_date}
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label>
                      E. Date/የሚገመተው ቀን{" "}
                      <span className="text-gray-400 text-sm">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      name="estimated_date"
                      onChange={handleChange}
                      value={formData.estimated_date}
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                    />
                  </div>
                  <div>
                    <label>
                      {" "}
                      Date Out/የምያልቅበት ቀን{" "}
                      <span className="text-gray-400 text-sm">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="promise_date"
                      onChange={handleChange}
                      value={formData.promise_date}
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="font-medium">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      onChange={handleChange}
                      value={formData.priority}
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    >
                      <option value="">ቅድምያው የሚሰጠዉን ምረጥ</option>
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="border border-gray-300 hover:shadow-md hover:border-blue-500 p-3 py-4 rounded-md">
                    <label className="mb-2 block text-gray-700 font-semibold">
                      Repair Category <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "General Service",
                        "Body",
                        "Mechanical",
                        "Electrical",
                        "Diagnostic",
                      ].map((category) => (
                        <label key={category}>
                          <input
                            type="checkbox"
                            name="repair_category"
                            value={category}
                            onChange={handleChange}
                            className="ring-0 focus:ring-0"
                            checked={formData.repair_category.includes(
                              category
                            )} // Check if category exists in the array
                          />{" "}
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Customer Observations, Spare Change, and Received By - Vertically Aligned */}
                <div className="flex flex-col gap-4 mt-6">
                  <div className="p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all duration-300">
                    <h3 className="font-semibold mb-2">
                      Customer Information{" "}
                      <span className="text-gray-400 text-sm">(Optional)</span>
                    </h3>

                    {formData.customer_observation.map((info, index) => (
                      <input
                        key={index}
                        type="text"
                        value={info}
                        onChange={(e) => handleCustomerInfoChange(index, e)}
                        onKeyDown={(e) => handleCustomerInfoKeyDown(e, index)}
                        className="w-full border border-gray-300 p-2 rounded mb-2"
                      />
                    ))}
                  </div>

                  <div className="p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all duration-300">
                    <h3 className="font-semibold mb-2">
                      Spare Change{" "}
                      <span className="text-gray-400 text-sm">(Optional)</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {formData.spare_change.map((item, index) => (
                        <input
                          key={index}
                          type="text"
                          name="spare_change"
                          value={item}
                          onChange={(e) => handleSpareChangeChange(index, e)}
                          onKeyDown={(e) => handleSpareChangeKeyDown(e, index)}
                          placeholder="Enter spare change details"
                          className="w-full border border-gray-300 p-2 rounded mb-2"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all duration-300">
                    <h3 className="font-semibold mb-2">
                      Received By{" "}
                      <span className="text-gray-400 text-sm">(Optional)</span>
                    </h3>
                    <input
                      type="text"
                      name="received_by"
                      value={formData.received_by}
                      onChange={handleChange}
                      placeholder="የተቀባይ ስም"
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="col-span-1 text-right px-4 py-2 border border-blue-500 rounded-md">
                <h3 className="text-left font-semibold mb-2 text-blue-700">
                  Vehicle Details{" "}
                </h3>
                {/* <button
                  type="button"
                  onClick={addVehicle}
                  className="w-full bg-blue-500 text-white p-2 rounded"
                >
                  Add Vehicle +
                </button> */}

                {formData.vehicles?.map((vehicle, index) => (
                  <div
                    key={index}
                    className="mt-4 p-4 border hover:border-blue-500 rounded-lg relative inline-block text-left flex flex-col gap-2 transition-all duration-500"
                  >
                    <h4 className="font-semibold">Vehicle {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="absolute top-2 right-2 text-red-500"
                      >
                        ✖
                      </button>
                    )}

                    {/* Required Fields */}
                    {["plate_no", "model"].map((field) => (
                      <div key={field}>
                        <label>
                          {field.replace("_", " ").toUpperCase()}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name={field}
                          value={vehicle[field] || ""}
                          placeholder={placeholders[field]} // Amharic Placeholder
                          onChange={(e) => handleVehicleChange(index, e)}
                          className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                          required
                        />
                      </div>
                    ))}

                    {/* Optional Fields */}
                    {[
                      "vin",
                      "tin",
                      "year",
                      "km_reading",
                      "estimated_price",
                    ].map((field) => (
                      <div key={field}>
                        <label>
                          {field.replace("_", " ").toUpperCase()}{" "}
                          <span className="text-gray-400 text-sm">
                            (Optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          name={field}
                          value={vehicle[field] || ""}
                          placeholder={placeholders[field]} // Amharic Placeholder
                          onChange={(e) => handleVehicleChange(index, e)}
                          className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                        />
                      </div>
                    ))}

                    {/* Required Condition Field */}
                    <label>
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="condition"
                      value={vehicle.condition || ""}
                      onChange={(e) => handleVehicleChange(index, e)}
                      className="placeholder:text-sm w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      required
                    >
                      <option value="">የመኪናዉን ሁኔታ ምረጥ</option>
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Average">Average</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </div>
                ))}

                {/* Job Description Section */}
                <div className="mt-10 p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all duration-300">
                  <h3 className="text-left font-semibold mb-2">
                    Job Description{" "}
                    <span className="text-gray-400 text-sm">(Optional)</span>
                  </h3>
                  <textarea
                    value={
                      Array.isArray(formData.job_description)
                        ? formData.job_description.join("\n")
                        : ""
                    }
                    onChange={handleJobDescriptionChange}
                    onKeyDown={handleJobDescriptionKeyDown}
                    className="w-full border border-gray-300 p-2 rounded resize-none"
                    rows="5"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white p-2 w-full hover:shadow-lg focus:shadow-sm rounded transition-all duration-500"
            >
              Submit
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
