// src/pages/Permissions.jsx
import { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Permissions() {
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/permissions");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

      // Group permissions by role
      const grouped = data.reduce((acc, perm) => {
        const roleName = perm.role?.name || "Unknown Role";
        if (!acc[roleName]) acc[roleName] = [];
        acc[roleName].push(perm);
        return acc;
      }, {});

      setPermissions(grouped);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch permissions", "error");
    }
  };

  const handleDeleteByRole = async (roleId) => {
    const confirm = await Swal.fire({
      title: "Delete All Permissions for This Role?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/permissions/role/${roleId}`);
      Swal.fire(
        "Deleted!",
        "All permissions for this role were removed.",
        "success"
      );
      fetchPermissions();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete permissions", "error");
    }
  };

  const handleEditByRole = (roleId) => {
    navigate(`/edit-permission/${roleId}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Create Permission Button */}
          <div className="flex justify-end mb-6">
            <Link
              to="/create-permission"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow font-medium"
            >
              + Create Permission
            </Link>
          </div>

          {/* Permissions List */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:table w-full">
              {/* Table Header */}
              <div className="hidden md:table-header-group bg-gray-100 text-gray-700">
                <div className="table-row">
                  <div className="table-cell p-3 font-semibold border">
                    Role
                  </div>
                  <div className="table-cell p-3 font-semibold border">
                    Permissions
                  </div>
                  <div className="table-cell p-3 font-semibold border text-center">
                    Actions
                  </div>
                </div>
              </div>

              {/* Roles */}
              {Object.keys(permissions).map((role) => {
                // Filter out features with no true permissions
                const filteredPerms = permissions[role].filter(
                  (perm) =>
                    perm.can_create === 1 ||
                    perm.can_manage === 1 ||
                    perm.can_edit === 1 ||
                    perm.can_delete === 1
                );

                // Skip role entirely if no permissions and not admin
                if (
                  role.toLowerCase() !== "admin" &&
                  filteredPerms.length === 0
                )
                  return null;

                return (
                  <div
                    key={role}
                    className="block md:table-row border-b hover:bg-gray-50 transition"
                  >
                    {/* Role */}
                    <div className="p-3 border font-bold text-gray-700 md:table-cell">
                      {role}
                    </div>

                    {/* Permissions */}
                    <div className="p-3 border md:table-cell">
                      {role.toLowerCase() === "admin" ? (
                        <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold">
                          ADMIN HAS ALL PERMISSIONS
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {filteredPerms.map((perm) => (
                            <div key={perm.id} className="flex flex-wrap gap-2">
                              {perm.can_create === 1 && (
                                <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium">
                                  CAN CREATE {perm.feature_name.toUpperCase()}
                                </span>
                              )}
                              {perm.can_manage === 1 && (
                                <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium">
                                  CAN MANAGE {perm.feature_name.toUpperCase()}
                                </span>
                              )}
                              {perm.can_edit === 1 && (
                                <span className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-medium">
                                  CAN EDIT {perm.feature_name.toUpperCase()}
                                </span>
                              )}
                              {perm.can_delete === 1 && (
                                <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium">
                                  CAN DELETE {perm.feature_name.toUpperCase()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-3 border flex gap-4 items-center justify-start md:justify-center md:table-cell">
                      {role.toLowerCase() !== "admin" &&
                        filteredPerms.length > 0 && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={() =>
                                handleEditByRole(filteredPerms[0].role_id)
                              }
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteByRole(filteredPerms[0].role_id)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash size={18} />
                            </button>
                          </>
                        )}
                      {role.toLowerCase() === "admin" && <span>-</span>}
                    </div>
                  </div>
                );
              })}

              {Object.keys(permissions).length === 0 && (
                <div className="p-6 text-center text-gray-500 italic">
                  No permissions found.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
