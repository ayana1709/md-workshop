import React, { useEffect, useState } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import { useStores } from "@/contexts/storeContext";
import Swal from "sweetalert2";

const CompanySettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setCompanyData } = useStores();
  const [errors, setErrors] = useState({});

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
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  // console.log("Logo preview URL:", logoPreview);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await api.get("/settings");
        const data = res.data;

        // ✅ Preview image only if logo exists

        if (data.logo) {
          // setLogoPreview(`http://localhost:8000/storage/${data.logo}`);
          const baseURL =
            import.meta.env.VITE_API_URL || "http://localhost:8000";
          setLogoPreview(`${baseURL}/storage/${data.logo}`);
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
          logo: null, // file input remains null
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
            text: "Logo must be JPEG, PNG, JPG, or WEBP.",
          });
          return;
        }
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
    setErrors({});
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "logo") {
          if (value instanceof File) {
            formData.append("logo", value);
          }
        } else {
          formData.append(key, value);
        }
      });

      // ✅ Print exactly what is being sent to Laravel
      console.log("Sending form data:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await api.post("/settings", formData);
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
                label="Company Name (English) / የኩባንያ ስም (እንግሊዝኛ)"
                placeholder="Company Name"
                name="name_en"
                value={form.name_en}
                onChange={handleChange}
                error={errors.name_en}
              />
              <Input
                label="Company Name (Amharic) / የኩባንያ ስም (አማርኛ)"
                placeholder="የኩባንያ ስም"
                name="name_am"
                value={form.name_am}
                onChange={handleChange}
                error={errors.name_am}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Logo / የኩባንያ አርማ
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
                    alt="Company Logo"
                    className="h-24 w-auto mt-2 rounded-md border border-gray-300 shadow-md"
                    onError={(e) => {
                      e.target.onerror = null; // prevents looping
                      e.target.src = "../images/aa.png"; // fallback image path
                    }}
                  />
                )}
                {errors.logo && (
                  <p className="text-red-500 text-sm">{errors.logo[0]}</p>
                )}
              </div>

              <Input
                label="Phone Number / ስልክ ቁጥር"
                placeholder="0912345678"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <Input
                label="Email / ኢሜይል"
                type="email"
                placeholder="info@company.com"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />
              <Input
                label="Address / አድራሻ"
                placeholder="Addis Ababa / አዲስ አበባ"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
                className="md:col-span-2"
              />
              <Input
                label="TIN Number / TIN ቁጥር"
                name="tin"
                value={form.tin}
                onChange={handleChange}
                error={errors.tin}
              />
              <Input
                label="VAT Number / VAT ቁጥር"
                name="vat"
                value={form.vat}
                onChange={handleChange}
                error={errors.vat}
              />
              <Input
                label="Website / ድር ጣቢያ"
                name="website"
                value={form.website}
                onChange={handleChange}
                error={errors.website}
              />
              <Input
                label="Business Type / የንግድ አይነት"
                name="business_type"
                value={form.business_type}
                onChange={handleChange}
                error={errors.business_type}
              />
              <Input
                label="Tagline / አስተዋፅዖ"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="md:col-span-2"
                error={errors.tagline}
              />
              <Input
                label="Established Year / የመጀመሪያ አመት"
                type="number"
                name="established"
                value={form.established}
                onChange={handleChange}
                error={errors.established}
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
                >
                  Save / አስቀምጥ
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
