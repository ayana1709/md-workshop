import React, { useState, useEffect } from "react";

import SearchModal from "../components/ModalSearch";
import Notifications from "../components/DropdownNotifications";
import Help from "../components/DropdownHelp";
import UserMenu from "../components/DropdownProfile";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Header({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-indigo-100 dark:bg-gray-800"
          : "bg-transparent hover:bg-indigo-100 dark:hover:bg-gray-800"
      } ${
        variant === "v2" || variant === "v3"
          ? "after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10"
          : "max-lg:shadow-sm"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-16 ${
            variant === "v2" || variant === "v3"
              ? ""
              : "lg:border-b border-gray-200 dark:border-gray-700/60"
          }`}
        >
          {/* Left Side */}
          <div className="flex">
            <button
              className="text-indigo-600 dark:text-indigo-300 hover:text-violet-600 dark:hover:text-violet-200 transition-all duration-150 ease-in-out lg:hidden active:scale-95 focus:ring-2 focus:ring-indigo-300 rounded"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <div>
              <button
                className={`w-8 h-8 flex items-center justify-center transition-colors duration-150 rounded-full ml-3 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 ${
                  searchModalOpen ? "bg-indigo-200 dark:bg-indigo-900" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchModalOpen(true);
                }}
                aria-controls="search-modal"
              >
                <span className="sr-only">Search</span>
                <svg
                  className="fill-current text-indigo-600 dark:text-indigo-300"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                  <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                </svg>
              </button>
              {/* <SearchModal
                id="search-modal"
                searchId="search"
                modalOpen={searchModalOpen}
                setModalOpen={setSearchModalOpen}
              /> */}
            </div>

            <LanguageSwitcher />
            {/* <Notifications align="right" /> */}
            {/* <Help align="right" /> */}
            <ThemeToggle />

            {/* Divider */}
            <hr className="w-px h-6 bg-gray-300 dark:bg-gray-700/60 border-none" />

            <UserMenu align="right" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
