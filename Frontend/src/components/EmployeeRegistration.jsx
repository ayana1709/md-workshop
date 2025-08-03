import { useState } from "react";
import axios from "axios";
import api from "../api";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "./BackButton";

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    contact_information: "",
    position: "",
    address: "",
    gender: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/employees", formData);

      setFormData({
        full_name: "",
        contact_information: "",
        position: "",
        address: "",
        gender: "",
      });
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/employees-list"), 2000);
    } catch (error) {
      console.error(error.response.data);
      toast.error("Failed to submit form.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full flex overflow-x-hidden overflow-y-auto">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Content Area */}
      <div className="w-full relative mb-4 overflow-x-hidden">
        <div className="absolute z-[999] top-6 left-2">
          <BackButton />
        </div>
        {/* Site Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="w-full pb-4 mb-4">
          {/* <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto"> */}
          <div className="w-full relative p-6 mb-4">
            <form
              onSubmit={handleSubmit}
              className="absolute w-1/2 left-1/2 -translate-x-[50%] pb-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 border border-blue-400 shadow-md rounded-md px-8 pb-8 pt-4 mb-4 transition-all duration-500"
            >
              <h2 className="text-xl font-bold mb-4 text-blue-700 tracking-wider">
                Employee Registration
              </h2>
              <div className="mb-4 overlow-hidden">
                <label className="block text-gray-600 dark:text-gray-200 text-sm tracking-wider uppercase font-medium mb-2">
                  Full Name/ሙሉ ስም
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="ሙሉ ስም"
                  className="w-[85%] px-3 py-2 dark:bg-gray-800 placeholder:dark:text-white border-[2px] border-blue-300 focus:border-blue-500 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 dark:text-gray-200 text-sm tracking-wider uppercase font-medium mb-2">
                  Contact Information/የመገናኛ መረጃ
                </label>
                <input
                  type="text"
                  name="contact_information"
                  value={formData.contact_information}
                  onChange={handleChange}
                  placeholder="መገናኛ መረጃ"
                  className="w-[85%] dark:bg-gray-800 placeholder:dark:text-white px-3 py-2 border-[2px] border-blue-300 focus:border-blue-500 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 dark:text-gray-200 text-sm tracking-wider uppercase font-medium mb-2">
                  Position/ቦታ
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="ቦታ"
                  className="w-[85%] px-3 py-2 dark:bg-gray-800 placeholder:dark:text-white border-[2px] border-blue-300 focus:border-blue-500 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 dark:text-gray-200 text-sm tracking-wider uppercase font-medium mb-2">
                  Address/አድራሻ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="አድራሻ"
                  className="w-[85%] px-3 py-2 dark:bg-gray-800 placeholder:dark:text-white border-[2px] border-blue-300 focus:border-blue-500 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 dark:text-gray-200 text-sm tracking-wider uppercase font-medium mb-2">
                  Gender/ጾታ
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="ፆታ"
                  className="w-[85%] px-3 py-2 dark:bg-gray-800 placeholder:dark:text-white border-[2px] border-blue-300 focus:border-blue-500 ring-0 outline-none focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-[85%] bg-blue-500 hover:bg-blue-800 text-white px-4 py-3 rounded-md transition-all duration-500 hover:shadow-md hover:shadow-blue-500"
              >
                Register Employee/ሰራተኛ መዝግብ
              </button>
            </form>
          </div>
          {/* </div> */}
        </main>
      </div>
      //{" "}
    </div>
  );
};

export default EmployeeRegistration;
