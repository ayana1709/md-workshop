import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { Textarea } from "../ui/textarea";

export default function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    dept_name: "",
    description: "",
    status: "active",
  });

  // Fetch department when editing
  useEffect(() => {
    if (id) {
      api.get(`/departments/${id}`).then((res) => {
        setForm({
          dept_name: res.data.name,
          description: res.data.description || "",
          status: res.data.status,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = {
        name: form.dept_name,
        description: form.description,
        status: form.status,
      };

      if (id) {
        await api.put(`/departments/${id}`, payload);
      } else {
        await api.post("/departments", payload);
      }

      Swal.fire({
        icon: "success",
        title: id ? "Updated!" : "Created!",
        text: `Department ${id ? "updated" : "created"} successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/departments");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire("Error", "Something went wrong.", "error");
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
            className="bg-white p-8 rounded-lg shadow w-full max-w-xl space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-700 text-center">
              {id ? "Edit Department" : "Create New Department"}
            </h2>

            {/* Department Name */}
            <div>
              <label className="block font-medium mb-1 text-gray-600">
                Department Name
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                value={form.dept_name}
                onChange={(e) =>
                  setForm({ ...form, dept_name: e.target.value })
                }
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name[0]}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-1 text-gray-600">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Enter department details..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description[0]}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium mb-1 text-gray-600">
                Status
              </label>
              <select
                className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.status[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-bold shadow-lg transition duration-200"
            >
              {id ? "Save Changes" : "Create Department"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/departments")}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Cancel
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
