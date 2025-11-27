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

  // Reset password modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
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
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      Swal.fire("Deleted!", "User has been deleted.", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to delete user.", "error");
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/users/${selectedUser.id}/reset-password`, {
        password: newPassword,
      });
      setShowModal(false);
      Swal.fire("Success!", "Password reset successfully!", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to reset password!", "error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow p-6 bg-gray-50">
          <div className="flex justify-end mb-4">
            <Link
              to="/create-users"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              + Create User
            </Link>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-purple-100 text-purple-900">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const imgSrc = u.profile_image
                    ? `${import.meta.env.VITE_API_URL}/storage/profile_images/${
                        u.profile_image
                      }`
                    : `${
                        import.meta.env.VITE_API_URL
                      }/storage/profile_images/userprofile.jpg
        
                    
                   `; // 👈 Put a default profile placeholder in /public folder

                  return (
                    <tr
                      key={u.id}
                      className="border-b hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-3">{u.id}</td>

                      <td className="p-3">
                        <img
                          src={imgSrc}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      </td>
                      <td className="p-3 font-semibold">{u.name}</td>
                      <td className="p-3">{u.username}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        {u.roles?.length > 0
                          ? u.roles.map((r) => r.name).join(", ")
                          : "-"}
                      </td>
                      <td className="p-3 space-x-2">
                        {u.username === "admin" ? (
                          <span className="text-gray-400 italic">
                            Protected
                          </span>
                        ) : (
                          <>
                            <Link
                              to={`/edit-user/${u.id}`}
                              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleOpenModal(u)}
                              className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600"
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

            {users.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No users found.
              </div>
            )}
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
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
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
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
