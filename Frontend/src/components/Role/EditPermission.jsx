// src/pages/EditPermission.jsx
import { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

export default function EditPermission() {
  const [role, setRole] = useState({ id: "", name: "" });
  const [form, setForm] = useState({ permissions: {} });
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    "Job Order",
    "Work Order",
    "Inventory",
    "Payment",
    "Sales",
    "Purchase",
    "Proforma",
    "Checklist",
    "Setting",
    "Staff Management",
    "Income",
    "Expense",
  ];

  useEffect(() => {
    // Fetch role info
    api
      .get(`/roles/${roleId}`)
      .then((res) => setRole(res.data))
      .catch((err) => console.error(err));

    // Fetch permissions for this role
    api
      .get(`/permissions/role/${roleId}`)
      .then((res) => {
        const data = res.data || [];
        const perms = {};
        data.forEach((perm) => {
          perms[perm.feature_name] = {
            create: perm.can_create === 1,
            manage: perm.can_manage === 1,
            edit: perm.can_edit === 1,
            delete: perm.can_delete === 1,
          };
        });
        setForm({ permissions: perms });
      })
      .catch((err) => console.error(err));
  }, [roleId]);

  const togglePermission = (feature, action) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: {
          ...prev.permissions[feature],
          [action]: !prev.permissions?.[feature]?.[action],
        },
      },
    }));
  };

  const toggleFeatureAll = (feature) => {
    const allSelected =
      form.permissions?.[feature]?.create &&
      form.permissions?.[feature]?.manage &&
      form.permissions?.[feature]?.edit &&
      form.permissions?.[feature]?.delete;

    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: {
          create: !allSelected,
          manage: !allSelected,
          edit: !allSelected,
          delete: !allSelected,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/permissions/role/${roleId}`, form);

      Swal.fire({
        icon: "success",
        title: "Permission Updated!",
        text: "Permissions updated successfully.",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/permission"), 2000);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong while updating permissions.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl shadow-md w-full max-w-5xl mx-auto"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-6 text-center">
              Edit Permissions for: {role.name || "Loading..."}
            </h2>

            {/* Permissions Table */}
            <div className="hidden md:block overflow-x-auto max-h-[60vh] border rounded-lg">
              <table className="min-w-full border-collapse">
                <thead className="bg-blue-100 text-blue-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 border text-left">Feature</th>
                    <th className="px-4 py-3 border text-center">Create</th>
                    <th className="px-4 py-3 border text-center">Manage</th>
                    <th className="px-4 py-3 border text-center">Edit</th>
                    <th className="px-4 py-3 border text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border font-medium flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            form.permissions?.[feature]?.create &&
                            form.permissions?.[feature]?.manage &&
                            form.permissions?.[feature]?.edit &&
                            form.permissions?.[feature]?.delete
                          }
                          onChange={() => toggleFeatureAll(feature)}
                        />
                        {feature}
                      </td>
                      {["create", "manage", "edit", "delete"].map((action) => (
                        <td
                          key={action}
                          className="px-4 py-3 border text-center"
                        >
                          <input
                            type="checkbox"
                            checked={
                              form.permissions?.[feature]?.[action] || false
                            }
                            onChange={() => togglePermission(feature, action)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="border rounded-lg p-4 shadow-sm bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={
                        form.permissions?.[feature]?.create &&
                        form.permissions?.[feature]?.manage &&
                        form.permissions?.[feature]?.edit &&
                        form.permissions?.[feature]?.delete
                      }
                      onChange={() => toggleFeatureAll(feature)}
                    />
                    {feature}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {["create", "manage", "edit", "delete"].map((action) => (
                      <label
                        key={action}
                        className="flex items-center gap-2 bg-white p-2 rounded border"
                      >
                        <input
                          type="checkbox"
                          checked={
                            form.permissions?.[feature]?.[action] || false
                          }
                          onChange={() => togglePermission(feature, action)}
                        />
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow font-medium transition"
              >
                Update Permission
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
