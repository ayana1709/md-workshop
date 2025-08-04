import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function TabNav() {
  const tabRefs = useRef([]);
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabs = [
    "repair",
    // "bolo-list",
    // "inspection-list",
    // "wheel-alignment-list",
  ];
  useLayoutEffect(() => {
    const currentPath = location.pathname.split("/")[2];
    const activeTabIndex = tabs.indexOf(currentPath);
    if (tabRefs.current[activeTabIndex]) {
      const activeTab = tabRefs.current[activeTabIndex];
      setIndicatorStyle({
        transform: `translateX(${activeTab.offsetLeft}px)`,
        width: `${activeTab.offsetWidth}px`,
      });
    }
  }, [location]);
  return (
    <nav className="flex phone:flex-col tablet:flex-row rounded-t-xl overflow-hidden">
      {tabs.map((tab, index) => (
        <NavLink
          key={tab}
          to={`/job-manager/${tab}`}
          ref={(el) => (tabRefs.current[index] = el)}
          className={({ isActive }) =>
            `relative phone:px-2 laptop:px-4 py-2 flex items-center phone:justify-left tablet:justify-center transition-all duration-300 overflow-hidden ${
              isActive
                ? "bg-green-600 text-white text-black font-bold phone:rounded-t-sm tablet:rounded-t-lg"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-white"
            }`
          }
        >
          <span className="text-md">{tab.replace("-", " ").toUpperCase()}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default TabNav;
