import { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import DefaultAvatar from "@/images/userprofile.jpg";

export default function CreateUser() {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(DefaultAvatar);

  useEffect(() => {
    api.get("/roles").then((res) => setRoles(res.data));
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (image) {
        formData.append("profile_image", image);
      } else {
        // Send default image
        const response = await fetch(DefaultAvatar);
        const blob = await response.blob();
        formData.append("profile_image", blob, "default.jpg");
      }

      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "User Created!",
        text: "User created successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/users"), 2000);

      setForm({
        full_name: "",
        username: "",
        email: "",
        password: "",
        role: "",
      });
      setImage(null);
      setPreview(DefaultAvatar);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong while creating the user.",
        });
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow flex justify-center items-start p-6 bg-gray-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow w-full max-w-lg space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
              Create New User
            </h2>

            {/* Profile Image */}
            <div className="text-center">
              <img
                src={preview}
                alt="profile preview"
                className="w-28 h-28 rounded-full border object-cover mx-auto"
              />
              <label className="block mt-3 font-medium text-gray-600">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const img = new Image();
                  const reader = new FileReader();

                  reader.onload = (event) => {
                    img.src = event.target.result;

                    img.onload = () => {
                      const canvas = document.createElement("canvas");
                      const maxSize = 600; // Maximum width/height

                      let width = img.width;
                      let height = img.height;

                      if (width > height) {
                        if (width > maxSize) {
                          height *= maxSize / width;
                          width = maxSize;
                        }
                      } else {
                        if (height > maxSize) {
                          width *= maxSize / height;
                          height = maxSize;
                        }
                      }

                      canvas.width = width;
                      canvas.height = height;

                      const ctx = canvas.getContext("2d");
                      ctx.drawImage(img, 0, 0, width, height);

                      canvas.toBlob(
                        (blob) => {
                          const compressedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                          });

                          setImage(compressedFile);
                          setPreview(URL.createObjectURL(compressedFile));
                        },
                        "image/jpeg",
                        0.7 // Compression 0–1
                      );
                    };
                  };

                  reader.readAsDataURL(file);
                }}
                className="mt-2 w-full text-sm"
              />
              {errors.profile_image && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.profile_image[0]}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.full_name[0]}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block font-medium mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role[0]}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold shadow"
            >
              Create User
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
