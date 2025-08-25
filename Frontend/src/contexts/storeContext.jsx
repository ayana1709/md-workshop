/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";
const StoreContext = createContext({
  currentTheme: "light",
  changeCurrentTheme: () => {},
});

function StoreProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [isItemModalOpen, setIsItemModalOpen] = useState(false); // Control modal visibility
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [type, setType] = useState("");
  const [repairs, setRepairs] = useState([]);
  const [bolos, setBolos] = useState([]);
  const [inspection, setInspection] = useState([]);
  const [wheel, setWheel] = useState([]);
  const [work, setWork] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // State to control modal
  const [repairData, setRepairData] = useState(null);
  const [boloData, setBoloData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [inspectionData, setInspectionData] = useState(null);
  const [wheelData, setWheelData] = useState(null);
  const persistedTheme = localStorage.getItem("theme");
  const [theme, setTheme] = useState(persistedTheme || "light");
  const [lowStock, setLowStock] = useState(0);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedField, setSelectedField] = useState("");
  const [items, setItems] = useState([]);
  const [lowitems, setLowItems] = useState([]);
  const [outitems, setOutItems] = useState([]);

  const [itemOutData, setItemOutData] = useState(null);
  const [outQuantity, setOutQuantity] = useState(0);
  const [repair, setRepair] = useState(null);
  const [isDialogeOpen, setIsDialogeOpen] = useState(false);
  const [dialogeOpen, setDialogeOpen] = useState(false);
  const [grandTotals, setGrandTotals] = useState({});
  const [proformas, setProformas] = useState([]);

  // const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add("[&_*]:!transition-none");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    }

    const transitionTimeout = setTimeout(() => {
      document.documentElement.classList.remove("[&_*]:!transition-none");
    }, 1);

    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  // Inside StoreProvider
  const fetchItems = async () => {
    try {
      const response = await api.get("/items");
      console.log("fetched items:", response.data);
      setItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch store items");
    }
  };

  // Load once on mount
  useEffect(() => {
    fetchItems();
  }, []);
  // this is for  low stock items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items/low-stock"); // Fetch data from backend
        console.log("fetched items:", response.data);
        setLowItems(response.data); // Ensure the response structure matches
      } catch (error) {
        // console.error("Error fetching store items:", error);
        // toast.error("Failed to fetch store items");
      }
    };

    fetchItems();
  }, []);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items/out"); // Fetch data from backend
        console.log("fetched items:", response.data);
        setOutItems(response.data); // Ensure the response structure matches
      } catch (error) {
        // console.error("Error fetching store items:", error);
        // toast.error("Failed to fetch store items");
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchProformas = async () => {
      try {
        const response = await api.get("/proformas");
        setProformas(response.data);
      } catch (error) {
        console.error("Failed to fetch proformas:", error);
      }
    };

    fetchProformas();
  }, []);

  const handleDelete = async (id, type) => {
    if (!id) return;

    //     const handleDelete = async (id, type) => {
    //   try {
    //     await api.delete(`/repairs/${id}`);
    //     toast.success("Deleted successfully");
    //     // Optional: remove item from local state
    //   } catch (err) {
    //     console.error(err);
    //     toast.error("Failed to delete");
    //   }
    // };

    // Define API path based on type
    let apiPath;
    switch (type) {
      case "repair":
        apiPath = `/repairs/${id}`;
        break;
      case "bolo":
        apiPath = `/delete-bolo/${id}`;
        break;
      case "inspection":
        apiPath = `/delete-inspection/${id}`;
        break;
      case "wheel":
        apiPath = `/delete-wheel/${id}`;
        break;
      case "work":
        apiPath = `/delete-work/${id}`;
      case "item":
        apiPath = `/items/${id}`;
        break;
      // Add more cases as needed for other pages
      default:
        toast.error("Invalid delete type.");
        return;
    }

    try {
      const response = await api.delete(apiPath);
      toast.success(response.data.message);

      // Refresh list after deletion
      if (type === "repair") {
        setRepairs((prevRepairs) =>
          prevRepairs.filter((repair) => repair.id !== id)
        );
      } else if (type === "bolo") {
        setBolos((prevBolos) => prevBolos.filter((bolo) => bolo.id !== id));
      } else if (type === "inspection") {
        setInspection((prevInspection) =>
          prevInspection.filter((inspection) => inspection.id !== id)
        );
      } else if (type === "wheel") {
        setWheel((prevWheel) => prevWheel.filter((wheel) => wheel.id !== id));
      } else if (type === "work") {
        setWork((prevWork) => prevWork.filter((work) => work.id !== id));
      } else if (type === "item") {
        setItems((prevItem) => prevItem.filter((item) => item.id !== id));
      }
      setIsItemModalOpen(false); // Close modal after deletion
    } catch (error) {
      toast.error("Error deleting item:", error.response?.data || error);
    }
  };

  const changeCurrentTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const updateGrandTotal = (jobId, total) => {
    setGrandTotals((prev) => ({
      ...prev,
      [jobId]: total,
    }));
  };

  const getGrandTotal = (jobId) => {
    return grandTotals[jobId] || 0;
  };
  const [companyData, setCompanyData] = useState(() => {
    const stored = localStorage.getItem("companyData");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (companyData) {
      localStorage.setItem("companyData", JSON.stringify(companyData));
    }
  }, [companyData]);

  return (
    <StoreContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        selectedRepairId,
        setSelectedRepairId,
        handleDelete,
        type,
        setType,
        repairs,
        setRepairs,
        bolos,
        setBolos,
        inspection,
        setInspection,
        wheel,
        setWheel,
        work,
        setWork,
        printData,
        setPrintData,
        repairData,
        setRepairData,
        isPrintModalOpen,
        setIsPrintModalOpen,
        dropdownOpen,
        setDropdownOpen,
        showPassword,
        setShowPassword,
        boloData,
        setBoloData,
        inspectionData,
        setInspectionData,
        wheelData,
        setWheelData,
        currentTheme: theme,
        changeCurrentTheme,
        lowStock,
        setLowStock,
        isStatusModalOpen,
        setIsStatusModalOpen,
        showModal,
        setShowModal,
        showEditModal,
        setShowEditModal,
        itemId,
        setItemId,
        selectedField,
        selectedItem,
        setSelectedItem,
        setSelectedField,
        items,
        setItems,
        fetchItems,
        lowitems,
        setLowItems,
        outitems,
        setOutItems,
        showDetailModal,
        setShowDetailModal,
        isItemModalOpen,
        setIsItemModalOpen,
        itemOutData,
        setItemOutData,
        outQuantity,
        setOutQuantity,
        repair,
        setRepair,
        isDialogeOpen,
        setIsDialogeOpen,
        dialogeOpen,
        setDialogeOpen,
        grandTotals,
        updateGrandTotal,
        getGrandTotal,
        companyData,
        setCompanyData,
        proformas,
        setProformas,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

function useStores() {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("context used outside of scope");
  return context;
}

export { StoreProvider, useStores };
