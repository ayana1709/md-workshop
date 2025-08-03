import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import Flag from "react-world-flags";

const LANGUAGES = [
  { code: "en", label: "English", country: "GB" },
  { code: "am", label: "አማርኛ", country: "ET" },
  { code: "om", label: "Afaan Oromo", country: "ET" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef();

  const currentLang =
    LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={switcherRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border px-2 py-1 rounded text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Flag code={currentLang.country} style={{ width: 20, height: 14 }} />
        <span>{currentLang.label}</span>
        <svg
          className="w-3 h-3 ml-1 fill-current"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.293 7.707 2.586 5l1.414-1.414L6 5.586l2.586-2.586L10 5l-2.707 2.707-1.293 1.293z" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50 text-sm">
          {LANGUAGES.map(({ code, label, country }) => (
            <li
              key={code}
              onClick={() => handleSelect(code)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-700 ${
                i18n.language === code
                  ? "bg-indigo-50 dark:bg-indigo-600 font-medium"
                  : ""
              }`}
            >
              <Flag code={country} style={{ width: 20, height: 14 }} />
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
