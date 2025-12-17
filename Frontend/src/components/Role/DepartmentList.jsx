import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments");
    }
  };

  // --- New Toggle Status Function ---
  const toggleStatus = async (dept) => {
    const newStatus = dept.status === "active" ? "inactive" : "active";
    
    try {
      // We send only the status update to the backend
      await api.put(`/departments/${dept.id}`, { 
        ...dept, // Send existing data
        dept_name: dept.name, // Ensure naming matches your controller validation
        status: newStatus 
      });

      // Update local state so the UI changes immediately
      setDepartments(departments.map(d => 
        d.id === dept.id ? { ...d, status: newStatus } : d
      ));

      Swal.fire({
        title: "Status Updated!",
        text: `Department is now ${newStatus}`,
        icon: "success",
        timer: 1000,
        showConfirmButton: false
      });
    } catch (err) {
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

    if (result.isConfirmed) {
      try {
        await api.delete(`/departments/${id}`);
        setDepartments(departments.filter((d) => d.id !== id));
        Swal.fire("Deleted!", "Department deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Could not delete department", "error");
      }
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
              <h2 className="text-2xl font-bold text-gray-700">Departments</h2>
              <Link to="/departments/create" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition">
                + Add Department
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-gray-600 font-semibold">Department Name</th>
                    <th className="p-4 text-gray-600 font-semibold">Description</th>
                    <th className="p-4 text-gray-600 font-semibold">Assigned User</th>
                    <th className="p-4 text-gray-600 font-semibold">Status</th>
                    <th className="p-4 text-gray-600 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">{dept.name}</td>
                      <td className="p-4 text-gray-500 text-sm">{dept.description || "No description"}</td>
                      {/* --- Relationship Fix: Using .admin since you renamed it --- */}
                      <td className="p-4 text-gray-700 font-medium">
                        {dept.admin ? dept.admin.name : <span className="text-gray-400 italic">Unassigned</span>}
                      </td>
                      <td className="p-4">
                        {/* --- Toggle Button --- */}
                        <button 
                          onClick={() => toggleStatus(dept)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            dept.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              dept.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <br />
                        <span className={`text-xs font-bold uppercase ${dept.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-4">
                        <Link to={`/departments/edit/${dept.id}`} className="text-purple-600 hover:text-purple-800 font-medium">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:text-red-700 font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}