// src/pages/Roles.jsx
import { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [roles, search, statusFilter]);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    let data = [...roles];
    if (search) {
      data = data.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      data = data.filter((r) => r.status === statusFilter);
    }
    setFilteredRoles(data);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This role will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/roles/${id}`);
          Swal.fire("Deleted!", "Role has been deleted.", "success");
          fetchRoles();
        } catch (err) {
          Swal.fire("Error!", "Failed to delete role.", "error");
        }
      }
    });
  };

  const openEditModal = (role) => {
    setCurrentRole(role);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/roles/${currentRole.id}`, currentRole);
      Swal.fire("Updated!", "Role updated successfully!", "success");
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRoles.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredRoles.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded w-60"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Redirect instead of modal */}
            <Link
              to="/create-role"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              + Create Role
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Role Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((role) => (
                  <tr key={role.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{role.id}</td>
                    <td className="p-3 font-semibold">{role.name}</td>
                    <td className="p-3">{role.description || "-"}</td>
                    <td className="p-3">{role.priority || "-"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-sm ${
                          role.status === "Active"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {role.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {role.name === "admin" ? (
                          <span className="text-gray-400 italic">
                            Protected
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(role)}
                              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(role.id)}
                              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-gray-500">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Role Name"
                value={currentRole.name}
                onChange={(e) =>
                  setCurrentRole({ ...currentRole, name: e.target.value })
                }
                className="border w-full px-3 py-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={currentRole.description}
                onChange={(e) =>
                  setCurrentRole({
                    ...currentRole,
                    description: e.target.value,
                  })
                }
                className="border w-full px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Priority"
                value={currentRole.priority}
                onChange={(e) =>
                  setCurrentRole({ ...currentRole, priority: e.target.value })
                }
                className="border w-full px-3 py-2 rounded"
              />
              <select
                value={currentRole.status}
                onChange={(e) =>
                  setCurrentRole({ ...currentRole, status: e.target.value })
                }
                className="border w-full px-3 py-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
