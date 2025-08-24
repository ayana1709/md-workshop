import { useState } from "react";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStores } from "../contexts/storeContext";
import PrintModal from "./PrintModal";
import BackButton from "./BackButton";

export default function RepairRegistrationForm() {
  const { isPrintModalOpen, setIsPrintModalOpen, setRepairData } = useStores();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showFuelOptions, setShowFuelOptions] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  // console.log(suggestions);

  const handleItemChange = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const [formData, setFormData] = useState({
    customer_name: "",
    // customer_type: "",
    mobile: "",
    types_of_jobs: "Repair",
    received_date: "",
    estimated_date: "",
    promise_date: "",
    priority: "Medium",
    product_name: "",
    serial_code: "",
    // customer_observation: ["1. "], // Default starts with "1. "
    spare_change: [
      { item: "1. ", part_number: "", qty: "", unit_price: "", total_price: 0 },
    ],
    job_description: [{ task: "1. ", price: "" }],
    received_by: "",
    image: null, // ✅ Add this line
  });

  const navigate = useNavigate();
  const removeVehicle = (index) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        repair_category: checked
          ? [...prevData.repair_category, value]
          : prevData.repair_category.filter((cat) => cat !== value),
      }));
    } else {
      setFormData((prevData) => {
        let updatedData = { ...prevData, [name]: value };

        // ✅ If both estimated_date (days) and received_date exist, calculate promise_date
        if (
          (name === "estimated_date" || name === "received_date") &&
          updatedData.estimated_date &&
          updatedData.received_date
        ) {
          try {
            const received = new Date(updatedData.received_date);
            const estimatedDays = parseInt(updatedData.estimated_date, 10);

            if (!isNaN(received.getTime()) && !isNaN(estimatedDays)) {
              const promise = new Date(received);
              promise.setDate(received.getDate() + estimatedDays);

              updatedData.promise_date = promise.toISOString().split("T")[0]; // format YYYY-MM-DD
            }
          } catch (error) {
            console.error("Date calculation error:", error);
          }
        }

        return updatedData;
      });
    }

    // customer search logic remains the same
    if (name === "customer_name" && value.length > 1) {
      try {
        const response = await api.get(`/search-customers?q=${value}`);
        let data = response.data;
        if (!Array.isArray(data)) {
          data = data.data || [];
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setSuggestions([]);
      }
    } else if (name === "customer_name") {
      setSuggestions([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file, // 👈 this is what FormData expects
      }));
    }
  };

  // state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // 🚫 prevent double submit
    setIsSubmitting(true);

    try {
      // Normalize customer observation
      const formattedCustomerObservation = Array.isArray(
        formData.customer_observation
      )
        ? formData.customer_observation
        : [formData.customer_observation];

      const payloadData = {
        ...formData,
        customer_observation: formattedCustomerObservation,
        job_description: formData.job_description,
        spare_change: formData.spare_change,
      };

      // Create multipart form data
      const formDataToSend = new FormData();
      formDataToSend.append("payload", JSON.stringify(payloadData));

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      console.log("Sending to backend:", JSON.stringify(payloadData, null, 2));

      const response = await api.post("/repairs", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 1000,
      });

      setRepairData(payloadData);
      setIsPrintModalOpen(true);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit form.";
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false); // ✅ re-enable button
    }
  };

  const handleCustomerObservationChange = (e) => {
    const lines = e.target.value.split("\n");
    setFormData({ ...formData, customer_observation: lines });
  };

  const handleCustomerObservationKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setFormData((prevState) => {
        const newObservations = [
          ...prevState.customer_observation,
          `${prevState.customer_observation.length + 1}. `,
        ];
        return { ...prevState, customer_observation: newObservations };
      });
    }
  };

  const handleSpareChangeChange = (index, field, value) => {
    const updated = [...formData.spare_change];
    updated[index][field] = value;

    // Recalculate total if price or qty changes
    const qty = parseFloat(updated[index].qty);
    const unit = parseFloat(updated[index].unit_price);
    updated[index].total_price = !isNaN(qty) && !isNaN(unit) ? qty * unit : 0;

    setFormData({ ...formData, spare_change: updated });
  };

  const handleSpareChangeKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newRowNumber = formData.spare_change.length + 1;
      const newList = [
        ...formData.spare_change,
        { item: `${newRowNumber}. `, qty: "", unit_price: "", total_price: 0 },
      ];
      setFormData({ ...formData, spare_change: newList });

      // Focus on new item name input
      setTimeout(() => {
        const input = document.getElementById(`spare-item-${newRowNumber - 1}`);
        if (input) input.focus();
      }, 50);
    }
  };

  const getSpareChangeTotal = () => {
    return formData.spare_change.reduce(
      (sum, item) => sum + (parseFloat(item.total_price) || 0),
      0
    );
  };

  const getJobTotal = () => {
    return formData.job_description.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );
  };

  const getGrandTotal = () => getJobTotal() + getSpareChangeTotal();

  const handleJobDescriptionChange = (index, field, value) => {
    const updatedJobs = [...formData.job_description];
    updatedJobs[index][field] = value;
    setFormData({ ...formData, job_description: updatedJobs });
  };

  const handleJobDescriptionKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newList = [
        ...formData.job_description,
        { task: `${formData.job_description.length + 1}. `, price: "" },
      ];
      setFormData({ ...formData, job_description: newList });
      setTimeout(() => {
        const nextInput = document.getElementById(`task-${newList.length - 1}`);
        if (nextInput) nextInput.focus();
      }, 50);
    }
  };

  const getTotalEstimatedPrice = () => {
    return formData.job_description.reduce((total, item) => {
      const price = parseFloat(item.price);
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  };
  const addJobRow = () => {
    const newRowNumber = formData.job_description.length + 1;
    const newJobs = [
      ...formData.job_description,
      { task: ` ${newRowNumber}.`, price: "" },
    ];
    setFormData({ ...formData, job_description: newJobs });
  };

  const addSpareRow = () => {
    const newRowNumber = formData.spare_change.length + 1;
    const newItems = [
      ...formData.spare_change,
      {
        item: `${newRowNumber}. `,
        part_number: "",
        qty: "",
        unit_price: "",
        total_price: 0,
      },
    ];
    setFormData({ ...formData, spare_change: newItems });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {isPrintModalOpen && (
          <div className="absolute top-0 left-0 w-full">
            <PrintModal
              routePath="print-register"
              dataKey="repairData"
              navigateBack="/job-manager/repair"
            />
          </div>
        )}
        <div className="fixed phone:top-[13%] tablet:top-4 phone:left-2 tablet:left-[19%] z-[99999999]">
          <BackButton />
        </div>
        <main className="grow mt-12 px-2 tablet:px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full ml-0 tablet:ml-4 mr-4 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg"
          >
            <h2 className="uppercase tracking-wide dark:text-gray-200 text-blue-700 phone:text-center phone:text-lg tablet:text-xl font-bold mb-4">
              Create New Job
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-4xl grid grid-cols-1 gap-6">
                {/* Customer Details */}
                <div className="border border-blue-500 px-4 py-2 rounded-md overflow-hidden">
                  <h3 className="font-semibold mb-4 dark:text-gray-200 tracking-wider uppercase text-blue-700">
                    Customer Details /የደንበኛ ዝርዝሮች
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <label className="dark:text-gray-200">
                        Customer Name/የደንበኛው ስም{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        placeholder="የደንበኛው ስም"
                        className="placeholder:text-sm dark:bg-gray-800 placeholder:dark:text-white dark:text-white w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                        required
                      />
                      {Array.isArray(suggestions) && suggestions.length > 0 && (
                        <ul className="absolute bg-white border w-full mt-1 shadow-md rounded-md">
                          {suggestions.map((name, index) => (
                            <li
                              key={index}
                              className="p-2 cursor-pointer hover:bg-gray-200"
                              onClick={() => {
                                setFormData((prevData) => ({
                                  ...prevData,
                                  customer_name: name,
                                }));
                                setSuggestions([]); // Hide suggestions after selection
                              }}
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-gray-200">
                        Mobile /ስልክ ቁጥር<span className="text-red-500 ">*</span>
                      </label>
                      <input
                        type="number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="ስልክ ቁጥር"
                        className="no-spinner placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="dark:text-gray-200">
                        Types Of Jobs
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="types_of_jobs"
                        value={formData.types_of_jobs}
                        onChange={handleChange}
                        placeholder=""
                        className="placeholder:text-sm dark:bg-gray-800 placeholder:dark:text-white dark:text-white w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Repair">Repair</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="installation">Installation</option>
                      </select>
                    </div>

                    <div>
                      <label className="dark:text-gray-200">
                        E. Date/የሚገመተው ቀን (Days)
                        <span className="text-gray-400 text-sm dark:text-gray-200">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="estimated_date"
                        value={formData.estimated_date}
                        onChange={handleChange}
                        min="1"
                        required
                        className="no-spinner placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      />
                    </div>

                    <div>
                      <label className="dark:text-gray-200">
                        Received Date/የተቀበሉበት ቀን{" "}
                        <span className="text-red-500 ">*</span>
                      </label>
                      <input
                        type="date"
                        name="received_date"
                        value={formData.received_date}
                        onChange={handleChange}
                        className="placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="dark:text-gray-200">
                        {" "}
                        Date Out/የምያልቅበት ቀን{" "}
                        <span className="text-gray-400 text-sm dark:text-gray-200">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="date"
                        name="promise_date"
                        value={formData.promise_date}
                        onChange={handleChange}
                        className="placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      />
                    </div>

                    <div>
                      <label className="dark:text-gray-200 font-medium">
                        Priority/ቅድሚያ የሚሰጡዋቸውን{" "}
                        <span className="text-red-500 ">*</span>
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                        required
                      >
                        <option value="">ቅድምያው የሚሰጠዉን ምረጥ</option>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="dark:text-gray-200">
                      {" "}
                      product Name
                      <span className="text-red-500 ">*</span>
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleChange}
                      required
                      className="placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="dark:text-gray-200">
                      {" "}
                      Serial Code
                      <span className="text-red-500 ">*</span>
                    </label>
                    <input
                      type="text"
                      name="serial_code"
                      value={formData.serial_code}
                      onChange={handleChange}
                      required
                      className="placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                    />
                  </div>

                  {/* Customer Observations, Spare Change, and Received By - Vertically Aligned */}

                  <div className="flex flex-col gap-4 mt-6">
                    {/* Jobs To Be Done */}
                    <div className="mt-10 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 overflow-x-auto">
                      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-black z-10 py-2 shadow-sm">
                        <h3 className="font-semibold dark:text-gray-200 text-lg">
                          Jobs To Be Done /የሚሰሩ ስራዎች
                          <span className="text-gray-400 text-sm dark:text-gray-200">
                            {" "}
                            (Optional)
                          </span>
                        </h3>

                        {/* Always visible button */}
                        <button
                          type="button"
                          onClick={addJobRow}
                          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
                        >
                          + Add Row
                        </button>
                      </div>

                      <div className="min-w-[600px]">
                        <table className="w-full text-sm border-collapse">
                          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                            <tr>
                              <th className="p-3 border text-left">
                                Job Description
                              </th>
                              <th className="p-3 border text-right">
                                Estimated Price (ETB)
                              </th>
                              <th className="p-3 border text-center">X</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.job_description.map((job, index) => (
                              <tr
                                key={index}
                                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="p-2 border">
                                  <input
                                    id={`task-${index}`}
                                    type="text"
                                    value={job.task}
                                    onChange={(e) =>
                                      handleJobDescriptionChange(
                                        index,
                                        "task",
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleJobDescriptionKeyDown(e, index)
                                    }
                                    placeholder={`Task ${index + 1}`}
                                    className="w-full px-3 py-2 rounded-md bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2 border text-right">
                                  <input
                                    type="number"
                                    value={job.price}
                                    onChange={(e) =>
                                      handleJobDescriptionChange(
                                        index,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleJobDescriptionKeyDown(e, index)
                                    }
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 rounded-md text-right bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none no-spinner"
                                  />
                                </td>
                                <td className="p-2 border text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (formData.job_description.length > 1) {
                                        const updated = [
                                          ...formData.job_description,
                                        ];
                                        updated.splice(index, 1);
                                        setFormData({
                                          ...formData,
                                          job_description: updated,
                                        });
                                      }
                                    }}
                                    className="text-red-500 font-bold"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 text-right font-semibold text-blue-700 dark:text-blue-300">
                        Total Estimated Price:{" "}
                        {getTotalEstimatedPrice().toLocaleString()} ETB
                      </div>
                    </div>
                    {/* Spare Change */}
                    <div className="mt-10 p-4 border border-black rounded-lg bg-white dark:bg-black text-gray-700 dark:text-white overflow-x-auto">
                      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-black z-10 py-2 shadow-sm">
                        <h3 className="font-semibold dark:text-gray-200 text-lg">
                          Spare Change /መለዋወጫ ለውጥ
                          <span className="text-gray-400 text-sm dark:text-gray-200">
                            {" "}
                            (Optional)
                          </span>
                        </h3>

                        {/* Always visible button */}
                        <button
                          type="button"
                          onClick={addSpareRow}
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition"
                        >
                          + Add Row
                        </button>
                      </div>

                      <div className="min-w-[800px]">
                        <table className="w-full text-sm border-collapse">
                          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                            <tr>
                              <th className="p-3 border text-left">
                                Item Name
                              </th>
                              <th className="p-3 border text-left">
                                Part Number
                              </th>
                              <th className="p-3 border text-center w-32">
                                Qty
                              </th>
                              <th className="p-3 border text-center w-40">
                                Unit Price
                              </th>
                              <th className="p-3 border text-right w-44">
                                Total
                              </th>
                              <th className="p-3 border text-center">X</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.spare_change.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="p-2 border">
                                  <input
                                    type="text"
                                    value={item.item}
                                    onChange={(e) =>
                                      handleSpareChangeChange(
                                        index,
                                        "item",
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleSpareChangeKeyDown(e, index)
                                    }
                                    className="w-full px-3 py-2 rounded-md bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2 border">
                                  <input
                                    type="text"
                                    value={item.part_number || ""}
                                    onChange={(e) =>
                                      handleSpareChangeChange(
                                        index,
                                        "part_number",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Part #"
                                    className="w-full px-3 py-2 rounded-md bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2 border text-center">
                                  <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) =>
                                      handleSpareChangeChange(
                                        index,
                                        "qty",
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleSpareChangeKeyDown(e, index)
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-md text-center bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none no-spinner"
                                  />
                                </td>
                                <td className="p-2 border text-center">
                                  <input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) =>
                                      handleSpareChangeChange(
                                        index,
                                        "unit_price",
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleSpareChangeKeyDown(e, index)
                                    }
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-md text-center bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none no-spinner"
                                  />
                                </td>
                                <td className="p-2 border text-right">
                                  <input
                                    type="text"
                                    readOnly
                                    value={item.total_price.toFixed(2)}
                                    className="w-full px-3 py-2 rounded-md text-right bg-transparent dark:text-white dark:bg-gray-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2 border text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (formData.spare_change.length > 1) {
                                        const updated = [
                                          ...formData.spare_change,
                                        ];
                                        updated.splice(index, 1);
                                        setFormData({
                                          ...formData,
                                          spare_change: updated,
                                        });
                                      }
                                    }}
                                    className="text-red-500 font-bold"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 text-right font-semibold text-blue-700 dark:text-blue-300">
                        Total Spare Change Price:{" "}
                        {getSpareChangeTotal().toLocaleString()} ETB
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all duration-300 mt-4">
                      <h3 className="font-semibold mb-2 dark:text-gray-200">
                        Upload Image / የምስል መጫኛ
                        <span className="text-gray-400 text-sm dark:text-gray-200">
                          {" "}
                          (Optional)
                        </span>
                      </h3>

                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange} // 👈 not handleChange
                        className="w-full text-sm dark:text-white dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />

                      {previewUrl && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            Preview:
                          </p>
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-64 object-contain border rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-6 text-right text-lg font-bold border-t pt-4  text-dark-700 dark:text-white">
                      Sub Total Estimated Price/ንዑስ ጠቅላላ የተገመተው ዋጋ:{" "}
                      {getGrandTotal().toLocaleString()} ETB
                    </div>
                    <div className="p-4 border rounded-lg hover:shadow-md hover:border-blue-500 transition-all duration-300">
                      <h3 className="font-semibold mb-2 dark:text-gray-200">
                        Received By /የተቀባይ ስም
                        <span className="text-gray-400 text-sm dark:text-gray-200">
                          (Optional)
                        </span>
                      </h3>
                      <input
                        type="text"
                        name="received_by"
                        onChange={handleChange}
                        placeholder="የተቀባይ ስም"
                        className="placeholder:text-sm dark:text-white dark:bg-gray-800 placeholder:dark:text-gray-100 w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
