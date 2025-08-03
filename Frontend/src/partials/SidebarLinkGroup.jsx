import React, { useState } from "react";

function SidebarLinkGroup({ children, activecondition }) {
  const [open, setOpen] = useState(activecondition);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <li
      className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200 ease-in-out
      ${
        activecondition
          ? "bg-gradient-to-r from-violet-500/20 to-violet-500/10 dark:from-violet-500/30 dark:to-violet-500/10"
          : "hover:bg-gradient-to-r hover:from-indigo-100 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-800"
      }`}
    >
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup;
