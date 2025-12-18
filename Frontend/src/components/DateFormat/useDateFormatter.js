// useDateFormatter.js
import { toEthiopian } from "ethiopian-calendar-new";
import { useSettings } from "./SettingsContext"; 

export const useDateFormatter = () => {

  const { dateFormat } = useSettings(); 
  
  const formatGCDate = (date) => {
    if (!date) return "N/A";
    if (!dateFormat) return "Loading...";

    try {
      const dateOnly = date.split("T")[0];
      const [y, m, d] = dateOnly.split("-");

      if (dateFormat === "MM/DD/YYYY") return `${m}/${d}/${y}`;
      if (dateFormat === "DD/MM/YYYY") return `${d}/${m}/${y}`;

      return `${y}/${m}/${d}`;
    } catch {
      return "Date Error";
    }
  };


  const formatEthioDate = (gregorianDate) => {
    if (!gregorianDate) return "N/A";
    if (!dateFormat) return "Loading...";

    try {
      const [y, m, d] = gregorianDate.split("T")[0].split("-").map(Number);
      
      const ethDate = toEthiopian(y, m, d);

      const dd = ethDate.day.toString().padStart(2, "0");
      const mm = ethDate.month.toString().padStart(2, "0");
      const yyyy = ethDate.year;

      if (dateFormat === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
      if (dateFormat === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
      
      return `${yyyy}/${mm}/${dd}`;
      
    } catch {
      return "Date Error";
    }
  };

  return { formatGCDate, formatEthioDate };
};