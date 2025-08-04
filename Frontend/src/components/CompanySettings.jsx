import React, { useState } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import useStore from "@/store/useStore"; // adjust path to your store

const CompanySettings = () => {
  const sidebarExpanded = useStore((state) => state.sidebarExpanded);
  const setSidebarExpanded = useStore((state) => state.setSidebarExpanded);

  const [form, setForm] = useState({
    name_en: "",
    name_am: "",
    phone: "",
    email: "",
    address: "",
    tin: "",
    vat: "",
    website: "",
    businessType: "",
    tagline: "",
    established: "",
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files[0];
      setForm({ ...form, logo: file });
      if (file) setLogoPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", form);
    // Submit to backend here
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="grow p-6 sm:p-10 lg:pl-72">
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Company Settings
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name (English)
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={form.name_en}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name (Amharic)
                </label>
                <input
                  type="text"
                  name="name_am"
                  value={form.name_am}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Logo
                </label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full mt-1"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="mt-2 h-20 rounded shadow"
                  />
                )}
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Legal Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  TIN Number
                </label>
                <input
                  type="text"
                  name="tin"
                  value={form.tin}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  VAT Reg. Number
                </label>
                <input
                  type="text"
                  name="vat"
                  value={form.vat}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Optional Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Type
                </label>
                <input
                  type="text"
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Slogan / Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Established Year
                </label>
                <input
                  type="number"
                  name="established"
                  value={form.established}
                  onChange={handleChange}
                  placeholder="e.g. 2005"
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanySettings;
