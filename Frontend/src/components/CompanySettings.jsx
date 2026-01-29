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
  const { setCompanyData, setAdmin } = useStores();
  const navigate = useNavigate();

  // 1. NEW STATE: Controls the edit/read-only mode
  const [isEditing, setIsEditing] = useState(false);

  const [errors, setErrors] = useState({});
  const [initialForm, setInitialForm] = useState({}); // To store the original data for Cancel

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

        // Set up image previews
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        if (data.logo) {
          setLogoPreview(`${baseURL}/storage/${data.logo}`);
        }
        if (data.profile_image) {
          setProfilePreview(`${baseURL}/storage/${data.profile_image}`);
        }

        const fetchedForm = {
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
          logo: null, // Files are not set in the form state initially
          username: data.username || "",
          profile_image: null, // Files are not set in the form state initially
        };

        setForm(fetchedForm);
        setInitialForm(fetchedForm); // Store initial data
        setCompanyData(data);
      } catch (error) {
        console.error("Failed to fetch company settings", error);
      }
    };

    fetchCompanyData();
  }, []);

  // Handler to toggle editing state
const handleEditToggle = async () => {
  if (isEditing) {
    setIsEditing(false);
    setErrors({});
    return;
  }

  let forceLogout = false;

  const { isConfirmed } = await Swal.fire({
    title: "Admin Verification",
    input: "password",
    inputPlaceholder: "xxxxxxxx",
    showCancelButton: true,
    confirmButtonText: "Verify",
    confirmButtonColor: "#2563eb",
    allowOutsideClick: false,

    preConfirm: async (password) => {
      if (!password) {
        Swal.showValidationMessage("Password is required");
        return false;
      }

      try {
        await api.post("/verify-admin", { password });
        return true;
      } catch (err) {
        forceLogout = true;



        // Small delay so user sees the message
        setTimeout(() => {
          Swal.close();
        }, 1200);

        return false;
      }
    },
  });

  if (!isConfirmed && forceLogout) {
    await Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Unauthenticated...",
      timer: 500,
    });
  }

  if (!isConfirmed) return;

  setIsEditing(true);
  setErrors({});
};



  // Handler to cancel editing and revert changes
  const handleCancel = () => {
    setForm(initialForm); // Revert to original data
    setIsEditing(false); // Switch back to read-only mode
    setErrors({}); // Clear errors

    // Also reset file previews in case a file was selected but not submitted
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    if (initialForm.logo) {
      setLogoPreview(`${baseURL}/storage/${initialForm.logo}`);
    } else {
      
    }
  };

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
        // Only append file if user selected a new one (value is a File object)
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
      setInitialForm(form); // Update initial form state with new saved data
      setIsEditing(false); // Exit editing mode after successful save

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
      const { value: enteredPasscode } = await Swal.fire({
    title: "Security Verification",
    text: "Enter administrator passcode:",
    icon: "lock",
    input: "password",
    inputPlaceholder: "Enter security passcode...",
    showCancelButton: true,
    confirmButtonText: "Verify",
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      if (!value) return "Passcode is required!";
    }
  });

  if (!enteredPasscode) return;

  // Verify passcode with backend
  try {
    const verifyRes = await api.post("/settings/verify-passcode", {
      passcode: enteredPasscode
    });

    if (!verifyRes.data.verified) {
      throw new Error("Invalid passcode");
    }
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
            text: error.response?.data?.error || "Could not export data.",
          });
          return; // ⛔ Stop reset if export fails
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
          // Clear localStorage first
          localStorage.clear();
          setAdmin(false);

          // Success alert
          Swal.fire({
            icon: "success",
            title: "System Reset!",
            text: res.data.message || "System has been reset successfully.",
            timer: 1500,
            showConfirmButton: false,
          });

          // Navigate after short delay
          setTimeout(() => {
            navigate(res.data.redirect || "/");
          }, 1500);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Reset Failed",
            text:
              err.response?.data?.error || // Real backend error
              err.response?.data?.message || // Fallback Laravel message
              "Unexpected error occurred.",
          });
        }
      });
    });
    } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "Invalid security passcode.",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }
};

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                የኩባንያ መረጃ ማስተካከያ / Company Settings
              </h2>
              {/* 2. Toggle Button */}
              <button
                type="button"
                onClick={handleEditToggle}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
                  isEditing
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isEditing ? "View Mode" : "Edit Settings"}
              </button>
            </div>

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
                readOnly={!isEditing} // Apply readOnly prop
              />
              <Input
                label="Company Name (Amharic)"
                name="name_am"
                value={form.name_am}
                onChange={handleChange}
                error={errors.name_am}
                readOnly={!isEditing} // Apply readOnly prop
              />

              {/* Logo - Hide file input when not editing */}
              <div className={!isEditing && !logoPreview ? "hidden" : ""}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Logo
                </label>
                {isEditing && (
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full mt-1"
                    disabled={!isEditing}
                  />
                )}
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
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
                readOnly={!isEditing}
              />

              {/* Profile Image - Hide file input when not editing */}
              <div
                className={!isEditing && !profilePreview ? "hidden" : ""}
                style={{ gridColumn: isEditing ? "auto" : "span 1" }} // Keep layout stable
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Profile Image
                </label>
                {isEditing && (
                  <input
                    type="file"
                    name="profile_image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full mt-1"
                    disabled={!isEditing}
                  />
                )}
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile Image Preview"
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
                readOnly={!isEditing}
              />
              <Input
                type="email"
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                readOnly={!isEditing}
              />

              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
                className="md:col-span-2"
                readOnly={!isEditing}
              />

              <Input
                label="TIN Number"
                name="tin"
                value={form.tin}
                onChange={handleChange}
                error={errors.tin}
                readOnly={!isEditing}
              />

              <Input
                label="VAT Number"
                name="vat"
                value={form.vat}
                onChange={handleChange}
                error={errors.vat}
                readOnly={!isEditing}
              />

              <Input
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                error={errors.website}
                readOnly={!isEditing}
              />

              <Input
                label="Business Type"
                name="business_type"
                value={form.business_type}
                onChange={handleChange}
                error={errors.business_type}
                readOnly={!isEditing}
              />

              <Input
                label="Tagline"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="md:col-span-2"
                error={errors.tagline}
                readOnly={!isEditing}
              />

              <Input
                label="Login Page Name (EN)"
                name="login_page_name"
                value={form.login_page_name}
                onChange={handleChange}
                error={errors.login_page_name}
                readOnly={!isEditing}
              />

              <Input
                label="Login Page Name (AM)"
                name="login_page_name_am"
                value={form.login_page_name_am}
                onChange={handleChange}
                error={errors.login_page_name_am}
                readOnly={!isEditing}
              />

              <Input
                label="Established"
                name="established"
                value={form.established}
                onChange={handleChange}
                error={errors.established}
                readOnly={!isEditing}
              />

              {/* Date Format Select - Use disabled when not editing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Format
                </label>
                <select
                  name="date_format"
                  value={form.date_format}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300"
                  disabled={!isEditing} // Apply disabled prop
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
                readOnly={!isEditing}
              />

              <Input
                label="Proforma Reference Start"
                name="proforma_ref_start"
                value={form.proforma_ref_start}
                onChange={handleChange}
                error={errors.proforma_ref_start}
                readOnly={!isEditing}
              />
              <Input
                label="Store Out Reference Start"
                name="storeout_ref_start"
                value={form.storeout_ref_start}
                onChange={handleChange}
                error={errors.storeout_ref_start}
                readOnly={!isEditing}
              />

              {/* BUTTONS - Only show Save/Cancel when editing */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                    disabled={isEditing} // Prevent reset while editing
                  >
                    Reset
                  </button>
                )}

                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

// 3. Update Input component to accept and apply readOnly prop
const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder = "",
  className = "",
  readOnly = false, // Default to false
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
      readOnly={readOnly} // Apply the readOnly prop here
      className={`w-full mt-1 p-2 border rounded-md ${
        readOnly
          ? "bg-gray-100 dark:bg-gray-700 cursor-default"
          : "dark:bg-gray-700"
      } dark:text-white ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
  </div>
);

export default CompanySettings;
