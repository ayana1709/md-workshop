import React, { useState, useEffect } from "react";
import api from "../api";
import { useStores } from "../contexts/storeContext";
import { BsEyeSlash, BsEyeSlashFill } from "react-icons/bs";
import { FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import customLogo from "../images/motor-775.png"; // Custom logo

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
  { name: "Custom Image", class: "bg-gradient-bg bg-cover bg-center" }, // Default custom image
];

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showPassword, setShowPassword } = useStores();
  const [bgClass, setBgClass] = useState(
    localStorage.getItem("loginBg") || backgrounds[3].class // Default = custom image
  );
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("loginBg", bgClass);
  }, [bgClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/admin/login", { username, password });

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        onLogin(response.data.admin);
        navigate("/dashboard");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "An error occurred");
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`h-screen w-full flex flex-col items-center justify-center p-4 transition-all duration-500 ${bgClass}`}
    >
      {/* Settings Icon (Top Right) */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-white/30 rounded-full text-white shadow-md hover:scale-110 transition"
        >
          <FaCog size={22} />
        </button>
        {showSettings && (
          <div className="absolute right-14 top-0 bg-white/30 rounded-lg shadow-lg p-3 space-y-2">
            {backgrounds.map((bg, idx) => (
              <button
                key={idx}
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn">
        {/* Logo */}
        {/* <div className="flex justify-center mb-4">
          <img src={customLogo} alt="Logo" className="w-16 h-16" />
        </div> */}

        {/* Titles */}
        <h2 className="text-center text-3xl font-extrabold text-gray-800 mb-1">
          መክቢብ ዲናሞ
        </h2>
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-4">
          MEKBIB DINAMO
        </h2>
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
            <label
              htmlFor="username"
              className="block text-gray-700 mb-1 font-medium"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-gray-700 mb-1 font-medium"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="absolute right-4 top-[57%] transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800 transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <BsEyeSlash size={20} />
              ) : (
                <BsEyeSlashFill size={20} />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-md hover:scale-105 active:scale-95 transition-transform duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="w-6 h-6 animate-spin mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                ></path>
              </svg>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6 font-semibold">
          Developed by{" "}
          <span className="text-blue-500 font-bold">Nile Source Ethiopia</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
