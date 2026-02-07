import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEyeSlash, BsEyeSlashFill } from "react-icons/bs";
import { FaCog } from "react-icons/fa";

import api from "../api";
import { useStores } from "../contexts/storeContext";

const backgrounds = [
  {
    name: "Blue-Purple",
    class: "bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500",
  },
  {
    name: "Green",
    class: "bg-gradient-to-br from-green-400 via-green-500 to-green-700",
  },
  {
    name: "Orange",
    class: "bg-gradient-to-br from-orange-400 via-yellow-500 to-red-500",
  },
  {
    name: "Custom Image",
    class: "bg-gradient-bg bg-cover bg-center",
  },
];

const Login = () => {
  const navigate = useNavigate();

  const {
    showPassword,
    setShowPassword,
    fetchPermissions,
    setPermissions,
    setAdmin,
    setUserBranchId,
    setUserBranch,
    companyData,
  } = useStores();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [bgClass, setBgClass] = useState(
    localStorage.getItem("loginBg") || backgrounds[0].class,
  );
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem("loginBg", bgClass);
  }, [bgClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/admin/login", { username, password });
      const { token, admin } = res.data;

      if (!token || !admin) {
        setError("Invalid login response");
        return;
      }

      // 🔐 Save auth
      localStorage.setItem("adminToken", token);
      setAdmin(admin);

      // 🏢 Branch
      if (admin.branch_id) {
        setUserBranchId(admin.branch_id);
        setUserBranch({
          id: admin.branch_id,
          name: admin.branch?.name || null,
        });
      }

      // 🔑 Permissions
      const roleId = admin?.roles?.[0]?.pivot?.role_id;
      if (roleId) {
        const perms = await fetchPermissions(roleId);
        localStorage.setItem("permissions", JSON.stringify(perms));
      } else {
        setPermissions([]);
      }

      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Server not reachable");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const companyNameEn =
    companyData?.login_page_name || "Inventory Management System";
  const companyNameAm = companyData?.login_page_name_am || "";

  return (
    <div
      className={`h-screen w-full flex items-center justify-center p-4 transition-all duration-500 ${bgClass}`}
    >
      {/* Settings */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="p-3 bg-white/30 rounded-full text-white shadow-md hover:scale-110 transition"
        >
          <FaCog size={22} />
        </button>

        {showSettings && (
          <div className="absolute right-14 top-0 bg-white/30 rounded-lg shadow-lg p-3 space-y-2">
            {backgrounds.map((bg) => (
              <button
                key={bg.name}
                onClick={() => {
                  setBgClass(bg.class);
                  setShowSettings(false);
                }}
                className="block w-40 text-left px-3 py-2 rounded-lg hover:bg-white/40 text-sm text-white"
              >
                {bg.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-800">
          {companyNameAm}
        </h2>
        <h3 className="text-center text-xl font-bold text-gray-700 mb-4">
          {companyNameEn}
        </h3>

        <p className="text-center text-gray-600 mb-6 font-semibold">
          Login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-red-500 bg-red-100 py-2 px-3 rounded-lg text-center">
              {error}
            </p>
          )}

          {/* Username */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Username
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700 mb-1 font-medium">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-[58%] cursor-pointer text-gray-500"
            >
              {showPassword ? <BsEyeSlash /> : <BsEyeSlashFill />}
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:scale-105 transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
