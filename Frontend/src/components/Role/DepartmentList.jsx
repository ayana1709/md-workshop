import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [usersByDept, setUsersByDept] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);

      // fetch users per department
      res.data.forEach((dept) => fetchDepartmentUsers(dept.id));
    } catch {
      console.error("Failed to fetch departments");
    }
  };

  const fetchDepartmentUsers = async (deptId) => {
    try {
      const res = await api.get(`/departments/${deptId}/users`);
      setUsersByDept((prev) => ({
        ...prev,
        [deptId]: res.data.users || [],
      }));
    } catch {
      setUsersByDept((prev) => ({
        ...prev,
        [deptId]: [],
      }));
    }
  };

  // Toggle status
  const toggleStatus = async (dept) => {
    const newStatus = dept.status === "active" ? "inactive" : "active";

    try {
      await api.put(`/departments/${dept.id}`, {
        status: newStatus,
      });

      setDepartments((prev) =>
        prev.map((d) =>
          d.id === dept.id ? { ...d, status: newStatus } : d
        )
      );

      Swal.fire({
        title: "Updated",
        text: `Department is now ${newStatus}`,
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This department will be permanently removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      Swal.fire("Deleted!", "Department deleted.", "success");
    } catch {
      Swal.fire("Error", "Could not delete department", "error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6 bg-gray-50 grow">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-700">
                Departments
              </h2>
              <Link
                to="/departments/create"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
              >
                + Add Department
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4">Department</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Assigned Users</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((dept) => {
                    const users = usersByDept[dept.id] || [];

                    return (
                      <tr key={dept.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{dept.name}</td>

                        <td className="p-4 text-sm text-gray-500">
                          {dept.description || "No description"}
                        </td>

                        {/* Assigned Users */}
                        <td className="p-4">
                          {users.length > 0 ? (
                            <div className="flex items-center space-x-2">
                              {users.slice(0, 5).map((user) => (
<div className="relative group">
  <img
    key={user.id}
    src={
      user.profile_image
        ? `${import.meta.env.VITE_API_URL}/storage/profile_images/${user.profile_image}`
        : "/avatar.png"
    }
    alt={user.name}
    className="w-8 h-8 rounded-full border object-cover"
  />
  {/* Tooltip */}
  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-600 text-white text-xs px-2 py-1 rounded shadow">
    {user.name}
  </span>
</div>

                              ))}
                              {users.length > 5 && (
                                <span className="text-xs text-gray-500">
                                  +{users.length - 5}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Status */}
<td className="p-4">
  <button
    onClick={() => toggleStatus(dept)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      dept.status === "active"
        ? "bg-green-500"
        : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        dept.status === "active"
          ? "translate-x-6"
          : "translate-x-1"
      }`}
    />
  </button>
</td>


                        <td className="p-4 text-center space-x-4">
                          <Link
                            to={`/departments/edit/${dept.id}`}
                            className="text-purple-600 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(dept.id)}
                            className="text-red-500 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
