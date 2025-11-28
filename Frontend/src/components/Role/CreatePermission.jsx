// src/pages/CreatePermission.jsx
import { useState, useEffect } from "react";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

export default function CreatePermission() {
  const [roles, setRoles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const inventoryColumns = [
    "Item Code",
    "Item Name",
    "Part Number",
    "Brand",
    "Quantity",
    "Purchase Price",
    "Selling Price",
    "Condition",
    "Type",
    "Location",
    "Shelf Number",
  ];

  // Track dropdown state per feature + type
  const [dropdowns, setDropdowns] = useState({});

  const [form, setForm] = useState({
    role: "",
    permissions: {},
    inventoryViewColumns: [],
    inventoryEditColumns: [],
  });

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
    api.get("/roles").then((res) => setRoles(res.data));
  }, []);

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

  const toggleDropdown = (feature, type) => {
    setDropdowns((prev) => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [type]: !prev?.[feature]?.[type],
      },
    }));
  };

  const toggleViewColumn = (col) => {
    setForm((prev) => {
      const exists = prev.inventoryViewColumns.includes(col);
      return {
        ...prev,
        inventoryViewColumns: exists
          ? prev.inventoryViewColumns.filter((c) => c !== col)
          : [...prev.inventoryViewColumns, col],
      };
    });
  };

  const toggleEditColumn = (col) => {
    setForm((prev) => {
      const exists = prev.inventoryEditColumns.includes(col);
      return {
        ...prev,
        inventoryEditColumns: exists
          ? prev.inventoryEditColumns.filter((c) => c !== col)
          : [...prev.inventoryEditColumns, col],
      };
    });
  };

  const toggleSelectAllView = () => {
    setForm((prev) => ({
      ...prev,
      inventoryViewColumns:
        prev.inventoryViewColumns.length === inventoryColumns.length
          ? []
          : [...inventoryColumns],
    }));
  };

  const toggleSelectAllEdit = () => {
    setForm((prev) => ({
      ...prev,
      inventoryEditColumns:
        prev.inventoryEditColumns.length === inventoryColumns.length
          ? []
          : [...inventoryColumns],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/permissions", form);

      Swal.fire({
        icon: "success",
        title: "Permission Created!",
        text: "The permission was successfully added.",
        confirmButtonColor: "#16a34a",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/permission");
      }, 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong while creating permission.",
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
              Assign Permissions
            </h2>

            <label className="block mb-2 font-semibold text-gray-700">
              Select Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose a Role --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            <div className="hidden md:block overflow-x-auto max-h-[60vh] border rounded-lg">
              <table className="min-w-full border-collapse">
                <thead className="bg-blue-100 text-blue-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 border text-left">Feature</th>
                    <th className="px-4 py-3 border text-center">Create</th>
                    <th className="px-4 py-3 border text-center">Manage</th>
                    {/* <th className="px-4 py-3 border text-center">Edit</th> */}
                    <th className="px-4 py-3 border text-center">Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {features.map((feature) => (
                    <tr key={feature} className="hover:bg-gray-50 relative">
                      {/* Feature + select all */}
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

                      {/* Create */}
                      <td className="px-4 py-3 border text-center">
                        <input
                          type="checkbox"
                          checked={form.permissions?.[feature]?.create || false}
                          onChange={() => togglePermission(feature, "create")}
                        />
                      </td>

                      {/* Manage / View */}
                      <td className="px-4 py-3 border text-center relative flex items-center justify-center gap-1">
                        View
                        <input
                          type="checkbox"
                          checked={form.permissions?.[feature]?.manage || false}
                          onChange={() => togglePermission(feature, "manage")}
                        />
                        {feature === "Inventory" && (
                          <FaChevronDown
                            className="cursor-pointer text-gray-500"
                            onClick={() => toggleDropdown(feature, "view")}
                          />
                        )}
                        {/* Dropdown only for columns */}
                        {dropdowns?.[feature]?.view &&
                          feature === "Inventory" && (
                            <div className="absolute top-8 bg-white border rounded shadow p-3 w-60 z-50">
                              <p className="font-semibold mb-2 text-sm">
                                Select View Columns
                              </p>
                              <label className="flex items-center gap-2 mb-2 font-medium text-blue-700">
                                <input
                                  type="checkbox"
                                  checked={
                                    form.inventoryViewColumns.length ===
                                    inventoryColumns.length
                                  }
                                  onChange={toggleSelectAllView}
                                />
                                Select All
                              </label>
                              <div className="max-h-40 overflow-y-auto">
                                {inventoryColumns.map((col) => (
                                  <label
                                    key={col}
                                    className="flex items-center gap-2 mb-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={form.inventoryViewColumns.includes(
                                        col
                                      )}
                                      onChange={() => toggleViewColumn(col)}
                                    />
                                    {col}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                      </td>

                      {/* Edit */}
                      <td className="px-4 py-3 border text-center relative flex items-center justify-center gap-1">
                        Edit
                        <input
                          type="checkbox"
                          checked={form.permissions?.[feature]?.edit || false}
                          onChange={() => togglePermission(feature, "edit")}
                        />
                        {feature === "Inventory" && (
                          <FaChevronDown
                            className="cursor-pointer text-gray-500"
                            onClick={() => toggleDropdown(feature, "edit")}
                          />
                        )}
                        {dropdowns?.[feature]?.edit &&
                          feature === "Inventory" && (
                            <div className="absolute top-8 bg-white border rounded shadow p-3 w-60 z-50">
                              <p className="font-semibold mb-2 text-sm">
                                Select Edit Columns
                              </p>
                              <label className="flex items-center gap-2 mb-2 font-medium text-green-700">
                                {" "}
                                <input
                                  type="checkbox"
                                  checked={
                                    form.inventoryEditColumns.length ===
                                    inventoryColumns.length
                                  }
                                  onChange={toggleSelectAllEdit}
                                />
                                Select All
                              </label>
                              <div className="max-h-40 overflow-y-auto">
                                {inventoryColumns.map((col) => (
                                  <label
                                    key={col}
                                    className="flex items-center gap-2 mb-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={form.inventoryEditColumns.includes(
                                        col
                                      )}
                                      onChange={() => toggleEditColumn(col)}
                                    />
                                    {col}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3 border text-center">
                        <input
                          type="checkbox"
                          checked={form.permissions?.[feature]?.delete || false}
                          onChange={() => togglePermission(feature, "delete")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow font-medium transition"
              >
                Create Permission
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
