import React, { useEffect, useState } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import { useStores } from "@/contexts/storeContext";
import Swal from "sweetalert2";

const CompanySettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setCompanyData } = useStores();

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

  useEffect(() => {
    // Optionally fetch initial data here
    api.get("/api/settings").then((res) => {
      const data = res.data;
      setForm({ ...form, ...data });
      setCompanyData(data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files[0];
      if (file) {
        // ✅ Check file type
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
        ];
        if (!validTypes.includes(file.type)) {
          Swal.fire({
            icon: "error",
            title: "Invalid File",
            text: "Logo must be a JPEG, PNG, or WEBP image.",
          });
          return;
        }

        // ✅ Optional: Check size limit (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
          Swal.fire({
            icon: "warning",
            title: "File Too Large",
            text: "Please upload an image smaller than 2MB.",
          });
          return;
        }

        setForm((prev) => ({ ...prev, logo: file }));
        setLogoPreview(URL.createObjectURL(file));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // ✅ Only append non-empty values and valid image file
      for (let key in form) {
        if (key === "logo") {
          if (form.logo instanceof File) {
            formData.append("logo", form.logo); // only append if it's a File
          }
        } else if (form[key] !== "") {
          formData.append(key, form[key]);
        }
      }

      // ✅ Send to backend
      const res = await api.post("/settings", formData);

      // ✅ Save to context
      setCompanyData(res.data);

      // ✅ Show success
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Company settings saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings", error);

      const errMsg =
        error.response?.data?.errors?.logo?.[0] ||
        error.response?.data?.message ||
        "An unexpected error occurred.";

      Swal.fire({
        icon: "error",
        title: "Failed to save",
        text: errMsg,
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8 ">
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Company Settings
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Input
                label="Company Name (English)"
                name="name_en"
                value={form.name_en}
                onChange={handleChange}
              />
              <Input
                label="Company Name (Amharic)"
                name="name_am"
                value={form.name_am}
                onChange={handleChange}
              />
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
              <Input
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <Input
                label="TIN Number"
                name="tin"
                value={form.tin}
                onChange={handleChange}
              />
              <Input
                label="VAT Reg. Number"
                name="vat"
                value={form.vat}
                onChange={handleChange}
              />
              <Input
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
              />
              <Input
                label="Business Type"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
              />
              <Input
                label="Company Slogan / Tagline"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <Input
                label="Established Year"
                type="number"
                name="established"
                value={form.established}
                onChange={handleChange}
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
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

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  className = "",
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
    />
  </div>
);

export default CompanySettings;
