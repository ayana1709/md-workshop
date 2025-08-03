import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "./BackButton";
import PrintModal from "./PrintModal";
import { useStores } from "../contexts/storeContext";

const AddInspection = () => {
  const { id } = useParams(); // Get ID from URL (for editing)
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_type: "",
    phone_number: "",
    tin_number: "",
    result: "",
    total_payment: "",
    checked_by: "",
    plate_number: "",
    make: "",
    model: "",
    year: "",
  });
  console.log(formData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    inspectionData,
    setInspectionData,
    setIsPrintModalOpen,
    isPrintModalOpen,
  } = useStores();

  useEffect(() => {
    if (id) {
      api
        .get(`/inspections/${id}`)
        .then((response) => {
          setFormData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          setError("Failed to fetch data.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (id) {
        await api.put(`/inspections/${id}`, formData);
        toast.success("Inspection updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await api.post("/add-inspection", formData);
        toast.success("Vehicle registered successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setInspectionData(formData); // Store the repair data
      setIsPrintModalOpen(true); // Open the modal
      // setTimeout(() => navigate("/job-manager/inspection-list"), 1000);

      // setTimeout(() => navigate("/job-manager/inspection-list"), 1000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {isPrintModalOpen && (
          <div className="absolute top-0 left-0 w-full">
            <PrintModal
              routePath="print-inspection"
              stateData={{ inspectionData }}
              navigateBack="/job-manager/inspection-list"
            />
          </div>
        )}
        <div className="fixed phone:top-[13%] tablet:top-4 phone:left-2 tablet:left-[19%] z-[99999999]">
          <BackButton />
        </div>
        <main className="grow">
          <div className="min-h-screen phone:p-2 tablet:p-6 shadow-lg">
            <div className="max-w-4xl phone:mt-10 tablet:mt-0 mx-auto phone:p-[4px] tablet:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-4">
              <h2 className="phone:text-center text-blue-700 dark:text-gray-200 tracking-wider uppercase phone:text-sm mdphone:text-md mtab:text-lg tablet:text-2xl font-bold tablet:text-left mb-6 text-blue-500">
                Inspection Registration Form
              </h2>
              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && (
                <p className="text-green-500 text-center">{success}</p>
              )}

              <form className="" onSubmit={handleSubmit}>
                <div className="w-full grid phone:grid-cols-1 tablet:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4 border border-blue-500 px-4 py-2 rounded-md overflow-hidden">
                    {[
                      {
                        label: "Customer Name",
                        name: "customer_name",
                        type: "text",
                        placeholder: "የደንበኛው ስም",
                      },

                      {
                        label: "Customer Type",
                        name: "customer_type",
                        type: "select",
                        placeholder: "የደንበኛው አይነት",
                        options: [
                          { value: "Regular", label: "Regular" },
                          { value: "Contract", label: "Contract" },
                        ],
                      },
                      {
                        label: "Phone Number",
                        name: "phone_number",
                        type: "text",
                        placeholder: "ስልክ ቁጥር",
                      },

                      {
                        label: "Result",
                        name: "result",
                        type: "text",
                        placeholder: "ዉጤት",
                      },
                      {
                        label: "Checked By",
                        name: "checked_by",
                        type: "text",
                        placeholder: "ባለሙያ",
                      },
                      {
                        label: "Make",
                        name: "make",
                        type: "text",
                        placeholder: "ሜክ",
                      },
                      {
                        label: "Year",
                        name: "year",
                        type: "text",
                        placeholder: "ዓመት",
                      },
                    ].map((field, index) => (
                      <div key={index} className="">
                        <div>
                          <label className="block dark:text-gray-200 font-medium text-sm text-gray-600 text-md pb-1">
                            {field.label}
                          </label>
                          {field.type === "select" ? (
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className="w-full dark:bg-gray-800 dark:text-white border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                            >
                              <option className="text-sm block" value="">
                                {field.placeholder}
                              </option>
                              {field.options.map((option, i) => (
                                <option key={i} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              placeholder={field.placeholder}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className="placeholder:text-sm dark:bg-gray-800 dark:text-white placeholder:dark:text-white w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 border border-blue-500 px-4 py-2 rounded-md overflow-hidden">
                    {[
                      {
                        label: "Plate No",
                        name: "plate_number",
                        type: "text",
                        placeholder: "የሰሌዳ ቁጥር",
                      },
                      {
                        label: "TIN Number",
                        name: "tin_number",
                        type: "text",
                        placeholder: "የተሽከርካሪው ቁጥር",
                      },
                      {
                        label: "Model",
                        name: "model",
                        type: "text",
                        placeholder: "ሞዴል",
                      },

                      {
                        label: "Payment Total",
                        name: "total_payment",
                        type: "text",
                        placeholder: "ጠቅላላ ክፍያ",
                      },
                    ].map((field, index) => (
                      <div key={index} className="">
                        <label className="block dark:text-gray-200 font-medium text-sm text-gray-600 text-md pb-1">
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className="w-full border dark:bg-gray-800 dark:text-white border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                          >
                            <option className="text-sm" value="">
                              {field.placeholder}
                            </option>
                            {field.options.map((option, i) => (
                              <option key={i} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="placeholder:text-sm dark:bg-gray-800 placeholder:dark:text-white dark:text-white w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="w-full flex justify-center col-span-2 mt-4">
                  <button
                    type="submit"
                    className="phone:w-full tablet:w-1/2 bg-blue-500 text-white px-6 py-2 rounded-md hover:shadow-lg hover:scale-105 focus:shadow-sm hover:bg-blue-600 transition duration-100 will-change-transform"
                  >
                    Register Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddInspection;
