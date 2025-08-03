import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Loading from "./Loading";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "./BackButton";
import PrintModal from "./PrintModal";
import { useStores } from "../contexts/storeContext";

const AddWheelAlignment = () => {
  const { wheelData, setWheelData, setIsPrintModalOpen, isPrintModalOpen } =
    useStores();
  const [formData, setFormData] = useState({
    job_card_no: "",
    date: "",
    customer_name: "",
    customer_type: "",
    mobile: "",
    tin_number: "",
    checked_date: "",
    work_description: "",
    result: "",
    total_amount: "",
    professional: "",
    checked_by: "",
  });

  console.log(formData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/wheel-alignment", formData);

      toast.success("Job card added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setWheelData(formData); // Store the repair data
      setIsPrintModalOpen(true); // Open the modal
      // navigate("/job-manager/wheel-alignment-list");
      // navigate("/job-manager/wheel-alignment-list");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
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
              routePath="print-bolo"
              stateData={{ wheelData }}
              navigateBack="/job-manager/wheel-alignment-list"
            />
          </div>
        )}
        <div className="fixed phone:top-[13%] tablet:top-4 phone:left-2 tablet:left-[19%] z-[99999999]">
          <BackButton />
        </div>
        <main className="grow">
          <div className="min-h-screen phone:p-2 phone:mt-10 tablet:mt-0 tablet:p-6 shadow-lg">
            <div className="max-w-4xl mx-auto phone:p-2 tablet:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-4">
              <h2 className="text-blue-700 dark:text-gray-200 phone:text-left tablet:text-center tracking-wide uppercase phone:text-sm mdphone:text-md mtab:text-lg tablet:text-2xl font-bold text-left mb-6 text-blue-500">
                Wheel Alignement Registration Form
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
                        label: "Job Card No",
                        name: "job_card_no",
                        type: "text",
                        placeholder: "የካርድ ቁጥር",
                      },
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
                        label: "Mobile",
                        name: "mobile",
                        type: "text",
                        placeholder: "ስልክ ቁጥር",
                      },

                      {
                        label: "Date/ቀን",
                        name: "date",
                        type: "date",
                        placeholder: "ቀን",
                      },
                      {
                        label: "Checked Date/የታየበት  ቀን",
                        name: "checked_date",
                        type: "date",
                        placeholder: "የታየበት  ቀን",
                      },
                      {
                        label: "Professional",
                        name: "professional",
                        type: "text",
                        placeholder: "ባለሙያ",
                      },
                      {
                        label: "Result",
                        name: "result",
                        type: "text",
                        placeholder: "ውጤት",
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
                              className="placeholder:text-sm dark:bg-gray-800 placeholder:dark:text-white dark:text-white w-full border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 border border-blue-500 px-4 py-2 rounded-md overflow-hidden">
                    {[
                      {
                        label: "TIN Number",
                        name: "tin_number",
                        type: "text",
                        placeholder: "የተሽከርካሪው ቁጥር",
                      },

                      {
                        label: "Work Description",
                        name: "work_description",
                        type: "text",
                        placeholder: "የስራ ማብራርያ",
                      },

                      {
                        label: "Total Aamount",
                        name: "total_amount",
                        type: "text",
                        placeholder: "ጠቅላላ ክፍያ",
                      },
                      {
                        label: "Checked By",
                        name: "checked_by",
                        type: "text",
                        placeholder: "መኪናዉን የፈተሸው ባለሙያ",
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
                            className="w-full dark:bg-gray-800 dark:text-white border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 transition duration-200"
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

export default AddWheelAlignment;
