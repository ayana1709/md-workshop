// src/contexts/AuthContext.jsx
import api from "@/api";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [userBranch, setUserBranch] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Hydrate permissions from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const savedAdmin = localStorage.getItem("admin");
    const savedBranch = localStorage.getItem("userBranch");
    const savedPerms = localStorage.getItem("permissions");

    if (token && savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
      setUserBranch(savedBranch ? JSON.parse(savedBranch) : null);
      setPermissions(savedPerms ? JSON.parse(savedPerms) : []);
    }
    setLoading(false);
  }, []);

  // ✅ Fetch permissions safely by roleId
  const fetchPermissions = async (roleId) => {
    try {
      const res = await api.get(`/roles/${roleId}/permissions`);
      // Ensure it's always an array
      const perms = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPermissions(perms);
      localStorage.setItem("permissions", JSON.stringify(perms));
      return perms;
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setPermissions([]);
      return [];
    }
  };

  const login = async (username, password) => {
    const res = await api.post("/admin/login", { username, password });
    const { token, admin } = res.data;

    if (!token || !admin) throw new Error("Invalid login");

    localStorage.setItem("adminToken", token);
    localStorage.setItem("admin", JSON.stringify(admin));

    let branch = null;
    if (admin.branch_id) {
      branch = { id: admin.branch_id, name: admin.branch?.name || null };
      localStorage.setItem("userBranch", JSON.stringify(branch));
    }

    // Fetch permissions via helper
    let perms = [];
    const roleId = admin?.roles?.[0]?.pivot?.role_id;
    if (roleId) {
      perms = await fetchPermissions(roleId);
    }

    setAdmin(admin);
    setUserBranch(branch);
    return { admin, branch, perms };
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("userBranch");
    localStorage.removeItem("permissions");
    setAdmin(null);
    setUserBranch(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        userBranch,
        permissions,
        loading,
        login,
        logout,
        fetchPermissions, // optional: can call later if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
