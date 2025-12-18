// SettingsContext.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '@/api';

const SettingsContext = React.createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [dateFormat, setDateFormat] = useState(null); 

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get("/settings");
        setDateFormat(res.data.date_format || "DD/MM/YYYY"); 
      } catch (err) {
        console.error("Failed to load settings", err);
        setDateFormat("DD/MM/YYYY");
      }
    };
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ dateFormat }}>
      {children}
    </SettingsContext.Provider>
  );
};
