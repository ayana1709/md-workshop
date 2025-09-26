import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import SidebarLinkGroup from "./SidebarLinkGroup";
import logo from "./../images/aa.png";
import { useStores } from "@/contexts/storeContext";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  // Default collapsed
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { companyData } = useStores();
  const logoUrl = companyData?.logo
    ? `${import.meta.env.VITE_API_URL}/storage/${companyData.logo}`
    : "/logo.png";

  // Auto-collapse on route change (when opening new content)
  useEffect(() => {
    setSidebarExpanded(false);
  }, [pathname]);

  // Hover expand/collapse
  const handleMouseEnter = () => setSidebarExpanded(true);
  const handleMouseLeave = () => setSidebarExpanded(false);
  const { permissions } = useStores();
  console.log("fetched permission  :", permissions);

  const hasAccess = (feature, action = null) => {
    const perm = permissions.find((p) => p.feature_name === feature);
    if (!perm) return false;
    if (action) return !!perm[`can_${action}`];
    return true;
  };

  return (
    <div className="min-w-0">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          flex flex-col
          absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto
          lg:translate-x-0
          h-[100dvh]
          overflow-y-scroll lg:overflow-y-auto no-scrollbar
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
          ${sidebarExpanded ? "w-64" : "w-20"} 
          bg-white dark:bg-gray-800
          ${
            variant === "v2"
              ? "border-r border-gray-200 dark:border-gray-700/60"
              : "rounded-r-2xl shadow-sm"
          }
          p-4
        `}
      >
        {/* Sidebar header */}
        <div className="flex flex-col gap-2 mb-10 pr-3 sm:px-2">
          {/* Expand/Collapse toggle button */}

          {/* Close button (mobile only) */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="w-6 h-6 fill-green-500"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>

          {/* Logo */}

          <button
            onClick={() => setSidebarExpanded((prev) => !prev)}
            className="hover:bg-gray-100 transition duration-200 block m-0 p-0 rounded-md"
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="w-full h-auto block m-0 p-0"
            />
          </button>
        </div>

        {/* Example link group */}
        <div className="space-y-0">
          <div>
            <h3
              className={`text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3 transition-all duration-300`}
            >
              {sidebarExpanded ? "WORKSHOP MANAGEMENT SYSTEM" : "WMS"}
            </h3>

            <ul className="mt-3 space-y-1">
              {/* Dashboard  */}
              <SidebarLinkGroup
                activecondition={
                  pathname === "/dashboard" || pathname.includes("dashboard")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          pathname === "/dashboard" ||
                          pathname.includes("dashboard")
                            ? ""
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg
                              className={`shrink-0 fill-green-500 ${
                                pathname.includes("dashboard")
                                  ? "text-violet-500 fill-green-500"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2 1.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-6ZM9 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V3Zm-7 9a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-2Zm7-1a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3Z" />
                            </svg>
                            <span className="text-sm font-medium ml-4  duration-200">
                              <NavLink
                                end
                                to="/dashboard"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Dashboard
                                </span>
                              </NavLink>
                            </span>
                          </div>
                        </div>
                      </a>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              {/* Job Order  */}
              {hasAccess("Job Order", "manage") && (
                <SidebarLinkGroup activecondition={pathname.includes("job")}>
                  {(handleClick, open) => (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block text-900 dark:text-gray-100 truncate transition duration-150 ${
                          pathname.includes("job")
                            ? ""
                            : "hover:text-gray-800 dark:hover:text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg
                              className="shrink-0 fill-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 12l1.5-4.5A3 3 0 0 1 7.3 6h9.4a3 3 0 0 1 2.8 1.5L21 12v5a2 2 0 0 1-2 2h-1a2 2 0 1 1-4 0H8a2 2 0 1 1-4 0H3a2 2 0 0 1-2-2v-5Z" />
                            </svg>
                            <span className="text-sm font-medium ml-4 duration-200">
                              Job Order
                            </span>
                          </div>
                          <div className="flex shrink-0 ml-2">
                            <svg
                              className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                open && "rotate-180"
                              }`}
                              viewBox="0 0 12 12"
                            >
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      {open && (
                        <ul className="pl-8 mt-1">
                          {/* ✅ Create Job Order (only if has create access) */}
                          {hasAccess("Job Order", "create") && (
                            <li>
                              <NavLink
                                end
                                to="/step-1"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate pl-4 " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                Create Job Order
                              </NavLink>
                            </li>
                          )}

                          {/* ✅ Job Manager (only if has manage access) */}
                          {hasAccess("Job Order", "manage") && (
                            <li>
                              <NavLink
                                end
                                to="/job-manager"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate pl-4 " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                Job Manager
                              </NavLink>
                            </li>
                          )}
                        </ul>
                      )}
                    </React.Fragment>
                  )}
                </SidebarLinkGroup>
              )}

              {/* Work orders */}
              {hasAccess("Work Order", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("appointment")
                                    ? "text-violet-500 fill-[#22c55e]"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 4a1 1 0 0 1 1-1h2V2a1 1 0 1 1 2 0v1h8V2a1 1 0 1 1 2 0v1h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm1 5v11h16V9H4Zm2 2h3a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Zm0 4h5a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                <NavLink
                                  end
                                  to="/work"
                                  className={({ isActive }) =>
                                    "block transition duration-150 truncate " +
                                    (isActive
                                      ? "text-violet-500"
                                      : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                  }
                                >
                                  <span className="text-sm font-medium  duration-200">
                                    Work Order
                                  </span>
                                </NavLink>
                              </span>
                            </div>
                          </div>
                        </a>
                        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block"></div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {/* Inventory  */}
              {hasAccess("Inventory", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-900 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-800 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("inventory")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M4 2a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4Zm1 3h14v4H5V5Zm0 6h6v4H5v-4Zm8 0h6v8h-6v-8ZM5 17h6v4H5v-4Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Inventory
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>
                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* Store Items  */}
                            <li className="mb-1 last:mb-0 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-green-500 dark:bg-gray-600"></span>
                              <NavLink
                                end
                                to="/inventory"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate pl-4 " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Store Items
                                </span>
                              </NavLink>
                            </li>
                            {/* Incoming Request  */}
                            <li className="mb-1 last:mb-0 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-green-500 dark:bg-gray-600"></span>
                              <NavLink
                                end
                                to="/incoming"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate pl-4 " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Incoming Request
                                </span>
                              </NavLink>
                            </li>
                            {/* Requested Item Out  */}
                            <li className="mb-1 last:mb-0 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-green-500 dark:bg-gray-600"></span>
                              <NavLink
                                end
                                to="/requested"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate pl-4 " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Requested Item Out
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {/* Payment */}
              {hasAccess("Payment", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("appointment")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 4a1 1 0 0 1 1-1h2V2a1 1 0 1 1 2 0v1h8V2a1 1 0 1 1 2 0v1h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm1 5v11h16V9H4Zm2 2h3a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Zm0 4h5a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Payment
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* Booking */}
                            <li className="mb-1 last:mb-0 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-green-300 dark:bg-gray-600"></span>
                              <NavLink
                                end
                                to="/add-payment"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="ml-2 text-sm font-medium  duration-200">
                                  Add New Payment
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-green-300 dark:bg-gray-600"></span>
                              <NavLink
                                end
                                to="/all-payments"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="ml-2 text-sm font-medium  duration-200">
                                  Manage Payment
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {/* Sales */}
              {hasAccess("Sales", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("purchase")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 2a2 2 0 0 0-2 2v2H3a1 1 0 0 0-1 1v2a3 3 0 0 0 3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1h-1V4a2 2 0 0 0-2-2H6Zm0 2h12v2H6V4ZM4 8h16v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Zm3 5h10v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-7Zm3-2a1 1 0 1 1 2 0v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H8a1 1 0 1 1 0-2h2v-2Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Sales
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {/* <div className="lg:hidden lg:sidebar-expanded:block 2xl:block"> */}
                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* Staff  */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/add-too-sale"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Create Sales
                                </span>
                              </NavLink>
                            </li>
                            {/* Timesheet    */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/sales"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Manage Sales
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}
              {/* Purchase */}
              {hasAccess("Purchase", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("purchase")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 
  0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.16 14h9.45c.75 0 
  1.41-.41 1.75-1.03l3.58-6.49c.38-.69-.11-1.48-.89-1.48H5.21L4.27 
  2H1v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.07 15 5.82 
  15H19v-2H7.42l.75-1.36-.01-.01Z"
                                />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Purchase
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* create purchase */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/create-order"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Create Purchase
                                </span>
                              </NavLink>
                            </li>
                            {/* manage Purchase   */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/purchase"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Manage Purchase
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {/* Preforma  */}
              {hasAccess("Proforma", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("proforma")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6Zm7 1.5L18.5 9H13V3.5ZM8 11h6a1 1 0 1 1 0 2H9.5c-.3 0-.5.2-.5.5s.2.5.5.5h2a3 3 0 1 1 0 6h-.5V21a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h6.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-2a3 3 0 1 1 0-6H14V9H8a1 1 0 1 1 0-2h6v2H8Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Proforma
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>
                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* manage preforma */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/proforma"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Create Proforma
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/manage-proforma"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Manage Proforma
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}
              {hasAccess("Inventory", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("appointment")
                                    ? "text-violet-500 fill-[#22c55e]"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.4 1.3 1.02 1.58.62.29 1.3.29 1.98.29v2c-.69 0-1.36 0-1.98.29A1.65 1.65 0 0 0 19.4 15Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                <NavLink
                                  end
                                  to="/setting"
                                  className={({ isActive }) =>
                                    "block transition duration-150 truncate " +
                                    (isActive
                                      ? "text-violet-500"
                                      : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                  }
                                >
                                  <span className="text-sm font-medium  duration-200">
                                    Setting
                                  </span>
                                </NavLink>
                              </span>
                            </div>
                          </div>
                        </a>
                        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block"></div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}
              {/* Cheacklist  */}
              {hasAccess("Setting", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("appointment")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 4a1 1 0 0 1 1-1h2V2a1 1 0 1 1 2 0v1h8V2a1 1 0 1 1 2 0v1h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm1 5v11h16V9H4Zm2 2h3a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Zm0 4h5a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Cheack List
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* Booking */}
                            <li className="mb-1 last:mb-0 relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-green-300 dark:bg-gray-600"></span>
                              <NavLink
                                end
                                to="/weekly-checklist"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="ml-2 text-sm font-medium  duration-200">
                                  weekly cheack list
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {/* users role  */}
              {hasAccess("Staff Management", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("purchase")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 
  0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.16 14h9.45c.75 0 
  1.41-.41 1.75-1.03l3.58-6.49c.38-.69-.11-1.48-.89-1.48H5.21L4.27 
  2H1v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.07 15 5.82 
  15H19v-2H7.42l.75-1.36-.01-.01Z"
                                />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Staff Management
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* create purchase */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/roles"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  List Of Role
                                </span>
                              </NavLink>
                            </li>
                            {/* manage Purchase   */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/permission"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  Permission
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/users"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  List Of User
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}
              {/*  Income  */}
              {hasAccess("Income", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("employee")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm-1 7h2a2 2 0 0 1 2 2v8H9V11a2 2 0 0 1 2-2Zm-7 6h4v2H4a2 2 0 0 0-2 2v2h2v-4h2v4h2v-2a2 2 0 0 0-2-2H3Zm13 2v2h2v2h-2v2h4v-6h-4Z" />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                <NavLink
                                  end
                                  to="/income"
                                  className={({ isActive }) =>
                                    "block transition duration-150 truncate " +
                                    (isActive
                                      ? "text-violet-500"
                                      : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                  }
                                >
                                  <span className="text-sm font-medium  duration-200">
                                    Income
                                  </span>
                                </NavLink>
                              </span>
                            </div>
                          </div>
                        </a>
                        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block"></div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}
              {hasAccess("Expense", "manage") && (
                <SidebarLinkGroup
                  activecondition={pathname.includes("ecommerce")}
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("ecommerce")
                              ? ""
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                            setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                className={`shrink-0 fill-green-500 ${
                                  pathname.includes("purchase")
                                    ? "text-violet-500"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 
  0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.16 14h9.45c.75 0 
  1.41-.41 1.75-1.03l3.58-6.49c.38-.69-.11-1.48-.89-1.48H5.21L4.27 
  2H1v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.07 15 5.82 
  15H19v-2H7.42l.75-1.36-.01-.01Z"
                                />
                              </svg>

                              <span className="text-sm font-medium ml-4  duration-200">
                                Expense
                              </span>
                            </div>
                            {/* Icon */}
                            <div className="flex shrink-0 ml-2">
                              <svg
                                className={`w-3 h-3 shrink-0 ml-1 fill-green-500 text-gray-400 dark:text-gray-500 ${
                                  open && "rotate-180"
                                }`}
                                viewBox="0 0 12 12"
                              >
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>

                        {open && (
                          <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                            {/* create purchase */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/new-expense"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  New Expense
                                </span>
                              </NavLink>
                            </li>
                            {/* manage Purchase   */}
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/expense"
                                className={({ isActive }) =>
                                  "block transition duration-150 truncate " +
                                  (isActive
                                    ? "text-violet-500"
                                    : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                                }
                              >
                                <span className="text-sm font-medium  duration-200">
                                  List Of Expense
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}
            </ul>
          </div>
          {/* More group */}
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="shrink-0 fill-green-500 text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
