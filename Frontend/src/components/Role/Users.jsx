// src/pages/Users.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import api from "@/api";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ... (Reset password modal states kept exactly as you had them)
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Ensure your Laravel controller uses ->with('department')
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

try {
    const response = await api.delete(`/users/${id}`);
    if (response.status === 200) {
      // ✅ Only remove from UI if the DB actually deleted it
      setUsers(prevUsers => prevUsers.filter((u) => u.id !== id));
      Swal.fire("Deleted!", "User removed.", "success");
    }
  } catch (error) {
    Swal.fire("Error!", "Database refused to delete.", "error");
  }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowModal(true);
  };

  const handleResetPassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire("Error!", "All fields are required.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire("Error!", "Passwords do not match!", "error");
      return;
    }

    try {
      const response = await api.post(`/users/${selectedUser.id}/reset-password`, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      Swal.fire("Success!", response.data.message, "success");
      setShowModal(false);
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed!", "error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">System Users</h1>
            <Link
              to="/create-users"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              + Create User
            </Link>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-purple-100 text-purple-900 border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Department</th> {/* 👈 New Column Header */}
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const imgSrc = u.profile_image
                    ? `${import.meta.env.VITE_API_URL}/storage/profile_images/${u.profile_image}`
                    : null;

                  return (
                    <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-500">#{u.id}</td>
                      <td className="p-3">
                        <img
                          src={imgSrc || "/images/userprofile.jpg"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{u.name}</td>
                      
                      {/* --- DEPARTMENT DATA --- */}
                      <td className="p-3">
                        {u.department ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm border border-blue-100">
                            {u.department.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No Dept</span>
                        )}
                      </td>

                      <td className="p-3">{u.username}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        {u.roles?.length > 0
                          ? u.roles.map((r) => r.name).join(", ")
                          : "-"}
                      </td>
                      <td className="p-3 space-x-2 text-center">
                        {u.username === "admin" ? (
                          <span className="text-gray-400 italic">Protected</span>
                        ) : (
                          <>
                            <Link
                              to={`/edit-user/${u.id}`}
                              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm shadow-sm"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm shadow-sm"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleOpenModal(u)}
                              className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 text-sm shadow-sm"
                            >
                              Reset Password
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && <div className="p-8 text-center text-gray-400">Loading or no users found...</div>}
          </div>
        </main>
      </div>


      {/* Reset Password Modal */}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              Reset Password for {selectedUser?.name}
            </h2>

            {/* Old Password */}
            <div className="relative mb-4">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Old Password"
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative mb-4">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative mb-6">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
