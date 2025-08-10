import React, { useState } from "react";
import api from "../api";
import logo from "./../images/aa.png";
import { useStores } from "../contexts/storeContext";
import { BsEyeSlash } from "react-icons/bs";
import { BsEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showPassword, setShowPassword } = useStores();
  console.log(showPassword);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/admin/login", { username, password });

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        onLogin(response.data.admin);
        navigate("/dashboard"); // Redirect to dashboard
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
    <div className="h-screen bg-gray-900 phone:px-0 phone:py-2 tablet:px-4 tablet:py-4">
      <div className="relative h-full w-[95%] mx-auto flex gap-8 bg-gray-800 px-4 py-4 rounded-md laptop:bg-car-image laptop:bg-gradient-bg laptop:bg-[length:100%] laptop:bg-center">
        {/* <div className="w-[50%] overflow-hidden bg-car-image bg-gradient-bg bg-cover bg-center rounded-md"></div> */}
        <div className="absolute phone:right-1/2 laptop:right-[25%] translate-x-1/2 w-full max-w-md overflow-hidden">
          <div className="text-center phone:p-2 btablet:p-6 text-white">
            {/* <img src={logo} className="phone:w-[75%]" /> */}
          </div>

          <form
            onSubmit={handleSubmit}
            className="phone:mt-6 tablet:mt-2 phone:p-2 tablet:p-6 flex flex-col phone:gap-4 laptop:gap-6 bg-gray-800 rounded-xl"
          >
            {error && (
              <p className="text-red-500 text-center font-medium">{error}</p>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-gray-300 font-medium"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                className="placeholder:text-gray-300 w-full mt-2 phone:py-2 phone:px-2 tablet:px-3 tablet:py-3 border-2 border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-0 outline-none focus:outline-none focus:border-gray-200 transition-all duration-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <div className="absolute right-6 top-[67%] -translate-y-1/2">
                {showPassword ? (
                  <BsEyeSlash
                    onClick={() => setShowPassword(!showPassword)}
                    // color="#000000"
                    className="cursor-pointer text-gray-400"
                    size={20}
                  />
                ) : (
                  <BsEyeSlashFill
                    onClick={() => setShowPassword(!showPassword)}
                    // color="#090909"
                    className="cursor-pointer text-gray-400"
                    size={20}
                  />
                )}
              </div>

              <label
                htmlFor="password"
                className="block text-gray-300 font-medium"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="placeholder:text-gray-300 w-full mt-2 phone:py-2 phone:px-2 tablet:px-3 tablet:py-3 border-2 border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-0 outline-none focus:outline-none focus:border-gray-200 transition-all duration-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="relative group z-1">
              <button
                type="submit"
                className="custom-button relative z-0 w-full tracking-wider phone:py-2 tablet:py-3 bg-cyan-900 text-white font-semibold rounded-lg flex items-center justify-center transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                ) : (
                  "Login"
                )}
              </button>
              {/* <div className="absolute block z-[9999] top-0 left-0 w-0 h-full rounded-lg group-hover:w-full bg-cyan-800 transition-all duration-300">
                &nbsp;
              </div> */}
            </div>

            <div className="w-full flex justify-center py-4 phone:px-2 tablet:px-0 phone:bg-transparent laptop:bg-gray-900 text-gray-300 text-sm rounded-md">
              <p className="text-center">© 2025 All rights reserved.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
