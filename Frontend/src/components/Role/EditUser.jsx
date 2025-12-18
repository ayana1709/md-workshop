// src/pages/EditUser.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import DefaultAvatar from "@/images/userprofile.jpg";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "",
    department_id: "", // 1. Integrate Department ID
  });

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]); // 2. State for departments
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(DefaultAvatar);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 3. Fetch Departments along with Roles and User data
        const [rolesRes, deptRes, userRes] = await Promise.all([
          api.get("/roles"),
          api.get("/departments"),
          api.get(`/users/${id}`),
        ]);

        setRoles(rolesRes.data);
        setDepartments(deptRes.data);

        const user = userRes.data;

        setForm({
          full_name: user.full_name || user.name || "",
          username: user.username || "",
          email: user.email || "",
          password: "",
          role: user.role || user.roles?.[0]?.name || "",
          department_id: user.department_id || "", // 4. Pre-fill existing department
        });

        if (user.profile_image) {
          setPreview(`${import.meta.env.VITE_API_URL}/storage/profile_images/${user.profile_image}`);
        }
      } catch (err) {
        Swal.fire({ icon: "error", title: "Failed!", text: "Could not load data." });
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        // Don't append empty password
        if (key === 'password' && form[key] === "") return;
        formData.append(key, form[key]);
      });

      if (image) formData.append("profile_image", image);

      // Using _method=PUT because PHP/Laravel doesn't parse multipart/form-data on native PUT requests
      await api.post(`/users/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({ icon: "success", title: "Updated!", text: "User updated successfully.", timer: 2000, showConfirmButton: false });
      setTimeout(() => navigate("/users"), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire({ icon: "error", title: "Failed!", text: "Something went wrong." });
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow flex justify-center items-start p-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-full max-w-lg space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 text-center">Edit User</h2>

            {/* Profile Image Section (Kept same as your logic) */}
            <div className="text-center">
              <img src={preview} className="w-28 h-28 rounded-full border object-cover mx-auto" alt="profile" />
              <label className="mt-3 block font-medium">Update Image</label>
              <input type="file" accept="image/*" className="mt-2 w-full text-sm" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const img = new Image();
                const reader = new FileReader();
                reader.onload = (event) => {
                  img.src = event.target.result;
                  img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const maxSize = 600;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
                    else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                      const compressedFile = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
                      setImage(compressedFile);
                      setPreview(URL.createObjectURL(compressedFile));
                    }, "image/jpeg", 0.7);
                  };
                };
                reader.readAsDataURL(file);
              }} />
            </div>

            {/* Basic Info Fields */}
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border p-2 rounded" required />
            </div>

            <div>
              <label className="block font-medium mb-1">Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border p-2 rounded" required />
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border p-2 rounded" required />
            </div>

            {/* --- INTEGRATED DEPARTMENT SELECT --- */}
            <div>
              <label className="block font-medium mb-1">Department</label>
              <select
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.department_id && <p className="text-red-500 text-sm mt-1">{errors.department_id[0]}</p>}
            </div>

            {/* Role Select */}
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
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Password (leave blank to keep unchanged)</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border p-2 rounded" />
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition">
              Update User
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}