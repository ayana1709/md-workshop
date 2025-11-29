import React, { useEffect, useState } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import { useStores } from "@/contexts/storeContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// import { useStores } from "@/contexts/storeContext";

const CompanySettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setCompanyData } = useStores();
  const [errors, setErrors] = useState({});

  const { setAdmin } = useStores(); // make sure useStores provides setAdmin
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name_en: "",
    name_am: "",
    phone: "",
    email: "",
    address: "",
    tin: "",
    vat: "",
    website: "",
    business_type: "",
    tagline: "",
    established: "",
    login_page_name: "",
    login_page_name_am: "",
    date_format: "DD/MM/YYYY",
    payment_ref_start: "REF0001",
    proforma_ref_start: "REF0001",
    storeout_ref_start: "REF0001",

    logo: null,

    // NEW FIELDS
    username: "",
    profile_image: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await api.get("/settings");
        const data = res.data;

        // Logo preview
        if (data.logo) {
          const baseURL =
            import.meta.env.VITE_API_URL || "http://localhost:8000";
          setLogoPreview(`${baseURL}/storage/${data.logo}`);
        }

        // Profile image preview
        if (data.profile_image) {
          const baseURL =
            import.meta.env.VITE_API_URL || "http://localhost:8000";
          setProfilePreview(`${baseURL}/storage/${data.profile_image}`);
        }

        setForm({
          name_en: data.name_en || "",
          name_am: data.name_am || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          tin: data.tin || "",
          vat: data.vat || "",
          website: data.website || "",
          business_type: data.business_type || "",
          tagline: data.tagline || "",
          established: data.established || "",
          login_page_name: data.login_page_name || "",
          login_page_name_am: data.login_page_name_am || "",
          date_format: data.date_format || "DD/MM/YYYY",
          payment_ref_start: data.payment_ref_start || "REF0001",
          proforma_ref_start: data.proforma_ref_start || "REF0001",
          storeout_ref_start: data.storeout_ref_start || "REF0001",
          logo: null,

          // NEW
          username: data.username || "",
          profile_image: null,
        });

        setCompanyData(data);
      } catch (error) {
        console.error("Failed to fetch company settings", error);
      }
    };

    fetchCompanyData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setErrors((prev) => ({ ...prev, [name]: null }));

    if (name === "logo") {
      const file = files[0];
      if (file) {
        setForm((prev) => ({ ...prev, logo: file }));
        setLogoPreview(URL.createObjectURL(file));
      }
      return;
    }

    if (name === "profile_image") {
      const file = files[0];
      if (file) {
        setForm((prev) => ({ ...prev, profile_image: file }));
        setProfilePreview(URL.createObjectURL(file));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        // Only append file if user selected a new one
        if (key === "logo" || key === "profile_image") {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, value ?? "");
        }
      });

      const res = await api.post("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCompanyData(res.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Company information has been saved.",
      });
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An unexpected error occurred.",
      });
    }
  };

  const handleReset = async () => {
    // Step 1 — Ask if they want to export data
    Swal.fire({
      title: "Export Before Reset?",
      text: "Do you want to export all system data before resetting?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, export",
      cancelButtonText: "No, continue",
    }).then(async (exportChoice) => {
      if (exportChoice.isConfirmed) {
        try {
          Swal.fire({
            title: "Exporting Data...",
            text: "Please wait...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
          });

          // Download export file as blob
          const res = await api.get("/settings/export", {
            responseType: "blob",
          });

          const url = window.URL.createObjectURL(new Blob([res.data]));
          const a = document.createElement("a");
          a.href = url;
          a.download = "system-backup.zip";
          a.click();

          Swal.close();

          Swal.fire({
            icon: "success",
            title: "Export Completed!",
            timer: 1200,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Export Failed",
            text: "Could not export data.",
          });
          return; // Stop reset process if export fails
        }
      }

      // Step 2 — Confirm reset
      Swal.fire({
        title: "Are you sure?",
        text: "This will ERASE everything and rebuild the system!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reset system",
        cancelButtonText: "Cancel",
      }).then(async (resetChoice) => {
        if (!resetChoice.isConfirmed) return;

        try {
          Swal.fire({
            title: "Resetting System...",
            text: "Please wait while the system rebuilds.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
          });

          const res = await api.post("/settings/reset");

          // Clear localStorage and update admin state for proper redirect
          localStorage.clear();
          setAdmin(false);

          Swal.fire({
            icon: "success",
            title: "System Reset!",
            text: "System has been reset successfully.",
            timer: 1500,
            showConfirmButton: false,
          });

          setTimeout(() => {
            // Use react-router navigation if available or fallback to window.location
            navigate(res.data.redirect || "/");
          }, 1500);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Reset Failed",
            text: err.response?.data?.message || "Unexpected error occurred.",
          });
        }
      });
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              የኩባንያ መረጃ ማስተካከያ / Company Settings
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
                error={errors.name_en}
              />
              <Input
                label="Company Name (Amharic)"
                name="name_am"
                value={form.name_am}
                onChange={handleChange}
                error={errors.name_am}
              />

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
                    className="h-24 w-auto mt-2 rounded-md border border-gray-300 shadow-md"
                  />
                )}
              </div>

              {/* Username */}
              <Input
                label="Username"
                name="username"
                placeholder="your username"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
              />

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Profile Image
                </label>
                <input
                  type="file"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full mt-1"
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    className="h-20 w-20 mt-2 rounded-full border border-gray-300 shadow-md object-cover"
                  />
                )}
              </div>

              <Input
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <Input
                type="email"
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
                className="md:col-span-2"
              />

              <Input
                label="TIN Number"
                name="tin"
                value={form.tin}
                onChange={handleChange}
                error={errors.tin}
              />

              <Input
                label="VAT Number"
                name="vat"
                value={form.vat}
                onChange={handleChange}
                error={errors.vat}
              />

              <Input
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                error={errors.website}
              />

              <Input
                label="Business Type"
                name="business_type"
                value={form.business_type}
                onChange={handleChange}
                error={errors.business_type}
              />

              <Input
                label="Tagline"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="md:col-span-2"
                error={errors.tagline}
              />

              <Input
                label="Login Page Name (EN)"
                name="login_page_name"
                value={form.login_page_name}
                onChange={handleChange}
                error={errors.login_page_name}
              />

              <Input
                label="Login Page Name (AM)"
                name="login_page_name_am"
                value={form.login_page_name_am}
                onChange={handleChange}
                error={errors.login_page_name_am}
              />

              <Input
                label="Established"
                name="established"
                value={form.established}
                onChange={handleChange}
                error={errors.established}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Format
                </label>
                <select
                  name="date_format"
                  value={form.date_format}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>

              <Input
                label="Payment Reference Start"
                name="payment_ref_start"
                value={form.payment_ref_start}
                onChange={handleChange}
                error={errors.payment_ref_start}
              />

              <Input
                label="Proforma Reference Start"
                name="proforma_ref_start"
                value={form.proforma_ref_start}
                onChange={handleChange}
                error={errors.proforma_ref_start}
              />
              <Input
                label="Store Out Reference Start"
                name="storeout_ref_start"
                value={form.storeout_ref_start}
                onChange={handleChange}
                error={errors.storeout_ref_start}
              />

              {/* BUTTONS */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Save
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
  error,
  placeholder = "",
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
      placeholder={placeholder}
      onChange={onChange}
      className={`w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
  </div>
);

export default CompanySettings;
