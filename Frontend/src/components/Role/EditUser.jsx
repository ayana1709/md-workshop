// src/pages/EditUser.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Fetch roles + user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, userRes] = await Promise.all([
          api.get("/roles"),
          api.get(`/users/${id}`),
        ]);

        setRoles(rolesRes.data);

        const user = userRes.data;

        setForm({
          full_name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          password: "",
          role: user.roles?.[0]?.name || "",
          phone: user.phone || "",
          status: user.status || "active",
          level: user.level || "",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Could not load user data.",
          confirmButtonColor: "#dc2626",
        });
      }
    };

    fetchData();
  }, [id]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.put(`/users/${id}`, form);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User updated successfully.",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/users"), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong while updating the user.",
          confirmButtonColor: "#dc2626",
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
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Edit User</h2>

            {/* Full Name */}
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium mb-1">
                Password (leave blank to keep unchanged)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded shadow"
            >
              Update User
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
