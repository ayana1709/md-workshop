// src/pages/CreateRole.jsx
import { useState } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function CreateRole() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("Active"); // default active

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/roles", { name, description, priority, status });

      // Reset form fields
      setName("");
      setDescription("");
      setPriority("");
      setStatus("active");

      // Success Swal then navigate
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Role created successfully!",
        timer: 2000,
        showConfirmButton: true,
      }).then(() => {
        navigate("/roles");
      });
    } catch (err) {
      if (err.response && err.response.status === 422) {
        // Validation errors from backend
        const errors = err.response.data.errors;

        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: Object.values(errors)
            .map((e) => `<p>${e.join(", ")}</p>`)
            .join(""),
        });
      } else {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong! Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content Area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Create New Role
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Name */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter role name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Short description of this role"
                    rows="3"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 no-spinner"
                    placeholder="Enter priority (e.g., 1 = highest)"
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
